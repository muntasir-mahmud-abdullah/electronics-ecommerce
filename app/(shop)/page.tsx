"use client";

import Link from "next/link";
import { ArrowRight, Truck, Shield, RotateCcw, Lock, Headphones, Monitor, Smartphone, Gamepad2, Home as HomeIcon, Watch, ChevronRight, Star, ChevronLeft } from "lucide-react";

// --- Data ---
const TRUST_ITEMS = [
  { icon: Truck, label: "Global Free Shipping" },
  { icon: Shield, label: "2-Year Hardware Warranty" },
  { icon: RotateCcw, label: "Easy 30-Day Returns" },
  { icon: Lock, label: "Secure Tech Payment" },
];

const CATEGORIES = [
  { icon: Headphones, label: "High-Res Audio", count: 12, slug: "audio" },
  { icon: Monitor, label: "Computing & Rig", count: 6, slug: "laptops" },
  { icon: Smartphone, label: "Mobile Devices", count: 14, slug: "smartphones" },
  { icon: Gamepad2, label: "Gaming Pro Gear", count: 11, slug: "gaming" },
  { icon: HomeIcon, label: "Smart Automation", count: 16, slug: "smarthome" },
  { icon: Watch, label: "Biometric Wear", count: 9, slug: "wearables" },
];

const LAB_SETUPS = [
  {
    title: "Creative Workspace",
    description: "Designed for monitor, studio workflows & 2070 GR cores.",
    href: "/products",
    bg: "from-indigo-900/80 to-[#0A0C14]",
    accent: "#00D4E8",
  },
  {
    title: "Competitive Esports Setup",
    description: "Max frame-rates, 360Hz displays, top-tier pro accessories.",
    href: "/products?category=gaming",
    bg: "from-cyan-900/80 to-[#0A0C14]",
    accent: "#00D4E8",
  },
  {
    title: "Audio & Creator Lab",
    description: "Perfect studio setups with lossless recording capabilities.",
    href: "/products?category=audio",
    bg: "from-violet-900/80 to-[#0A0C14]",
    accent: "#A78BFA",
  },
];

const BEST_SELLERS = [
  {
    badge: "BEST SELLERS",
    badgeColor: "#00D4E8",
    category: "HIGH-RES AUDIO",
    name: "Acoustix Pro Max",
    price: 349,
    rating: 4.5,
    reviews: 513,
    specs: ["Active ANC", "Hi-Res Audio", "60h Battery"],
  },
  {
    badge: null,
    badgeColor: null,
    category: "COMPUTING",
    name: "Quantum Pro Rig",
    price: 1899,
    rating: 4.0,
    reviews: 88,
    specs: ["Intel Core Ultra", "64GB DDR5", "2TB NVMe"],
  },
  {
    badge: "PRO CHOICE",
    badgeColor: "#7C3AED",
    category: "MOBILE",
    name: "Vanguard Book Pro",
    price: 1249,
    rating: 4.5,
    reviews: 1753,
    specs: ["OLED 120Hz", "8M Pro Chip", "1TB SSD"],
  },
  {
    badge: null,
    badgeColor: null,
    category: "BIOMETRIC WEAR",
    name: "Apex Chrono Chronometer",
    price: 299,
    rating: 4.0,
    reviews: 340,
    specs: ["Bio-Detect v2", "AOD Sapphire", "30d Water"],
  },
];

// --- Sub-components ---
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.floor(rating) ? "fill-[#00D4E8] text-[#00D4E8]" : i - 0.5 <= rating ? "fill-[#00D4E8]/50 text-[#00D4E8]/50" : "fill-[#1E2235] text-[#1E2235]"}`}
        />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: (typeof BEST_SELLERS)[0] }) {
  return (
    <div className="flex-shrink-0 w-[220px] bg-[#111320] border border-[#1E2235] rounded-xl overflow-hidden hover:border-[#00D4E8]/30 transition-colors group">
      {/* Image placeholder */}
      <div className="relative h-44 bg-[#0D0F1A] flex items-center justify-center">
        {product.badge && (
          <span
            className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded"
            style={{ color: product.badgeColor!, border: `1px solid ${product.badgeColor}`, background: `${product.badgeColor}15` }}
          >
            {product.badge}
          </span>
        )}
        <div className="w-24 h-24 rounded-full bg-[#1A1D2E] flex items-center justify-center opacity-60 group-hover:opacity-90 transition-opacity">
          <Star className="w-10 h-10 text-[#00D4E8]" />
        </div>
      </div>

      <div className="p-4">
        <p className="text-[10px] font-bold text-[#00D4E8] tracking-widest mb-1">{product.category}</p>
        <h4 className="text-white font-semibold text-sm mb-2 leading-snug">{product.name}</h4>
        <p className="text-white font-bold text-xl mb-2">${product.price.toLocaleString()}</p>
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-[#8892A4] text-[10px]">({product.reviews.toLocaleString()})</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {product.specs.map((s) => (
            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1A1D2E] border border-[#1E2235] text-[#8892A4] uppercase tracking-wide">
              {s}
            </span>
          ))}
        </div>
        <button className="w-full bg-[#00D4E8] hover:bg-[#00BDD0] text-[#0A0C14] font-bold text-xs py-2.5 rounded-md transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// --- Page ---
export default function Home() {
  return (
    <div className="bg-[#0A0C14] min-h-screen">
      {/* ── 1. HERO ───────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[520px] flex items-center overflow-hidden bg-[#0A0C14]">
        {/* BG gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C14] via-[#0A0C14]/80 to-transparent z-10" />
        {/* BG decorative circles */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-[#00D4E8]/10 opacity-60" />
        <div className="absolute right-20 top-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-[#00D4E8]/15 opacity-60" />
        <div className="absolute right-28 top-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full bg-[#00D4E8]/5 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-[#00D4E8]/10" />
        </div>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(#00D4E8 1px, transparent 1px), linear-gradient(90deg, #00D4E8 1px, transparent 1px)", backgroundSize: "48px 48px" }}
        />

        <div className="relative z-20 max-w-[1320px] mx-auto px-6 py-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 border border-[#00D4E8]/40 text-[#00D4E8] text-[10px] font-bold tracking-widest px-3 py-1 rounded mb-6 uppercase">
              New Arrival Edition
            </div>
            <h1 className="text-5xl lg:text-6xl font-black leading-[1.08] mb-5 text-white tracking-tight">
              Architectural Sound.<br />
              <span className="text-[#00D4E8]">Zero Distortions.</span>
            </h1>
            <p className="text-[#8892A4] text-[15px] mb-8 leading-relaxed max-w-sm">
              Presenting the GadgetHub SoundLabs Pro Series. Engineered with 50mm electrostatic transducers and real-time environment mapping.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products?category=audio"
                className="flex items-center gap-2 bg-[#00D4E8] hover:bg-[#00BDD0] text-[#0A0C14] font-bold px-6 py-3 rounded-md text-sm transition-colors"
              >
                Explore SoundLabs
              </Link>
              <Link
                href="/compare"
                className="flex items-center gap-2 border border-[#2E3555] hover:border-[#00D4E8]/50 text-white font-semibold px-6 py-3 rounded-md text-sm transition-colors"
              >
                Technical Specsheet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST BAR ─────────────────────────────────────────────── */}
      <section className="border-y border-[#1E2235] bg-[#0D0F1A]">
        <div className="max-w-[1320px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#1E2235]">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-4">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[#00D4E8]">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[13px] text-[#8892A4] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED CATEGORIES ───────────────────────────────────── */}
      <section className="max-w-[1320px] mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white mb-1">Featured Hardware Categories</h2>
        <p className="text-[#8892A4] text-sm mb-8">Engineered devices categorized by architectural standards.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(({ icon: Icon, label, count, slug }) => (
            <Link
              key={slug}
              href={`/products?category=${slug}`}
              className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-[#111320] border border-[#1E2235] hover:border-[#00D4E8]/40 hover:bg-[#131625] transition-all"
            >
              <div className="w-10 h-10 flex items-center justify-center text-[#8892A4] group-hover:text-[#00D4E8] transition-colors">
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-white text-[13px] font-semibold leading-tight">{label}</p>
                <p className="text-[#8892A4] text-[11px] mt-0.5">{count} Models</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. SHOP BY LAB & SETUP ───────────────────────────────────── */}
      <section className="max-w-[1320px] mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-white mb-1">Shop by Lab & Setup</h2>
        <p className="text-[#8892A4] text-sm mb-8">Hardware packages pre-configured for ultimate work workflows.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LAB_SETUPS.map((lab) => (
            <Link
              key={lab.title}
              href={lab.href}
              className="group relative rounded-xl overflow-hidden border border-[#1E2235] hover:border-[#00D4E8]/30 transition-colors aspect-[4/3] flex flex-col justify-end p-6 bg-[#111320]"
            >
              {/* Gradient bg overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${lab.bg} opacity-90`} />
              {/* Decorative grid dots */}
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
              />
              <div className="relative z-10">
                <h3 className="text-white font-bold text-lg mb-1">{lab.title}</h3>
                <p className="text-[#8892A4] text-xs mb-4 leading-relaxed">{lab.description}</p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold tracking-wide transition-all"
                  style={{ color: lab.accent }}
                >
                  Explore Build Packages
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 5. BEST SELLERS ──────────────────────────────────────────── */}
      <section className="max-w-[1320px] mx-auto px-6 pb-16">
        <div className="flex items-end justify-between mb-1">
          <h2 className="text-2xl font-bold text-white">Best Sellers in Performance</h2>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full border border-[#1E2235] bg-[#111320] flex items-center justify-center text-[#8892A4] hover:text-white hover:border-[#2E3555] transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full border border-[#1E2235] bg-[#111320] flex items-center justify-center text-[#8892A4] hover:text-white hover:border-[#2E3555] transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[#8892A4] text-sm mb-8">Top-rated tech built for reliability & speed.</p>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#1E2235]">
          {BEST_SELLERS.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
