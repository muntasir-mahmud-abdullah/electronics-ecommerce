"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  ShoppingBag,
  Heart,
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
    { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C14] pt-[60px]">
      <div className="max-w-[1320px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-6 sticky top-24">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#1E2235]">
                <div className="w-12 h-12 rounded-full bg-[#00D4E8] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#0A0C14] font-black text-lg leading-none">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {user?.name}
                  </p>
                  <p className="text-[#8892A4] text-xs truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#00D4E8]/10 text-[#00D4E8]"
                          : "text-[#8892A4] hover:text-white hover:bg-[#1E2235]/50"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#8892A4] hover:text-red-400 hover:bg-red-400/10 transition-colors w-full mt-4"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Header */}
            <div className="lg:hidden mb-6">
              <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#00D4E8] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#0A0C14] font-black text-base leading-none">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {user?.name}
                    </p>
                    <p className="text-[#8892A4] text-xs truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex gap-2 overflow-x-auto pb-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                          isActive
                            ? "bg-[#00D4E8]/10 text-[#00D4E8]"
                            : "text-[#8892A4] hover:text-white hover:bg-[#1E2235]/50"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Page Content */}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
