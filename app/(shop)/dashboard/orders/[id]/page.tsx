"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ShoppingBag, Calendar, DollarSign, MapPin, Phone, Mail, ArrowLeft, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OrderItem {
  productName: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl: string | null;
}

interface StatusHistory {
  toStatus: string;
  note: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string | null;
  orderNote: string | null;
  items: OrderItem[];
  statusHistory: StatusHistory[];
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrder();
    }
  }, [isAuthenticated, params.id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/user/orders/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setOrder(data.order);
    } catch (error) {
      console.error("Failed to fetch order", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/user/orders/${params.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Order cancelled successfully");
        fetchOrder();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Failed to cancel order", error);
      toast.error("An error occurred");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "CONFIRMED":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "PROCESSING":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "PACKED":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "SHIPPED":
        return "bg-teal-500/10 text-teal-500 border-teal-500/20";
      case "DELIVERED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "RETURNED":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#8892A4]">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-12 text-center">
        <ShoppingBag className="w-16 h-16 text-[#8892A4] mx-auto mb-4" />
        <h3 className="text-white font-semibold text-lg mb-2">Order not found</h3>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-[#00D4E8] hover:text-[#00BDD0] font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/orders"
          className="p-2 rounded-lg bg-[#111320] border border-[#1E2235] text-white hover:border-[#00D4E8]/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-[32px] font-black text-white tracking-tight mb-1">
            Order {order.orderNumber}
          </h1>
          <p className="text-[#8892A4] text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-xl border ${getStatusColor(order.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(order.status)}
            <div>
              <p className="font-semibold">{order.status}</p>
              <p className="text-xs opacity-80">
                {order.paymentStatus === "PAID" ? "Payment completed" : "Payment pending"}
              </p>
            </div>
          </div>
          {order.status === "PENDING" && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-[#1E2235] last:border-0 last:pb-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-[#0A0C14] flex items-center justify-center">
                      <Package className="w-8 h-8 text-[#8892A4]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{item.productName}</p>
                    <p className="text-[#8892A4] text-sm">{item.variantLabel}</p>
                    <p className="text-[#8892A4] text-xs">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">${Number(item.unitPrice).toFixed(2)}</p>
                    <p className="text-[#8892A4] text-xs">${Number(item.subtotal).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.statusHistory.map((history, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(history.toStatus).split(' ')[0]}`} />
                    {index < order.statusHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-[#1E2235] mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-white font-medium">{history.toStatus}</p>
                    <p className="text-[#8892A4] text-xs">
                      {new Date(history.createdAt).toLocaleString()}
                    </p>
                    {history.note && (
                      <p className="text-[#8892A4] text-sm mt-1">{history.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00D4E8]" />
              Shipping Address
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-white font-medium">{order.shippingName}</p>
              <p className="text-[#8892A4]">{order.shippingAddress}</p>
              <p className="text-[#8892A4]">{order.shippingCity}</p>
              {order.shippingZip && <p className="text-[#8892A4]">{order.shippingZip}</p>}
              <div className="flex items-center gap-2 text-[#8892A4] pt-2">
                <Phone className="w-4 h-4" />
                <span>{order.shippingPhone}</span>
              </div>
              {order.shippingEmail && (
                <div className="flex items-center gap-2 text-[#8892A4]">
                  <Mail className="w-4 h-4" />
                  <span>{order.shippingEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#00D4E8]" />
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#8892A4]">Subtotal</span>
                <span className="text-white">${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8892A4]">Shipping</span>
                <span className="text-white">${Number(order.shippingCost).toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-[#1E2235] flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-white font-bold text-lg">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1E2235]">
              <p className="text-[#8892A4] text-xs mb-1">Payment Method</p>
              <p className="text-white font-medium">{order.paymentMethod}</p>
            </div>
            {order.orderNote && (
              <div className="mt-4 pt-4 border-t border-[#1E2235]">
                <p className="text-[#8892A4] text-xs mb-1">Order Note</p>
                <p className="text-white text-sm">{order.orderNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
