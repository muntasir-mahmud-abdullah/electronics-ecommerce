import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { UpdateCartItemSchema } from "@/lib/validations";

// PATCH /api/cart/items/[id] — update quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = UpdateCartItemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id },
      include: { variant: { select: { stock: true } } },
    });

    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (result.data.quantity > item.variant.stock) {
      return NextResponse.json({ error: `Only ${item.variant.stock} units available` }, { status: 400 });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: result.data.quantity },
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE /api/cart/items/[id] — remove item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.cartItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
