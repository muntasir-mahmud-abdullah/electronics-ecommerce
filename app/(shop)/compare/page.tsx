"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { removeFromCompare, clearCompare } from "@/store/slices/compare";
import { X, ArrowLeft, CheckCircle2 } from "lucide-react";

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

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center text-indigo-400 animate-pulse">Loading comparison...</div>;

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="glass-panel max-w-2xl mx-auto p-12 rounded-3xl">
          <h2 className="text-3xl font-bold text-white mb-4">Compare Specs</h2>
          <p className="text-gray-400 mb-8">You haven't added any products to compare yet. Browse our catalog and click the compare icon to add up to 3 products.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]">
            <ArrowLeft className="w-5 h-5" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Compare Products</h1>
          <p className="text-gray-400">Side-by-side technical specifications</p>
        </div>
        <button 
          onClick={() => dispatch(clearCompare())}
          className="text-sm text-red-400 hover:text-red-300 font-medium px-4 py-2 glass rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border-white/10 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="w-48 p-6 bg-black/40 border-b border-r border-white/10 text-gray-400 font-medium uppercase tracking-wider text-xs">
                Product
              </th>
              {products.map((p) => (
                <th key={p.id} className="p-6 bg-black/20 border-b border-white/10 relative w-64 align-top">
                  <button 
                    onClick={() => dispatch(removeFromCompare(p.id))}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors bg-white/5 p-1 rounded-full border border-white/10"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="h-40 w-full mb-4 bg-black/40 rounded-xl flex items-center justify-center p-4">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-gray-600">No Image</span>
                    )}
                  </div>
                  <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">{p.brand}</div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                    <Link href={`/products/${p.slug}`} className="hover:text-cyan-400 transition-colors">{p.name}</Link>
                  </h3>
                  <div className="text-2xl font-bold text-white mb-4">${Number(p.price || 0).toFixed(2)}</div>
                  
                  <Link 
                    href={`/products/${p.slug}`}
                    className="block w-full py-2 text-center rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all font-medium text-sm"
                  >
                    View Details
                  </Link>
                </th>
              ))}
              {/* Fill remaining slots if < 3 products */}
              {[...Array(3 - products.length)].map((_, i) => (
                <th key={`empty-${i}`} className="p-6 bg-black/10 border-b border-l border-white/5 align-middle text-center w-64">
                   <div className="h-40 w-full border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center flex-col gap-2 text-gray-500">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">+</div>
                      <span className="text-sm font-medium">Add Product</span>
                   </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {/* Core Specs */}
            <tr className="bg-white/5">
              <td colSpan={4} className="px-6 py-3 font-bold text-white text-sm uppercase tracking-wider">General Information</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="p-4 px-6 text-gray-400 font-medium border-r border-white/5">Category</td>
              {products.map(p => <td key={p.id} className="p-4 font-medium text-gray-200">{p.category}</td>)}
              {[...Array(3 - products.length)].map((_, i) => <td key={`empty-c-${i}`} className="border-l border-white/5" />)}
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="p-4 px-6 text-gray-400 font-medium border-r border-white/5">Stock Status</td>
              {products.map(p => (
                <td key={p.id} className="p-4 font-medium">
                  {p.stock > 0 ? (
                    <span className="text-green-400 flex items-center gap-1 text-sm"><CheckCircle2 className="w-4 h-4"/> In Stock</span>
                  ) : (
                    <span className="text-red-400 text-sm">Out of Stock</span>
                  )}
                </td>
              ))}
              {[...Array(3 - products.length)].map((_, i) => <td key={`empty-s-${i}`} className="border-l border-white/5" />)}
            </tr>

            {/* Dynamic Attributes */}
            <tr className="bg-white/5">
              <td colSpan={4} className="px-6 py-3 font-bold text-white text-sm uppercase tracking-wider">Technical Specifications</td>
            </tr>
            {allAttributeGroups.map((group) => (
              <tr key={group} className="hover:bg-white/5 transition-colors group">
                <td className="p-4 px-6 text-gray-400 font-medium border-r border-white/5 group-hover:text-indigo-300 transition-colors">{group}</td>
                {products.map((p) => {
                  const val = p.specs[group];
                  // Highlight identical specs vs different specs (optional logic, keeping it simple for now)
                  return (
                    <td key={`${p.id}-${group}`} className={`p-4 font-medium ${val ? 'text-gray-200' : 'text-gray-600'}`}>
                      {val || "—"}
                    </td>
                  );
                })}
                {[...Array(3 - products.length)].map((_, i) => <td key={`empty-${group}-${i}`} className="border-l border-white/5" />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
