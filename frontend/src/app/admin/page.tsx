'use client';

import Link from 'next/link';
import { useEffect, useState, type ComponentType, type SVGProps } from 'react';
import { api } from '@/lib/api';
import type { DashboardKPIs, LowStockAlertItem, Order, SalesAnalyticsPoint, TopProductPerformance } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice } from '@/lib/utils';
import { AlertIcon, ArrowIcon, BagIcon, DollarIcon, PackageIcon, TrendIcon, UsersIcon } from '@/components/ui/Icons';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [sales, setSales] = useState<SalesAnalyticsPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductPerformance[]>([]);
  const [lowStock, setLowStock] = useState<LowStockAlertItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchDashboard() {
      try {
        const [kpiData, salesData, topData, stockData, orderData] = await Promise.all([
          api.admin.getKPIs().catch(() => null),
          api.admin.getSales(30).catch(() => []),
          api.admin.getTopProducts(5).catch(() => []),
          api.admin.getLowStock().catch(() => []),
          api.orders.getAll().catch(() => []),
        ]);
        if (!active) return;
        setKpis(kpiData);
        setSales(salesData);
        setTopProducts(topData);
        setLowStock(stockData);
        setRecentOrders(Array.isArray(orderData) ? orderData.slice(0, 5) : []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchDashboard();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="grid min-h-[65vh] place-items-center"><LoadingSpinner /></div>;

  const maxRevenue = Math.max(...sales.map((point) => point.revenue), 1);

  return (
    <div className="admin-dashboard space-y-7">
      <section className="flex flex-col gap-6 pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="admin-eyebrow">Performance command center</p>
          <h1 className="font-display text-[clamp(2.7rem,5vw,5rem)] leading-[0.9] tracking-[-0.055em]">Business overview.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#696a64]">A focused view of revenue, orders, inventory and customer activity across your store.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="admin-date-chip">Last 30 days</span>
          <Link href="/admin/products/new" className="admin-primary-action">Add product <ArrowIcon className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Net revenue" value={formatPrice(kpis?.totalRevenue || 0)} note="Across all completed orders" icon={DollarIcon} accent />
        <MetricCard label="Total orders" value={String(kpis?.totalOrders || 0)} note={`${kpis?.pendingOrdersCount || 0} awaiting action`} icon={BagIcon} />
        <MetricCard label="Customers" value={String(kpis?.totalCustomers || 0)} note="Active customer accounts" icon={UsersIcon} />
        <MetricCard label="Low stock" value={String(kpis?.lowStockCount || 0)} note="Items need attention" icon={AlertIcon} warning={Boolean(kpis?.lowStockCount)} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="admin-panel min-w-0">
          <PanelHeader eyebrow="Revenue intelligence" title="Sales momentum" action="30-day performance" />
          {sales.length === 0 ? (
            <EmptyMetric icon={TrendIcon} title="Sales will appear here" text="Revenue trends populate as customer orders are completed." />
          ) : (
            <div className="mt-8 overflow-x-auto pb-2">
              <div className="flex min-w-[560px] items-end gap-3" style={{ height: 250 }}>
                {sales.slice(-14).map((point) => {
                  const height = Math.max(8, (point.revenue / maxRevenue) * 100);
                  return (
                    <div key={point.date} className="group flex h-full flex-1 flex-col justify-end gap-3">
                      <div className="relative flex flex-1 items-end">
                        <div className="admin-chart-bar w-full rounded-t-md" style={{ height: `${height}%` }}>
                          <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#11120f] px-2 py-1 text-[9px] font-bold text-white shadow-lg group-hover:block">{formatPrice(point.revenue)}</span>
                        </div>
                      </div>
                      <span className="truncate text-center text-[9px] font-bold uppercase tracking-wide text-[#8a8b84]">{point.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="admin-panel">
          <PanelHeader eyebrow="Product performance" title="Top sellers" />
          {topProducts.length === 0 ? (
            <EmptyMetric icon={PackageIcon} title="No sales ranking yet" text="Best-performing products will appear here." compact />
          ) : (
            <div className="mt-7 divide-y divide-black/[0.07]">
              {topProducts.map((product, index) => (
                <div key={product.productId || index} className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/10 bg-[#f3f0e9] font-display text-lg text-[#806a3d]">{index + 1}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold transition group-hover:text-[#806a3d]">{product.productName}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#85867f]">{product.totalQuantitySold} units sold</p></div>
                  <span className="text-xs font-black">{formatPrice(product.totalRevenueGenerated)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="admin-panel">
          <PanelHeader eyebrow="Inventory watch" title="Low-stock alerts" href="/admin/inventory" />
          {lowStock.length === 0 ? (
            <div className="mt-7 flex items-center gap-4 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-5"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-800"><PackageIcon className="h-5 w-5" /></span><div><p className="text-sm font-bold">Inventory looks healthy</p><p className="mt-1 text-xs text-[#73746d]">No products currently require restocking.</p></div></div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Available</th><th className="text-right">Action</th></tr></thead>
                <tbody>{lowStock.slice(0, 5).map((item) => <tr key={item.id}><td><p className="font-bold">{item.productName}</p><p className="mt-1 font-mono text-[10px] text-[#8b8c85]">{item.sku}</p></td><td><span className="admin-status admin-status-warning">{item.availableQuantity} left</span></td><td className="text-right"><Link href="/admin/inventory" className="admin-text-action">Restock</Link></td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-panel">
          <PanelHeader eyebrow="Latest activity" title="Recent orders" href="/admin/orders" />
          {recentOrders.length === 0 ? (
            <EmptyMetric icon={BagIcon} title="No orders yet" text="New customer orders will be listed here." compact />
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="admin-table">
                <thead><tr><th>Order</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>{recentOrders.map((order) => <tr key={order.id}><td className="font-mono text-[11px] font-bold">{order.orderNumber || `#${order.id.slice(0, 8)}`}</td><td className="font-black">{formatPrice(order.totalAmount || 0)}</td><td><span className={`admin-status ${order.status === 'DELIVERED' ? 'admin-status-success' : order.status === 'CANCELLED' ? 'admin-status-danger' : 'admin-status-warning'}`}>{order.status}</span></td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

function MetricCard({ label, value, note, icon: Icon, accent, warning }: { label: string; value: string; note: string; icon: IconComponent; accent?: boolean; warning?: boolean }) {
  return (
    <article className={`admin-metric-card ${accent ? 'admin-metric-accent' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-55">{label}</p><p className={`mt-5 text-3xl font-black tracking-[-0.045em] ${warning ? 'text-[#9f483c]' : ''}`}>{value}</p></div>
        <span className={`grid h-11 w-11 place-items-center rounded-full border ${accent ? 'border-white/15 bg-white/10 text-[#d8c28f]' : 'border-black/10 bg-[#f0ede6] text-[#806a3d]'}`}><Icon className="h-5 w-5" /></span>
      </div>
      <p className="mt-6 border-t border-current/10 pt-3 text-[10px] font-semibold opacity-50">{note}</p>
    </article>
  );
}

function PanelHeader({ eyebrow, title, action, href }: { eyebrow: string; title: string; action?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-black/[0.07] pb-5">
      <div><p className="admin-eyebrow">{eyebrow}</p><h2 className="font-display text-3xl tracking-[-0.04em]">{title}</h2></div>
      {href ? <Link href={href} className="admin-text-action flex items-center gap-1.5">View all <ArrowIcon className="h-3.5 w-3.5" /></Link> : action ? <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8a8b84]">{action}</span> : null}
    </div>
  );
}

function EmptyMetric({ icon: Icon, title, text, compact }: { icon: IconComponent; title: string; text: string; compact?: boolean }) {
  return <div className={`grid place-items-center text-center ${compact ? 'min-h-[220px]' : 'min-h-[270px]'}`}><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#b69b63]/30 bg-[#b69b63]/10 text-[#806a3d]"><Icon className="h-6 w-6" /></span><p className="mt-5 font-display text-2xl">{title}</p><p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-[#77786f]">{text}</p></div></div>;
}
