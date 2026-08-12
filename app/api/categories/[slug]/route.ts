import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { CategorySchema } from "@/lib/validations";

// GET /api/categories/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await prisma.category.findUnique({
      where: { slug },
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
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("[CATEGORIES/[slug]/GET]", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

// PATCH /api/categories/[slug]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { slug },
      data: result.data,
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    console.error("[CATEGORIES/[slug]/PATCH]", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/categories/[slug]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    await prisma.category.delete({ where: { slug } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    console.error("[CATEGORIES/[slug]/DELETE]", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
