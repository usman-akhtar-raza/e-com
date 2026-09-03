'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Brand } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    try {
      const data = await api.brands.getAll();
      setBrands(data || []);
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setDescription('');
    setLogo('');
    setShowModal(true);
  }

  function handleOpenEdit(brand: Brand) {
    setEditingBrand(brand);
    setName(brand.name);
    setSlug(brand.slug);
    setDescription(brand.description || '');
    setLogo(brand.logo || '');
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBrand) {
        await api.brands.update(editingBrand.id, { name, slug, description, logo });
      } else {
        await api.brands.create({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), description, logo });
      }
      setShowModal(false);
      loadBrands();
    } catch (err: any) {
      alert(err.message || 'Failed to save brand');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await api.brands.delete(id);
      loadBrands();
    } catch (err: any) {
      alert(err.message || 'Failed to delete brand');
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage manufacturers and product brands.</p>
        </div>
        <Button onClick={handleOpenCreate}>+ Add New Brand</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
            <tr>
              <th className="p-4">Brand Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {brands.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">No brands found.</td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-semibold text-gray-900">{brand.name}</td>
                  <td className="p-4 text-gray-500 font-mono text-xs">{brand.slug}</td>
                  <td className="p-4 text-gray-500 max-w-xs truncate">{brand.description || '-'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(brand)} className="text-blue-600 hover:underline font-medium">Edit</button>
                    <button onClick={() => handleDelete(brand.id)} className="text-red-600 hover:underline font-medium">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">{editingBrand ? 'Edit Brand' : 'Add New Brand'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-if-empty"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Brand'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
