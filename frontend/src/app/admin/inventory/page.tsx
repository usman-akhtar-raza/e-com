'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LowStockAlertItem, Product } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

export default function AdminInventoryPage() {
  const [alerts, setAlerts] = useState<LowStockAlertItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [stockData, productsData] = await Promise.all([
        api.admin.getLowStock().catch(() => []),
        api.products.getAll({ limit: 100 }).catch(() => ({ data: [] })),
      ]);
      setAlerts(stockData || []);
      setProducts(productsData?.data || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStockUpdate(productId: string, newStock: number) {
    setUpdating(true);
    try {
      await api.inventory.updateStock(productId, newStock);
      await loadData();
      alert('Inventory stock updated successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory & Stock Control</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor stock availability, reserved stock, and low stock thresholds.</p>
      </div>

      {/* Low Stock Alerts Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">⚠️ Low Stock Alerts ({alerts.length})</h2>
        {alerts.length === 0 ? (
          <p className="text-red-700 text-sm">No critical inventory alerts.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {alerts.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-red-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.productName}</p>
                  <p className="text-xs text-gray-500 font-mono">SKU: {item.sku}</p>
                  <p className="text-xs text-red-600 font-medium mt-1">
                    Available: {item.availableQuantity} | Reserved: {item.reservedQuantity}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={0}
                    defaultValue={item.quantity + 20}
                    id={`stock-${item.productId}`}
                    className="w-20 border rounded px-2 py-1 text-sm"
                  />
                  <Button
                    size="sm"
                    disabled={updating}
                    onClick={() => {
                      const input = document.getElementById(`stock-${item.productId}`) as HTMLInputElement;
                      if (input) handleStockUpdate(item.productId, parseInt(input.value, 10));
                    }}
                  >
                    Set Stock
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Catalog Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-900 text-sm">
          All Products Inventory Stock Levels
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Price</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4 text-right">Quick Stock Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-semibold text-gray-900">{prod.name}</td>
                <td className="p-4 text-gray-500 font-mono text-xs">{prod.sku || 'N/A'}</td>
                <td className="p-4 font-medium text-gray-900">${prod.price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    prod.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {prod.stock} units
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center space-x-2">
                    <input
                      type="number"
                      min={0}
                      defaultValue={prod.stock}
                      id={`catalog-stock-${prod.id}`}
                      className="w-20 border rounded px-2 py-1 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updating}
                      onClick={() => {
                        const input = document.getElementById(`catalog-stock-${prod.id}`) as HTMLInputElement;
                        if (input) handleStockUpdate(prod.id, parseInt(input.value, 10));
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
