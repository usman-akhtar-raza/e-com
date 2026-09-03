
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {['Total Products', 'Total Orders', 'Total Users', 'Revenue'].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-gray-500 text-sm font-medium">{stat}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
        <p className="text-gray-500">No recent orders to display.</p>
      </div>
    </div>
  );
}
