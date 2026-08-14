"use client";

import Link from "next/link";
import {
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Lock,
  Headphones,
  Monitor,
  Smartphone,
  Gamepad2,
  Home as HomeIcon,
  Watch,
  ChevronRight,
  Star,
  ChevronLeft,
} from "lucide-react";

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
    description:
      "Designed for intensive render operations & 2070 GB video edit.",
    href: "/products",
    bg: "from-slate-800 to-[#111827]",
    accent: "#00D4E8",
    image: "/annie-spratt-6pMI--IXV-8-unsplash.jpg",
  },
  {
    title: "Competitive Esports Setup",
    description: "Max frame rates, 360Hz displays, low-latency controllers.",
    href: "/products?category=gaming",
    bg: "from-sky-900 to-[#111827]",
    accent: "#00D4E8",
    image: "/ella-don-JomkRNkzKhE-unsplash.jpg",
  },
  {
    title: "Audio & Creator Lab",
    description: "Perfect studio setups with spatial recording capabilities.",
    href: "/products?category=audio",
    bg: "from-stone-800 to-[#111827]",
    accent: "#00D4E8",
    image: "/luther-yonel-t04qpDs4rYk-unsplash.jpg",
  },
];

const BEST_SELLERS = [
  {
    badge: "BEST SELLER",
    badgeColor: "#00D4E8",
    category: "CIRCU SOUNDLABS",
    name: "Acoustix Pro Max",
    price: 349,
    rating: 4.5,
    reviews: 142,
    specs: ["Active ANC", "Hi-Res Audio", "60h Battery"],
  },
  {
    badge: null,
    badgeColor: null,
    category: "X-COMPUTE",
    name: "Quantum Pro Rig",
    price: 1899,
    rating: 4.0,
    reviews: 88,
    specs: ["Intel Core Ultra", "64GB DDR5", "2TB NVMe"],
  },
  {
    badge: "PRO CHOICE",
    badgeColor: "#00D4E8",
    category: "VERTEX",
    name: "Vanguard Book Pro",
    price: 1249,
    rating: 4.5,
    reviews: 213,
    specs: ["OLED 120Hz", "M4 Pro Chip", "1TB SSD"],
  },
  {
    badge: null,
    badgeColor: null,
    category: "CIRCU ENERGY",
    name: "Apex Chrono Chronometer",
    price: 299,
    rating: 4.0,
    reviews: 54,
    specs: ["Bio-Sensor v2", "AOD Sapphire", "30d Water"],
  },
];

// --- Sub-components ---
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.floor(rating) ? "fill-[#F59E0B] text-[#F59E0B]" : i - 0.5 <= rating ? "fill-[#F59E0B]/50 text-[#F59E0B]/50" : "fill-[#E5E7EB] text-[#E5E7EB]"}`}
        />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: (typeof BEST_SELLERS)[0] }) {
  return (
    <div className="flex-shrink-0 w-[240px] bg-white border border-[#E5E7EB] rounded-lg overflow-hidden hover:border-[#00D4E8]/50 transition-colors group flex flex-col">
      {/* Image placeholder */}
      <div className="relative h-[200px] bg-[#F9FAFB] rounded-lg flex items-center justify-center">
        {product.badge && (
          <span
            className="absolute top-2 bg-blue-50 left-2 text-[10px] font-bold px-2 py-1 rounded"
            style={{
              color: product.badgeColor!,
              border: `1px solid ${product.badgeColor}`,
            }}
          >
            {product.badge}
          </span>
        )}
        <div className="w-full h-full bg-[#F4F5F7] flex items-center justify-center mix-blend-multiply transition-transform duration-500">
          <div className="text-[#9CA3AF] text-xs">No Image</div>
        </div>
      </div>

      <div className="flex-1 gap-1 flex p-3 flex-col">
        <p className="text-[10px] font-bold text-[#6B7280] tracking-widest">
          {product.category}
        </p>
        <h4 className="text-[#111827] font-bold text-[15px] leading-snug line-clamp-2">
          {product.name}
        </h4>

        <div className="flex items-center justify-between">
          <p className="text-[#111827] font-black text-[20px]">
            ${product.price.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5">
            <StarRating rating={product.rating} />
            <span className="text-[#6B7280] text-[11px] font-medium">
              ({product.reviews.toLocaleString()})
            </span>
          </div>
        </div>

        <div className="flex flex-nowrap py-1 overflow-x-scroll scrollbar-none gap-1.5">
          {product.specs.map((s) => (
            <span
              key={s}
              className="text-[10px] text-nowrap px-1 rounded-sm bg-gray-100 border border-[#E5E7EB] text-[#4B5563] font-medium"
            >
              {s}
            </span>
          ))}
        </div>

        <button className="mt-1 w-full bg-[#0A0C14] hover:bg-[#1E2235] text-white font-semibold text-[13px] py-1.5 rounded-lg transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// --- Page ---
export default function Home() {
  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* ── 1. HERO ───────────────────────────────────────────────────── */}
      <section
        className="relative w-full min-h-[520px] flex items-center overflow-hidden bg-[#0A0C14]"
        style={{
          backgroundImage: "url('/davide-boscolo-gz9njd0zYbQ-unsplash.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* BG gradient layer with dark contrast */}
        <div className="absolute inset-0 bg-[#0A0F24] opacity-85 z-10" />
        {/* BG decorative circles */}
        {/* <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-[#00D4E8]/10 opacity-60" />
        <div className="absolute right-20 top-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-[#00D4E8]/15 opacity-60" />
        <div className="absolute right-28 top-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full bg-[#00D4E8]/5 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-[#00D4E8]/10" />
        </div> */}
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#00D4E8 1px, transparent 1px), linear-gradient(90deg, #00D4E8 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-20 w-full max-w-[1320px] mx-auto px-6 py-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 border border-[#00D4E8]/40 text-[#00D4E8] text-[10px] font-bold tracking-widest px-3 py-1 rounded mb-6 uppercase">
              New Arrival Edition
            </div>
            <h1 className="text-5xl lg:text-6xl font-black leading-[1.08] mb-5 text-white tracking-tight">
              Architectural Sound.
              <br />
              <span className="text-[#00D4E8]">Zero Distortions.</span>
            </h1>
            <p className="text-[#8892A4] text-[15px] mb-8 leading-relaxed max-w-lg">
              Presenting the GadgetHub SoundLabs Pro Series. Engineered with
              50mm electrostatic transducers and real-time environment mapping.
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
                <span className="text-[13px] text-white font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED CATEGORIES ───────────────────────────────────── */}
      <section className="max-w-[1320px] mx-auto px-6 pt-16 pb-12">
        <h2 className="text-[22px] font-black text-[#111827] tracking-tight mb-1">
          Featured Hardware Categories
        </h2>
        <p className="text-[#6B7280] text-[13px] mb-8">
          Engineered devices categorized by architectural standards.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ icon: Icon, label, count, slug }) => (
            <Link
              key={slug}
              href={`/products?category=${slug}`}
              className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#00D4E8] hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 flex items-center justify-center text-[#4B5563] group-hover:text-[#00D4E8] transition-colors">
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-[#111827] text-[13px] font-bold leading-tight">
                  {label}
                </p>
                <p className="text-[#9CA3AF] text-[11px] mt-0.5">
                  {count} Models
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. SHOP BY LAB & SETUP ───────────────────────────────────── */}
      <section className="max-w-[1320px] mx-auto px-6 py-12">
        <h2 className="text-[22px] font-black text-[#111827] tracking-tight mb-1">
          Shop by Lab & Setup
        </h2>
        <p className="text-[#6B7280] text-[13px] mb-8">
          Hardware packages pre-configured for ultimate work workflows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {LAB_SETUPS.map((lab) => (
            <Link
              key={lab.title}
              href={lab.href}
              className="group relative rounded-xl overflow-hidden border border-[#E5E7EB] hover:border-[#00D4E8] transition-colors aspect-[1.4] flex flex-col justify-end p-6 bg-white"
              style={{
                backgroundImage: `url('${lab.image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Dark gradient overlay for contrast */}
              <div
                className="absolute inset-0 opacity-65"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(10, 15, 36, 0.9), rgba(10, 15, 36, 0.7))",
                }}
              />
              <div className="relative z-10">
                <h3 className="text-white font-bold text-[17px] mb-1.5">
                  {lab.title}
                </h3>
                <p className="text-[#9CA3AF] text-[12px] mb-4 leading-relaxed max-w-[200px]">
                  {lab.description}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide transition-all uppercase"
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
      <section className="max-w-[1320px] mx-auto px-6 py-12 pb-20">
        <div className="flex items-end justify-between mb-1">
          <h2 className="text-[22px] font-black text-[#111827] tracking-tight">
            Best Sellers in Performance
          </h2>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#D1D5DB] transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#D1D5DB] transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[#6B7280] text-[13px] mb-8">
          Top-rated tech built for reliability & speed.
        </p>

        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#E5E7EB]">
          {BEST_SELLERS.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
