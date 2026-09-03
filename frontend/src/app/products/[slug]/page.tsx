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
        <h1 className="text-2xl font-black text-slate-900 mb-4">Product Not Found</h1>
        <Link href="/products" className="text-blue-600 font-bold hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const mainImage = selectedImage || product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
  const displayPrice = selectedVariant?.price || product.price;
  const inStock = (selectedVariant?.stock ?? product.stock) > 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: mainImage,
    description: product.description,
    sku: product.sku || product.id,
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      price: displayPrice,
      priceCurrency: 'USD',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: summary?.totalReviews ? {
      '@type': 'AggregateRating',
      ratingValue: summary.averageRating,
      reviewCount: summary.totalReviews,
    } : undefined,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span className="text-slate-300">/</span>
        <Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link>
        <span className="text-slate-300">/</span>
        {product.category && (
          <>
            <Link href={`/products?categoryId=${product.category.id}`} className="hover:text-blue-600 transition-colors">
              {product.category.name}
            </Link>
            <span className="text-slate-300">/</span>
          </>
        )}
        <span className="text-slate-900 font-bold truncate">{product.name}</span>
      </nav>

      {/* Main Product Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 relative group">
            <img src={mainImage} alt={product.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-white/50 backdrop-blur-sm transition-all duration-300 ${
                    selectedImage === img ? 'ring-2 ring-blue-500 shadow-md scale-105' : 'border border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
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
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                {product.brand.name}
              </span>
            )}
            <h1 className="text-4xl font-black text-slate-900 leading-tight">{product.name}</h1>
            <p className="text-xs text-slate-400 font-mono mt-2">SKU: {product.sku || 'N/A'}</p>
          </div>

          <div className="flex items-center space-x-4">
            <Rating value={summary?.averageRating || product.averageRating || 4.5} />
            <span className="text-sm font-bold text-slate-600">
              {summary?.averageRating || 4.5} ({summary?.totalReviews || 0} reviews)
            </span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-black text-slate-900">{formatPrice(displayPrice)}</span>
            {product.compareAtPrice && product.compareAtPrice > displayPrice && (
              <span className="text-lg text-slate-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          {/* Stock Status Badge */}
          <div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              inStock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {inStock ? `In Stock (${selectedVariant?.stock ?? product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Select Option</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300 ${
                      selectedVariant?.id === v.id
                        ? 'border-transparent bg-white shadow-sm ring-2 ring-blue-500 text-blue-700'
                        : 'border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Add to Cart */}
          <div className="flex items-center space-x-4 pt-6 border-t border-slate-200/80">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 font-bold transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2.5 font-bold text-slate-900 text-sm bg-white min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 font-bold transition-colors"
              >
                +
              </button>
            </div>

            <button
              className="flex-1 py-3 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
            >
              {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
            </button>
          </div>

          {/* Product Description */}
          <div className="pt-6 border-t border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-3">Description</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Customer Reviews & Ratings</h2>
            <p className="text-sm text-slate-500 mt-1">Verified buyer feedback & star breakdown</p>
          </div>
          {user && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 transition-all"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Rating Summary Breakdown */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div className="text-center md:border-r border-slate-200/80 pr-4">
              <span className="text-5xl font-black text-slate-900">{summary.averageRating}</span>
              <div className="flex justify-center my-3">
                <Rating value={summary.averageRating} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Based on {summary.totalReviews} reviews</span>
            </div>

            <div className="md:col-span-2 space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = summary.ratingDistribution[stars as 1|2|3|4|5] || 0;
                const pct = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center text-xs">
                    <span className="w-16 font-bold text-slate-600">{stars} Stars</span>
                    <div className="flex-1 mx-4 bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right font-bold text-slate-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-bold text-slate-900 mb-1">No reviews yet</h3>
              <p className="text-slate-500 text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                      {rev.user ? rev.user.firstName[0] : 'A'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-slate-900">
                        {rev.user ? `${rev.user.firstName} ${rev.user.lastName}` : 'Anonymous'}
                      </span>
                      {rev.isVerifiedPurchase && (
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center mt-0.5">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <Rating value={rev.rating} />
                </div>
                <div className="pt-2">
                  {rev.title && <h4 className="font-black text-slate-900 text-sm mb-1">{rev.title}</h4>}
                  <p className="text-slate-600 text-sm leading-relaxed">{rev.comment}</p>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100">{new Date(rev.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl border border-slate-200/80 animate-slide-up">
            <h2 className="text-2xl font-black text-slate-900">Write a Review</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(parseInt(e.target.value, 10))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none font-medium text-slate-700"
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Terrible</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Summarize your review..."
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none placeholder-slate-400 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Comment</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details of your experience with this product..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none placeholder-slate-400 font-medium text-slate-700 resize-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95 transition-all disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
