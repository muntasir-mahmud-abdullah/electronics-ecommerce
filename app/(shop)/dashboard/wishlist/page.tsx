"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { Heart, Trash2, ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { setCart } from "@/store/slices/cart";

interface WishlistItem {
  id: string;
  variant: {
    id: string;
    price: number;
    salePrice: number | null;
    product: {
      name: string;
      slug: string;
      media: Array<{ url: string }>;
    };
  };
}

export default function WishlistPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/user/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setWishlistItems(data.wishlistItems || []);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (variantId: string) => {
    setAddingToCart(variantId);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ variantId, quantity: 1 }),
      });

      if (res.ok) {
        const data = await res.json();
        dispatch(setCart(data));
        toast.success("Added to cart");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Failed to add to cart", error);
      toast.error("An error occurred");
    } finally {
      setAddingToCart(null);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    if (!confirm("Remove this item from wishlist?")) return;

    setRemoving(itemId);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/user/wishlist/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Removed from wishlist");
        setWishlistItems(wishlistItems.filter((item) => item.id !== itemId));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Failed to remove from wishlist", error);
      toast.error("An error occurred");
    } finally {
      setRemoving(null);
    }
  };

  const getPrice = (item: WishlistItem) => {
    return item.variant.salePrice ?? item.variant.price;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-black text-white tracking-tight mb-2">
          My Wishlist
        </h1>
        <p className="text-[#8892A4] text-sm">
          {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {/* Wishlist Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#8892A4]">Loading wishlist...</div>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-12 text-center">
          <Heart className="w-16 h-16 text-[#8892A4] mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">Your wishlist is empty</h3>
          <p className="text-[#8892A4] text-sm mb-6">
            Save items you love by clicking the heart icon on product pages
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00D4E8] hover:bg-[#00BDD0] text-[#0A0C14] font-bold text-sm rounded-lg transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#111320] border border-[#1E2235] rounded-2xl overflow-hidden hover:border-[#00D4E8]/30 transition-colors group"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-[#0A0C14]">
                {item.variant.product.media[0]?.url ? (
                  <img
                    src={item.variant.product.media[0].url}
                    alt={item.variant.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-[#8892A4]" />
                  </div>
                )}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  disabled={removing === item.id}
                  className="absolute top-3 right-3 p-2 bg-[#0A0C14]/80 backdrop-blur-sm rounded-full text-red-400 hover:text-red-300 hover:bg-red-400/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link
                  href={`/products/${item.variant.product.slug}`}
                  className="block"
                >
                  <h3 className="text-white font-medium text-sm mb-2 line-clamp-2 hover:text-[#00D4E8] transition-colors">
                    {item.variant.product.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    {item.variant.salePrice ? (
                      <div className="flex items-center gap-2">
                        <p className="text-[#00D4E8] font-bold">
                          ${item.variant.salePrice.toFixed(2)}
                        </p>
                        <p className="text-[#8892A4] text-sm line-through">
                          ${item.variant.price.toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-white font-bold">
                        ${item.variant.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => addToCart(item.variant.id)}
                  disabled={addingToCart === item.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00D4E8] hover:bg-[#00BDD0] text-[#0A0C14] font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {addingToCart === item.id ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
