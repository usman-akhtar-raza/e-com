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
      <div className="space-y-4 text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
        <Link href="/account/orders" className="text-blue-600 font-semibold hover:underline">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const canCancel = order.status === 'PENDING' || order.status === 'PROCESSING';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-gray-900">Order #{order.orderNumber || order.id.slice(0, 8)}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        {canCancel && (
          <Button variant="danger" disabled={cancelling} onClick={handleCancelOrder}>
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        )}
      </div>

      {/* Main Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Shipping Address</h3>
          <p className="font-bold text-gray-900 text-sm">{order.shippingAddress?.fullName || 'Customer'}</p>
          <p className="text-sm text-gray-600">{order.shippingAddress?.addressLine1 || order.shippingAddress?.street}</p>
          <p className="text-sm text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode || order.shippingAddress?.zipCode}</p>
          <p className="text-sm text-gray-600">{order.shippingAddress?.country}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Payment & Status</h3>
          <p className="text-sm text-gray-900 font-semibold">Method: {order.paymentMethod}</p>
          <p className="text-sm text-gray-600">Payment Status: <span className="font-bold text-green-600">{order.paymentStatus}</span></p>
          {order.couponCode && (
            <p className="text-sm text-gray-600">Coupon Used: <span className="font-mono font-bold text-blue-600">{order.couponCode}</span></p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-900 text-sm">
          Order Items
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Unit Price</th>
              <th className="p-4">Quantity</th>
              <th className="p-4 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td className="p-4 font-semibold text-gray-900">{item.productName}</td>
                <td className="p-4 text-gray-600">{formatPrice(item.unitPrice)}</td>
                <td className="p-4 text-gray-600">{item.quantity}</td>
                <td className="p-4 text-right font-bold text-gray-900">{formatPrice(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-2 text-sm text-right">
          <p className="text-gray-600">Subtotal: <span className="font-bold text-gray-900">{formatPrice(order.subtotal || order.totalAmount)}</span></p>
          {order.discountAmount > 0 && (
            <p className="text-green-600 font-medium">Discount: -{formatPrice(order.discountAmount)}</p>
          )}
          <p className="text-gray-600">Tax: <span className="font-bold text-gray-900">{formatPrice(order.taxAmount || 0)}</span></p>
          <p className="text-gray-600">Shipping: <span className="font-bold text-gray-900">{formatPrice(order.shippingAmount || 0)}</span></p>
          <p className="text-xl font-extrabold text-gray-900 pt-2 border-t border-gray-200">Total: {formatPrice(order.totalAmount)}</p>
        </div>
      </div>
    </div>
  );
}
