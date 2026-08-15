import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/user/orders/[id] — fetch single order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true, slug: true } } },
            },
          },
        },
        payment: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ensure user can only access their own orders
    if (order.userId !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[USER/ORDERS/[id]/GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

// DELETE /api/user/orders/[id] — cancel order (user can only cancel their own pending orders)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ensure user can only cancel their own orders
    if (order.userId !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow cancellation of pending orders
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending orders can be cancelled" },
        { status: 400 },
      );
    }

    // Cancel order and restore stock
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restore stock for all items
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Update order status
      const updated = await tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: {
          items: true,
          payment: true,
          statusHistory: { orderBy: { createdAt: "desc" } },
        },
      });

      // Add status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: "CANCELLED",
          note: "Order cancelled by user",
          actorId: user.sub,
        },
      });

      return updated;
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("[USER/ORDERS/[id]/DELETE]", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 },
    );
  }
}
