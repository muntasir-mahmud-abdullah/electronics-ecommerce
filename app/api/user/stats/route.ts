import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/user/stats — fetch user statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalOrders, totalSpentData, wishlistCount] = await Promise.all([
      prisma.order.count({
        where: { userId: user.sub },
      }),
      prisma.order.aggregate({
        where: {
          userId: user.sub,
          status: { not: "CANCELLED" },
        },
        _sum: { total: true },
      }),
      prisma.wishlistItem.count({
        where: { userId: user.sub },
      }),
    ]);

    const totalSpent = totalSpentData._sum?.total || 0;

    return NextResponse.json({
      stats: {
        totalOrders,
        totalSpent: Number(totalSpent),
        wishlistCount,
      },
    });
  } catch (error) {
    console.error("[USER/STATS/GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
