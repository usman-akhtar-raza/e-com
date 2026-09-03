'use client';
import { useAuth } from '@/context/auth-context';

export default function AccountDashboard() {
  const { user } = useAuth();
  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome back, {user?.firstName}!</h1>
        <p className="text-slate-500">From your account dashboard you can view your recent orders and manage your profile details.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Recent Orders</h2>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <span className="text-4xl mb-3">🛍️</span>
            <h3 className="font-bold text-slate-900 mb-1">No orders yet</h3>
            <p className="text-slate-500 text-sm mb-4">You have no recent orders to show.</p>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-5 py-2 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition font-medium text-sm">
              Start Shopping
            </button>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Account Info</h2>
          <div className="space-y-1">
            <p className="text-lg font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
