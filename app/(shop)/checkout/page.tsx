"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { useRouter } from "next/navigation";
import { clearCart } from "@/store/slices/cart";
import { ChevronLeft, ShieldCheck, CreditCard, Wallet, Banknote, Lock } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [formData, setFormData] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingEmail: "",
    shippingAddress: "",
    shippingCity: "",
    shippingZip: "",
    orderNote: "",
    paymentMethod: "COD",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(clearCart());
        router.push(`/orders/${data.order.id}/success`);
      } else {
        setError(data.error || "Checkout failed. Please check your information.");
        if (data.details) {
          console.error("Validation errors:", data.details);
        }
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!cart.isLoaded) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#00D4E8] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-6">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center max-w-md w-full">
          <h2 className="text-[22px] font-black text-[#111827] mb-2">Cart is Empty</h2>
          <p className="text-[#6B7280] text-[13px] mb-8">You need items in your cart to proceed to checkout.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#0A0C14] hover:bg-[#1E2235] text-white font-bold px-6 py-3 rounded-lg text-[13px] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20 pt-8">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="mb-8">
          <Link
            href="/cart"
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
            className="inline-flex items-center gap-1.5 text-[12px] text-[#6B7280] hover:text-[#111827] transition-colors mb-4"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <h1 className="text-[28px] font-black text-[#111827] tracking-tight flex items-center gap-3">
            Secure Checkout
            <ShieldCheck className="w-6 h-6 text-[#10B981]" />
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Form */}
          <div className="w-full lg:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 lg:p-8">
                <h2 className="text-[16px] font-black text-[#111827] mb-5">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-bold text-[#4B5563] mb-1.5">Full Name</label>
                    <input
                      required
                      name="shippingName"
                      value={formData.shippingName}
                      onChange={handleChange}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] focus:outline-none focus:border-[#00D4E8] focus:ring-1 focus:ring-[#00D4E8] transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#4B5563] mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="shippingEmail"
                      value={formData.shippingEmail}
                      onChange={handleChange}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] focus:outline-none focus:border-[#00D4E8] transition-all"
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#4B5563] mb-1.5">Phone Number</label>
                    <input
                      required
                      name="shippingPhone"
                      value={formData.shippingPhone}
                      onChange={handleChange}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] focus:outline-none focus:border-[#00D4E8] transition-all"
                      placeholder="e.g. +1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 lg:p-8">
                <h2 className="text-[16px] font-black text-[#111827] mb-5">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-bold text-[#4B5563] mb-1.5">Street Address</label>
                    <input
                      required
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleChange}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] focus:outline-none focus:border-[#00D4E8] transition-all"
                      placeholder="123 Hardware Lane, Suite 100"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#4B5563] mb-1.5">City</label>
                    <input
                      required
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleChange}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] focus:outline-none focus:border-[#00D4E8] transition-all"
                      placeholder="San Francisco"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#4B5563] mb-1.5">Postal / Zip Code</label>
                    <input
                      required
                      name="shippingZip"
                      value={formData.shippingZip}
                      onChange={handleChange}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] focus:outline-none focus:border-[#00D4E8] transition-all"
                      placeholder="94107"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 lg:p-8">
                <h2 className="text-[16px] font-black text-[#111827] mb-5">Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${
                      formData.paymentMethod === "COD"
                        ? "border-[#00D4E8] bg-[#F0FFFE] ring-1 ring-[#00D4E8]"
                        : "border-[#E5E7EB] hover:border-[#D1D5DB] bg-[#F9FAFB]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Banknote
                      className={`w-6 h-6 ${formData.paymentMethod === "COD" ? "text-[#00D4E8]" : "text-[#9CA3AF]"}`}
                    />
                    <span className={`text-[13px] font-bold ${formData.paymentMethod === "COD" ? "text-[#00D4E8]" : "text-[#6B7280]"}`}>
                      Cash on Delivery
                    </span>
                  </label>

                  <label
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${
                      formData.paymentMethod === "BANK_TRANSFER"
                        ? "border-[#00D4E8] bg-[#F0FFFE] ring-1 ring-[#00D4E8]"
                        : "border-[#E5E7EB] hover:border-[#D1D5DB] bg-[#F9FAFB]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={formData.paymentMethod === "BANK_TRANSFER"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Wallet
                      className={`w-6 h-6 ${formData.paymentMethod === "BANK_TRANSFER" ? "text-[#00D4E8]" : "text-[#9CA3AF]"}`}
                    />
                    <span className={`text-[13px] font-bold text-center ${formData.paymentMethod === "BANK_TRANSFER" ? "text-[#00D4E8]" : "text-[#6B7280]"}`}>
                      Bank Transfer
                    </span>
                  </label>
                  
                  <label
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${
                      formData.paymentMethod === "MOCK_CARD"
                        ? "border-[#00D4E8] bg-[#F0FFFE] ring-1 ring-[#00D4E8]"
                        : "border-[#E5E7EB] hover:border-[#D1D5DB] bg-[#F9FAFB]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="MOCK_CARD"
                      checked={formData.paymentMethod === "MOCK_CARD"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <CreditCard
                      className={`w-6 h-6 ${formData.paymentMethod === "MOCK_CARD" ? "text-[#00D4E8]" : "text-[#9CA3AF]"}`}
                    />
                    <span className={`text-[13px] font-bold ${formData.paymentMethod === "MOCK_CARD" ? "text-[#00D4E8]" : "text-[#6B7280]"}`}>
                      Credit Card (Mock)
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-4 text-[13px] font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#0A0C14] hover:bg-[#1E2235] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  `Place Order — $${cart.total.toLocaleString()}`
                )}
              </button>
            </form>
          </div>

          {/* Right: Order Summary (Sticky) */}
          <div className="w-full lg:w-1/3 sticky top-[100px]">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <h2 className="text-[16px] font-black text-[#111827] mb-5">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto scrollbar-thin pr-2">
                {cart.items.map((item) => {
                  const product = item.variant.product;
                  const price = Number(item.variant.salePrice ?? item.variant.price);
                  const variantLabel = item.variant.attributes?.map((a: any) => a.attributeValue.value).join(" / ");

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-[60px] h-[60px] flex-shrink-0 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] flex items-center justify-center p-1.5 overflow-hidden">
                        {product.media?.[0]?.url ? (
                          <img src={product.media[0].url} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                          <span className="text-[9px] text-[#9CA3AF]">No Img</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-[12px] font-bold text-[#111827] line-clamp-1">{product.name}</h4>
                        {variantLabel && <p className="text-[10px] text-[#6B7280] mt-0.5">{variantLabel}</p>}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[11px] font-medium text-[#6B7280]">Qty: {item.quantity}</span>
                          <span className="text-[13px] font-bold text-[#111827]">${(price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-5 border-t border-[#E5E7EB] mb-5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6B7280]">Subtotal</span>
                  <span className="font-semibold text-[#111827]">${cart.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6B7280]">Shipping</span>
                  <span className="font-semibold text-[#111827]">
                    {cart.shippingCost === 0 ? (
                      <span className="text-[#10B981]">Free</span>
                    ) : (
                      `$${cart.shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-[#E5E7EB]">
                <span className="text-[15px] font-black text-[#111827]">Total</span>
                <span className="text-[22px] font-black text-[#00D4E8]">${cart.total.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                <Lock className="w-3 h-3" />
                Payments are secure and encrypted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
