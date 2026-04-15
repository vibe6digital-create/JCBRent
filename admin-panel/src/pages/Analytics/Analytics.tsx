import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, IndianRupee, CalendarCheck, Users,
  Truck, MapPin, BarChart2, RefreshCw,
} from 'lucide-react';
import { getBookings, getUsers, getMachines } from '../../services/api';
import toast from 'react-hot-toast';

// ─── helpers ──────────────────────────────────────────────────────────────────

function toDate(val: any): Date | null {
  if (!val) return null;
  if (typeof val === 'string') return new Date(val);
  if (typeof val === 'object' && val._seconds) return new Date(val._seconds * 1000);
  return null;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function lastNMonths(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

const INR = (v: number) => `₹${v.toLocaleString('en-IN')}`;

// ─── sub-components ──────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string;
  icon: any; accent: string;
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={accent} strokeWidth={1.5} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#1A1D26', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

const TOOLTIP_STYLE = {
  background: '#1A1D26', border: 'none', borderRadius: 8,
  color: '#fff', fontSize: 12, padding: '8px 12px',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  approved: '#3B82F6',
  accepted: '#3B82F6',
  arrived: '#FF8C00',
  in_progress: '#8B5CF6',
  completed: '#43A047',
  cancelled: '#EF4444',
  rejected: '#DC2626',
};

const PIE_COLORS = ['#43A047', '#F59E0B', '#EF4444', '#3B82F6', '#FF8C00', '#8B5CF6', '#DC2626'];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // raw data
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [bRes, uRes] = await Promise.all([
        getBookings() as any,
        getUsers() as any,
      ]);
      setBookings(bRes.bookings || []);
      setUsers(uRes.users || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── computed metrics ────────────────────────────────────────────────────────

  const months6 = lastNMonths(6);
  const months12 = lastNMonths(12);

  // Revenue per month (completed bookings only)
  const revenueByMonth = months6.map(key => ({
    month: monthLabel(key),
    revenue: bookings
      .filter(b => b.status === 'completed' && toDate(b.createdAt) && monthKey(toDate(b.createdAt)!) === key)
      .reduce((s, b) => s + (b.estimatedCost || 0), 0),
  }));

  // Bookings per month (all)
  const bookingsByMonth = months6.map(key => ({
    month: monthLabel(key),
    total: bookings.filter(b => toDate(b.createdAt) && monthKey(toDate(b.createdAt)!) === key).length,
    completed: bookings.filter(b => b.status === 'completed' && toDate(b.createdAt) && monthKey(toDate(b.createdAt)!) === key).length,
    cancelled: bookings.filter(b => b.status === 'cancelled' && toDate(b.createdAt) && monthKey(toDate(b.createdAt)!) === key).length,
  }));

  // User growth per month
  const userGrowth = months12.map(key => ({
    month: monthLabel(key),
    customers: users.filter(u => u.role === 'customer' && toDate(u.createdAt) && monthKey(toDate(u.createdAt)!) === key).length,
    vendors: users.filter(u => u.role === 'vendor' && toDate(u.createdAt) && monthKey(toDate(u.createdAt)!) === key).length,
  }));

  // Booking status breakdown
  const statusCounts: Record<string, number> = {};
  bookings.forEach(b => { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1; });
  const statusPieData = Object.entries(statusCounts).map(([status, value]) => ({
    name: status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value,
    status,
  }));

  // Machine category demand
  const catCounts: Record<string, number> = {};
  bookings.forEach(b => { catCounts[b.machineCategory] = (catCounts[b.machineCategory] || 0) + 1; });
  const categoryData = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bookings]) => ({ name, bookings }));

  // Top cities
  const cityCounts: Record<string, number> = {};
  bookings.forEach(b => {
    const city = b.workLocation?.city || 'Unknown';
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([city, bookings]) => ({ city, bookings }));

  // Top vendors
  const vendorMap: Record<string, { name: string; bookings: number; revenue: number }> = {};
  bookings.forEach(b => {
    if (!vendorMap[b.vendorId]) vendorMap[b.vendorId] = { name: b.vendorName || 'Unknown', bookings: 0, revenue: 0 };
    vendorMap[b.vendorId].bookings++;
    if (b.status === 'completed') vendorMap[b.vendorId].revenue += b.estimatedCost || 0;
  });
  const topVendors = Object.values(vendorMap)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 8);

  // Rate type breakdown
  const rateCounts: Record<string, number> = {};
  bookings.forEach(b => { rateCounts[b.rateType] = (rateCounts[b.rateType] || 0) + 1; });
  const rateData = Object.entries(rateCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  // Booking type split
  const instantCount = bookings.filter(b => b.bookingType === 'instant').length;
  const scheduledCount = bookings.filter(b => b.bookingType === 'scheduled').length;
  const totalWithType = instantCount + scheduledCount;

  // KPIs
  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.estimatedCost || 0), 0);
  const completionRate = bookings.length ? Math.round((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100) : 0;
  const avgBookingValue = bookings.length ? Math.round(bookings.reduce((s, b) => s + (b.estimatedCost || 0), 0) / bookings.length) : 0;
  const cancellationRate = bookings.length ? Math.round((bookings.filter(b => b.status === 'cancelled').length / bookings.length) * 100) : 0;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A1D26', margin: 0 }}>Analytics</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: '4px 0 0' }}>Platform performance overview</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff',
            fontSize: 13, fontWeight: 600, color: '#6B7280', cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} strokeWidth={1.5} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        <KpiCard label="Total Revenue" value={INR(totalRevenue)} sub="from completed bookings" icon={IndianRupee} accent="#FF8C00" />
        <KpiCard label="Completion Rate" value={`${completionRate}%`} sub={`${bookings.filter(b => b.status === 'completed').length} of ${bookings.length} bookings`} icon={CalendarCheck} accent="#43A047" />
        <KpiCard label="Avg Booking Value" value={INR(avgBookingValue)} sub="across all bookings" icon={TrendingUp} accent="#3B82F6" />
        <KpiCard label="Cancellation Rate" value={`${cancellationRate}%`} sub={`${bookings.filter(b => b.status === 'cancelled').length} cancelled`} icon={BarChart2} accent="#EF4444" />
      </div>

      {/* Revenue + Bookings trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ChartCard title="Monthly Revenue" sub="Revenue from completed bookings (last 6 months)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByMonth} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [INR(v), 'Revenue']} cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="revenue" fill="#FF8C00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Bookings" sub="Total vs completed vs cancelled (last 6 months)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={bookingsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="total" name="Total" stroke="#6B7280" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="completed" name="Completed" stroke="#43A047" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Status donut + category demand */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>
        <ChartCard title="Booking Status Breakdown" sub={`${bookings.length} total bookings`}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusPieData}
                cx="50%" cy="50%"
                innerRadius={65} outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {statusPieData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Machine Category Demand" sub="Bookings per category">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [v, 'Bookings']} cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="bookings" fill="#FF8C00" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* User growth + top cities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ChartCard title="User Registrations" sub="New customers & vendors per month (last 12 months)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={userGrowth} barSize={10} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="customers" name="Customers" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="vendors" name="Vendors" fill="#FF8C00" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Cities by Demand" sub="Bookings per work location city">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topCities} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [v, 'Bookings']} cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="bookings" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Booking type + rate type + top vendors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

        {/* Booking type split */}
        <ChartCard title="Booking Type Split" sub="Instant vs scheduled">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
            {[
              { label: 'Instant', count: instantCount, color: '#43A047', emoji: '⚡' },
              { label: 'Scheduled', count: scheduledCount, color: '#3B82F6', emoji: '📅' },
            ].map(({ label, count, color, emoji }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{emoji} {label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>
                    {count} <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>
                      ({totalWithType ? Math.round((count / totalWithType) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalWithType ? (count / totalWithType) * 100 : 0}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Rate type donut */}
        <ChartCard title="Rate Type Breakdown" sub="Bookings by duration type">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={rateData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {rateData.map((_, i) => (
                  <Cell key={i} fill={['#FF8C00', '#3B82F6', '#8B5CF6', '#43A047'][i % 4]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Coupon usage */}
        <ChartCard title="Coupon Usage" sub="Bookings with discount applied">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
            {(() => {
              const withCoupon = bookings.filter(b => b.couponCode).length;
              const withoutCoupon = bookings.length - withCoupon;
              const totalDiscount = bookings.reduce((s, b) => s + (b.discountAmount || 0), 0);
              return (
                <>
                  {[
                    { label: 'With coupon', count: withCoupon, color: '#43A047' },
                    { label: 'Without coupon', count: withoutCoupon, color: '#E5E7EB' },
                  ].map(({ label, count, color }) => (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>
                          {count}
                          <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}> ({bookings.length ? Math.round((count / bookings.length) * 100) : 0}%)</span>
                        </span>
                      </div>
                      <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${bookings.length ? (count / bookings.length) * 100 : 0}%`, background: color, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, padding: '10px 14px', background: '#F0FDF4', borderRadius: 8, border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>Total discount given</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#16A34A' }}>{INR(totalDiscount)}</div>
                  </div>
                </>
              );
            })()}
          </div>
        </ChartCard>
      </div>

      {/* Top vendors table */}
      <ChartCard title="Top Vendors" sub="Ranked by booking count">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                {['#', 'Vendor', 'Bookings', 'Revenue (completed)', 'Avg per booking'].map(h => (
                  <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topVendors.map((v, i) => (
                <tr key={v.name} style={{ borderBottom: i < topVendors.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: i < 3 ? '#FF8C00' : '#9CA3AF' }}>#{i + 1}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1A1D26' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FF8C00' }}>
                        {v.name.charAt(0).toUpperCase()}
                      </div>
                      {v.name}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ height: 6, width: topVendors[0].bookings ? `${(v.bookings / topVendors[0].bookings) * 80}px` : 0, background: '#FF8C00', borderRadius: 3, minWidth: 4 }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>{v.bookings}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1A1D26' }}>{INR(v.revenue)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>
                    {v.bookings ? INR(Math.round(v.revenue / v.bookings)) : '—'}
                  </td>
                </tr>
              ))}
              {topVendors.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No booking data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>

    </div>
  );
}
