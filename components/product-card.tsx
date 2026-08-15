"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { setCart } from "@/store/slices/cart";
import { showToast, openCart } from "@/store/slices/ui";
import {
  Product,
  Brand,
  ProductVariant,
  ProductMedia,
  AttributeValue,
  ProductAttribute,
  AttributeGroup,
} from "@prisma/client";

type PopulatedVariant = ProductVariant & {
  attributes: (ProductAttribute & {
    attributeValue: AttributeValue & { group: AttributeGroup };
  })[];
};

export type PopulatedProduct = Product & {
  category: any;
  brand: Brand | null;
  media: ProductMedia[];
  variants: PopulatedVariant[];
};

export function StarRating({ rating }: { rating: number }) {
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

export function ProductCard({ product }: { product: PopulatedProduct }) {
  const dispatch = useDispatch<AppDispatch>();
  const primaryMedia =
    product.media.find((m) => m.isPrimary) || product.media[0];
  // Calculate price based on cheapest variant
  const minPrice =
    product.variants.length > 0
      ? Math.min(...product.variants.map((v) => Number(v.salePrice || v.price)))
      : 0;

  // For specs on the card, we just pull the attributes from the first variant
  const firstVariant = product.variants[0];
  const specs = firstVariant
    ? firstVariant.attributes.slice(0, 3).map((a) => a.attributeValue.value)
    : [];

  // Mocking rating/reviews since they aren't in schema
  // Use deterministic values based on product ID to avoid hydration mismatch
  const hash = product.id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = 3.5 + (hash % 15) / 10; // 3.5 to 5.0
  const reviews = 10 + (hash % 150); // 10 to 160

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent Link navigation
    e.preventDefault();

    if (!firstVariant) {
      dispatch(
        showToast({
          message: "No variants available for this product",
          type: "error",
        }),
      );
      return;
    }

    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: firstVariant.id, quantity: 1 }),
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
      dispatch(showToast({ message: "Failed to add to cart", type: "error" }));
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex-shrink-0 w-[240px] bg-white border border-[#E5E7EB] rounded-lg overflow-hidden hover:border-[#00D4E8]/50 transition-colors group flex flex-col"
    >
      <div className="relative h-[200px] bg-[#F9FAFB] flex items-center justify-center">
        {product.isFeatured && (
          <span className="absolute top-2 left-2 bg-[#00D4E8]/10 text-[#00D4E8] text-[10px] font-bold px-2 py-1 rounded border border-[#00D4E8]/20 z-10">
            FEATURED
          </span>
        )}
        <div className="w-full h-full bg-[#F4F5F7] flex items-center justify-center mix-blend-multiply transition-transform duration-500 group-hover:scale-105">
          {primaryMedia ? (
            <img
              src={primaryMedia.url}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="text-[#9CA3AF] text-xs">No Image</div>
          )}
        </div>
      </div>

      <div className="flex-1 gap-1 flex p-3 flex-col">
        <p className="text-[10px] font-bold text-[#6B7280] tracking-widest uppercase">
          {product.brand?.name || "Unknown"}
        </p>
        <h4 className="text-[#111827] font-bold text-[15px] leading-snug line-clamp-2">
          {product.name}
        </h4>

        <div className="flex items-center justify-between">
          <p className="text-[#111827] font-black text-[20px]">
            ${minPrice.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5">
            <StarRating rating={rating} />
            <span className="text-[#6B7280] text-[11px] font-medium">
              ({reviews})
            </span>
          </div>
        </div>

        <div className="flex flex-nowrap py-1 overflow-x-scroll scrollbar-none gap-1.5">
          {specs.map((s) => (
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
    </Link>
  );
}
