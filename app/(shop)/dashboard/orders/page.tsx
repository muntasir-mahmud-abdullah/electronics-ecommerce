"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ShoppingBag, Calendar, DollarSign, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  items: Array<{
    productName: string;
    variantLabel: string;
    quantity: number;
    imageUrl: string | null;
  }>;
}

export default function OrdersPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const statusParam = statusFilter ? `&status=${statusFilter}` : "";
      const res = await fetch(`/api/user/orders?page=${currentPage}&limit=10${statusParam}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/user/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Order cancelled successfully");
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Failed to cancel order", error);
      toast.error("An error occurred");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black text-white tracking-tight mb-2">
            My Orders
          </h1>
          <p className="text-[#8892A4] text-sm">
            Track and manage your orders
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111320] border border-[#1E2235] rounded-lg px-4 py-2 text-white text-sm focus:border-[#00D4E8] focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#8892A4]">Loading orders...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-[#8892A4] mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">No orders found</h3>
          <p className="text-[#8892A4] text-sm mb-6">
            {statusFilter ? "Try changing the status filter" : "Start shopping to see your orders here"}
          </p>
          {!statusFilter && (
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00D4E8] hover:bg-[#00BDD0] text-[#0A0C14] font-bold text-sm rounded-lg transition-colors"
            >
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#111320] border border-[#1E2235] rounded-2xl p-6 hover:border-[#00D4E8]/30 transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-[#1E2235]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00D4E8]/10 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-[#00D4E8]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{order.orderNumber}</p>
                    <p className="text-[#8892A4] text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center gap-1 text-[#00D4E8] hover:text-[#00BDD0] text-sm font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {order.items.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-[#0A0C14] flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-[#8892A4]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {item.productName}
                      </p>
                      <p className="text-[#8892A4] text-xs">{item.variantLabel}</p>
                      <p className="text-[#8892A4] text-xs">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-[#8892A4] text-xs">
                    +{order.items.length - 2} more items
                  </p>
                )}
              </div>

              {/* Order Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#1E2235]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#8892A4]" />
                    <span className="text-white font-bold">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[#8892A4] text-xs">
                    {order.paymentMethod} • {order.paymentStatus}
                  </div>
                </div>

                {order.status === "PENDING" && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-[#111320] border border-[#1E2235] text-white hover:border-[#00D4E8]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-[#8892A4] text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-[#111320] border border-[#1E2235] text-white hover:border-[#00D4E8]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
