import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Truck, CalendarCheck, IndianRupee, Clock, Plus, ChevronRight } from 'lucide-react';
import { getVendorBookings, getMyMachines, getVendorEarnings } from '../../../services/api';
import type { Booking, Machine } from '../../../types';
import Badge from '../../../components/common/Badge';

const MACHINE_ICONS: Record<string, string> = {
  JCB: '🚜', Excavator: '⛏️', Crane: '🏗️', Bulldozer: '🚧', Roller: '🛞', Pokelane: '🛣️',
};

export default function VendorHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [earnings, setEarnings] = useState<{ total: number; thisMonth: number; month: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getVendorBookings().then((res: any) => setBookings(res.bookings || [])).catch(() => setBookings([])),
      getMyMachines().then((res: any) => setMachines(res.machines || [])).catch(() => setMachines([])),
      getVendorEarnings().then((res: any) => setEarnings(res.earnings || null)).catch(() => setEarnings(null)),
    ]).finally(() => setLoading(false));
  }, []);

  const stats = {
    machines: machines.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => ['accepted', 'in_progress'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  const recentBookings = bookings.slice(0, 4);

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-in">
      {/* Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Good morning 👋</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D26', letterSpacing: '-0.02em', marginTop: 2 }}>
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
        </div>
        <button onClick={() => navigate('/vendor/machines/add')} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
          background: '#FF8C00', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'background 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
        >
          <Plus size={15} strokeWidth={2} /> Add Machine
        </button>
      </div>

      {/* Earnings Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #FF8C00 0%, #1A1A2E 100%)',
        borderRadius: 16, padding: '24px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>Total Earnings</div>
          <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
            ₹{(earnings?.total || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
            ₹{(earnings?.thisMonth || earnings?.month || 0).toLocaleString('en-IN')} this month · {stats.completed} completed bookings
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { icon: Truck, label: 'My Machines', value: stats.machines, color: '#3B82F6', bg: '#EFF6FF', action: '/vendor/machines' },
          { icon: Clock, label: 'Pending', value: stats.pending, color: '#F59E0B', bg: '#FFFBEB', action: '/vendor/bookings' },
          { icon: CalendarCheck, label: 'Active', value: stats.active, color: '#43A047', bg: '#E8F5E9', action: '/vendor/bookings' },
          { icon: IndianRupee, label: 'Completed', value: stats.completed, color: '#FF8C00', bg: '#FFF3E0', action: '/vendor/earnings' },
        ].map(s => (
          <div key={s.label} onClick={() => navigate(s.action)}
            style={{ background: '#fff', borderRadius: 12, padding: '18px 16px', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: 10 }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; el.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.transform = 'none'; }}
          >
            <div style={{ width: 40, height: 40, background: s.bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={18} color={s.color} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1A1D26' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Recent Bookings */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Recent Bookings</h2>
            <button onClick={() => navigate('/vendor/bookings')} style={{ background: 'none', border: 'none', color: '#FF8C00', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ChevronRight size={13} strokeWidth={2} />
            </button>
          </div>
          <div>
            {recentBookings.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No bookings yet</div>
            ) : recentBookings.map((b, i) => (
              <div key={b.id} style={{
                padding: '14px 20px', borderBottom: i < recentBookings.length - 1 ? '1px solid #F3F4F6' : 'none',
                display: 'flex', gap: 12, alignItems: 'center', transition: 'background 0.1s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF8C00', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {b.customerName.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>{b.customerName}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                    {MACHINE_ICONS[b.machineCategory]} {b.machineCategory} · {b.startDate}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1D26' }}>₹{b.estimatedCost.toLocaleString('en-IN')}</div>
                  <Badge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Quick Actions</h2>
          {[
            { label: 'Add New Machine', icon: Plus, color: '#FF8C00', bg: '#FFF3E0', action: '/vendor/machines/add' },
            { label: `Pending Bookings (${stats.pending})`, icon: Clock, color: '#F59E0B', bg: '#FFFBEB', action: '/vendor/bookings' },
            { label: 'View Earnings', icon: IndianRupee, color: '#43A047', bg: '#E8F5E9', action: '/vendor/earnings' },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.action)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12,
              background: '#fff', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = a.color; el.style.background = a.bg; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#E5E7EB'; el.style.background = '#fff'; }}
            >
              <div style={{ width: 38, height: 38, background: a.bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <a.icon size={17} color={a.color} strokeWidth={1.5} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>{a.label}</span>
              <ChevronRight size={14} color="#9CA3AF" strokeWidth={1.5} style={{ marginLeft: 'auto' }} />
            </button>
          ))}

          {/* Earnings Period */}
          <div style={{ background: '#1A1A2E', borderRadius: 12, padding: '18px' }}>
            <div style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>This Period</div>
            {[
              { label: 'This Week', value: 0, color: '#3B82F6' },
              { label: 'This Month', value: earnings?.thisMonth || earnings?.month || 0, color: '#FF8C00' },
            ].map(e => (
              <div key={e.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#6B7280', fontSize: 13 }}>{e.label}</span>
                <span style={{ color: e.color, fontWeight: 800, fontSize: 14 }}>₹{e.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
