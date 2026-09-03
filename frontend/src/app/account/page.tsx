
'use client';
import { useAuth } from '@/context/auth-context';

export default function AccountDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome back, {user?.firstName}!</h1>
      <p className="text-gray-600 mb-8">From your account dashboard you can view your recent orders and manage your profile details.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-lg font-bold mb-2">Recent Orders</h2>
          <p className="text-gray-500 text-sm">You have no recent orders.</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-lg font-bold mb-2">Account Info</h2>
          <p className="text-gray-700">{user?.firstName} {user?.lastName}</p>
          <p className="text-gray-700">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
