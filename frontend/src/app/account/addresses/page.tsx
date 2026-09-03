'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Address } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('USA');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      const data = await api.addresses.getAll();
      setAddresses(data || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addresses.create({
        fullName,
        phone,
        addressLine1,
        city,
        state,
        postalCode,
        country,
        addressType: 'SHIPPING',
        isDefault: addresses.length === 0,
      });
      setShowModal(false);
      setFullName('');
      setPhone('');
      setAddressLine1('');
      setCity('');
      setState('');
      setPostalCode('');
      loadAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to create address');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await api.addresses.setDefault(id);
      loadAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to set default address');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.addresses.delete(id);
      loadAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Address Book</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your saved shipping and billing addresses.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Add New Address</Button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm space-y-4">
          <p className="text-gray-500 text-lg">No addresses saved yet.</p>
          <Button onClick={() => setShowModal(true)}>Create Your First Address</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-3 relative">
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  Default Address
                </span>
              )}
              <h3 className="font-bold text-gray-900 text-base">{addr.fullName}</h3>
              <p className="text-sm text-gray-600 font-mono">{addr.phone}</p>
              <p className="text-sm text-gray-600">{addr.addressLine1}</p>
              <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
              <p className="text-sm text-gray-600">{addr.country}</p>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-blue-600 font-semibold hover:underline">
                    Set as Default
                  </button>
                )}
                <button onClick={() => handleDelete(addr.id)} className="text-xs text-red-600 font-semibold hover:underline ml-auto">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">Add New Address</h2>
            <form onSubmit={handleCreate} className="space-y-4">
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
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">ZIP Code</label>
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
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Address'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
