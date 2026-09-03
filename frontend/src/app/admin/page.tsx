'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardKPIs, SalesAnalyticsPoint, TopProductPerformance, LowStockAlertItem, Order } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [sales, setSales] = useState<SalesAnalyticsPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductPerformance[]>([]);
  const [lowStock, setLowStock] = useState<LowStockAlertItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [kpiData, salesData, topData, stockData, ordersData] = await Promise.all([
          api.admin.getKPIs().catch(() => null),
          api.admin.getSales(30).catch(() => []),
          api.admin.getTopProducts(5).catch(() => []),
          api.admin.getLowStock().catch(() => []),
          api.orders.getAll().catch(() => []),
        ]);

        setKpis(kpiData);
        setSales(salesData);
        setTopProducts(topData);
        setLowStock(stockData);
        setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time performance and analytics summary.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(kpis?.totalRevenue || 0)}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 font-bold text-xl">
            $
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpis?.totalOrders || 0}</p>
            <p className="text-xs text-orange-600 font-medium mt-0.5">{kpis?.pendingOrdersCount || 0} pending</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl">
            📦
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Customers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpis?.totalCustomers || 0}</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 font-bold text-xl">
            👥
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{kpis?.lowStockCount || 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">items need reorder</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-bold text-xl">
            ⚠️
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend (30 Days)</h2>
          {sales.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No sales history yet.</p>
          ) : (
            <div className="space-y-4">
              {sales.slice(-7).map((point) => {
                const maxRevenue = Math.max(...sales.map(s => s.revenue), 1);
                const pct = Math.min(100, Math.max(5, (point.revenue / maxRevenue) * 100));
                return (
                  <div key={point.date} className="flex items-center text-sm">
                    <span className="w-24 text-gray-500 font-mono text-xs">{point.date}</span>
                    <div className="flex-1 mx-4 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-24 text-right font-semibold text-gray-900">{formatPrice(point.revenue)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Performing Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No top product metrics yet.</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((prod, idx) => (
                <div key={prod.productId || idx} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm text-gray-900 line-clamp-1">{prod.productName}</p>
                    <p className="text-xs text-gray-500">{prod.totalQuantitySold} units sold</p>
                  </div>
                  <span className="font-semibold text-sm text-green-600">{formatPrice(prod.totalRevenueGenerated)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Inventory Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Low Stock Inventory Alerts</h2>
            <Link href="/admin/inventory" className="text-xs text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">All inventory stock levels are healthy.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase border-b border-gray-100">
                    <th className="pb-3">Product / SKU</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lowStock.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-semibold">
                          {item.availableQuantity} left
                        </span>
                      </td>
                      <td className="py-3">
                        <Link href="/admin/inventory" className="text-xs text-blue-600 font-medium hover:underline">
                          Restock
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Customer Orders</h2>
            <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No recent orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase border-b border-gray-100">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-3 font-mono text-xs font-medium text-gray-900">{order.orderNumber || order.id.slice(0, 8)}</td>
                      <td className="py-3 font-semibold text-gray-900">{formatPrice(order.totalAmount || 0)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
