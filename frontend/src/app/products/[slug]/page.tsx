'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product, Review, ReviewSummary, ProductVariant } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuth } from '@/context/auth-context';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProductData();
  }, [slug]);

  async function loadProductData() {
    setLoading(true);
    try {
      const prod = await api.products.getBySlug(slug);
      setProduct(prod);

      if (prod) {
        if (prod.images && prod.images.length > 0) {
          setSelectedImage(prod.images[0]);
        }
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        }

        const [sumRes, revRes, relRes] = await Promise.all([
          api.reviews.getSummary(prod.id).catch(() => null),
          api.reviews.getByProduct(prod.id).catch(() => ({ data: [] })),
          api.products.getAll({ categoryId: prod.categoryId, limit: 4 }).catch(() => ({ data: [] })),
        ]);

        setSummary(sumRes);
        setReviews(revRes?.data || []);
        setRelated((relRes?.data || []).filter(p => p.id !== prod.id));
      }
    } catch (err) {
      console.error('Failed to load product detail:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart() {
    if (!user) {
      alert('Please sign in to add items to your cart.');
      return;
    }
    if (!product) return;

    setAddingToCart(true);
    try {
      await api.cart.addItem(product.id, quantity, selectedVariant?.id);
      alert(`${quantity} x ${product.name} added to cart!`);
    } catch (err: any) {
      alert(err.message || 'Failed to add product to cart.');
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !product) return;
    setSubmittingReview(true);
    try {
      await api.reviews.create({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setShowReviewModal(false);
      setReviewTitle('');
      setReviewComment('');
      loadProductData();
      alert('Thank you! Your review has been submitted.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <Link href="/products" className="text-blue-600 font-semibold hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const mainImage = selectedImage || product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
  const displayPrice = selectedVariant?.price || product.price;
  const inStock = (selectedVariant?.stock ?? product.stock) > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600">Products</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/products?categoryId=${product.category.id}`} className="hover:text-blue-600">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative">
            <img src={mainImage} alt={product.name} className="object-cover w-full h-full" />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${
                    selectedImage === img ? 'border-blue-600' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info */}
        <div className="space-y-6">
          <div>
            {product.brand && (
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-1 block">
                {product.brand.name}
              </span>
            )}
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">SKU: {product.sku || 'N/A'}</p>
          </div>

          <div className="flex items-center space-x-4">
            <Rating value={summary?.averageRating || product.averageRating || 4.5} />
            <span className="text-sm font-semibold text-gray-700">
              {summary?.averageRating || 4.5} ({summary?.totalReviews || 0} reviews)
            </span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-gray-900">{formatPrice(displayPrice)}</span>
            {product.compareAtPrice && product.compareAtPrice > displayPrice && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          {/* Stock Status Badge */}
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {inStock ? `In Stock (${selectedVariant?.stock ?? product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-700">Select Option</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                      selectedVariant?.id === v.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Add to Cart */}
          <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 font-bold"
              >
                -
              </button>
              <span className="px-4 py-2 font-semibold text-gray-900 text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 font-bold"
              >
                +
              </button>
            </div>

            <Button
              className="flex-1 py-3 text-base"
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
            >
              {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
            </Button>
          </div>

          {/* Product Description */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm uppercase mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Customer Reviews & Ratings</h2>
            <p className="text-sm text-gray-500 mt-1">Verified buyer feedback & star breakdown</p>
          </div>
          {user && (
            <Button onClick={() => setShowReviewModal(true)}>
              Write a Review
            </Button>
          )}
        </div>

        {/* Rating Summary Breakdown */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-gray-50 p-6 rounded-xl">
            <div className="text-center md:border-r border-gray-200 pr-4">
              <span className="text-5xl font-extrabold text-gray-900">{summary.averageRating}</span>
              <div className="flex justify-center my-2">
                <Rating value={summary.averageRating} />
              </div>
              <span className="text-xs text-gray-500">Based on {summary.totalReviews} reviews</span>
            </div>

            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = summary.ratingDistribution[stars as 1|2|3|4|5] || 0;
                const pct = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center text-xs">
                    <span className="w-12 font-medium text-gray-600">{stars} Stars</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right font-medium text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No reviews yet for this product. Be the first to write one!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="border border-gray-100 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-gray-900">
                      {rev.user ? `${rev.user.firstName} ${rev.user.lastName}` : 'Anonymous'}
                    </span>
                    {rev.isVerifiedPurchase && (
                      <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-semibold">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <Rating value={rev.rating} />
                </div>
                {rev.title && <h4 className="font-bold text-gray-900 text-sm">{rev.title}</h4>}
                <p className="text-gray-600 text-sm">{rev.comment}</p>
                <p className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">Write a Customer Review</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(parseInt(e.target.value, 10))}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Terrible</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Summarize your review..."
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Comment</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details of your experience with this product..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)}>Cancel</Button>
                <Button type="submit" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
