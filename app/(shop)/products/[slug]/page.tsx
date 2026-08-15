"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ShoppingCart,
  Check,
  Star,
  ChevronRight,
  Minus,
  Plus,
  Scale,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { setCart } from "@/store/slices/cart";
import { showToast, openCart } from "@/store/slices/ui";
import { addToCompare, removeFromCompare } from "@/store/slices/compare";
import Link from "next/link";

// --- Static presentation data ---
const SPEC_GROUPS: Record<string, string> = {
  "Transducer & Audio Display": "group-1",
  "System Performance & Connectivity": "group-2",
};

const RELATED_PRODUCTS = [
  {
    category: "CIRCU LABS",
    name: "Premium Desktop Headphone Stand",
    price: 49,
    rating: 4.5,
    reviews: 29,
    specs: ["Anodised Aluminium", "Silicone Cradle"],
  },
  {
    category: "CIRCU LABS",
    name: "Dynamic Studio Condenser Mic",
    price: 149,
    rating: 4.0,
    reviews: 35,
    specs: ["Cardioid Pickup", "USB-C Output"],
  },
  {
    category: "VERTEX",
    name: "Multi-Port Travel Charging Hub",
    price: 89,
    rating: 4.5,
    reviews: 17,
    specs: ["Multi-Built In", "6x USB-C Ports"],
  },
];

const REVIEWS = [
  {
    name: "Dr. Marcus Vance",
    date: "Nov 10, 2026",
    rating: 5,
    text: "The electrostatic transducer response is absolutely immaculate. Linear response across all frequencies with no noticeable peaks. Highly recommended for studio engineering.",
  },
  {
    name: "Linus G.",
    date: "Nov 08, 2026",
    rating: 4,
    text: "Battery performance is extremely robust. Measured roughly 58 hours on low-latency mode. Memory foam pads fit tightly but remain comfortable during long engineering playlists sessions.",
  },
];

const RATING_BARS = [
  { stars: 5, pct: 63 },
  { stars: 4, pct: 17 },
  { stars: 3, pct: 8 },
  { stars: 2, pct: 6 },
  { stars: 1, pct: 4 },
];

// --- Sub-components ---
function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${
            i <= Math.floor(rating)
              ? "fill-[#F59E0B] text-[#F59E0B]"
              : i - 0.5 <= rating
                ? "fill-[#F59E0B]/50 text-[#F59E0B]/50"
                : "fill-[#E5E7EB] text-[#E5E7EB]"
          }`}
        />
      ))}
    </div>
  );
}

function RelatedCard({ product }: { product: (typeof RELATED_PRODUCTS)[0] }) {
  const dispatch = useDispatch<AppDispatch>();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(
      showToast({
        message: "This is a demo product - not available for purchase",
        type: "error",
      }),
    );
  };

  return (
    <div className="flex-shrink-0 w-[240px] bg-white border border-[#E5E7EB] rounded-lg overflow-hidden hover:border-[#00D4E8]/50 transition-colors group flex flex-col">
      <div className="relative h-[200px] bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-full h-full bg-[#F4F5F7] flex items-center justify-center mix-blend-multiply transition-transform duration-500 group-hover:scale-105">
          <div className="text-[#9CA3AF] text-xs">No Image</div>
        </div>
      </div>

      <div className="flex-1 gap-1 flex p-3 flex-col">
        <p className="text-[10px] font-bold text-[#6B7280] tracking-widest uppercase">
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
              ({product.reviews})
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

        <button
          onClick={handleAddToCart}
          className="mt-1 w-full bg-[#0A0C14] hover:bg-[#1E2235] text-white font-semibold text-[13px] py-1.5 rounded-lg transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeThumb, setActiveThumb] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch<AppDispatch>();
  const compareIds = useSelector(
    (state: RootState) => state.compare.productIds,
  );

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
          if (data.product.variants?.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selectedVariant.id, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(
          showToast({
            message: data.error || "Failed to add to cart",
            type: "error",
          }),
        );
      } else {
        dispatch(setCart(data));
        dispatch(
          showToast({
            message: `${product.name} added to cart!`,
            type: "success",
          }),
        );
        dispatch(openCart());
      }
    } catch (error) {
      console.error(error);
      dispatch(showToast({ message: "Something went wrong", type: "error" }));
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selectedVariant.id, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(
          showToast({
            message: data.error || "Failed to add to cart",
            type: "error",
          }),
        );
      } else {
        dispatch(setCart(data));
        dispatch(
          showToast({
            message: `${product.name} added to cart!`,
            type: "success",
          }),
        );
        // Redirect to checkout instead of opening cart
        window.location.href = "/checkout";
      }
    } catch (error) {
      console.error(error);
      dispatch(showToast({ message: "Something went wrong", type: "error" }));
    }
  };

  const handleCompare = () => {
    if (!product) return;
    const isInCompare = compareIds.includes(product.id);

    if (isInCompare) {
      dispatch(removeFromCompare(product.id));
      dispatch(
        showToast({
          message: "Removed from comparison",
          type: "success",
        }),
      );
    } else {
      if (compareIds.length >= 3) {
        dispatch(
          showToast({
            message: "Maximum 3 products can be compared",
            type: "error",
          }),
        );
        return;
      }
      dispatch(addToCompare(product.id));
      dispatch(
        showToast({
          message: "Added to comparison",
          type: "success",
        }),
      );
    }
  };

  if (loading)
    return (
      <div className="min-h-[70vh] bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#00D4E8] border-t-transparent animate-spin" />
          <span className="text-[#6B7280] text-sm font-medium">
            Loading product...
          </span>
        </div>
      </div>
    );
  if (!product)
    return (
      <div className="min-h-[70vh] bg-[#F9FAFB] flex items-center justify-center">
        <p className="text-[#6B7280]">Product not found.</p>
      </div>
    );

  const price = Number(
    selectedVariant?.salePrice ?? selectedVariant?.price ?? 0,
  );
  const originalPrice = selectedVariant?.salePrice
    ? Number(selectedVariant.price)
    : null;
  const inStock = selectedVariant?.stock > 0;
  const savings = originalPrice ? originalPrice - price : null;

  // Build thumbnails: real images + placeholders to fill 4
  const allMedia = product.media || [];
  const thumbs = [
    ...allMedia,
    ...Array(Math.max(0, 4 - allMedia.length)).fill(null),
  ].slice(0, 4);

  // Group specs by attribute group name
  const specsByGroup: Record<string, any[]> = {};
  selectedVariant?.attributes?.forEach((attr: any) => {
    const groupName = attr.attributeValue.group?.name || "General";
    if (!specsByGroup[groupName]) specsByGroup[groupName] = [];
    specsByGroup[groupName].push(attr);
  });

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20">
      <div className="max-w-[1320px] mx-auto px-6 pt-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mb-8">
          <Link href="/" className="hover:text-[#111827] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href="/products"
            className="hover:text-[#111827] transition-colors"
          >
            {product.category?.name || "Products"}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold text-[#111827]">{product.name}</span>
        </div>

        {/* ── MAIN PRODUCT SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* LEFT: Images */}
          <div>
            {/* Main image */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl aspect-square flex items-center justify-center mb-4 overflow-hidden">
              {allMedia[activeThumb]?.url ? (
                <img
                  src={allMedia[activeThumb].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-[#9CA3AF] text-sm">No Image Available</div>
              )}
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {thumbs.map((media: any, i: number) => (
                <button
                  key={i}
                  onClick={() => media && setActiveThumb(i)}
                  className={`bg-white border-2 rounded-xl aspect-square flex items-center justify-center p-3 transition-all overflow-hidden ${
                    activeThumb === i && media
                      ? "border-[#00D4E8] shadow-[0_0_0_2px_rgba(0,212,232,0.2)]"
                      : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                  }`}
                >
                  {media?.url ? (
                    <img
                      src={media.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#F3F4F6] rounded-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Info */}
          <div className="flex flex-col">
            {/* Brand */}
            <p className="text-[11px] font-black text-[#00D4E8] tracking-[0.18em] uppercase mb-2">
              {product.brand?.name || "CIRCU SOUNDLABS"}
            </p>

            {/* Title */}
            <h1 className="text-[28px] lg:text-[34px] font-black text-[#111827] tracking-tight leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating + Stock */}
            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={4.8} />
              <span className="text-[12px] text-[#6B7280] font-medium">
                142
              </span>
              <span className="text-[#E5E7EB]">|</span>
              {inStock ? (
                <span className="text-[12px] font-bold text-[#10B981]">
                  In Stock —{" "}
                  <span className="text-[#6B7280] font-normal">
                    Ships Tomorrow
                  </span>
                </span>
              ) : (
                <span className="text-[12px] font-bold text-[#EF4444]">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-[#E5E7EB]">
              <span className="text-[32px] font-black text-[#111827]">
                ${price.toLocaleString()}
              </span>
              {savings && (
                <span className="text-[12px] font-bold text-white bg-[#10B981] px-2 py-0.5 rounded">
                  Save ${savings.toFixed(0)}
                </span>
              )}
              {originalPrice && (
                <span className="text-[16px] text-[#9CA3AF] line-through">
                  ${originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Color Variant — visual mock with real variant toggle */}
            {product.variants?.length > 1 && (
              <div className="mb-5">
                <p className="text-[12px] font-bold text-[#111827] mb-2.5">
                  Select Color Variant
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any, idx: number) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const colors = ["#1F2937", "#6B7280", "#00D4E8"];
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        title={v.attributes
                          .map((a: any) => a.attributeValue.value)
                          .join(" / ")}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          isSelected
                            ? "border-[#111827] scale-110 shadow-md"
                            : "border-transparent hover:border-[#D1D5DB]"
                        }`}
                        style={{ background: colors[idx % colors.length] }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Configuration pills */}
            <div className="mb-6">
              <p className="text-[12px] font-bold text-[#111827] mb-2.5">
                Hardware Edition Configuration
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants?.map((v: any) => {
                  const label =
                    v.attributes
                      .map((a: any) => a.attributeValue.value)
                      .join(" / ") || v.sku;
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-1.5 rounded-md text-[12px] font-semibold border transition-all ${
                        isSelected
                          ? "bg-[#111827] text-white border-[#111827]"
                          : "bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#00D4E8]"
                      }`}
                    >
                      {label || `Config ${v.sku}`}
                    </button>
                  );
                })}
                {(!product.variants || product.variants.length === 0) && (
                  <button className="px-4 py-1.5 rounded-md text-[12px] font-semibold border bg-[#111827] text-white border-[#111827]">
                    Standard
                  </button>
                )}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 mb-3">
              {/* Quantity */}
              <div className="flex items-center bg-white border border-[#E5E7EB] rounded-lg h-[52px] px-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-[#111827] text-[15px]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 h-[52px] rounded-lg font-bold text-[14px] flex items-center justify-center gap-2 transition-all ${
                  inStock
                    ? "bg-[#0A0C14] hover:bg-[#1E2235] text-white"
                    : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {inStock ? "Add to Shopping Cart" : "Out of Stock"}
              </button>
            </div>

            {/* Secure Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className={`w-full h-[52px] rounded-lg font-bold text-[14px] transition-colors mb-3 ${
                inStock
                  ? "bg-[#00D4E8] hover:bg-[#00BDD0] text-[#0A0C14]"
                  : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
              }`}
            >
              {inStock ? "Secure Buy Now" : "Out of Stock"}
            </button>

            {/* Add to Compare */}
            <button
              onClick={handleCompare}
              disabled={!inStock}
              className={`w-full h-[52px] rounded-lg font-bold text-[14px] transition-colors mb-5 flex items-center justify-center gap-2 ${
                inStock
                  ? compareIds.includes(product?.id)
                    ? "bg-[#111827] hover:bg-[#1E2235] text-white"
                    : "bg-white border border-[#E5E7EB] text-[#111827] hover:border-[#00D4E8] hover:text-[#00D4E8]"
                  : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
              }`}
            >
              <Scale className="w-4 h-4" />
              {compareIds.includes(product?.id)
                ? "Remove from Compare"
                : "Add to Compare"}
            </button>

            {/* Trust badges */}
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                <Check className="w-4 h-4 text-[#10B981]" />
                2-Year Warranty Included
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                <Check className="w-4 h-4 text-[#10B981]" />
                Free Tech Diagnostics
              </span>
            </div>
          </div>
        </div>

        {/* ── TECHNICAL SPECIFICATION BLUEPRINT ── */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 mb-12">
          <h2 className="text-[20px] font-black text-[#111827] tracking-tight mb-6">
            Technical Specification Blueprint
          </h2>

          {Object.keys(specsByGroup).length > 0 ? (
            Object.entries(specsByGroup).map(([groupName, attrs]) => (
              <div key={groupName} className="mb-6">
                <h3 className="text-[12px] font-bold text-[#6B7280] uppercase tracking-widest mb-3 pb-2 border-b border-[#F3F4F6]">
                  {groupName}
                </h3>
                <div className="divide-y divide-[#F3F4F6]">
                  {attrs.map((attr: any) => (
                    <div key={attr.id} className="flex py-3">
                      <div className="w-[220px] flex-shrink-0 text-[13px] text-[#6B7280]">
                        {attr.attributeValue.group?.name}
                      </div>
                      <div className="text-[13px] font-medium text-[#111827]">
                        {attr.attributeValue.value}{" "}
                        {attr.attributeValue.group?.unit || ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            /* Fallback — static spec table matching Figma if no structured attrs */
            <>
              <div className="mb-6">
                <h3 className="text-[12px] font-bold text-[#6B7280] uppercase tracking-widest mb-3 pb-2 border-b border-[#F3F4F6]">
                  Transducer & Audio Display
                </h3>
                <div className="divide-y divide-[#F3F4F6]">
                  {[
                    [
                      "Transducer Element",
                      "50mm Electrostatic Membrane Transducer",
                    ],
                    [
                      "Frequency Bandwidth",
                      "4Hz – 84,000Hz / Ultra High-Resolution",
                    ],
                    [
                      "Acoustic Impedance",
                      "35 Ohms Active / 300 Ohms Passive Bypass",
                    ],
                    [
                      "Real-time Spatial Chipset",
                      "Circu SoundLabs Spatial DSP v4",
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="flex py-3">
                      <div className="w-[220px] flex-shrink-0 text-[13px] text-[#6B7280]">
                        {label}
                      </div>
                      <div className="text-[13px] font-medium text-[#111827]">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <h3 className="text-[12px] font-bold text-[#6B7280] uppercase tracking-widest mb-3 pb-2 border-b border-[#F3F4F6]">
                  System Performance & Connectivity
                </h3>
                <div className="divide-y divide-[#F3F4F6]">
                  {[
                    [
                      "Wireless Connection Protocol",
                      "Low-Latency Bluetooth 5.4 with aptX Adaptive Lossless",
                    ],
                    [
                      "Cable Connector Interface",
                      "3.9mm Balanced (XLR-Planet) Jack & USB-C Audio Stage",
                    ],
                    [
                      "Battery Lifespan Rating",
                      "60 Hours with ANC / 80 Hours ANC-Off",
                    ],
                    [
                      "Fast Charge Integration",
                      "15-minute charge last/min 12 Hours audio playback",
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="flex py-3">
                      <div className="w-[220px] flex-shrink-0 text-[13px] text-[#6B7280]">
                        {label}
                      </div>
                      <div className="text-[13px] font-medium text-[#111827]">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── RELATED STUDIO ACCESSORIES ── */}
        <div className="mb-12">
          <h2 className="text-[20px] font-black text-[#111827] tracking-tight mb-1">
            Related Studio Accessories
          </h2>
          <p className="text-[#6B7280] text-[13px] mb-6">
            Engineered accessories optimized for this product.
          </p>
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#E5E7EB]">
            {RELATED_PRODUCTS.map((p) => (
              <RelatedCard key={p.name} product={p} />
            ))}
          </div>
        </div>

        {/* ── VERIFIED LAB REVIEWS ── */}
        <div className="mb-12">
          <h2 className="text-[20px] font-black text-[#111827] tracking-tight mb-6">
            Verified Lab Reviews
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Rating aggregate */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 flex flex-col items-center justify-center">
              <span className="text-[64px] font-black text-[#111827] leading-none mb-1">
                4.8
              </span>
              <StarRating rating={4.8} size="lg" />
              <p className="text-[12px] text-[#6B7280] mt-2 mb-6">
                Based on 142 Hardware reviews
              </p>
              <div className="w-full space-y-2">
                {RATING_BARS.map(({ stars, pct }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-[11px] text-[#6B7280] w-8 text-right shrink-0">
                      {stars} Star
                    </span>
                    <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#F59E0B] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#6B7280] w-6 shrink-0">
                      {pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Review cards */}
            <div className="lg:col-span-2 space-y-4">
              {REVIEWS.map((review) => (
                <div
                  key={review.name}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[14px] font-bold text-[#111827]">
                        {review.name}
                      </p>
                      <p className="text-[11px] text-[#9CA3AF]">
                        {review.date}
                      </p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-[13px] text-[#4B5563] leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
