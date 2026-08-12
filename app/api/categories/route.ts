import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { CategorySchema } from "@/lib/validations";

// GET /api/categories — list all active categories (with attribute groups)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const withAttributes = searchParams.get("withAttributes") === "true";

    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        ...(withAttributes && {
          attributeMaps: {
            include: { attributeGroup: { include: { values: { orderBy: { sortOrder: "asc" } } } } },
            orderBy: { displayOrder: "asc" },
          },
        }),
      },
      orderBy: { sortOrder: "asc" },
    });

    // Return only root categories (parentId = null) with children nested
    const rootCategories = categories.filter((c) => !c.parentId);
    return NextResponse.json({ categories: rootCategories });
  } catch (error) {
    console.error("[CATEGORIES/GET]", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/categories — create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = CategorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({ data: result.data });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Category slug already exists" }, { status: 409 });
    }
    console.error("[CATEGORIES/POST]", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
