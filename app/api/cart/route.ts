import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

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

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    let cart = await prisma.cart.findUnique({ where: { userId }, include: CART_INCLUDE });
    if (!cart) cart = await prisma.cart.create({ data: { userId }, include: CART_INCLUDE });
    return cart;
  }
  if (sessionId) {
    let cart = await prisma.cart.findUnique({ where: { sessionId }, include: CART_INCLUDE });
    if (!cart) cart = await prisma.cart.create({ data: { sessionId }, include: CART_INCLUDE });
    return cart;
  }
  return null;
}

function computeCartTotals(items: any[]) {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.variant.salePrice ?? item.variant.price);
    return sum + price * item.quantity;
  }, 0);
  const shippingCost = subtotal > parseFloat(process.env.FREE_SHIPPING_THRESHOLD || "99") ? 0 : parseFloat(process.env.SHIPPING_FLAT_RATE || "9.99");
  return { subtotal, shippingCost, total: subtotal + shippingCost };
}

// GET /api/cart
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const sessionId = request.cookies.get("cart_session")?.value;

    const cart = await getOrCreateCart(user?.sub, sessionId || undefined);
    if (!cart) return NextResponse.json({ error: "Could not identify cart" }, { status: 400 });

    const totals = computeCartTotals(cart.items);
    return NextResponse.json({ cart, ...totals });
  } catch (error) {
    console.error("[CART/GET]", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}
