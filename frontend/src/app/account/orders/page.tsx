export default function OrdersPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Order History</h1>
        <p className="text-slate-500 mt-2">View and track all your recent purchases.</p>
      </div>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm text-center py-16 px-4 animate-slide-up">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No orders found</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">You haven't placed any orders yet. Once you do, you'll be able to track their status here.</p>
        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-6 py-2.5 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition font-semibold">
          Explore Products
        </button>
      </div>
    </div>
  );
}
