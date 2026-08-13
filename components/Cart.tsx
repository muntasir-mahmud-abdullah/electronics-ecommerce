"use client";

import { X, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { setCart } from "@/store/slices/cart";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ isOpen, onClose }: CartProps) {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const refreshCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        dispatch(setCart(data));
      }
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingId(itemId);
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (res.ok) {
        await refreshCart();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update quantity");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdatingId(itemId);
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        await refreshCart();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-over panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0A0C14] border-l border-[#1E2235] z-[101] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2235]">
          <h2 className="text-xl font-black text-white tracking-tight">Your Cart</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#111320] border border-[#1E2235] text-[#8892A4] hover:text-white hover:border-[#2E3555] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-[#1E2235]">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#111320] border border-[#1E2235] flex items-center justify-center mb-4">
                <span className="text-[#00D4E8] font-bold">G</span>
              </div>
              <p className="text-white font-bold mb-2">Your cart is empty.</p>
              <p className="text-[#8892A4] text-sm mb-6">Looks like you haven't added anything to your cart yet.</p>
              <button
                onClick={onClose}
                className="bg-[#00D4E8] hover:bg-[#00BDD0] text-[#0A0C14] font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item) => {
                const product = item.variant.product;
                const price = Number(item.variant.salePrice ?? item.variant.price);
                const isUpdating = updatingId === item.id;

                // Build variant label
                const variantLabel = item.variant.attributes
                  ?.map((a: any) => a.attributeValue.value)
                  .join(" / ");

                return (
                  <div key={item.id} className={`flex gap-4 ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}>
                    {/* Image */}
                    <div className="w-20 h-20 flex-shrink-0 bg-[#111320] rounded-lg border border-[#1E2235] flex items-center justify-center overflow-hidden p-2">
                      {product.media?.[0]?.url ? (
                        <img src={product.media[0].url} alt={product.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-[#8892A4]">No Img</span>
                      )}
                    </div>
                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-[#8892A4] hover:text-[#EF4444] transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {variantLabel && (
                          <p className="text-[11px] text-[#8892A4] mt-1">{variantLabel}</p>
                        )}
                      </div>
                      <div className="flex items-end justify-between mt-3">
                        {/* Quantity controls */}
                        <div className="flex items-center bg-[#111320] border border-[#1E2235] rounded-md h-7 px-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#8892A4] hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white text-[12px] font-bold w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#8892A4] hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-white font-bold text-[15px]">${price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {cart.items.length > 0 && (
          <div className="p-6 border-t border-[#1E2235] bg-[#0A0C14]">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[13px] text-[#8892A4]">
                <span>Subtotal</span>
                <span className="text-white font-semibold">${cart.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[#8892A4]">
                <span>Shipping</span>
                <span className="text-white font-semibold">
                  {cart.shippingCost === 0 ? "Free" : `$${cart.shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-[#1E2235] pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-xl font-black text-[#00D4E8]">${cart.total.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full h-12 bg-[#00D4E8] hover:bg-[#00BDD0] text-[#0A0C14] font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
