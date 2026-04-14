import { useState, useEffect } from 'react';
import { Phone, Calendar, MapPin, IndianRupee, Check, X, Truck, Flag, Star, KeyRound } from 'lucide-react';
import { getVendorBookings, updateBookingStatus, markArrived, verifyStartOtp } from '../../../services/api';
import type { Booking, BookingStatus } from '../../../types';
import Badge from '../../../components/common/Badge';
import toast from 'react-hot-toast';

const MACHINE_ICONS: Record<string, string> = {
  JCB: '🚜', Excavator: '⛏️', Crane: '🏗️', Bulldozer: '🚧', Roller: '🛞', Pokelane: '🛣️',
};

type Tab = 'pending' | 'active' | 'completed' | 'rejected';

export default function VendorBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('pending');
  // OTP input state per booking
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpLoading, setOtpLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getVendorBookings()
      .then((res: any) => setBookings(res.bookings || []))
      .catch((err: any) => setError(err.message || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      const msgs: Partial<Record<BookingStatus, string>> = {
        accepted: 'Booking accepted!',
        rejected: 'Booking rejected',
        completed: 'Booking marked complete!',
      };
      toast.success(msgs[status] || `Status updated to ${status}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleMarkArrived = async (id: string) => {
    try {
      await markArrived(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'arrived' } : b));
      toast.success('Arrival marked — OTP sent to customer');
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark arrival');
    }
  };

  const handleVerifyOtp = async (id: string) => {
    const otp = otpInputs[id] || '';
    if (otp.length < 4) { toast.error('Enter the 4-digit OTP'); return; }
    setOtpLoading(prev => ({ ...prev, [id]: true }));
    try {
      await verifyStartOtp(id, otp);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'in_progress' } : b));
      setOtpInputs(prev => ({ ...prev, [id]: '' }));
      toast.success('OTP verified — Work started!');
    } catch (err: any) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setOtpLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const filtered = bookings.filter(b => {
    if (tab === 'pending') return b.status === 'pending';
    if (tab === 'active') return ['accepted', 'arrived', 'in_progress'].includes(b.status);
    if (tab === 'completed') return b.status === 'completed';
    return b.status === 'rejected';
  });

  const counts: Record<Tab, number> = {
    pending: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => ['accepted', 'arrived', 'in_progress'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
  };

  const TAB_CONFIG: { key: Tab; label: string; color: string }[] = [
    { key: 'pending', label: 'Pending', color: '#F59E0B' },
    { key: 'active', label: 'Active', color: '#3B82F6' },
    { key: 'completed', label: 'Completed', color: '#43A047' },
    { key: 'rejected', label: 'Rejected', color: '#E53935' },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: 40, color: '#E53935' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-in">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26' }}>Bookings</h1>
        <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Manage all your equipment booking requests</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#1A1A2E', borderRadius: 12, padding: 4, gap: 4, width: 'fit-content' }}>
        {TAB_CONFIG.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: tab === t.key ? t.color : 'transparent',
            color: tab === t.key ? '#fff' : '#6B7280',
            fontWeight: 700, fontSize: 13, transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(b => (
          <div key={b.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF8C00', fontWeight: 800, fontSize: 16 }}>
                  {b.customerName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>{b.customerName}</div>
                  <a href={`tel:${b.customerPhone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280', textDecoration: 'none' }}>
                    <Phone size={11} strokeWidth={1.5} /> {b.customerPhone}
                  </a>
                </div>
              </div>
              <Badge status={b.status} />
            </div>

            <div style={{ padding: '16px 20px' }}>
              {/* Machine */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', background: '#F5F5F5', borderRadius: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>{MACHINE_ICONS[b.machineCategory]}</span>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>{b.machineCategory}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>{b.machineModel}</div>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <Calendar size={13} color="#FF8C00" strokeWidth={1.5} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>DATES</div>
                    <div style={{ fontSize: 13, color: '#1A1D26', fontWeight: 600 }}>{b.startDate}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>→ {b.endDate}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <MapPin size={13} color="#FF8C00" strokeWidth={1.5} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>LOCATION</div>
                    <div style={{ fontSize: 13, color: '#1A1D26', fontWeight: 600 }}>{b.workCity}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{b.workLocation}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <IndianRupee size={13} color="#FF8C00" strokeWidth={1.5} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>EARNINGS</div>
                    <div style={{ fontSize: 15, color: '#1A1D26', fontWeight: 800 }}>₹{b.estimatedCost.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'capitalize' }}>{b.rateType}</div>
                  </div>
                </div>
              </div>

              {b.notes && (
                <div style={{ padding: '8px 12px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FEF3C7', marginBottom: 12, fontSize: 12, color: '#92400E', fontStyle: 'italic' }}>
                  "{b.notes}"
                </div>
              )}

              {/* Rating for completed */}
              {b.status === 'completed' && b.rating && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: '#FFFBEB', borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={13} color="#FF8C00" fill={s <= (b.rating || 0) ? '#FF8C00' : 'none'} strokeWidth={1.5} />)}
                  </div>
                  {b.review && <span style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>"{b.review}"</span>}
                </div>
              )}

              {/* ── Action Buttons by status ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {b.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => handleUpdateStatus(b.id, 'accepted')} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '10px', borderRadius: 10, background: '#43A047', color: '#fff',
                      fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#388E3C'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#43A047'; }}
                    >
                      <Check size={14} strokeWidth={2.5} /> Accept
                    </button>
                    <button onClick={() => handleUpdateStatus(b.id, 'rejected')} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '10px', borderRadius: 10, background: 'transparent', color: '#E53935',
                      fontWeight: 700, fontSize: 13, border: '1.5px solid #E53935', cursor: 'pointer', transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFEBEE'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <X size={14} strokeWidth={2.5} /> Reject
                    </button>
                  </div>
                )}

                {b.status === 'accepted' && (
                  <button onClick={() => handleMarkArrived(b.id)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '11px', borderRadius: 10, background: '#3B82F6', color: '#fff',
                    fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#2563EB'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#3B82F6'; }}
                  >
                    <Truck size={14} strokeWidth={2} /> Mark Arrived at Site
                  </button>
                )}

                {b.status === 'arrived' && (
                  <div style={{ background: '#FFF3E0', borderRadius: 12, border: '1.5px solid rgba(255,140,0,0.3)', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <KeyRound size={14} color="#FF8C00" strokeWidth={1.5} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#E07B00' }}>Enter OTP from Customer</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#92400E', marginBottom: 12 }}>
                      Customer received a 4-digit OTP on their app. Ask them to share it to start work.
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={otpInputs[b.id] || ''}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setOtpInputs(prev => ({ ...prev, [b.id]: val }));
                        }}
                        placeholder="_ _ _ _"
                        style={{
                          flex: 1, padding: '10px 16px', border: '2px solid #FFB74D',
                          borderRadius: 10, fontSize: 20, fontWeight: 800, letterSpacing: '0.2em',
                          textAlign: 'center', color: '#1A1D26', background: '#fff', outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => handleVerifyOtp(b.id)}
                        disabled={otpLoading[b.id] || (otpInputs[b.id] || '').length < 4}
                        style={{
                          padding: '10px 20px', borderRadius: 10, background: '#FF8C00', color: '#fff',
                          fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer',
                          opacity: (otpInputs[b.id] || '').length < 4 ? 0.6 : 1, transition: 'all 0.15s',
                          display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                        }}
                      >
                        {otpLoading[b.id]
                          ? <span className="spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
                          : <Check size={14} strokeWidth={2.5} />
                        }
                        Start Work
                      </button>
                    </div>
                  </div>
                )}

                {b.status === 'in_progress' && (
                  <button onClick={() => handleUpdateStatus(b.id, 'completed')} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '11px', borderRadius: 10, background: '#FF8C00', color: '#fff',
                    fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
                  >
                    <Flag size={14} strokeWidth={2.5} /> Mark Job Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>
            {tab === 'pending' ? '⏳' : tab === 'active' ? '🔧' : tab === 'completed' ? '🎉' : '❌'}
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>No {tab} bookings</h3>
        </div>
      )}
    </div>
  );
}
