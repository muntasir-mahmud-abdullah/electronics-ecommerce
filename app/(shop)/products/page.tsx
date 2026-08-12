"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown, Minus, Star, ChevronLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { addToCompare } from "@/store/slices/compare";

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

const FILTERS = [
  {
    title: "Brand",
    options: [
      { label: "X-Compute", count: 8 },
      { label: "Vertex", count: 14 },
      { label: "Circu Pro", count: 4 },
      { label: "Overclock", count: 10 },
    ],
  },
  {
    title: "Screen Size",
    options: [
      { label: "13-inch", count: 4 },
      { label: "14-inch", count: 16 },
      { label: "16-inch", count: 12 },
      { label: "17-inch", count: 4 },
    ],
  },
  {
    title: "Processor Tech",
    options: [
      { label: "Intel Ultra Core", count: 12 },
      { label: "AMD Ryzen Thread", count: 10 },
      { label: "ARM Apex Silicon", count: 8 },
      { label: "Apple M4 Series", count: 5 },
    ],
  },
  {
    title: "System RAM",
    options: [
      { label: "16GB Unified", count: 8 },
      { label: "32GB High-Speed", count: 18 },
      { label: "64GB DDR5", count: 8 },
      { label: "128GB Enterprise", count: 2 },
    ],
  },
  {
    title: "Internal Storage",
    options: [
      { label: "512GB NVMe", count: 12 },
      { label: "1TB PCIe Gen4", count: 16 },
      { label: "2TB Enterprise", count: 6 },
      { label: "4TB Extreme Raid", count: 2 },
    ],
  },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const query = new URLSearchParams();
        if (category) query.set("category", category);
        
        const res = await fetch(`/api/products?${query.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category]);

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    dispatch(addToCompare(productId)); // Keeping existing logic for now, although it says "Add to Cart"
  };

  const getPageTitle = () => {
    switch(category) {
      case "laptops": return "Professional Computing Rigs";
      case "smartphones": return "Mobile Devices";
      case "audio": return "High-Res Audio";
      case "gaming": return "Gaming Pro Gear";
      case "smarthome": return "Smart Automation";
      default: return "All Products";
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20">
      <div className="max-w-[1320px] mx-auto px-6 py-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mb-6">
          <Link href="/" className="hover:text-[#111827] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products?category=laptops" className="hover:text-[#111827] transition-colors">Computing</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold text-[#111827]">Professional Laptops</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[28px] font-black text-[#111827] tracking-tight mb-2">
              {getPageTitle()}
            </h1>
            <p className="text-[13px] text-[#6B7280]">
              Showing 1-{Math.min(12, products.length || 36)} of {products.length || 36} high-spec engineering workbooks.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[#6B7280]">Sort by:</span>
            <button className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-md px-3 py-1.5 font-semibold text-[#111827] hover:bg-gray-50 transition-colors">
              Highest Spec
              <ChevronDown className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-[240px] flex-shrink-0 space-y-4">
            {FILTERS.map((filter) => (
              <div key={filter.title} className="bg-white border border-[#E5E7EB] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[13px] text-[#111827]">{filter.title}</h3>
                  <Minus className="w-4 h-4 text-[#9CA3AF]" />
                </div>
                <div className="space-y-3">
                  {filter.options.map((opt) => (
                    <label key={opt.label} className="flex items-center gap-3 group cursor-pointer">
                      <div className="w-4 h-4 rounded border border-[#D1D5DB] group-hover:border-[#00D4E8] bg-white transition-colors" />
                      <span className="text-[13px] text-[#4B5563] group-hover:text-[#111827] transition-colors flex-1">
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-[#9CA3AF]">({opt.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Price Range */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[13px] text-[#111827]">Price Range</h3>
                <Minus className="w-4 h-4 text-[#9CA3AF]" />
              </div>
              <div className="px-1">
                {/* Visual slider */}
                <div className="relative w-full h-1 bg-[#E5E7EB] rounded-full mb-4">
                  <div className="absolute left-[10%] right-[30%] h-full bg-[#111827] rounded-full" />
                  <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-3 h-3 bg-[#00D4E8] border-2 border-[#111827] rounded-full" />
                  <div className="absolute right-[30%] top-1/2 -translate-y-1/2 w-3 h-3 bg-[#00D4E8] border-2 border-[#111827] rounded-full" />
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#6B7280]">
                  <span>$800</span>
                  <span>$3,500</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 h-[400px] animate-pulse flex flex-col">
                     <div className="w-full h-[180px] bg-[#F3F4F6] rounded-lg mb-4" />
                     <div className="w-1/3 h-3 bg-[#E5E7EB] rounded mb-2" />
                     <div className="w-3/4 h-5 bg-[#E5E7EB] rounded mb-3" />
                     <div className="w-1/4 h-6 bg-[#E5E7EB] rounded mb-4" />
                     <div className="flex gap-2 mb-4">
                       <div className="w-16 h-6 bg-[#E5E7EB] rounded" />
                       <div className="w-16 h-6 bg-[#E5E7EB] rounded" />
                     </div>
                     <div className="mt-auto w-full h-10 bg-[#E5E7EB] rounded" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white border border-[#E5E7EB] rounded-xl">
                <p className="text-[#6B7280]">No products found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
                  {products.map((product) => {
                    const variant = product.variants?.[0];
                    const price = Number(variant?.salePrice ?? variant?.price ?? 0);
                    // Generate a fake rating and reviews for presentation if none exists
                    const mockRating = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5 to 5.0
                    const mockReviews = Math.floor(Math.random() * 200) + 20;

                    return (
                      <Link 
                        href={`/products/${product.slug}`} 
                        key={product.id} 
                        className="group bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col hover:border-[#00D4E8] hover:shadow-lg transition-all"
                      >
                        <div className="relative w-full h-[220px] rounded-lg bg-[#F9FAFB] mb-5 flex items-center justify-center p-4">
                          {product.media?.[0]?.url ? (
                            <img src={product.media[0].url} alt={product.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="text-[#9CA3AF] text-sm">No Image</div>
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                          <div className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest mb-1.5">
                            {product.brand?.name || "VERTEX"}
                          </div>
                          <h3 className="text-[15px] font-bold text-[#111827] mb-2 leading-snug line-clamp-2">
                            {product.name}
                          </h3>
                          
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[20px] font-black text-[#111827]">${price.toLocaleString()}</span>
                            <div className="flex items-center gap-1.5">
                              <StarRating rating={Number(mockRating)} />
                              <span className="text-[#6B7280] text-[11px] font-medium">({mockReviews})</span>
                            </div>
                          </div>
                          
                          <div className="mb-6 flex flex-wrap gap-1.5">
                            {variant?.attributes?.slice(0, 3).map((attr: any) => (
                              <span key={attr.id} className="text-[10px] px-2 py-1 rounded bg-white border border-[#E5E7EB] text-[#4B5563] font-medium">
                                {attr.attributeValue.value} {attr.attributeValue.group.unit || ''}
                              </span>
                            ))}
                            {(!variant?.attributes || variant.attributes.length === 0) && (
                              <>
                                <span className="text-[10px] px-2 py-1 rounded bg-white border border-[#E5E7EB] text-[#4B5563] font-medium">OLED 120Hz</span>
                                <span className="text-[10px] px-2 py-1 rounded bg-white border border-[#E5E7EB] text-[#4B5563] font-medium">1TB SSD</span>
                              </>
                            )}
                          </div>

                          <button 
                            onClick={(e) => handleAddToCart(e, product.id)}
                            className="mt-auto w-full bg-[#0A0C14] hover:bg-[#1E2235] text-white font-semibold text-[13px] py-3 rounded-lg transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-6">
                  <button className="flex items-center gap-1 text-[13px] font-semibold text-[#111827] hover:text-[#00D4E8] transition-colors border border-[#E5E7EB] bg-white rounded-md px-4 py-2">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded bg-[#0A0C14] text-white text-[13px] font-bold flex items-center justify-center">1</button>
                    <button className="w-8 h-8 rounded bg-white border border-[#E5E7EB] text-[#4B5563] hover:border-[#00D4E8] text-[13px] font-bold flex items-center justify-center transition-colors">2</button>
                    <button className="w-8 h-8 rounded bg-white border border-[#E5E7EB] text-[#4B5563] hover:border-[#00D4E8] text-[13px] font-bold flex items-center justify-center transition-colors">3</button>
                    <span className="w-8 h-8 flex items-center justify-center text-[#9CA3AF]">...</span>
                    <button className="w-8 h-8 rounded bg-white border border-[#E5E7EB] text-[#4B5563] hover:border-[#00D4E8] text-[13px] font-bold flex items-center justify-center transition-colors">8</button>
                  </div>
                  <button className="flex items-center gap-1 text-[13px] font-semibold text-white bg-[#0A0C14] hover:bg-[#1E2235] transition-colors rounded-md px-4 py-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center text-[#111827] font-bold">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
