import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Phone, Mail, MapPin, Truck, Star, CheckCircle, LogOut, Wifi, WifiOff, Edit2 } from 'lucide-react';
import { getVendorBookings, getVendorEarnings, toggleVendorOnline } from '../../../services/api';
import type { Booking } from '../../../types';
import toast from 'react-hot-toast';

export default function VendorProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(user?.isOnline ?? true);
  const [togglingOnline, setTogglingOnline] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<{ total: number; thisMonth: number; month: number } | null>(null);

  useEffect(() => {
    getVendorBookings()
      .then((res: any) => setBookings(res.bookings || []))
      .catch(() => setBookings([]));
    getVendorEarnings()
      .then((res: any) => setEarnings(res.earnings || null))
      .catch(() => setEarnings(null));
  }, []);

  const avgRating = (() => {
    const rated = bookings.filter(b => b.rating);
    if (!rated.length) return 0;
    return (rated.reduce((s, b) => s + (b.rating || 0), 0) / rated.length).toFixed(1);
  })();

  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    const next = !isOnline;
    try {
      await toggleVendorOnline(next);
      setIsOnline(next);
      toast.success(next ? 'You are now Online — accepting bookings' : 'You are now Offline — not accepting bookings');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setTogglingOnline(false);
    }
  };

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-in">
      {/* Header */}
      <div style={{ background: '#1A1A2E', borderRadius: 16, padding: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,140,0,0.06)' }} />

        {/* Online toggle — top right */}
        <button
          onClick={handleToggleOnline}
          disabled={togglingOnline}
          style={{
            position: 'absolute', top: 18, right: 18,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 20, border: 'none', cursor: togglingOnline ? 'not-allowed' : 'pointer',
            background: isOnline ? 'rgba(67,160,71,0.15)' : 'rgba(107,114,128,0.15)',
            transition: 'all 0.2s',
            opacity: togglingOnline ? 0.6 : 1,
          }}
          aria-label={isOnline ? 'Go Offline' : 'Go Online'}
        >
          {isOnline
            ? <Wifi size={13} color="#43A047" strokeWidth={1.5} />
            : <WifiOff size={13} color="#9CA3AF" strokeWidth={1.5} />
          }
          <span style={{ fontSize: 12, fontWeight: 700, color: isOnline ? '#43A047' : '#9CA3AF' }}>
            {togglingOnline ? '...' : isOnline ? 'Online' : 'Offline'}
          </span>
          {/* Toggle pill */}
          <div style={{
            width: 32, height: 18, borderRadius: 9,
            background: isOnline ? '#43A047' : '#6B7280',
            position: 'relative', transition: 'background 0.2s', marginLeft: 2,
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 2,
              left: isOnline ? 16 : 2,
              transition: 'left 0.2s',
            }} />
          </div>
        </button>

        {/* Edit button */}
        <button onClick={() => navigate('/vendor/profile/edit')} style={{
          position: 'absolute', top: 18, left: 18,
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.08)', color: '#9CA3AF', fontWeight: 700, fontSize: 12,
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
        >
          <Edit2 size={12} strokeWidth={1.5} /> Edit
        </button>

        <div style={{ position: 'relative', display: 'flex', gap: 20, alignItems: 'center', marginBottom: 20, marginTop: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF8C00, #FFAD33)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 28, flexShrink: 0,
            border: '3px solid rgba(255,140,0,0.3)',
          }}>
            {user?.name.charAt(0)}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.name}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(67,160,71,0.15)', border: '1px solid rgba(67,160,71,0.3)', borderRadius: 20, padding: '3px 10px' }}>
              <CheckCircle size={11} color="#43A047" strokeWidth={2} />
              <span style={{ color: '#43A047', fontSize: 11, fontWeight: 700 }}>Verified Vendor</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: Truck, label: 'Machines', value: '—' },
            { icon: Star, label: 'Avg Rating', value: avgRating || '—' },
            { icon: CheckCircle, label: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
              <s.icon size={18} color="#FF8C00" strokeWidth={1.5} style={{ margin: '0 auto 6px' }} />
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{s.value}</div>
              <div style={{ color: '#6B7280', fontSize: 11, marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Online status info banner */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center',
        padding: '12px 16px', borderRadius: 10,
        background: isOnline ? '#E8F5E9' : '#F3F4F6',
        border: `1px solid ${isOnline ? '#C8E6C9' : '#E5E7EB'}`,
      }}>
        {isOnline
          ? <Wifi size={16} color="#43A047" strokeWidth={1.5} />
          : <WifiOff size={16} color="#9CA3AF" strokeWidth={1.5} />
        }
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: isOnline ? '#2E7D32' : '#6B7280' }}>
            {isOnline ? 'You are Online' : 'You are Offline'}
          </div>
          <div style={{ fontSize: 12, color: isOnline ? '#4CAF50' : '#9CA3AF' }}>
            {isOnline ? 'Customers can see and book your machines' : 'Your machines are hidden from customers'}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '18px 22px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 14 }}>Account Details</h3>
        {[
          { icon: Phone, label: 'Mobile', value: user?.phone || '—' },
          { icon: Mail, label: 'Email', value: user?.email || 'Not set' },
          { icon: MapPin, label: 'City', value: `${user?.city || 'Not set'}, ${user?.state || ''}` },
          { icon: Truck, label: 'Business', value: user?.businessName || 'Individual Vendor' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ width: 36, height: 36, background: '#FFF3E0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={15} color="#FF8C00" strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 14, color: '#1A1D26', fontWeight: 600 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Earnings Summary */}
      <div style={{ background: '#1A1A2E', borderRadius: 14, padding: '18px 22px' }}>
        <div style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Earnings Summary</div>
        {[
          { label: 'Total Earnings', value: `₹${(earnings?.total || 0).toLocaleString('en-IN')}`, color: '#FF8C00' },
          { label: 'This Month', value: `₹${(earnings?.thisMonth || earnings?.month || 0).toLocaleString('en-IN')}`, color: '#43A047' },
          { label: 'This Week', value: `₹0`, color: '#3B82F6' },
        ].map(e => (
          <div key={e.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#6B7280', fontSize: 13 }}>{e.label}</span>
            <span style={{ color: e.color, fontWeight: 800, fontSize: 14 }}>{e.value}</span>
          </div>
        ))}
      </div>

      <button onClick={() => { logout(); navigate('/'); }} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: '14px', borderRadius: 12, background: '#fff',
        border: '1.5px solid #FECACA', color: '#E53935', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.15s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFEBEE'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
      >
        <LogOut size={16} strokeWidth={2} /> Sign Out
      </button>
    </div>
  );
}
