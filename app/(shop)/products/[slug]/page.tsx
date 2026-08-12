"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShoppingCart, Check, Shield, Truck, RotateCcw } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch<AppDispatch>();

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
      if (res.ok) {
        // Redux slice would update from a separate fetch or from response
        alert("Added to cart!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center text-indigo-400 animate-pulse">Loading product...</div>;
  if (!product) return <div className="min-h-[70vh] flex items-center justify-center text-gray-400">Product not found.</div>;

  const price = Number(selectedVariant?.salePrice ?? selectedVariant?.price ?? 0);
  const originalPrice = selectedVariant?.salePrice ? Number(selectedVariant.price) : null;
  const inStock = selectedVariant?.stock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="glass-panel p-8 rounded-3xl aspect-square flex items-center justify-center bg-black/40 relative">
          {product.media?.[0]?.url ? (
            <img src={product.media[0].url} alt={product.name} className="w-full h-full object-contain" />
          ) : (
             <div className="text-gray-600">No Image Available</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="text-sm font-bold tracking-wider text-indigo-400 uppercase mb-2">
            {product.brand?.name}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">{product.name}</h1>
          
          <div className="mb-6 flex items-baseline gap-4">
            <span className="text-4xl font-bold text-white">${price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-xl text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
            )}
          </div>

          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selection (Simplified) */}
          {product.variants?.length > 1 && (
            <div className="mb-8">
              <h3 className="text-white font-medium mb-3">Select Configuration:</h3>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v: any) => {
                  const label = v.attributes.map((a:any) => a.attributeValue.value).join(" / ");
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl border transition-all ${
                        isSelected 
                          ? "bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
                          : "glass border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div className="mb-10 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center glass rounded-xl border border-white/10 h-14 w-32">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 text-gray-400 hover:text-white transition-colors h-full">-</button>
              <span className="text-white font-bold w-10 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="flex-1 text-gray-400 hover:text-white transition-colors h-full">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                inStock 
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_50px_rgba(79,70,229,0.6)]" 
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 text-gray-400">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span className="text-sm">{product.warrantyMonths} Months Warranty</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Truck className="w-5 h-5 text-cyan-400" />
              <span className="text-sm">Free Shipping over $99</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <RotateCcw className="w-5 h-5 text-purple-400" />
              <span className="text-sm">30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Technical Specifications */}
      <div className="glass-panel rounded-3xl p-8 md:p-12 border-white/10">
        <h2 className="text-2xl font-bold text-white mb-8">Technical Specifications</h2>
        
        {/* Render attributes from Category's AttributeMap for structured display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          {product.category?.attributeMaps?.map((map: any) => {
            const group = map.attributeGroup;
            // Find if selected variant has this attribute
            const attr = selectedVariant?.attributes?.find((a: any) => a.attributeValue.groupId === group.id);
            if (!attr) return null;
            
            return (
              <div key={group.id} className="flex border-b border-white/5 py-4">
                <div className="w-1/3 text-gray-500 font-medium">{group.name}</div>
                <div className="w-2/3 text-gray-200 font-medium">
                  {attr.attributeValue.value} {group.unit || ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
