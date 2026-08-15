"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  LogOut,
  LayoutDashboard,
  Loader2,
  Scale,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { setCart } from "@/store/slices/cart";
import { openCart, closeCart } from "@/store/slices/ui";
import { clearAuth } from "@/store/slices/auth";
import { showToast } from "@/store/slices/ui";
import { initializeFromStorage } from "@/store/slices/compare";
import { useState, useEffect } from "react";
import { Cart } from "./Cart";
import { useDebounce } from "@/lib/hooks/useDebounce";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";

export function Navbar() {
  const router = useRouter();
  const {
    itemCount: cartItemCount,
    isLoaded: cartIsLoaded,
    total: cartTotal,
  } = useSelector((state: RootState) => state.cart);
  const isCartOpen = useSelector((state: RootState) => state.ui.isCartOpen);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const compareIds = useSelector(
    (state: RootState) => state.compare.productIds,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    if (!cartIsLoaded) {
      fetch("/api/cart")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) dispatch(setCart(data));
        })
        .catch(console.error);
    }
    // Initialize compare state from session storage
    dispatch(initializeFromStorage());
  }, [cartIsLoaded, dispatch]);

  // Handle debounced search navigation
  useEffect(() => {
    // Show loading while typing (before debounce completes)
    if (debouncedSearchQuery !== searchQuery) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setIsSearching(false);
      if (debouncedSearchQuery.trim()) {
        router.push(
          `/products?search=${encodeURIComponent(debouncedSearchQuery)}`,
        );
      } else if (debouncedSearchQuery === "") {
        router.push("/products");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [debouncedSearchQuery, searchQuery, router]);

  // Handle Enter key for immediate search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      dispatch(clearAuth());
      dispatch(
        showToast({ message: "Logged out successfully", type: "success" }),
      );
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      dispatch(showToast({ message: "Logout failed", type: "error" }));
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0A0C14]/95 backdrop-blur-xl border-b border-[#1E2235] transition-all duration-300">
      <div className="max-w-[1320px] mx-auto px-6">
        <div className="flex justify-between items-center h-[60px] gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 flex-shrink-0 group"
          >
            <div className="w-7 h-7 rounded-md bg-[#00D4E8] flex items-center justify-center">
              <span className="text-[#0A0C14] font-black text-sm leading-none">
                G
              </span>
            </div>
            <span className="font-bold text-[17px] tracking-tight text-white">
              GadgetHub<span className="text-[#00D4E8]">.</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-7">
            {[
              { label: "Audio", href: "/products?category=audio" },
              { label: "Computing", href: "/products?category=laptops" },
              { label: "Mobile", href: "/products?category=smartphones" },
              { label: "Gaming", href: "/products?category=gaming" },
              { label: "Smart Home", href: "/products?category=smarthome" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[#E2E8F0] hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xs items-center gap-2 bg-[#111320] border border-[#1E2235] rounded-md px-3 h-9">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-[#00D4E8] flex-shrink-0 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-[#8892A4] flex-shrink-0" />
            )}
            <input
              type="text"
              placeholder="Search hardware, specs, models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="flex-1 bg-transparent text-sm text-white placeholder-[#8892A4] outline-none"
            />
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              href="/compare"
              className="flex items-center gap-2 text-[#E2E8F0] hover:text-white transition-colors relative group"
              title={
                compareIds.length > 0
                  ? `Compare ${compareIds.length} products`
                  : "Compare products"
              }
            >
              <Scale className="w-4 h-4" />
              {compareIds.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#00D4E8] text-[#0A0C14] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {compareIds.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => dispatch(openCart())}
              className="flex items-center gap-2 text-[#E2E8F0] hover:text-white transition-colors relative group"
            >
              <ShoppingCart className="w-4 h-4" color="white" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#00D4E8] text-[#0A0C14] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
              <span className="text-sm font-semibold text-white">
                ${cartTotal.toFixed(0)}
              </span>
            </button>

            {isAuthenticated && user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 px-3 h-8 rounded-md border border-[#1E2235] bg-[#111320] text-sm text-[#E2E8F0] hover:text-white hover:border-[#2E3555] transition-all">
                    <Avatar.Root className="w-6 h-6 rounded-full bg-[#00D4E8] flex items-center justify-center">
                      <Avatar.Fallback className="text-[#0A0C14] text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <span className="text-sm font-medium">
                      {user.name.split(" ")[0]}
                    </span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[200px] bg-[#111320] border border-[#1E2235] rounded-lg p-2 shadow-xl z-50"
                    sideOffset={8}
                    align="end"
                  >
                    <div className="px-3 py-2 border-b border-[#1E2235] mb-2">
                      <p className="text-sm font-semibold text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-[#8892A4]">{user.email}</p>
                    </div>
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#E2E8F0] hover:text-white hover:bg-[#1E2235] rounded-md transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#E2E8F0] hover:text-white hover:bg-[#1E2235] rounded-md transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 h-8 rounded-md border border-[#1E2235] bg-[#111320] text-sm text-[#E2E8F0] hover:text-white hover:border-[#2E3555] transition-all"
              >
                <User className="w-4 h-4" color="white" />
                Account
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden items-center gap-3">
            <Link
              href="/compare"
              className="text-[#8892A4] hover:text-white relative"
              title={
                compareIds.length > 0
                  ? `Compare ${compareIds.length} products`
                  : "Compare products"
              }
            >
              <Scale className="w-5 h-5" />
              {compareIds.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#00D4E8] text-[#0A0C14] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {compareIds.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => dispatch(openCart())}
              className="text-[#8892A4] hover:text-white relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#00D4E8] text-[#0A0C14] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
            {isAuthenticated && user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2">
                    <Avatar.Root className="w-7 h-7 rounded-full bg-[#00D4E8] flex items-center justify-center">
                      <Avatar.Fallback className="text-[#0A0C14] text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar.Root>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[200px] bg-[#111320] border border-[#1E2235] rounded-lg p-2 shadow-xl z-50"
                    sideOffset={8}
                    align="end"
                  >
                    <div className="px-3 py-2 border-b border-[#1E2235] mb-2">
                      <p className="text-sm font-semibold text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-[#8892A4]">{user.email}</p>
                    </div>
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#E2E8F0] hover:text-white hover:bg-[#1E2235] rounded-md transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#E2E8F0] hover:text-white hover:bg-[#1E2235] rounded-md transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <Link href="/login" className="text-[#8892A4] hover:text-white">
                <User className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-[#8892A4] hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#1E2235] bg-[#0A0C14] px-6 py-4 flex flex-col gap-3">
          {[
            { label: "Audio", href: "/products?category=audio" },
            { label: "Computing", href: "/products?category=laptops" },
            { label: "Mobile", href: "/products?category=smartphones" },
            { label: "Gaming", href: "/products?category=gaming" },
            { label: "Smart Home", href: "/products?category=smarthome" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[#8892A4] hover:text-white text-sm font-medium py-1"
            >
              {link.label}
            </Link>
          ))}
          {compareIds.length > 0 && (
            <Link
              href="/compare"
              className="text-[#8892A4] hover:text-white text-sm font-medium py-1 flex items-center gap-2"
            >
              <Scale className="w-4 h-4" />
              Compare ({compareIds.length})
            </Link>
          )}
          {isAuthenticated && user && (
            <>
              <div className="border-t border-[#1E2235] pt-3 mt-2">
                <p className="text-xs text-[#8892A4] mb-2">
                  Signed in as {user.name}
                </p>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-[#E2E8F0] hover:text-white text-sm font-medium py-1"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-[#E2E8F0] hover:text-white text-sm font-medium py-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Cart Slide-over */}
      <Cart isOpen={isCartOpen} onClose={() => dispatch(closeCart())} />
    </nav>
  );
}
