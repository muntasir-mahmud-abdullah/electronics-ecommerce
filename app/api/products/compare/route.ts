import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/compare?ids=id1,id2,id3
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json({ error: "ids parameter is required" }, { status: 400 });
    }

    const ids = idsParam.split(",").slice(0, 3); // Max 3 products

    if (ids.length < 2) {
      return NextResponse.json({ error: "At least 2 product IDs required" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids }, status: "ACTIVE" },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        media: { where: { isPrimary: true }, take: 1 },
        variants: {
          where: { isActive: true },
          include: {
            attributes: {
              include: {
                attributeValue: { include: { group: true } },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });

    // Build a union of all attribute group names across all products for the comparison table
    const allGroupNames = new Set<string>();
    for (const product of products) {
      for (const variant of product.variants) {
        for (const attr of variant.attributes) {
          allGroupNames.add(attr.attributeValue.group.name);
        }
      }
    }

    // Flatten each product's first variant's attributes into a map {groupName → value}
    const enrichedProducts = products.map((product) => {
      const variant = product.variants[0];
      const specMap: Record<string, string> = {};
      if (variant) {
        for (const attr of variant.attributes) {
          specMap[attr.attributeValue.group.name] =
            attr.attributeValue.group.unit
              ? `${attr.attributeValue.value} ${attr.attributeValue.group.unit}`
              : attr.attributeValue.value;
        }
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand?.name,
        category: product.category.name,
        image: product.media[0]?.url || null,
        price: variant?.price,
        salePrice: variant?.salePrice,
        stock: variant?.stock ?? 0,
        variantId: variant?.id,
        warrantyMonths: product.warrantyMonths,
        warrantyNote: product.warrantyNote,
        condition: product.condition,
        specs: specMap,
      };
    });

    // Sort products in requested id order
    const orderedProducts = ids
      .map((id) => enrichedProducts.find((p) => p.id === id))
      .filter(Boolean);

    return NextResponse.json({
      products: orderedProducts,
      allAttributeGroups: [...allGroupNames].sort(),
    });
  } catch (error) {
    console.error("[PRODUCTS/COMPARE]", error);
    return NextResponse.json({ error: "Failed to fetch comparison" }, { status: 500 });
  }
}
