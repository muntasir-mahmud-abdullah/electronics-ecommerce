import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, Truck, ArrowRight } from "lucide-react";
import { PrintButton } from "@/components/print-button";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen pt-12 pb-24">
      <div className="max-w-[800px] mx-auto px-6">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#F0FFFE] border-2 border-[#00D4E8] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#00D4E8]" />
          </div>
          <h1 className="text-[32px] font-black text-[#111827] tracking-tight mb-2">
            Order Confirmed!
          </h1>
          <p className="text-[#6B7280] text-[15px]">
            Thank you for your purchase. Your order number is{" "}
            <span className="font-bold text-[#111827]">
              {order.orderNumber}
            </span>
            .
          </p>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Shipping Details */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-[#9CA3AF]" />
              <h2 className="text-[14px] font-bold text-[#111827]">
                Shipping Address
              </h2>
            </div>
            <div className="text-[13px] text-[#4B5563] space-y-1">
              <p className="font-bold text-[#111827]">{order.shippingName}</p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.shippingCity}, {order.shippingZip}
              </p>
              <p className="pt-2">{order.shippingPhone}</p>
              {order.shippingEmail && <p>{order.shippingEmail}</p>}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-[#9CA3AF]" />
              <h2 className="text-[14px] font-bold text-[#111827]">
                Order Info
              </h2>
            </div>
            <div className="text-[13px] text-[#4B5563] space-y-2">
              <div className="flex justify-between">
                <span>Date</span>
                <span className="font-semibold text-[#111827]">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-semibold text-[#111827]">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span className="font-semibold text-[#F59E0B]">
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fulfillment Status</span>
                <span className="font-semibold text-[#3B82F6]">
                  {order.fulfillmentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-8">
          <h2 className="text-[16px] font-black text-[#111827] mb-5">
            Order Summary
          </h2>
          <div className="space-y-4 mb-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-[60px] h-[60px] flex-shrink-0 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] flex items-center justify-center p-1.5 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <span className="text-[9px] text-[#9CA3AF]">No Img</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-[13px] font-bold text-[#111827]">
                    {item.productName}
                  </h4>
                  {item.variantLabel && (
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      {item.variantLabel}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[12px] font-medium text-[#6B7280]">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-[13px] font-bold text-[#111827]">
                      ${Number(item.subtotal).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-5 border-t border-[#E5E7EB] mb-5">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7280]">Subtotal</span>
              <span className="font-semibold text-[#111827]">
                ${Number(order.subtotal).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7280]">Shipping</span>
              <span className="font-semibold text-[#111827]">
                {Number(order.shippingCost) === 0 ? (
                  <span className="text-[#10B981]">Free</span>
                ) : (
                  `$${Number(order.shippingCost).toFixed(2)}`
                )}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-5 border-t border-[#E5E7EB]">
            <span className="text-[16px] font-black text-[#111827]">Total</span>
            <span className="text-[24px] font-black text-[#00D4E8]">
              ${Number(order.total).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#0A0C14] hover:bg-[#1E2235] text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
          <PrintButton />
        </div>
      </div>
    </div>
  );
}
