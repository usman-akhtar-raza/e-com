'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Cart, Address, Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/auth-context';

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Address Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('USA');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (user) {
      loadCheckoutData();
      const savedCoupon = sessionStorage.getItem('checkout_coupon');
      if (savedCoupon) setCouponCode(savedCoupon);
    } else {
      setLoading(false);
    }
  }, [user]);

  async function loadCheckoutData() {
    try {
      const [cartData, addrData] = await Promise.all([
        api.cart.get().catch(() => null),
        api.addresses.getAll().catch(() => []),
      ]);
      setCart(cartData);
      setAddresses(addrData || []);

      if (addrData && addrData.length > 0) {
        const defaultAddr = addrData.find(a => a.isDefault) || addrData[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      console.error('Failed to load checkout data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!cart?.items || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      let shippingAddress: any;
      if (selectedAddressId) {
        const addr = addresses.find(a => a.id === selectedAddressId);
        if (addr) {
          shippingAddress = {
            fullName: addr.fullName,
            phone: addr.phone,
            addressLine1: addr.addressLine1,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            country: addr.country,
          };
        }
      }

      if (!shippingAddress) {
        shippingAddress = {
          fullName,
          phone,
          addressLine1,
          city,
          state,
          postalCode,
          country,
        };
      }

      const order: Order = await api.orders.create({
        shippingAddress,
        couponCode: couponCode || undefined,
        paymentMethod,
      });

      // Process Mock Payment
      await api.payments.process(order.id, order.totalAmount, paymentMethod);

      sessionStorage.removeItem('checkout_coupon');
      router.push(`/checkout/success/${order.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-gray-500 mb-6">You must be logged in to proceed with checkout.</p>
        <Button onClick={() => router.push('/login')}>Go to Sign In</Button>
      </div>
    );
  }

  const subtotal = cart?.items?.reduce((acc, item) => {
    const price = item.priceSnapshot || item.variant?.price || item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900">Checkout & Payment</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Shipping & Payment Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Saved Addresses */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900">1. Shipping Address</h2>

            {addresses.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase text-gray-700">Select Saved Address</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        selectedAddressId === addr.id
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold text-sm text-gray-900">{addr.fullName}</p>
                      <p className="text-xs text-gray-600 mt-1">{addr.addressLine1}</p>
                      <p className="text-xs text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                    </div>
                  ))}
                  <div
                    onClick={() => setSelectedAddressId('')}
                    className={`p-4 rounded-xl border border-dashed flex items-center justify-center cursor-pointer text-sm font-medium ${
                      selectedAddressId === '' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    + Use Custom Address
                  </div>
                </div>
              </div>
            )}

            {selectedAddressId === '' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">ZIP / Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900">2. Payment Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`p-4 rounded-xl border cursor-pointer flex items-center space-x-3 ${
                paymentMethod === 'CARD' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="text-blue-600"
                />
                <div>
                  <p className="font-bold text-sm text-gray-900">Credit / Debit Card</p>
                  <p className="text-xs text-gray-500">Secure Instant Mock Payment</p>
                </div>
              </label>

              <label className={`p-4 rounded-xl border cursor-pointer flex items-center space-x-3 ${
                paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="text-blue-600"
                />
                <div>
                  <p className="font-bold text-sm text-gray-900">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay upon package arrival</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Order Review Sidebar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 h-fit">
          <h2 className="text-lg font-extrabold text-gray-900 border-b border-gray-100 pb-4">Order Items ({cart?.items?.length || 0})</h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart?.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-gray-900 line-clamp-1">{item.product?.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatPrice((item.priceSnapshot || item.product?.price || 0) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            {couponCode && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Applied Coupon</span>
                <span className="font-mono">{couponCode}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-extrabold text-gray-900 pt-3 border-t border-gray-100">
              <span>Grand Total</span>
              <span className="text-blue-600">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <Button type="submit" className="w-full py-4 text-base" disabled={submitting}>
            {submitting ? 'Processing Payment & Order...' : 'Place Order & Pay Now'}
          </Button>
        </div>
      </form>
    </div>
  );
}
