import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { Globe, Mail, MessageCircle, Video, Code } from "lucide-react";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0C14]">
      <Navbar />
      <main className="flex-1 pt-[60px]">
        {children}
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="bg-[#060810] border-t border-[#1E2235] mt-auto">
        <div className="max-w-[1320px] mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand + Newsletter */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-1.5 mb-4 group">
                <div className="w-7 h-7 rounded-md bg-[#00D4E8] flex items-center justify-center">
                  <span className="text-[#0A0C14] font-black text-sm leading-none">G</span>
                </div>
                <span className="font-bold text-[17px] tracking-tight text-white">
                  GadgetHub<span className="text-[#00D4E8]">.</span>
                </span>
              </Link>
              <p className="text-[#8892A4] text-sm leading-relaxed mb-6">
                Premium tech hardware curated for absolute performance. Experience engineering-level depth with dynamic side-by-side comparison tables.
              </p>
              <p className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Subscribe to Hardware Drops</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 bg-[#111320] border border-[#1E2235] text-white text-sm px-3 py-2 rounded-l-md placeholder-[#8892A4] outline-none focus:border-[#00D4E8]/50"
                />
                <button className="bg-[#00D4E8] hover:bg-[#00BDD0] text-[#0A0C14] font-bold text-xs px-4 py-2 rounded-r-md transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Products</h4>
              <ul className="space-y-2.5">
                {["Audio & Studio", "Computing & PCs", "Mobile & Tablets", "Gaming Setup", "Wearables"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[#8892A4] text-sm hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Support</h4>
              <ul className="space-y-2.5">
                {["Warranty Claims", "Hardware Repair", "Order Tracking", "Technical FAQ", "Developer API"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[#8892A4] text-sm hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2.5">
                {["Our Philosophy", "System Labs", "Media Kit", "Careers", "Contact Engineers"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[#8892A4] text-sm hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-[#1E2235] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[#8892A4] text-xs">
              © {new Date().getFullYear()} GadgetHub Technologies Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {[Globe, MessageCircle, Video, Mail, Code].map((Icon, i) => (
                <a key={i} href="#" className="text-[#8892A4] hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
