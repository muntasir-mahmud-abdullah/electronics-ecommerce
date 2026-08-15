import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { ProductSchema, ProductVariantSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

// ─── GET /api/products ────────────────────────────────────────────────────────
// Supports: ?category=slug, ?brand=id, ?search=query, ?sort=price_asc|price_desc|newest|name,
//           ?page=1, ?limit=12, ?minPrice=100, ?maxPrice=500, ?inStock=true,
//           ?featured=true, ?useCases=gaming,study
//           + dynamic attribute filters: ?RAM=16GB, ?Storage=512GB, etc.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(48, parseInt(searchParams.get("limit") || "12"));
    const skip = (page - 1) * limit;

    const categorySlug = searchParams.get("category");
    const brandId = searchParams.get("brand");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock") === "true";
    const featured = searchParams.get("featured") === "true";
    const useCases =
      searchParams.get("useCases")?.split(",").filter(Boolean) || [];

    // Find categoryId from slug
    let categoryId: string | undefined;
    let attributeFilterGroupIds: string[] = [];
    if (categorySlug) {
      const cat = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: { attributeMaps: { select: { attributeGroupId: true } } },
      });
      if (cat) {
        categoryId = cat.id;
        attributeFilterGroupIds = cat.attributeMaps.map(
          (m) => m.attributeGroupId,
        );
      }
    }

    // Collect dynamic attribute filters from query params
    // These are params not in the known params list
    const knownParams = new Set([
      "page",
      "limit",
      "category",
      "brand",
      "search",
      "sort",
      "minPrice",
      "maxPrice",
      "inStock",
      "featured",
      "useCases",
    ]);
    const attributeFilters: { groupName: string; value: string }[] = [];
    for (const [key, value] of searchParams.entries()) {
      if (!knownParams.has(key)) {
        attributeFilters.push({ groupName: key, value });
      }
    }

    // Build the where clause for products
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(featured && { isFeatured: true }),
      ...(useCases.length > 0 && { useCaseTags: { hasSome: useCases } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // Variant-level filters (price, stock, dynamic attributes)
    const variantWhere: Prisma.ProductVariantWhereInput = {
      isActive: true,
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      ...(inStock && { stock: { gt: 0 } }),
    };

    // Dynamic attribute filters: find variantIds that match ALL attribute filters
    let filteredVariantIds: string[] | undefined;
    if (attributeFilters.length > 0) {
      // For each attribute filter, find matching attributeValues, then matching variants
      const matchingSets: Set<string>[] = [];

      for (const { groupName, value } of attributeFilters) {
        const group = await prisma.attributeGroup.findFirst({
          where: { name: { equals: groupName, mode: "insensitive" } },
        });
        if (!group) continue;

        const attrValue = await prisma.attributeValue.findFirst({
          where: {
            groupId: group.id,
            value: { equals: value, mode: "insensitive" },
          },
        });
        if (!attrValue) {
          // No match → empty result for this filter
          matchingSets.push(new Set());
          continue;
        }

        const variantAttrs = await prisma.productAttribute.findMany({
          where: { attributeValueId: attrValue.id },
          select: { variantId: true },
        });
        matchingSets.push(new Set(variantAttrs.map((va) => va.variantId)));
      }

      if (matchingSets.length > 0) {
        // Intersection: variant must match ALL filters
        const intersection = matchingSets.reduce((acc, set) => {
          return new Set([...acc].filter((id) => set.has(id)));
        });
        filteredVariantIds = [...intersection];
      }
    }

    if (filteredVariantIds !== undefined) {
      variantWhere.id = { in: filteredVariantIds };
    }

    // Order by
    type ProductOrderBy = Prisma.ProductOrderByWithRelationInput;
    const orderBy: ProductOrderBy =
      sort === "newest"
        ? { createdAt: "desc" }
        : sort === "name_asc"
          ? { name: "asc" }
          : { createdAt: "desc" };

    // For price sorting, load all variants to compute accurate prices
    const loadAllVariants = sort === "price_asc" || sort === "price_desc";

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true } },
          media: { where: { isPrimary: true }, take: 1 },
          variants: {
            where: variantWhere,
            include: {
              attributes: {
                include: { attributeValue: { include: { group: true } } },
              },
            },
            orderBy: { sortOrder: "asc" },
            take: loadAllVariants ? undefined : 1, // Load all variants for price sorting
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Filter products that have at least one matching variant (when attribute filters active)
    let filteredProducts =
      attributeFilters.length > 0
        ? products.filter((p) => p.variants.length > 0)
        : products;

    // Apply JavaScript sorting for price-based sorts
    if (sort === "price_asc" || sort === "price_desc") {
      filteredProducts = filteredProducts
        .map((product) => ({
          ...product,
          minPrice: Math.min(...product.variants.map((v) => Number(v.price))),
          maxPrice: Math.max(...product.variants.map((v) => Number(v.price))),
        }))
        .sort((a, b) => {
          if (sort === "price_asc") {
            return a.minPrice - b.minPrice;
          } else {
            return b.maxPrice - a.maxPrice;
          }
        })
        .map((product) => ({
          ...product,
          // Keep only the first variant for card display after sorting
          variants: [product.variants[0]],
        }));
    }

    return NextResponse.json({
      products: filteredProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[PRODUCTS/GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// ─── POST /api/products ───────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { variants: variantsData, ...productData } = body;

    const productResult = ProductSchema.safeParse(productData);
    if (!productResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: productResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Auto-generate SKU prefix from category
    const category = await prisma.category.findUnique({
      where: { id: productResult.data.categoryId },
    });

    // Create product with variants in a transaction
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({ data: productResult.data });

      if (variantsData && Array.isArray(variantsData)) {
        for (let i = 0; i < variantsData.length; i++) {
          const varResult = ProductVariantSchema.safeParse(variantsData[i]);
          if (!varResult.success) continue;

          const { attributeValueIds, ...variantFields } = varResult.data;

          // Auto-generate SKU if not provided
          const sku =
            variantFields.sku ||
            `${category?.prefix || "XX"}-${String(i + 1).padStart(4, "0")}`;

          const variant = await tx.productVariant.create({
            data: { ...variantFields, sku, productId: created.id },
          });

          // Link attribute values
          if (attributeValueIds?.length) {
            await tx.productAttribute.createMany({
              data: attributeValueIds.map((avId: string) => ({
                variantId: variant.id,
                attributeValueId: avId,
              })),
              skipDuplicates: true,
            });
          }
        }
      }

      return tx.product.findUnique({
        where: { id: created.id },
        include: {
          variants: {
            include: { attributes: { include: { attributeValue: true } } },
          },
          media: true,
          category: true,
          brand: true,
        },
      });
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Product slug or variant SKU already exists" },
        { status: 409 },
      );
    }
    console.error("[PRODUCTS/POST]", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
