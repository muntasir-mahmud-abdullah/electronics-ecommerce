"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { removeFromCompare, clearCompare } from "@/store/slices/compare";
import { X, ArrowLeft, Star, Zap } from "lucide-react";

// Static spec data for demo presentation when DB attributes are sparse
const STATIC_SPEC_GROUPS: { group: string; rows: string[] }[] = [
  {
    group: "Acoustics & Transducers",
    rows: ["Transducer Element", "Frequency Range", "Acoustic Impedance"],
  },
  {
    group: "Performance & Battery",
    rows: ["Processor Core", "Continuous Playback", "Connectivity"],
  },
  {
    group: "Physical Mechanics",
    rows: ["Net Weight", "Memory Cushioning"],
  },
];

// Values we highlight in cyan (when they differ significantly)
function isHighlightValue(value: string): boolean {
  // Highlight values that contain Hz/Hours/Rating suffix — matches Figma logic
  return /hz|hours|rating/i.test(value);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
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

export default function ComparePage() {
  const compareIds = useSelector((state: RootState) => state.compare.productIds);
  const dispatch = useDispatch<AppDispatch>();

  const [products, setProducts] = useState<any[]>([]);
  const [allAttributeGroups, setAllAttributeGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompareData() {
      if (compareIds.length === 0) {
        setProducts([]);
        setAllAttributeGroups([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/products/compare?ids=${compareIds.join(",")}`);
        const data = await res.json();
        setProducts(data.products || []);
        setAllAttributeGroups(data.allAttributeGroups || []);
      } catch (error) {
        console.error("Failed to load compare data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompareData();
  }, [compareIds]);

  /* ── LOADING ── */
  if (loading)
    return (
      <div className="min-h-[70vh] bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#00D4E8] border-t-transparent animate-spin" />
          <span className="text-[#6B7280] text-sm font-medium">Loading comparison...</span>
        </div>
      </div>
    );

  /* ── EMPTY STATE ── */
  if (products.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#F9FAFB] flex items-center justify-center px-6">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl max-w-lg w-full p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-[#F0FFFE] border border-[#00D4E8]/30 flex items-center justify-center mb-5">
            <Zap className="w-7 h-7 text-[#00D4E8]" />
          </div>
          <h2 className="text-[22px] font-black text-[#111827] tracking-tight mb-3">No Products to Compare</h2>
          <p className="text-[#6B7280] text-sm mb-8 leading-relaxed">
            You haven&apos;t added any products to your comparison lab yet. Browse the catalog and click the compare icon to add up to 3 products.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#0A0C14] hover:bg-[#1E2235] text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  /* ── Build spec rows from live API groups, fallback to static if empty ── */
  const specRows: { group: string; rows: string[] }[] = [];

  if (allAttributeGroups.length > 0) {
    specRows.push({ group: "Technical Specifications", rows: allAttributeGroups });
  } else {
    specRows.push(...STATIC_SPEC_GROUPS);
  }

  /* ── COMPARE TABLE ── */
  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-32">
      <div className="max-w-[1320px] mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[12px] text-[#6B7280] hover:text-[#111827] transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Listing
          </Link>
          <h1 className="text-[28px] font-black text-[#111827] tracking-tight">Side-by-Side Spec Comparison</h1>
        </div>

        {/* Main comparison card */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            {/* ── PRODUCT HEADER ROW ── */}
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {/* Label column */}
                <th className="w-[180px] p-6 text-left align-middle">
                  <span className="text-[12px] font-bold text-[#6B7280] uppercase tracking-widest">
                    Attribute comparison
                  </span>
                </th>

                {/* Product columns */}
                {products.map((p) => (
                  <th key={p.id} className="p-5 align-top border-l border-[#E5E7EB] w-[220px]">
                    <div className="flex items-start gap-4">
                      {/* Product image */}
                      <div className="w-[90px] h-[90px] flex-shrink-0 bg-[#F9FAFB] rounded-xl flex items-center justify-center overflow-hidden border border-[#E5E7EB]">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply p-2" />
                        ) : (
                          <div className="text-[#9CA3AF] text-xs text-center px-2">No Image</div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-1">
                          <Link
                            href={`/products/${p.slug}`}
                            className="text-[13px] font-bold text-[#111827] hover:text-[#00D4E8] transition-colors leading-snug truncate max-w-[110px] block"
                          >
                            {p.name}
                          </Link>
                          <button
                            onClick={() => dispatch(removeFromCompare(p.id))}
                            className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F3F4F6] hover:bg-[#FEE2E2] flex items-center justify-center text-[#9CA3AF] hover:text-[#EF4444] transition-all"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[18px] font-black text-[#111827] mt-1">${Number(p.price || 0).toLocaleString()}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <StarRating rating={4.5} />
                          <span className="text-[10px] text-[#6B7280]">(142)</span>
                        </div>
                      </div>
                    </div>
                  </th>
                ))}

                {/* Empty slot columns */}
                {[...Array(Math.max(0, 3 - products.length))].map((_, i) => (
                  <th key={`empty-head-${i}`} className="p-5 border-l border-[#E5E7EB] align-middle">
                    <Link
                      href="/products"
                      className="flex flex-col items-center justify-center gap-2 h-[90px] border-2 border-dashed border-[#E5E7EB] rounded-xl text-[#9CA3AF] hover:border-[#00D4E8] hover:text-[#00D4E8] transition-all"
                    >
                      <span className="text-2xl font-light leading-none">+</span>
                      <span className="text-[11px] font-medium">Add Product</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            {/* ── SPEC ROWS ── */}
            <tbody>
              {specRows.map(({ group, rows }) => (
                <>
                  {/* Group header */}
                  <tr key={`group-${group}`} className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <td
                      colSpan={4}
                      className="px-6 py-3 text-[12px] font-black text-[#111827] uppercase tracking-wider"
                    >
                      {group}
                    </td>
                  </tr>

                  {/* Spec value rows */}
                  {rows.map((rowLabel, rowIdx) => {
                    // Check if all values differ — to highlight
                    const values = products.map((p) => p.specs?.[rowLabel] || "—");
                    const allUnique = new Set(values.filter((v) => v !== "—")).size === values.filter((v) => v !== "—").length;
                    const shouldHighlight = allUnique && values.every((v) => v !== "—") && isHighlightValue(values[0] || "");

                    return (
                      <tr key={rowLabel} className={`border-b border-[#E5E7EB] ${rowIdx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}>
                        {/* Label */}
                        <td className="px-6 py-3 text-[12px] text-[#6B7280]">{rowLabel}</td>

                        {/* Values */}
                        {products.map((p) => {
                          const val = p.specs?.[rowLabel];
                          const highlight = shouldHighlight && val;
                          return (
                            <td
                              key={`${p.id}-${rowLabel}`}
                              className={`px-5 py-3 border-l border-[#E5E7EB] text-[13px] font-semibold ${
                                highlight ? "text-[#00D4E8] bg-[#F0FFFE]" : val ? "text-[#111827]" : "text-[#9CA3AF]"
                              }`}
                            >
                              {val || "—"}
                            </td>
                          );
                        })}

                        {/* Empty slots */}
                        {[...Array(Math.max(0, 3 - products.length))].map((_, i) => (
                          <td key={`empty-val-${rowLabel}-${i}`} className="border-l border-[#E5E7EB]" />
                        ))}
                      </tr>
                    );
                  })}
                </>
              ))}

              {/* ── ADD TO CART ROW ── */}
              <tr className="border-t border-[#E5E7EB]">
                <td className="p-5" />
                {products.map((p) => (
                  <td key={`cart-${p.id}`} className="p-5 border-l border-[#E5E7EB]">
                    <Link
                      href={`/products/${p.slug}`}
                      className="block w-full bg-[#0A0C14] hover:bg-[#1E2235] text-white text-center font-semibold text-[13px] py-3 rounded-lg transition-colors"
                    >
                      Add product to Cart
                    </Link>
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - products.length))].map((_, i) => (
                  <td key={`empty-cart-${i}`} className="p-5 border-l border-[#E5E7EB]">
                    <div className="w-full h-[46px] border-2 border-dashed border-[#E5E7EB] rounded-lg" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#1E2235] bg-[#0A0C14]/95 backdrop-blur-xl px-6 py-4">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[12px] font-black text-white uppercase tracking-wider">Active Specs Lab</span>
            <div className="flex items-center gap-2 flex-wrap">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 bg-[#111320] border border-[#2E3555] rounded-full px-3 py-1"
                >
                  <span className="text-[11px] font-semibold text-[#8892A4] truncate max-w-[80px]">
                    {p.name?.split(" ").slice(0, 2).join(" ")}
                  </span>
                  <button
                    onClick={() => dispatch(removeFromCompare(p.id))}
                    className="text-[#8892A4] hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-[#8892A4]">Highlights active differences</span>
            <button className="bg-[#00D4E8] hover:bg-[#00BDD0] text-[#0A0C14] font-bold text-[12px] px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap">
              Run Hardware Diagnostics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
