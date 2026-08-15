import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingBag,
  AlertCircle,
  Users,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic"; // Ensure fresh data on admin load

export default async function AdminDashboard() {
  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenueData,
    lowStockVariants,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.productVariant.count({
      where: { stock: { lt: 5 }, isActive: true },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true } },
        items: {
          include: {
            variant: { include: { product: { select: { name: true } } } },
          },
        },
      },
    }),
  ]);

  const totalRevenue = totalRevenueData._sum?.total || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            $
            {totalRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
        </div>

        {/* Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Total Products
            </h3>
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
        </div>

        {/* Customers */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Total Customers
            </h3>
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalCustomers}</p>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Low Stock Alerts
            </h3>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {lowStockVariants}
          </p>
          <p className="text-sm text-gray-500 mt-1">Variants &lt; 5 units</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          <Link
            href="/admin/orders"
            className="text-sm text-indigo-600 font-semibold hover:underline flex items-center"
          >
            View All <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Order Number</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-indigo-600 hover:text-indigo-900 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {order.user?.name || order.shippingName}
                      <span className="block text-xs text-gray-400">
                        {order.user?.email || order.shippingEmail}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      $
                      {Number(order.total).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
