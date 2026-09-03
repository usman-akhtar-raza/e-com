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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900">Your Shopping Cart</h1>
        <p className="text-gray-500">Please sign in to view your saved shopping cart items.</p>
        <Link href="/login">
          <Button>Sign In to Continue</Button>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>

      {!cart?.items || cart.items.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm space-y-4">
          <p className="text-gray-500 text-lg">Your shopping cart is currently empty.</p>
          <Link href="/products">
            <Button>Explore Products & Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Item List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
              {cart.items.map((item) => {
                const itemPrice = item.priceSnapshot || item.variant?.price || item.product?.price || 0;
                const imageUrl = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';

                return (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <img src={imageUrl} alt={item.product?.name} className="w-20 h-20 object-cover rounded-xl border" />
                      <div>
                        <Link href={`/products/${item.product?.slug}`} className="font-bold text-gray-900 hover:text-blue-600">
                          {item.product?.name}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-gray-500 font-medium">Option: {item.variant.name}</p>
                        )}
                        <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(itemPrice)}</p>
                      </div>
                    </div>

                    {/* Quantity Modifiers */}
                    <div className="flex items-center space-x-4 self-end sm:self-center">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          disabled={updatingItemId === item.id}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold text-sm"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-semibold text-gray-900 text-sm">{item.quantity}</span>
                        <button
                          disabled={updatingItemId === item.id}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold text-sm"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-gray-900 text-base w-24 text-right">
                        {formatPrice(itemPrice * item.quantity)}
                      </span>

                      <button
                        disabled={updatingItemId === item.id}
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
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
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-gray-900 border-b border-gray-100 pb-4">Order Summary</h2>

              {/* Coupon Form */}
              <form onSubmit={handleValidateCoupon} className="space-y-2">
                <label className="block text-xs font-bold uppercase text-gray-700">Promo / Coupon Code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. SAVE10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 border border-gray-200 rounded-xl p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <Button type="submit" size="sm" disabled={validatingCoupon}>
                    {validatingCoupon ? 'Validating...' : 'Apply'}
                  </Button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    ✓ Coupon <span className="font-mono font-bold">{appliedCoupon.coupon.code}</span> applied ({formatPrice(discount)} discount)
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-600 font-semibold mt-1">{couponError}</p>
                )}
              </form>

              {/* Breakdown */}
              <div className="space-y-3 text-sm text-gray-600 pt-4 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shipping === 0 ? <span className="text-green-600 font-bold">FREE</span> : formatPrice(shipping)}
                  </span>
                </div>

                <div className="flex justify-between text-lg font-extrabold text-gray-900 pt-4 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                className="w-full py-3.5 text-base"
                onClick={() => {
                  if (appliedCoupon?.coupon?.code) {
                    sessionStorage.setItem('checkout_coupon', appliedCoupon.coupon.code);
                  }
                  router.push('/checkout');
                }}
              >
                Proceed to Checkout →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
