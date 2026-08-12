export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Sales</h3>
          <p className="text-3xl font-bold text-gray-900">$12,450.00</p>
          <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Orders</h3>
          <p className="text-3xl font-bold text-gray-900">24</p>
          <p className="text-sm text-gray-600 mt-2">5 pending fulfillment</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Low Stock Alerts</h3>
          <p className="text-3xl font-bold text-orange-600">3</p>
          <p className="text-sm text-gray-600 mt-2">Requires attention</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="p-6 text-center text-gray-500 py-12">
          Chart or recent orders table goes here.
        </div>
      </div>
    </div>
  );
}
