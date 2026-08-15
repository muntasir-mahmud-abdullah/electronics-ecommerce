import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parallel aggregate queries
    const [
      totalProducts,
      totalOrders,
      totalRevenueData,
      recentOrders
    ] = await Promise.all([
      prisma.product.count({ where: { status: { not: "ARCHIVED" } } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true } } }
      })
    ]);

    return NextResponse.json({
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenueData._sum?.total || 0,
      },
      recentOrders
    });
  } catch (error) {
    console.error("[ADMIN/STATS/GET]", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
