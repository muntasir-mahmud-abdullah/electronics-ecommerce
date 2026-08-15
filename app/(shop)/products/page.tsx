"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronRight, Minus, ChevronLeft } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SortDropdown } from "@/components/sort-dropdown";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const category = searchParams.get("category");
  const currentSort = searchParams.get("sort") || "newest";

  const [products, setProducts] = useState<any[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Fetch filters
  useEffect(() => {
    async function fetchFilters() {
      setLoadingFilters(true);
      try {
        if (category) {
          const res = await fetch(`/api/categories/${category}`);
          if (res.ok) {
            const data = await res.json();
            if (data.category?.attributeMaps) {
              const mappedFilters = data.category.attributeMaps
                .filter((map: any) => map.isFilterable)
                .map((map: any) => ({
                  title: map.attributeGroup.name,
                  groupId: map.attributeGroup.id,
                  options: map.attributeGroup.values.map((v: any) => ({
                    label: v.value,
                    valueId: v.id,
                    count: 0, // Count could be aggregated later
                  })),
                }));
              setFilters(mappedFilters);
            }
          }
        } else {
          // If no category, fetch all filterable attributes
          const res = await fetch("/api/attributes");
          if (res.ok) {
            const data = await res.json();
            if (data.groups) {
              const mappedFilters = data.groups
                .filter((g: any) => g.isFilterable)
                .map((g: any) => ({
                  title: g.name,
                  groupId: g.id,
                  options: g.values.map((v: any) => ({
                    label: v.value,
                    valueId: v.id,
                    count: 0,
                  })),
                }));
              setFilters(mappedFilters);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load filters", error);
      } finally {
        setLoadingFilters(false);
      }
    }
    fetchFilters();
  }, [category]);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true);
      try {
        const query = new URLSearchParams(searchParams.toString());
        const res = await fetch(`/api/products?${query.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, [searchParams]);

  const toggleFilter = (groupName: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    const existing = current.get(groupName);

    if (existing === value) {
      current.delete(groupName);
    } else {
      current.set(groupName, value);
    }

    // Reset to page 1 on filter change
    current.delete("page");
    router.push(`${pathname}?${current.toString()}`);
  };

  const handleSortChange = (sortValue: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("sort", sortValue);
    // Reset to page 1 on sort change
    current.delete("page");
    router.push(`${pathname}?${current.toString()}`);
  };

  const getPageTitle = () => {
    switch (category) {
      case "laptops":
        return "Computing & Rigs";
      case "smartphones":
        return "Mobile Devices";
      case "audio":
        return "High-Res Audio";
      case "monitors":
        return "Professional Displays";
      default:
        return "All Hardware";
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20">
      <div className="max-w-[1320px] mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mb-6">
          <Link href="/" className="hover:text-[#111827] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href="/products"
            className="hover:text-[#111827] transition-colors"
          >
            Hardware
          </Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="font-semibold text-[#111827]">
                {getPageTitle()}
              </span>
            </>
          )}
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[28px] font-black text-[#111827] tracking-tight mb-2">
              {getPageTitle()}
            </h1>
            <p className="text-[13px] text-[#6B7280]">
              Showing {products.length} performance-engineered devices.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[#6B7280]">Sort by:</span>
            <SortDropdown
              currentSort={currentSort}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-[240px] flex-shrink-0 space-y-4">
            {loadingFilters ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#E5E7EB] rounded-xl p-5 h-40 animate-pulse"
                  />
                ))}
              </div>
            ) : filters.length === 0 ? (
              <div className="text-sm text-gray-500 bg-white p-4 border border-[#E5E7EB] rounded-xl">
                No dynamic filters available for this category.
              </div>
            ) : (
              filters.map((filter) => (
                <div
                  key={filter.groupId}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[13px] text-[#111827]">
                      {filter.title}
                    </h3>
                    <Minus className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                  <div className="space-y-3">
                    {filter.options.map((opt: any) => {
                      const isActive =
                        searchParams.get(filter.title) === opt.label;
                      return (
                        <label
                          key={opt.valueId}
                          className="flex items-center gap-3 group cursor-pointer"
                          onClick={() => toggleFilter(filter.title, opt.label)}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isActive ? "bg-[#00D4E8] border-[#00D4E8]" : "bg-white border-[#D1D5DB] group-hover:border-[#00D4E8]"}`}
                          >
                            {isActive && (
                              <div className="w-1.5 h-1.5 bg-white rounded-sm" />
                            )}
                          </div>
                          <span
                            className={`text-[13px] transition-colors flex-1 ${isActive ? "text-[#111827] font-semibold" : "text-[#4B5563] group-hover:text-[#111827]"}`}
                          >
                            {opt.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#E5E7EB] rounded-xl p-4 h-[340px] animate-pulse flex flex-col"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white border border-[#E5E7EB] rounded-xl">
                <p className="text-[#6B7280]">
                  No products found matching your criteria.
                </p>
                {searchParams.toString() !== "" &&
                  searchParams.toString() !== `category=${category}` && (
                    <button
                      onClick={() =>
                        router.push(
                          category
                            ? `/products?category=${category}`
                            : "/products",
                        )
                      }
                      className="mt-4 text-[#00D4E8] font-semibold hover:underline text-sm"
                    >
                      Clear Filters
                    </button>
                  )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-6">
                  <button className="flex items-center gap-1 text-[13px] font-semibold text-[#111827] hover:text-[#00D4E8] transition-colors border border-[#E5E7EB] bg-white rounded-md px-4 py-2">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded bg-[#0A0C14] text-white text-[13px] font-bold flex items-center justify-center">
                      1
                    </button>
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center text-[#111827] font-bold">
          Loading hardware catalog...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
