
export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Orders Management</h1>
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
