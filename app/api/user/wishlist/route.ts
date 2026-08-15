import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

const AddToWishlistSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
});

// GET /api/user/wishlist — fetch user's wishlist
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: user.sub },
      include: {
        variant: {
          include: {
            product: {
              include: {
                media: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ wishlistItems });
  } catch (error) {
    console.error("[USER/WISHLIST/GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 },
    );
  }
}

// POST /api/user/wishlist — add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = AddToWishlistSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { variantId } = result.data;

    // Check if variant exists
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || !variant.isActive || variant.product.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Product not available" },
        { status: 404 },
      );
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: user.sub,
        variantId,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already in wishlist" },
        { status: 409 },
      );
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.sub,
        variantId,
      },
      include: {
        variant: {
          include: {
            product: {
              include: {
                media: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ wishlistItem }, { status: 201 });
  } catch (error) {
    console.error("[USER/WISHLIST/POST]", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 },
    );
  }
}
