import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

const AdjustStockSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int(), // positive to add, negative to subtract
  reason: z.string().optional(),
});

// GET /api/inventory — list low stock items
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get("threshold") || "10");

    const lowStockVariants = await prisma.productVariant.findMany({
      where: { stock: { lte: threshold }, isActive: true },
      include: {
        product: { select: { name: true, category: { select: { name: true } } } },
        attributes: { include: { attributeValue: true } },
      },
      orderBy: { stock: "asc" },
    });

    return NextResponse.json({ lowStockVariants });
  } catch (error) {
    console.error("[INVENTORY/GET]", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

// POST /api/inventory — adjust stock
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = AdjustStockSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { variantId, quantity } = result.data;

    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

    const newStock = Math.max(0, variant.stock + quantity);

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
      include: { product: { select: { name: true } } },
    });

    return NextResponse.json({ variant: updated });
  } catch (error) {
    console.error("[INVENTORY/POST]", error);
    return NextResponse.json({ error: "Failed to adjust stock" }, { status: 500 });
  }
}
