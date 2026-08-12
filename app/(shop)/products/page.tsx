"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Filter, ShoppingCart, Info } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { addToCompare } from "@/store/slices/compare";

import { Suspense } from "react";

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

  const handleCompare = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    dispatch(addToCompare(productId));
    // Could add a toast notification here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="glass-panel p-6 rounded-2xl sticky top-24">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-400" />
              Filters
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Categories</h4>
                <div className="space-y-2">
                  <Link href="/products?category=laptops" className={`block text-sm ${category === 'laptops' ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-white'}`}>Laptops</Link>
                  <Link href="/products?category=smartphones" className={`block text-sm ${category === 'smartphones' ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-white'}`}>Smartphones</Link>
                </div>
              </div>
              
              {/* Note: Dynamic attribute filters would go here based on API response */}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="mb-8 flex justify-between items-end border-b border-white/10 pb-4">
            <div>
              <h1 className="text-3xl font-bold text-white capitalize">
                {category || "All Products"}
              </h1>
              <p className="text-gray-400 mt-2">{products.length} products found</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-panel rounded-2xl p-4 h-80 animate-pulse flex flex-col justify-end">
                   <div className="w-full h-4 bg-white/10 rounded mb-2" />
                   <div className="w-2/3 h-4 bg-white/10 rounded mb-4" />
                   <div className="w-1/3 h-6 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-2xl">
              <p className="text-gray-400">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const variant = product.variants?.[0];
                const price = Number(variant?.salePrice ?? variant?.price ?? 0);
                const originalPrice = variant?.salePrice ? Number(variant.price) : null;

                return (
                  <Link href={`/products/${product.slug}`} key={product.id} className="group glass-panel rounded-2xl p-4 flex flex-col transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:border-indigo-500/40">
                    <div className="relative aspect-square w-full rounded-xl bg-black/50 mb-4 overflow-hidden flex items-center justify-center">
                      {product.media?.[0]?.url ? (
                        <img src={product.media[0].url} alt={product.name} className="object-contain w-full h-full p-4 group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="text-gray-600 text-sm">No Image</div>
                      )}
                      
                      {originalPrice && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                          SALE
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="text-xs text-indigo-400 font-semibold mb-1">{product.brand?.name}</div>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Key Specs snippet */}
                      <div className="mb-4 flex flex-wrap gap-1">
                        {variant?.attributes?.slice(0, 3).map((attr: any) => (
                          <span key={attr.id} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400">
                            {attr.attributeValue.value} {attr.attributeValue.group.unit || ''}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          {originalPrice && (
                            <span className="text-sm text-gray-500 line-through mr-2">${originalPrice}</span>
                          )}
                          <span className="text-2xl font-bold text-white">${price}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => handleCompare(e, product.id)}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-colors"
                            title="Add to Compare"
                          >
                            <Info className="w-4 h-4 text-gray-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-indigo-400 animate-pulse">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
