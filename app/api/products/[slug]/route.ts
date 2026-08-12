import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

const PRODUCT_INCLUDE = {
  category: {
    include: {
      attributeMaps: {
        include: { attributeGroup: { include: { values: { orderBy: { sortOrder: "asc" as const } } } } },
        orderBy: { displayOrder: "asc" as const },
      },
    },
  },
  brand: true,
  media: { orderBy: { sortOrder: "asc" as const } },
  variants: {
    where: { isActive: true },
    include: {
      attributes: {
        include: {
          attributeValue: {
            include: { group: true },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
};

// GET /api/products/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_INCLUDE,
    });

    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("[PRODUCTS/[slug]/GET]", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PATCH /api/products/[slug] — update product (admin)
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

    const product = await prisma.product.update({
      where: { slug },
      data: body,
      include: PRODUCT_INCLUDE,
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("[PRODUCTS/[slug]/PATCH]", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/products/[slug]
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
    // Soft delete — set to ARCHIVED
    const product = await prisma.product.update({
      where: { slug },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("[PRODUCTS/[slug]/DELETE]", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
