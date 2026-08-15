import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const ordersPage = Math.max(
      1,
      parseInt(searchParams.get("ordersPage") || "1"),
    );
    const ordersLimit = Math.min(
      10,
      parseInt(searchParams.get("ordersLimit") || "5"),
    );
    const ordersSkip = (ordersPage - 1) * ordersLimit;

    // Parallel aggregate queries
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenueData,
      recentOrders,
      ordersTotal,
    ] = await Promise.all([
      prisma.product.count({ where: { status: { not: "ARCHIVED" } } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.findMany({
        skip: ordersSkip,
        take: ordersLimit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { email: true, name: true } },
          items: {
            include: {
              variant: { include: { product: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: totalRevenueData._sum?.total || 0,
      },
      recentOrders,
      ordersPagination: {
        page: ordersPage,
        limit: ordersLimit,
        total: ordersTotal,
        totalPages: Math.ceil(ordersTotal / ordersLimit),
      },
    });
  } catch (error) {
    console.error("[ADMIN/STATS/GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
