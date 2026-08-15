import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { CheckoutSchema, UpdateOrderStatusSchema } from "@/lib/validations";
import { nanoid } from "nanoid";

function generateOrderNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `GH-${ymd}-${nanoid(6).toUpperCase()}`;
}

// GET /api/orders — list orders (customer: own; admin: all)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    const isAdmin = user.role === "SUPER_ADMIN" || user.role === "MANAGER";
    const statusFilter = searchParams.get("status");

    const where = {
      ...(isAdmin ? {} : { userId: user.sub }),
      ...(statusFilter && { status: statusFilter as any }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              variant: {
                include: { product: { select: { name: true } } },
              },
            },
          },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("[ORDERS/GET]", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders — create order from cart (checkout)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CheckoutSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await getAuthUser(request);
    const sessionId = request.cookies.get("cart_session")?.value;

    // Find cart
    let cart = null;
    if (user?.sub) {
      cart = await prisma.cart.findUnique({
        where: { userId: user.sub },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { media: { where: { isPrimary: true }, take: 1 } },
                  },
                  attributes: {
                    include: { attributeValue: { include: { group: true } } },
                  },
                },
              },
            },
          },
        },
      });
    } else if (result.data.cartId) {
      cart = await prisma.cart.findUnique({
        where: { id: result.data.cartId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { media: { where: { isPrimary: true }, take: 1 } },
                  },
                  attributes: {
                    include: { attributeValue: { include: { group: true } } },
                  },
                },
              },
            },
          },
        },
      });
    } else if (sessionId) {
      cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { media: { where: { isPrimary: true }, take: 1 } },
                  },
                  attributes: {
                    include: { attributeValue: { include: { group: true } } },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const shippingThreshold = parseFloat(process.env.FREE_SHIPPING_THRESHOLD || "99");
    const flatRate = parseFloat(process.env.SHIPPING_FLAT_RATE || "9.99");

    // Atomic transaction: validate stock → deduct → create order
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;

      // 1. Validate stock and current prices (never trust cart snapshot)
      for (const item of cart!.items) {
        const freshVariant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: { select: { status: true } } },
        });

        if (!freshVariant || !freshVariant.isActive || freshVariant.product.status !== "ACTIVE") {
          throw new Error(`Product "${item.variant.product.name}" is no longer available`);
        }
        if (freshVariant.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${item.variant.product.name}" (only ${freshVariant.stock} left)`);
        }

        subtotal += Number(freshVariant.salePrice ?? freshVariant.price) * item.quantity;
      }

      const shippingCost = subtotal > shippingThreshold ? 0 : flatRate;
      const total = subtotal + shippingCost;

      // 2. Deduct stock
      for (const item of cart!.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Create order
      const orderNumber = generateOrderNumber();
      const { cartId, ...checkoutData } = result.data;

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.sub || null,
          ...checkoutData,
          subtotal,
          shippingCost,
          total,
          status: "PENDING",
          paymentStatus: checkoutData.paymentMethod === "COD" ? "PENDING" : "PENDING",
          fulfillmentStatus: "UNFULFILLED",
          items: {
            create: cart!.items.map((item) => {
              // Build variant label from attributes
              const variantLabel = item.variant.attributes
                .map((a) => a.attributeValue.value)
                .join(" / ");

              return {
                variantId: item.variantId,
                productName: item.variant.product.name,
                variantLabel,
                unitPrice: item.variant.salePrice ?? item.variant.price,
                quantity: item.quantity,
                subtotal: Number(item.variant.salePrice ?? item.variant.price) * item.quantity,
                imageUrl: item.variant.product.media[0]?.url || null,
              };
            }),
          },
          payment: {
            create: {
              method: checkoutData.paymentMethod,
              amount: total,
              status: "PENDING",
            },
          },
        },
        include: {
          items: true,
          payment: true,
        },
      });

      // 4. Add initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          toStatus: "PENDING",
          note: "Order placed",
          actorId: user?.sub || null,
        },
      });

      // 5. Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart!.id } });

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("Insufficient stock") || error.message?.includes("no longer available")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("[ORDERS/POST]", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
