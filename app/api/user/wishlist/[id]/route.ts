import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// DELETE /api/user/wishlist/[id] — remove item from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if wishlist item exists and belongs to user
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: { id },
    });

    if (!wishlistItem) {
      return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 });
    }

    if (wishlistItem.userId !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete wishlist item
    await prisma.wishlistItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Item removed from wishlist" });
  } catch (error) {
    console.error("[USER/WISHLIST/[id]/DELETE]", error);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
