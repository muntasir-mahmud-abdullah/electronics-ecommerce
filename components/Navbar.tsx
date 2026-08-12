"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export function Navbar() {
  const cartItemCount = useSelector((state: RootState) => state.cart.itemCount);

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-cyan-400/40 transition-all">
                <span className="text-white font-bold text-xl leading-none">G</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-cyan-400 transition-all">
                GadgetHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link href="/products?category=laptops" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Laptops
            </Link>
            <Link href="/products?category=smartphones" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Smartphones
            </Link>
            <Link href="/compare" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Compare
            </Link>
          </div>

          {/* Icons & Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/cart" className="text-gray-400 hover:text-white transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-4">
            <Link href="/cart" className="text-gray-400 hover:text-white relative">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button className="text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
