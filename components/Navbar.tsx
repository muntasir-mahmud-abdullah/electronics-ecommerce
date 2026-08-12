"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, Truck, Shield, RotateCcw, Lock, ChevronRight, Star, Headphones, Monitor, Smartphone, Gamepad2, Home, Watch, Cpu } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useState } from "react";

export function Navbar() {
  const cartItemCount = useSelector((state: RootState) => state.cart.itemCount);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0A0C14]/95 backdrop-blur-xl border-b border-[#1E2235] transition-all duration-300">
      <div className="max-w-[1320px] mx-auto px-6">
        <div className="flex justify-between items-center h-[60px] gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0 group">
            <div className="w-7 h-7 rounded-md bg-[#00D4E8] flex items-center justify-center">
              <span className="text-[#0A0C14] font-black text-sm leading-none">G</span>
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
                className="text-[#8892A4] hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xs items-center gap-2 bg-[#111320] border border-[#1E2235] rounded-md px-3 h-9">
            <Search className="w-4 h-4 text-[#8892A4] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search hardware, specs, models..."
              className="flex-1 bg-transparent text-sm text-white placeholder-[#8892A4] outline-none"
            />
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-5">
            <Link href="/cart" className="flex items-center gap-2 text-[#8892A4] hover:text-white transition-colors relative group">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#00D4E8] text-[#0A0C14] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
              <span className="text-sm font-semibold text-white">
                ${cartItemCount > 0 ? (cartItemCount * 0).toFixed(0) : "0.00"}
              </span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 h-8 rounded-md border border-[#1E2235] bg-[#111320] text-sm text-[#8892A4] hover:text-white hover:border-[#2E3555] transition-all"
            >
              <User className="w-4 h-4" />
              Account
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden items-center gap-3">
            <Link href="/cart" className="text-[#8892A4] hover:text-white relative">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#00D4E8] text-[#0A0C14] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#8892A4] hover:text-white">
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
            <Link key={link.label} href={link.href} className="text-[#8892A4] hover:text-white text-sm font-medium py-1">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
