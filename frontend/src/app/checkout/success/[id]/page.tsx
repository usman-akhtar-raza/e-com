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
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900">Order Confirmed!</h1>
        <p className="text-gray-500">Thank you for your purchase.</p>
        <Link href="/account/orders">
          <Button>View Order History</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Confirmation Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto">
          ✓
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Thank You for Your Order!</h1>
        <p className="text-gray-500 text-sm">
          Your order <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span> has been successfully placed.
        </p>
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <span>Status: {order.status}</span>
          <span>•</span>
          <span>Payment: {order.paymentStatus}</span>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Order Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Shipping Address</p>
            <p className="font-bold text-gray-900 mt-1">{order.shippingAddress?.fullName || 'Customer'}</p>
            <p className="text-gray-600">{order.shippingAddress?.addressLine1 || order.shippingAddress?.street}</p>
            <p className="text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode || order.shippingAddress?.zipCode}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Payment Summary</p>
            <p className="font-bold text-gray-900 mt-1">Method: {order.paymentMethod}</p>
            <p className="text-gray-600">Total Charged: <span className="font-bold text-gray-900">{formatPrice(order.totalAmount)}</span></p>
          </div>
        </div>

        {/* Purchased Items */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase">Purchased Items</p>
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
              <div>
                <p className="font-semibold text-gray-900">{item.productName}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatPrice(item.unitPrice)}</p>
              </div>
              <span className="font-bold text-gray-900">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
          <Link href={`/account/orders/${order.id}`} className="flex-1">
            <Button className="w-full">Track Order Status</Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button variant="outline" className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
