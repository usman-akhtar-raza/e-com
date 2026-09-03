'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Cart, CouponValidationResult } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/auth-context';

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function loadCart() {
    try {
      const data = await api.cart.get();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setUpdatingItemId(itemId);
    try {
      const updatedCart = await api.cart.updateItem(itemId, newQuantity);
      setCart(updatedCart);
      if (appliedCoupon && updatedCart) {
        revalidateCoupon(updatedCart);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleRemoveItem(itemId: string) {
    setUpdatingItemId(itemId);
    try {
      const updatedCart = await api.cart.removeItem(itemId);
      setCart(updatedCart);
      if (appliedCoupon && updatedCart) {
        revalidateCoupon(updatedCart);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove item');
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleValidateCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError('');
    try {
      const subtotal = calculateSubtotal();
      const res = await api.coupons.validate(couponCode.trim().toUpperCase(), subtotal);
      if (res.valid) {
        setAppliedCoupon(res);
      } else {
        setCouponError(res.message || 'Invalid coupon code.');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate coupon.');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  }

  async function revalidateCoupon(c: Cart) {
    const subtotal = c.items?.reduce((acc, item) => {
      const price = item.priceSnapshot || item.variant?.price || item.product?.price || 0;
      return acc + price * item.quantity;
    }, 0) || 0;

    if (appliedCoupon && appliedCoupon.coupon) {
      try {
        const res = await api.coupons.validate(appliedCoupon.coupon.code, subtotal);
        if (res.valid) {
          setAppliedCoupon(res);
        } else {
          setAppliedCoupon(null);
        }
      } catch {
        setAppliedCoupon(null);
      }
    }
  }

  function calculateSubtotal(): number {
    if (!cart?.items) return 0;
    return cart.items.reduce((acc, item) => {
      const price = item.priceSnapshot || item.variant?.price || item.product?.price || 0;
      return acc + price * item.quantity;
    }, 0);
  }

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-3xl font-black text-slate-900">Your Shopping Cart</h1>
        <p className="text-slate-500 max-w-md mx-auto">Please sign in to view your saved shopping cart items and proceed to checkout.</p>
        <Link href="/login" className="inline-block mt-4">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all duration-300">
            Sign In to Continue
          </button>
        </Link>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const discount = appliedCoupon?.discountAmount || 0;
  const tax = Number(((subtotal - discount) * 0.05).toFixed(2));
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 15;
  const total = Math.max(0, subtotal - discount + tax + shipping);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 relative">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -z-10 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl -z-10 mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-slide-up z-10 relative">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{cart?.items?.length || 0} Items</span>
        </div>

        {!cart?.items || cart.items.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-16 text-center shadow-xl shadow-slate-200/50 space-y-6 max-w-2xl mx-auto">
            <div className="text-6xl animate-bounce-subtle">🛍️</div>
            <h2 className="text-2xl font-extrabold text-slate-900">Your cart is feeling lonely</h2>
            <p className="text-slate-500 text-lg">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/products" className="inline-block pt-4">
              <button className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all duration-300 hover:-translate-y-1">
                Explore Products & Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Item List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-lg shadow-slate-200/40 overflow-hidden divide-y divide-slate-100">
                {cart.items.map((item) => {
                  const itemPrice = item.priceSnapshot || item.variant?.price || item.product?.price || 0;
                  const imageUrl = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';

                  return (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center space-x-5">
                        <div className="relative group">
                          <img src={imageUrl} alt={item.product?.name} className="w-24 h-24 object-cover rounded-2xl border border-slate-200/80 shadow-sm" />
                          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors rounded-2xl pointer-events-none"></div>
                        </div>
                        <div>
                          <Link href={`/products/${item.product?.slug}`} className="font-extrabold text-lg text-slate-900 hover:text-blue-600 transition-colors">
                            {item.product?.name}
                          </Link>
                          {item.variant && (
                            <p className="text-sm text-slate-500 font-semibold mt-1">Option: <span className="text-slate-700">{item.variant.name}</span></p>
                          )}
                          <p className="text-sm font-bold text-slate-900 mt-2 bg-slate-100 inline-block px-2 py-1 rounded-lg">{formatPrice(itemPrice)}</p>
                        </div>
                      </div>

                      {/* Quantity Modifiers */}
                      <div className="flex flex-row sm:flex-row items-center space-x-6 self-end sm:self-center w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                          <button
                            disabled={updatingItemId === item.id}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="px-4 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-black text-lg transition-colors disabled:opacity-50"
                          >
                            −
                          </button>
                          <span className="w-10 text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                          <button
                            disabled={updatingItemId === item.id}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-4 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-black text-lg transition-colors disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-black text-slate-900 text-lg w-24 text-right">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>

                        <button
                          disabled={updatingItemId === item.id}
                          onClick={() => handleRemoveItem(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                          title="Remove Item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary & Coupon Card */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-200/50 space-y-6 sticky top-8">
                <h2 className="text-xl font-black text-slate-900">Order Summary</h2>

                {/* Coupon Form */}
                <form onSubmit={handleValidateCoupon} className="space-y-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Promo Code</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. SAVE10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal uppercase"
                    />
                    <button
                      type="submit"
                      disabled={validatingCoupon}
                      className="px-4 py-2 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-70"
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in">
                      <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                        <span className="text-emerald-500 text-sm">✓</span>
                        Code <span className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-800">{appliedCoupon.coupon.code}</span> applied
                      </p>
                    </div>
                  )}
                  {couponError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl animate-fade-in">
                      <p className="text-xs text-rose-700 font-bold">{couponError}</p>
                    </div>
                  )}
                </form>

                {/* Breakdown */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 bg-emerald-50/50 p-2 -mx-2 rounded-lg">
                      <span className="text-sm font-bold">Discount</span>
                      <span className="font-bold">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-500">Estimated Tax (5%)</span>
                    <span className="font-bold text-slate-900">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-500">Shipping</span>
                    <span className="font-bold text-slate-900">
                      {shipping === 0 ? <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs tracking-wide uppercase">Free</span> : formatPrice(shipping)}
                    </span>
                  </div>

                  <div className="flex justify-between items-end pt-6 border-t border-slate-100">
                    <div>
                      <span className="block text-base font-black text-slate-900">Total</span>
                      <span className="text-xs text-slate-400 font-medium mt-1 block">Including taxes</span>
                    </div>
                    <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 active:scale-95 transition-all duration-300 text-lg hover:-translate-y-0.5 mt-4"
                  onClick={() => {
                    if (appliedCoupon?.coupon?.code) {
                      sessionStorage.setItem('checkout_coupon', appliedCoupon.coupon.code);
                    }
                    router.push('/checkout');
                  }}
                >
                  Proceed to Checkout
                </button>

                <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest pt-2">
                  <span>🔒</span>
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
