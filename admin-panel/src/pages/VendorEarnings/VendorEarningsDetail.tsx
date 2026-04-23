import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, IndianRupee, Calendar, TrendingUp, Clock,
  Truck, Star, CheckCircle, XCircle, Phone, MapPin, Wifi, WifiOff,
} from 'lucide-react';
import { getVendorEarningsAdmin } from '../../services/api';
import toast from 'react-hot-toast';

const MACHINE_ICONS: Record<string, string> = {
  JCB: '🚜', Excavator: '⛏️', Crane: '🏗️', Bulldozer: '🚧', Roller: '🛞', Pokelane: '🛣️',
};

interface MachineBreakdown {
  id: string;
  model: string;
  category: string;
  approvalStatus: string;
  earnings: number;
  completedBookings: number;
  avgRating: number | null;
}

interface VendorStats {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalBookings: number;
  completedBookings: number;
  machineCount: number;
  avgRating: number | null;
}

interface VendorData {
  uid: string;
  name: string;
  phone: string;
  city?: string;
  state?: string;
  isOnline?: boolean;
  createdAt?: string;
}

function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} color="#FF8C00" fill={rating >= s ? '#FF8C00' : 'none'} strokeWidth={1.5} />
      ))}
    </span>
  );
}

export default function VendorEarningsDetail() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();

  const [vendor, setVendor]   = useState<VendorData | null>(null);
  const [stats, setStats]     = useState<VendorStats | null>(null);
  const [machines, setMachines] = useState<MachineBreakdown[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    (getVendorEarningsAdmin(uid) as Promise<any>)
      .then((res: any) => {
        setVendor(res.vendor);
        setStats(res.stats);
        setMachines(res.machineBreakdown || []);
        setBookings(res.recentBookings || []);
      })
      .catch((err: any) => toast.error(err.message || 'Failed to load vendor earnings'))
      .finally(() => setLoading(false));
  }, [uid]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!vendor || !stats) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Vendor not found.</div>
  );

  const periodCards = [
    { icon: Calendar,    label: 'Today',      value: stats.todayEarnings,  color: '#43A047', bg: '#E8F5E9' },
    { icon: TrendingUp,  label: 'This Week',  value: stats.weekEarnings,   color: '#3B82F6', bg: '#EFF6FF' },
    { icon: IndianRupee, label: 'This Month', value: stats.monthEarnings,  color: '#FF8C00', bg: '#FFF3E0' },
    { icon: Clock,       label: 'Lifetime',   value: stats.totalEarnings,  color: '#7C3AED', bg: '#F5F3FF' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-in">

      {/* Back + header */}
      <div>
        <button onClick={() => navigate('/users')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: 16, fontSize: 13, padding: 0 }}>
          <ArrowLeft size={15} strokeWidth={2} /> Back to Users
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26', margin: 0 }}>Earnings: {vendor.name}</h1>
            <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Per-vendor revenue breakdown and booking history</p>
          </div>
          {/* Vendor info pill */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
              <Phone size={13} strokeWidth={1.5} />{vendor.phone}
            </div>
            {vendor.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                <MapPin size={13} strokeWidth={1.5} />{vendor.city}{vendor.state ? `, ${vendor.state}` : ''}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: vendor.isOnline ? '#43A047' : '#9CA3AF' }}>
              {vendor.isOnline ? <Wifi size={13} strokeWidth={1.5} /> : <WifiOff size={13} strokeWidth={1.5} />}
              {vendor.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #FF8C00 0%, #1A1A2E 100%)',
        borderRadius: 16, padding: '28px 32px', position: 'relative', overflow: 'hidden',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Total Lifetime Earnings</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <IndianRupee size={28} color="#fff" strokeWidth={1.5} />
            <span style={{ color: '#fff', fontSize: 42, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {stats.totalEarnings.toLocaleString('en-IN')}
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
            From {stats.completedBookings} completed bookings
          </div>
        </div>
        {/* Right side: key stats */}
        <div style={{ display: 'flex', gap: 28, position: 'relative' }}>
          {[
            { label: 'Machines',    value: stats.machineCount },
            { label: 'Total Jobs',  value: stats.totalBookings },
            { label: 'Completed',   value: stats.completedBookings },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{s.label}</div>
            </div>
          ))}
          {stats.avgRating !== null && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#FF8C00', fontSize: 28, fontWeight: 800 }}>{stats.avgRating}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'flex', gap: 3, justifyContent: 'center', marginTop: 2 }}>
                <StarRow rating={Math.round(stats.avgRating)} size={11} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Period cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {periodCards.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 22px' }}>
            <div style={{ width: 42, height: 42, background: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <s.icon size={20} color={s.color} strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26', marginBottom: 4 }}>
              {s.value > 0 ? fmt(s.value) : '—'}
            </div>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Machine breakdown */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26', margin: 0 }}>Machine Breakdown</h2>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>{machines.length} machines</span>
        </div>
        {machines.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No machines listed yet.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr', padding: '8px 20px', background: '#FAFAFA', borderBottom: '1px solid #F3F4F6', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Machine</span><span>Status</span><span>Completed</span><span>Rating</span><span style={{ textAlign: 'right' }}>Earnings</span>
            </div>
            {machines.map((m, i) => (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr', padding: '14px 20px', alignItems: 'center', borderBottom: i < machines.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: '#FFF3E0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {MACHINE_ICONS[m.category] ?? <Truck size={16} color="#FF8C00" strokeWidth={1.5} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>{m.model}</div>
                    <div style={{ fontSize: 11, color: '#FF8C00', fontWeight: 600 }}>{m.category}</div>
                  </div>
                </div>
                <span>
                  {m.approvalStatus === 'approved'
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: '#43A047', background: '#E8F5E9', borderRadius: 20, padding: '2px 8px' }}><CheckCircle size={10} strokeWidth={2} /> Approved</span>
                    : m.approvalStatus === 'rejected'
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: '#E53935', background: '#FFEBEE', borderRadius: 20, padding: '2px 8px' }}><XCircle size={10} strokeWidth={2} /> Rejected</span>
                    : <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309', background: '#FFFBEB', borderRadius: 20, padding: '2px 8px' }}>Pending</span>}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>{m.completedBookings}</span>
                <span>
                  {m.avgRating !== null ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} color="#FF8C00" fill="#FF8C00" strokeWidth={1.5} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#FF8C00' }}>{m.avgRating}</span>
                    </span>
                  ) : <span style={{ fontSize: 12, color: '#9CA3AF' }}>—</span>}
                </span>
                <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: m.earnings > 0 ? '#43A047' : '#9CA3AF' }}>
                  {m.earnings > 0 ? fmt(m.earnings) : '—'}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Recent completed bookings */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26', margin: 0 }}>Recent Completed Bookings</h2>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>Last {bookings.length}</span>
        </div>
        {bookings.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No completed bookings yet.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr', padding: '8px 20px', background: '#FAFAFA', borderBottom: '1px solid #F3F4F6', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Customer</span><span>Machine</span><span>Dates</span><span>Rating</span><span style={{ textAlign: 'right' }}>Earned</span>
            </div>
            {bookings.map((b, i) => (
              <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr', padding: '13px 20px', alignItems: 'center', borderBottom: i < bookings.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF8C00', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {(b.customerName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>{b.customerName}</div>
                    {b.customerPhone && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{b.customerPhone}</div>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1D26' }}>{b.machineModel}</div>
                  <div style={{ fontSize: 11, color: '#FF8C00', fontWeight: 600 }}>{b.machineCategory}</div>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {b.startDate} → {b.endDate}
                </div>
                <div>
                  {b.rating ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <StarRow rating={b.rating} size={11} />
                    </span>
                  ) : <span style={{ fontSize: 12, color: '#9CA3AF' }}>—</span>}
                </div>
                <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#43A047' }}>
                  +{fmt(b.estimatedCost)}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
