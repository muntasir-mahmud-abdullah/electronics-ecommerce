import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { AddToCartSchema } from "@/lib/validations";

const CART_INCLUDE = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              media: { where: { isPrimary: true }, take: 1 },
              brand: { select: { name: true } },
            },
          },
          attributes: {
            include: { attributeValue: { include: { group: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

function computeCartTotals(items: any[]) {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.variant.salePrice ?? item.variant.price);
    return sum + price * item.quantity;
  }, 0);
  const threshold = parseFloat(process.env.FREE_SHIPPING_THRESHOLD || "99");
  const flatRate = parseFloat(process.env.SHIPPING_FLAT_RATE || "9.99");
  const shippingCost = subtotal > threshold ? 0 : flatRate;
  return { subtotal, shippingCost, total: subtotal + shippingCost };
}

// POST /api/cart/items — Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const sessionId = request.cookies.get("cart_session")?.value;

    const body = await request.json();
    const result = AddToCartSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { variantId, quantity } = result.data;

    // Validate variant exists, is active, and has stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { select: { status: true } } },
    });

    if (!variant || !variant.isActive || variant.product.status !== "ACTIVE") {
      return NextResponse.json({ error: "Product not available" }, { status: 400 });
    }
    if (variant.stock < quantity) {
      return NextResponse.json({ error: `Only ${variant.stock} units available` }, { status: 400 });
    }

    // Get or create cart
    let cart;
    if (user?.sub) {
      cart = await prisma.cart.findUnique({ where: { userId: user.sub } });
      if (!cart) cart = await prisma.cart.create({ data: { userId: user.sub } });
    } else if (sessionId) {
      cart = await prisma.cart.findUnique({ where: { sessionId } });
      if (!cart) cart = await prisma.cart.create({ data: { sessionId } });
    } else {
      return NextResponse.json({ error: "No session identified" }, { status: 400 });
    }

    // Upsert cart item (if exists, increment; otherwise create)
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > variant.stock) {
        return NextResponse.json({ error: `Only ${variant.stock} units available` }, { status: 400 });
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, variantId, quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: CART_INCLUDE,
    });

    const totals = computeCartTotals(updatedCart!.items);
    return NextResponse.json({ cart: updatedCart, ...totals });
  } catch (error) {
    console.error("[CART/ITEMS/POST]", error);
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 });
  }
}
