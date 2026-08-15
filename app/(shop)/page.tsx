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
  ChevronLeft,
} from "lucide-react";
import { prisma, withRetry } from "@/lib/prisma";
import { ProductCard, PopulatedProduct } from "@/components/product-card";

// Prevent prerendering during build — this page needs database access at runtime
export const dynamic = "force-dynamic";

// --- Data ---
const TRUST_ITEMS = [
  { icon: Truck, label: "Global Free Shipping" },
  { icon: Shield, label: "2-Year Hardware Warranty" },
  { icon: RotateCcw, label: "Easy 30-Day Returns" },
  { icon: Lock, label: "Secure Tech Payment" },
];

const LAB_SETUPS = [
  {
    title: "Creative Workspace",
    description:
      "Designed for intensive render operations & 2070 GB video edit.",
    href: "/products?category=laptops",
    bg: "from-slate-800 to-[#111827]",
    accent: "#00D4E8",
    image: "/annie-spratt-6pMI--IXV-8-unsplash.jpg",
  },
  {
    title: "Competitive Esports Setup",
    description: "Max frame rates, 360Hz displays, low-latency controllers.",
    href: "/products?category=monitors",
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

// Fallback Icons based on category slugs
const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case "audio":
      return Headphones;
    case "laptops":
      return Monitor;
    case "smartphones":
      return Smartphone;
    case "monitors":
      return Monitor;
    default:
      return Gamepad2;
  }
};

export default async function Home() {
  // Fetch real data from database with retry logic
  let categoriesDb: any[] = [];
  let featuredProductsDb: any[] = [];

  try {
    categoriesDb = await withRetry(() =>
      prisma.category.findMany({
        where: { isActive: true },
        include: { _count: { select: { products: true } } },
        orderBy: { sortOrder: "asc" },
      }),
    );
    console.log(`[Home] Fetched ${categoriesDb.length} categories`);
  } catch (error: any) {
    console.error("[Home] Failed to fetch categories after retries:", {
      message: error?.message || String(error),
      code: error?.code,
    });
  }

  try {
    featuredProductsDb = await withRetry(() =>
      prisma.product.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        include: {
          category: true,
          brand: true,
          media: { orderBy: { sortOrder: "asc" } },
          variants: {
            where: { isActive: true },
            include: {
              attributes: {
                include: {
                  attributeValue: {
                    include: { group: true },
                  },
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        take: 8,
      }),
    );
    console.log(
      `[Home] Fetched ${featuredProductsDb.length} featured products`,
    );
  } catch (error: any) {
    console.error("[Home] Failed to fetch featured products after retries:", {
      message: error?.message || String(error),
      code: error?.code,
    });
  }

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
        <div className="absolute inset-0 bg-[#0A0F24] opacity-85 z-10" />
        <div
          className="absolute inset-0 opacity-5 z-10"
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
                href="/products"
                className="flex items-center gap-2 border border-[#2E3555] hover:border-[#00D4E8]/50 text-white font-semibold px-6 py-3 rounded-md text-sm transition-colors"
              >
                All Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST BAR ─────────────────────────────────────────────── */}
      <section className="bg-[#0D0F1A]">
        <div className="max-w-[1320px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4">
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
          {categoriesDb.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#00D4E8] hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 flex items-center justify-center text-[#4B5563] group-hover:text-[#00D4E8] transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-[#111827] text-[13px] font-bold leading-tight">
                    {cat.name}
                  </p>
                  <p className="text-[#9CA3AF] text-[11px] mt-0.5">
                    {cat._count.products} Models
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 4. SHOP BY LAB & SETUP ───────────────────────────────────── */}
      <section className="max-w-[1320px] mx-auto px-6 py-12">
        <h2 className="text-[22px] font-black text-[#111827] tracking-tight mb-1">
          Shop by Lab & Setup
        </h2>
        <p className="text-[#6B7280] text-[13px] mb-8">
          Hardware packages pre-configured for ultimate workflows.
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
            Featured Performance Tech
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
          {featuredProductsDb.map((product) => (
            <ProductCard
              key={product.id}
              product={JSON.parse(JSON.stringify(product))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
