'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await api.orders.getById(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) return <LoadingSpinner />;

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6 animate-fade-in">
        <h1 className="text-4xl font-black text-slate-900">Order Confirmed!</h1>
        <p className="text-slate-500 text-lg">Thank you for your purchase.</p>
        <Link href="/account/orders">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-xl hover:shadow-blue-500/25 active:scale-95 transition-all">View Order History</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 animate-slide-up">
      {/* Confirmation Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-10 text-center shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 opacity-50 pointer-events-none"></div>
        <div className="relative">
          <div className="text-7xl mb-6 inline-block animate-bounce">🎉</div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Thank You for Your Order!</h1>
          <p className="text-slate-500 text-base">
            Your order <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md">{order.orderNumber}</span> has been successfully placed.
          </p>
          <div className="mt-6 inline-flex items-center space-x-3 bg-white/60 backdrop-blur-md border border-slate-200/60 shadow-sm text-sm font-bold px-5 py-2.5 rounded-full">
            <span className="text-emerald-600 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>{order.status}</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600">{order.paymentStatus}</span>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 space-y-8">
        <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-4">Order Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Shipping Address</p>
            <p className="font-black text-slate-900 text-base mb-1">{order.shippingAddress?.fullName || 'Customer'}</p>
            <p className="text-slate-600 font-medium">{order.shippingAddress?.addressLine1 || order.shippingAddress?.street}</p>
            <p className="text-slate-600 font-medium">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode || order.shippingAddress?.zipCode}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Summary</p>
            <p className="font-bold text-slate-700 mb-1">Method: <span className="text-slate-900">{order.paymentMethod}</span></p>
            <p className="text-slate-600 font-medium mt-2">Total Charged</p>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>

        {/* Purchased Items */}
        <div className="pt-2 space-y-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Purchased Items</p>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
                <div>
                  <p className="font-bold text-slate-900 text-base">{item.productName}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                </div>
                <span className="font-black text-slate-900 text-lg">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
          <Link href={`/account/orders/${order.id}`} className="flex-1">
            <Button className="w-full py-4 text-base bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-xl hover:shadow-blue-500/25 active:scale-95 transition-all font-bold">Track Order Status</Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button variant="outline" className="w-full py-4 text-base border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all font-bold">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
