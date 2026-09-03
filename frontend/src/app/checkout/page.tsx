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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Please Sign In</h1>
        <p className="text-slate-500 mb-6 text-lg">You must be logged in to proceed with checkout.</p>
        <Button onClick={() => router.push('/login')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all">Go to Sign In</Button>
      </div>
    );
  }

  const subtotal = cart?.items?.reduce((acc, item) => {
    const price = item.priceSnapshot || item.variant?.price || item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-slide-up">
      <h1 className="text-4xl font-black text-slate-900 tracking-tight">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Shipping & Payment Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Saved Addresses */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900">1. Shipping Address</h2>

            {addresses.length > 0 && (
              <div className="space-y-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Select Saved Address</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        selectedAddressId === addr.id
                          ? 'border-blue-600 bg-blue-50/50 shadow-md'
                          : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                      }`}
                    >
                      <p className="font-extrabold text-sm text-slate-900">{addr.fullName}</p>
                      <p className="text-sm text-slate-500 mt-2">{addr.addressLine1}</p>
                      <p className="text-sm text-slate-500">{addr.city}, {addr.state} {addr.postalCode}</p>
                    </div>
                  ))}
                  <div
                    onClick={() => setSelectedAddressId('')}
                    className={`p-5 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer text-sm transition-all duration-300 ${
                      selectedAddressId === '' ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-extrabold' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    + Use Custom Address
                  </div>
                </div>
              </div>
            )}

            {selectedAddressId === '' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Street Address</label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">ZIP / Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900">2. Payment Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center space-x-4 transition-all duration-300 ${
                paymentMethod === 'CARD' ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-slate-100 hover:border-slate-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <p className="font-extrabold text-sm text-slate-900">Credit / Debit Card</p>
                  <p className="text-xs text-slate-500 mt-1">Secure Instant Mock Payment</p>
                </div>
              </label>

              <label className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center space-x-4 transition-all duration-300 ${
                paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-slate-100 hover:border-slate-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <p className="font-extrabold text-sm text-slate-900">Cash on Delivery</p>
                  <p className="text-xs text-slate-500 mt-1">Pay upon package arrival</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Order Review Sidebar */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 space-y-6 h-fit sticky top-8">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">Order Summary</h2>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {cart?.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm group">
                <div className="flex-1 pr-4">
                  <p className="font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{item.product?.name}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Qty: {item.quantity}</p>
                </div>
                <span className="font-black text-slate-900 whitespace-nowrap">
                  {formatPrice((item.priceSnapshot || item.product?.price || 0) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal</span>
              <span className="font-black text-slate-900">{formatPrice(subtotal)}</span>
            </div>
            {couponCode && (
              <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 p-2.5 rounded-xl">
                <span className="font-bold">Applied Coupon</span>
                <span className="font-black tracking-wider uppercase">{couponCode}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xl font-black text-slate-900 pt-4 border-t border-slate-100">
              <span>Grand Total</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <Button type="submit" className="w-full py-4 text-base bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-xl hover:shadow-blue-500/25 active:scale-95 transition-all duration-300 font-bold" disabled={submitting}>
            {submitting ? 'Processing...' : 'Place Order & Pay Now'}
          </Button>
        </div>
      </form>
    </div>
  );
}
