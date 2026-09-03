'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  async function loadOrderDetails() {
    try {
      const data = await api.orders.getById(orderId);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelOrder() {
    if (!confirm('Are you sure you want to cancel this order? Item inventory stock will be restored.')) return;
    setCancelling(true);
    try {
      const updatedOrder = await api.orders.cancel(orderId);
      setOrder(updatedOrder);
      alert('Order cancelled successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!order) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm text-center py-16 px-4 animate-slide-up">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h1>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">We couldn't find the order you're looking for. It may have been deleted or the link is incorrect.</p>
        <Link href="/account/orders" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-6 py-2.5 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition font-semibold">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const canCancel = order.status === 'PENDING' || order.status === 'PROCESSING';

  const statusBadgeClass =
    order.status === 'DELIVERED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
    order.status === 'CANCELLED' ? 'bg-rose-50 border-rose-200 text-rose-700' :
    order.status === 'PROCESSING' ? 'bg-blue-50 border-blue-200 text-blue-700' :
    'bg-amber-50 border-amber-200 text-amber-700';

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-black text-slate-900">Order #{order.orderNumber || order.id.slice(0, 8)}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadgeClass}`}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        {canCancel && (
          <Button variant="danger" disabled={cancelling} onClick={handleCancelOrder} className="rounded-xl hover:shadow-lg transition">
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        )}
      </div>

      {/* Timeline (Static mock for visual) */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm p-6 overflow-hidden relative hidden sm:block">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-6">Order Status</h3>
        <div className="relative flex justify-between items-center w-full px-4">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full mx-4"></div>
          <div className={`absolute top-1/2 left-0 h-1 ${
              order.status === 'DELIVERED' ? 'bg-emerald-500 w-full' :
              order.status === 'PROCESSING' ? 'bg-blue-500 w-1/2' :
              order.status === 'CANCELLED' ? 'bg-rose-500 w-full' : 'bg-amber-500 w-1/4'
            } -translate-y-1/2 z-0 rounded-full mx-4 transition-all duration-500`}></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm mb-2 ${order.status !== 'CANCELLED' ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
            <span className="text-[10px] font-bold uppercase text-slate-600">Placed</span>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm mb-2 ${order.status === 'PROCESSING' || order.status === 'DELIVERED' ? 'bg-blue-500' : order.status === 'CANCELLED' ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
            <span className="text-[10px] font-bold uppercase text-slate-600">Processing</span>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm mb-2 ${order.status === 'DELIVERED' ? 'bg-emerald-500' : order.status === 'CANCELLED' ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
            <span className="text-[10px] font-bold uppercase text-slate-600">Delivered</span>
          </div>
        </div>
      </div>

      {/* Main Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Shipping Address</h3>
          <p className="font-bold text-slate-900">{order.shippingAddress?.fullName || 'Customer'}</p>
          <p className="text-sm text-slate-600">{order.shippingAddress?.addressLine1 || order.shippingAddress?.street}</p>
          <p className="text-sm text-slate-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode || order.shippingAddress?.zipCode}</p>
          <p className="text-sm text-slate-600">{order.shippingAddress?.country}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Payment & Status</h3>
          <p className="text-sm text-slate-900"><span className="text-slate-500">Method:</span> {order.paymentMethod}</p>
          <p className="text-sm text-slate-900"><span className="text-slate-500">Status:</span> <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{order.paymentStatus}</span></p>
          {order.couponCode && (
            <p className="text-sm text-slate-900 mt-2"><span className="text-slate-500">Coupon:</span> <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">{order.couponCode}</span></p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 bg-slate-50/50 border-b border-slate-200/80">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="p-5">Product</th>
                <th className="p-5">Unit Price</th>
                <th className="p-5">Quantity</th>
                <th className="p-5 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 font-semibold text-slate-900">{item.productName}</td>
                  <td className="p-5 text-slate-600">{formatPrice(item.unitPrice)}</td>
                  <td className="p-5 text-slate-600">{item.quantity}</td>
                  <td className="p-5 text-right font-bold text-slate-900">{formatPrice(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/50 border-t border-slate-200/80 space-y-3 text-sm text-right">
          <p className="text-slate-600">Subtotal: <span className="font-bold text-slate-900 inline-block w-24">{formatPrice(order.subtotal || order.totalAmount)}</span></p>
          {order.discountAmount > 0 && (
            <p className="text-emerald-600 font-medium">Discount: <span className="inline-block w-24">-{formatPrice(order.discountAmount)}</span></p>
          )}
          <p className="text-slate-600">Tax: <span className="font-bold text-slate-900 inline-block w-24">{formatPrice(order.taxAmount || 0)}</span></p>
          <p className="text-slate-600">Shipping: <span className="font-bold text-slate-900 inline-block w-24">{formatPrice(order.shippingAmount || 0)}</span></p>
          <div className="pt-4 mt-2 border-t border-slate-200/80">
            <p className="text-xl font-black text-slate-900 flex items-center justify-end gap-4">
              <span className="text-sm font-bold uppercase text-slate-400 tracking-wider">Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
