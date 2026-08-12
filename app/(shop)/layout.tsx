import { ReactNode } from "next";
import { Navbar } from "@/components/Navbar";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="glass-panel mt-auto py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-gray-400">
          <div>
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center">
                <span className="text-white font-bold text-xs">G</span>
              </div>
              GadgetHub
            </h4>
            <p>The electronics store that shows you the spec, not just the price.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><a href="/products?category=laptops" className="hover:text-white transition-colors">Laptops</a></li>
              <li><a href="/products?category=smartphones" className="hover:text-white transition-colors">Smartphones</a></li>
              <li><a href="/compare" className="hover:text-white transition-colors">Compare Specs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li><a href="/login" className="hover:text-white transition-colors">Login</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">Register</a></li>
              <li><a href="/orders" className="hover:text-white transition-colors">Order History</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs">
          © {new Date().getFullYear()} GadgetHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
