import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Search, Zap, MapPin, Clock, IndianRupee, ArrowRight, ChevronRight } from 'lucide-react';
import { searchMachines, getCustomerBookings } from '../../../services/api';
import type { Machine, Booking } from '../../../types';
import Badge from '../../../components/common/Badge';

const MACHINE_ICONS: Record<string, string> = {
  JCB: '🚜', Excavator: '⛏️', Crane: '🏗️', Bulldozer: '🚧', Roller: '🛞', Pokelane: '🛣️',
};

const CATEGORIES = [
  { icon: '🚜', name: 'JCB' }, { icon: '⛏️', name: 'Excavator' },
  { icon: '🏗️', name: 'Crane' }, { icon: '🚧', name: 'Bulldozer' },
  { icon: '🛞', name: 'Roller' }, { icon: '🛣️', name: 'Pokelane' },
];

const STATUS_COLOR: Record<string, string> = {
  pending: '#F59E0B', accepted: '#43A047', in_progress: '#3B82F6', completed: '#16A34A', rejected: '#E53935',
};

export default function CustomerHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState('');

  const [machines, setMachines] = useState<Machine[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    searchMachines({})
      .then((res: any) => setMachines((res.machines || []).filter((m: Machine) => m.approvalStatus === 'approved').slice(0, 4)))
      .catch(() => setMachines([]))
      .finally(() => setLoadingMachines(false));
  }, []);

  useEffect(() => {
    getCustomerBookings()
      .then((res: any) => setBookings((res.bookings || []).slice(0, 3)))
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));
  }, []);

  const handleSearch = () => {
    if (searchQ.trim()) navigate(`/customer/search?q=${encodeURIComponent(searchQ)}`);
    else navigate('/customer/search');
  };

  const totalBookings = bookings.length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const activeCount = bookings.filter(b => ['accepted', 'in_progress'].includes(b.status)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="fade-in">
      {/* Greeting + Search */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #252545 100%)',
        borderRadius: 16, padding: '32px 36px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,140,0,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 200, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,140,0,0.05)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 6 }}>Good morning 👋</div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>
            Hello, {user?.name?.split(' ')[0]}!
          </h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <Search size={16} color="#9CA3AF" strokeWidth={1.5} />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search machines by city or type..."
                style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: 14 } as React.CSSProperties}
              />
            </div>
            <button onClick={handleSearch} style={{
              padding: '12px 20px', borderRadius: 10, background: '#FF8C00',
              color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'background 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Smart Estimate Banner */}
      <div onClick={() => navigate('/customer/estimate')} style={{
        background: 'linear-gradient(135deg, #FF8C00 0%, #FFAD33 100%)',
        borderRadius: 14, padding: '20px 24px', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'opacity 0.15s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.92'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: '2px 10px', marginBottom: 8 }}>
            <Zap size={10} color="#fff" strokeWidth={2} fill="#fff" />
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>AI Powered</span>
          </div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>Smart Cost Estimate</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }}>Upload site photo → Get instant time & cost estimate</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 36 }}>🤖</div>
          <ArrowRight size={20} color="#fff" strokeWidth={2} />
        </div>
      </div>

      {/* Categories */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1A1D26' }}>Equipment Categories</h2>
          <button onClick={() => navigate('/customer/search')} style={{ background: 'none', border: 'none', color: '#FF8C00', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            View All <ChevronRight size={14} strokeWidth={2} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {CATEGORIES.map(c => (
            <button key={c.name} onClick={() => navigate(`/customer/search?category=${c.name}`)} style={{
              background: '#fff', borderRadius: 12, padding: '16px 8px', border: '1px solid #E5E7EB',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#FF8C00'; el.style.background = '#FFF3E0'; el.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#E5E7EB'; el.style.background = '#fff'; el.style.transform = 'none'; }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1D26' }}>{c.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Featured Machines */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1A1D26' }}>Featured Machines</h2>
            <button onClick={() => navigate('/customer/search')} style={{ background: 'none', border: 'none', color: '#FF8C00', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              See All <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
          {loadingMachines ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {machines.map(m => (
                <div key={m.id} onClick={() => navigate(`/customer/machine/${m.id}`)}
                  style={{
                    background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
                    padding: '16px 18px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; el.style.borderColor = '#FF8C00'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.borderColor = '#E5E7EB'; }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 12, background: '#FFF3E0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0,
                  }}>
                    {MACHINE_ICONS[m.category]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>{m.model}</div>
                        <div style={{ fontSize: 12, color: '#FF8C00', fontWeight: 600, marginTop: 1 }}>{m.category}</div>
                      </div>
                      <Badge status={m.isAvailable ? 'available' : 'unavailable'} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
                        <MapPin size={11} strokeWidth={1.5} /> {m.location.city}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
                        <Clock size={11} strokeWidth={1.5} />
                        <span style={{ color: '#1A1D26', fontWeight: 700 }}>₹{m.hourlyRate.toLocaleString('en-IN')}</span>/hr
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
                        <IndianRupee size={11} strokeWidth={1.5} />
                        <span style={{ color: '#1A1D26', fontWeight: 700 }}>{m.dailyRate.toLocaleString('en-IN')}</span>/day
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#9CA3AF" strokeWidth={1.5} />
                </div>
              ))}
              {machines.length === 0 && (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                  No machines available yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1A1D26' }}>Recent Bookings</h2>
            <button onClick={() => navigate('/customer/bookings')} style={{ background: 'none', border: 'none', color: '#FF8C00', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
          {loadingBookings ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bookings.map(b => (
                <div key={b.id} onClick={() => navigate(`/customer/bookings/${b.id}`)}
                  style={{
                    background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
                    padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; el.style.borderColor = '#E0E0E0'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.borderColor = '#E5E7EB'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>{b.machineModel}</div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[b.status], marginTop: 4, flexShrink: 0 }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>{b.machineCategory} · {b.workCity}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{b.startDate} → {b.endDate}</span>
                    <Badge status={b.status} />
                  </div>
                  {b.status === 'in_progress' && (
                    <button onClick={e => { e.stopPropagation(); navigate(`/customer/tracking/${b.id}`); }} style={{
                      marginTop: 10, width: '100%', padding: '7px', borderRadius: 8,
                      background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#3B82F6',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}>
                      📍 Track Vehicle Live
                    </button>
                  )}
                </div>
              ))}
              {bookings.length === 0 && (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                  No bookings yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { icon: '📦', label: 'Total Bookings', value: loadingBookings ? '…' : totalBookings },
          { icon: '✅', label: 'Completed', value: loadingBookings ? '…' : completedCount },
          { icon: '⏳', label: 'Active', value: loadingBookings ? '…' : activeCount },
          { icon: '⭐', label: 'Avg Rating Given', value: '4.8' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #E5E7EB', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
