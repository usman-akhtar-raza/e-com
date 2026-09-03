'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Review, ReviewStatus } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Rating } from '@/components/ui/Rating';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [statusFilter]);

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await api.reviews.getAll(statusFilter ? { status: statusFilter } : {});
      setReviews(res?.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: ReviewStatus) {
    setProcessingId(id);
    try {
      await api.reviews.updateStatus(id, status);
      await loadReviews();
    } catch (err: any) {
      alert(err.message || 'Failed to update review status');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.reviews.delete(id);
      loadReviews();
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews & Moderation</h1>
          <p className="text-gray-500 text-sm mt-1">Approve, reject, or moderate product customer reviews.</p>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PENDING">PENDING</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Review Content</th>
                <th className="p-4">Verified</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">No reviews found matching filter.</td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-semibold text-gray-900">
                      {rev.user ? `${rev.user.firstName} ${rev.user.lastName}` : 'Anonymous'}
                    </td>
                    <td className="p-4">
                      <Rating value={rev.rating} />
                    </td>
                    <td className="p-4 max-w-md">
                      {rev.title && <p className="font-bold text-gray-900 text-sm mb-0.5">{rev.title}</p>}
                      <p className="text-gray-600 text-xs line-clamp-2">{rev.comment}</p>
                    </td>
                    <td className="p-4">
                      {rev.isVerifiedPurchase ? (
                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-medium">✓ Verified</span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        rev.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        rev.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rev.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {rev.status !== 'APPROVED' && (
                        <button
                          disabled={processingId === rev.id}
                          onClick={() => handleStatusChange(rev.id, 'APPROVED')}
                          className="text-xs text-green-600 font-semibold hover:underline"
                        >
                          Approve
                        </button>
                      )}
                      {rev.status !== 'REJECTED' && (
                        <button
                          disabled={processingId === rev.id}
                          onClick={() => handleStatusChange(rev.id, 'REJECTED')}
                          className="text-xs text-yellow-600 font-semibold hover:underline"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="text-xs text-red-600 font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
