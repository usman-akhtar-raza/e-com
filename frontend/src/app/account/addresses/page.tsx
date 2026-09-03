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
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Address Book</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your saved shipping and billing addresses.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-5 py-2.5 font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition"
        >
          + Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm text-center py-16 px-4 animate-slide-up">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No addresses saved</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">You haven't saved any addresses yet. Add one now for faster checkout.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-6 py-2.5 font-semibold hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition"
          >
            Create Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3 relative hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50">
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-sm">
                  Default
                </span>
              )}
              <h3 className="font-bold text-slate-900 text-base">{addr.fullName}</h3>
              <p className="text-sm text-slate-600 font-mono bg-slate-50 inline-block px-2 py-1 rounded-md border border-slate-100">{addr.phone}</p>
              <div className="text-sm text-slate-600 mt-2">
                <p>{addr.addressLine1}</p>
                <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                <p>{addr.country}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between">
                {!addr.isDefault ? (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
                    Set as Default
                  </button>
                ) : <span />}
                <button onClick={() => handleDelete(addr.id)} className="text-xs text-rose-500 font-semibold hover:text-rose-600 hover:underline transition-colors ml-auto">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-slide-up border border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Add New Address</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Street Address</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-6 py-2.5 font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition disabled:opacity-70 disabled:active:scale-100">
                  {submitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
