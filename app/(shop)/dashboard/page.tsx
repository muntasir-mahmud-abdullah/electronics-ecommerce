"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ShoppingBag, Heart, ArrowRight, Package } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalSpent: number;
    wishlistCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/user/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[32px] font-black text-white tracking-tight mb-2">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-[#8892A4] text-sm">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#00D4E8]/10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-[#00D4E8]" />
            </div>
            <Link
              href="/dashboard/orders"
              className="text-[#8892A4] hover:text-white transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-[#8892A4] text-xs uppercase tracking-wider mb-1">
            Total Orders
          </p>
          <p className="text-white text-2xl font-bold">
            {loading ? "..." : stats?.totalOrders || 0}
          </p>
        </div>

        <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-green-500" />
            </div>
            <Link
              href="/dashboard/orders"
              className="text-[#8892A4] hover:text-white transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-[#8892A4] text-xs uppercase tracking-wider mb-1">
            Total Spent
          </p>
          <p className="text-white text-2xl font-bold">
            {loading ? "..." : `$${stats?.totalSpent?.toFixed(2) || "0.00"}`}
          </p>
        </div>

        <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <Link
              href="/dashboard/wishlist"
              className="text-[#8892A4] hover:text-white transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-[#8892A4] text-xs uppercase tracking-wider mb-1">
            Wishlist Items
          </p>
          <p className="text-white text-2xl font-bold">
            {loading ? "..." : stats?.wishlistCount || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-4 p-4 bg-[#0A0C14] rounded-xl border border-[#1E2235] hover:border-[#00D4E8]/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-[#00D4E8]/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#00D4E8]" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">View Orders</p>
              <p className="text-[#8892A4] text-xs">
                Track your recent purchases
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/wishlist"
            className="flex items-center gap-4 p-4 bg-[#0A0C14] rounded-xl border border-[#1E2235] hover:border-[#00D4E8]/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">View Wishlist</p>
              <p className="text-[#8892A4] text-xs">See your saved items</p>
            </div>
          </Link>

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-4 p-4 bg-[#0A0C14] rounded-xl border border-[#1E2235] hover:border-[#00D4E8]/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Edit Profile</p>
              <p className="text-[#8892A4] text-xs">
                Update your account details
              </p>
            </div>
          </Link>

          <Link
            href="/products"
            className="flex items-center gap-4 p-4 bg-[#0A0C14] rounded-xl border border-[#1E2235] hover:border-[#00D4E8]/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                Continue Shopping
              </p>
              <p className="text-[#8892A4] text-xs">Browse our products</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
