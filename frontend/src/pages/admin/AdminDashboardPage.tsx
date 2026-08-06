import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiShoppingBag, FiUsers, FiBox, FiMessageSquare } from 'react-icons/fi';
import { dashboardService } from '@/services';
import { formatCurrency, formatDate } from '@/utils/cn';
import { Spinner, Badge } from '@/components/ui';
import { AdminHeader } from '@/components/admin/AdminHeader';

const COLORS = ['#2f5233', '#e2a33b', '#8fa998', '#b5502f', '#3f6b45', '#1b2b22'];

const StatCard = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-md border border-ink/10 bg-white p-5">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
        <p className="font-display text-xl text-ink">{value}</p>
      </div>
    </div>
  </div>
);

export const AdminDashboardPage = () => {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: dashboardService.stats });

  if (isLoading || !stats) return <div className="flex justify-center py-32"><Spinner /></div>;

  return (
    <div>
      <AdminHeader title="Dashboard" subtitle="Electronics catalog, orders, and project request overview" />

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={FiShoppingBag} label="Total Orders" value={stats.totalOrders} />
          <StatCard icon={FiBox} label="Products" value={stats.totalProducts} />
          <StatCard icon={FiMessageSquare} label="Open Requests" value={stats.openInquiries} />
          <StatCard icon={FiUsers} label="Customers" value={stats.totalCustomers} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-md border border-ink/10 bg-white p-5 lg:col-span-2">
            <p className="mb-4 font-display text-lg text-ink">Sales — last 30 days</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.dailySales}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f5233" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2f5233" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Area type="monotone" dataKey="revenue" stroke="#2f5233" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-md border border-ink/10 bg-white p-5">
            <p className="mb-4 font-display text-lg text-ink">Order status</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.orderStatusBreakdown} dataKey="count" nameKey="_id" innerRadius={50} outerRadius={80}>
                  {stats.orderStatusBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {stats.orderStatusBreakdown.map((s, i) => (
                <span key={s._id} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {s._id} ({s.count})
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-md border border-ink/10 bg-white p-5">
            <p className="mb-4 font-display text-lg text-ink">Recent orders</p>
            <div className="space-y-3">
              {stats.recentOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-mono">{o.orderNumber}</p>
                    <p className="text-xs text-ink/50">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono">{formatCurrency(o.totalPrice)}</p>
                    <Badge variant="forest">{o.status}</Badge>
                  </div>
                </div>
              ))}
              {stats.recentOrders.length === 0 && <p className="text-sm text-ink/50">No orders yet.</p>}
            </div>
          </div>

          <div className="rounded-md border border-ink/10 bg-white p-5">
            <p className="mb-4 font-display text-lg text-ink">Low stock alerts</p>
            <div className="space-y-2">
              {stats.lowStock.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <span>{p.name} <span className="text-ink/40">({p.sku})</span></span>
                  <Badge variant="rust">{p.stock} left</Badge>
                </div>
              ))}
              {stats.lowStock.length === 0 && <p className="text-sm text-ink/50">All products well stocked.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
