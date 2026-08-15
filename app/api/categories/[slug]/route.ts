import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { CategorySchema } from "@/lib/validations";

// Helper function to determine if string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET /api/categories/[slug] - accepts both id and slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Determine if this is an id or slug lookup
    const whereClause = isUUID(slug) ? { id: slug } : { slug };

    const category = await prisma.category.findUnique({
      where: whereClause,
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        attributeMaps: {
          include: {
            attributeGroup: {
              include: { values: { orderBy: { sortOrder: "asc" } } },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("[CATEGORIES/[slug]/GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

// PATCH /api/categories/[slug] - accepts both id and slug
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    const body = await request.json();
    const result = CategorySchema.partial().safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Determine if this is an id or slug lookup
    const whereClause = isUUID(slug) ? { id: slug } : { slug };

    const category = await prisma.category.update({
      where: whereClause,
      data: result.data,
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Category slug already exists" },
        { status: 409 },
      );
    }
    console.error("[CATEGORIES/[slug]/PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

// DELETE /api/categories/[slug] - accepts both id and slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;

    // Determine if this is an id or slug lookup
    const whereClause = isUUID(slug) ? { id: slug } : { slug };

    // Ensure it has no products or children
    const category = await prisma.category.findUnique({
      where: whereClause,
      include: {
        _count: { select: { products: true, children: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    if (category._count.products > 0 || category._count.children > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete category because it contains products or subcategories.",
        },
        { status: 400 },
      );
    }

    await prisma.category.delete({
      where: whereClause,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }
    console.error("[CATEGORIES/[slug]/DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
