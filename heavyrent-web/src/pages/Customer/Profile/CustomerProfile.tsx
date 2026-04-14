import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Phone, Mail, MapPin, CalendarCheck, ClipboardList, Bell, HelpCircle, LogOut, Edit2, Copy, Building2, User } from 'lucide-react';
import { getCustomerBookings } from '../../../services/api';
import type { Booking } from '../../../types';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = user?.name || '';
  const city = user?.city || '';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    getCustomerBookings()
      .then((res: any) => setBookings(res.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));
  }, []);

  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const referralCode = user?.referralCode || 'HEAVY' + (user?.uid?.slice(-4).toUpperCase() ?? '----');
  const profileType = user?.profileType ?? 'personal';

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      toast.success('Referral code copied!');
    });
  };

  const menuItems = [
    { icon: CalendarCheck, label: 'My Bookings', sub: loadingBookings ? 'Loading...' : `${bookings.length} bookings`, action: () => navigate('/customer/bookings') },
    { icon: ClipboardList, label: 'My Estimates', sub: 'View estimates', action: () => navigate('/customer/estimates') },
    { icon: Bell, label: 'Notifications', sub: 'Booking updates', action: () => navigate('/customer/notifications') },
    { icon: HelpCircle, label: 'Help & Support', sub: 'FAQ, Contact us', action: () => navigate('/customer/help') },
  ];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-in">
      {/* Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FF8C00, #FFAD33)',
        borderRadius: 16, padding: '28px 28px 32px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 150, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        {/* Profile Type Badge */}
        <div style={{ position: 'absolute', top: 16, left: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 10px' }}>
            {profileType === 'corporate'
              ? <Building2 size={11} color="#fff" strokeWidth={2} />
              : <User size={11} color="#fff" strokeWidth={2} />
            }
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{profileType}</span>
          </div>
        </div>

        {/* Edit button */}
        <button onClick={() => navigate('/customer/profile/edit')} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
          padding: '6px 12px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: 12,
        }}>
          <Edit2 size={13} strokeWidth={1.5} /> Edit
        </button>

        <div style={{ position: 'relative', display: 'flex', gap: 18, alignItems: 'center', marginTop: 12 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 28, border: '3px solid rgba(255,255,255,0.4)', flexShrink: 0 }}>
            {user?.name.charAt(0)}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{name}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={12} strokeWidth={1.5} /> {user?.phone}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <MapPin size={11} strokeWidth={1.5} /> {city || 'Location not set'}{user?.state ? `, ${user.state}` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Bookings', value: loadingBookings ? '…' : bookings.length },
          { label: 'Completed', value: loadingBookings ? '…' : completedBookings },
          { label: 'Pending', value: loadingBookings ? '…' : bookings.filter(b => b.status === 'pending').length },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1A1D26' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Referral Code Card */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '18px 20px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 12 }}>Your Referral Code</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            flex: 1, padding: '12px 16px', background: '#FFF3E0', borderRadius: 10,
            border: '2px dashed #FFB74D', textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#FF8C00', letterSpacing: '0.12em' }}>{referralCode}</div>
          </div>
          <button onClick={handleCopyReferral} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E5E7EB',
            background: '#fff', color: '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
          >
            <Copy size={14} strokeWidth={1.5} /> Copy
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 10 }}>Share this code with friends. You earn rewards when they complete their first booking.</p>
      </div>

      {/* Info Card */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '18px 20px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 14 }}>Account Info</h3>
        {[
          { icon: Phone, label: 'Mobile', value: user?.phone || '—' },
          { icon: Mail, label: 'Email', value: user?.email || 'Not set' },
          { icon: MapPin, label: 'City', value: `${city || 'Not set'}, ${user?.state || ''}` },
          { icon: profileType === 'corporate' ? Building2 : User, label: 'Profile Type', value: profileType === 'corporate' ? 'Corporate Account' : 'Personal Account' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ width: 34, height: 34, background: '#FFF3E0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={15} color="#FF8C00" strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 14, color: '#1A1D26', fontWeight: 600 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {menuItems.map(({ icon: Icon, label, sub, action }, i) => (
          <button key={label} onClick={action} style={{
            width: '100%', display: 'flex', gap: 14, alignItems: 'center',
            padding: '16px 20px', background: 'none', border: 'none',
            borderBottom: i < menuItems.length - 1 ? '1px solid #F3F4F6' : 'none',
            cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
          >
            <div style={{ width: 38, height: 38, background: '#FFF3E0', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={17} color="#FF8C00" strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D26' }}>{label}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{sub}</div>
            </div>
            <span style={{ color: '#D1D5DB', fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <button onClick={() => { logout(); navigate('/'); }} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: '14px', borderRadius: 12, background: '#fff', border: '1.5px solid #FECACA',
        color: '#E53935', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.15s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFEBEE'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
      >
        <LogOut size={16} strokeWidth={2} /> Sign Out
      </button>
    </div>
  );
}
