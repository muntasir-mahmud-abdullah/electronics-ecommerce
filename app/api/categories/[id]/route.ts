import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { CategorySchema } from "@/lib/validations";

// PATCH /api/categories/[id] — Edit category
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    
    // Partial validation
    const result = CategorySchema.partial().safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: result.data,
    });
    
    return NextResponse.json({ category });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Category slug already exists" }, { status: 409 });
    }
    console.error("[CATEGORIES/PATCH]", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/categories/[id] — Delete category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Ensure it has no products or children
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { products: true, children: true } }
      }
    });

    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (category._count.products > 0 || category._count.children > 0) {
      return NextResponse.json({ 
        error: "Cannot delete category because it contains products or subcategories." 
      }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: params.id },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CATEGORIES/DELETE]", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
