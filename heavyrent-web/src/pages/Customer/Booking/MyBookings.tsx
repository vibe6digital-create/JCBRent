import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, IndianRupee, ChevronRight, Navigation } from 'lucide-react';
import { mockCustomerBookings } from '../../../data/mockData';
import type { BookingStatus } from '../../../types';
import Badge from '../../../components/common/Badge';

type Tab = 'all' | 'active' | 'completed';

const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'accepted', 'in_progress'];

export default function MyBookings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('all');

  const filtered = mockCustomerBookings.filter(b => {
    if (tab === 'active') return ACTIVE_STATUSES.includes(b.status);
    if (tab === 'completed') return b.status === 'completed' || b.status === 'rejected';
    return true;
  });

  const counts = {
    all: mockCustomerBookings.length,
    active: mockCustomerBookings.filter(b => ACTIVE_STATUSES.includes(b.status)).length,
    completed: mockCustomerBookings.filter(b => ['completed', 'rejected'].includes(b.status)).length,
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Done' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-in">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26' }}>My Bookings</h1>
        <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Track all your equipment bookings</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 10, padding: 4, border: '1px solid #E5E7EB', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: tab === t.key ? '#1A1A2E' : 'transparent',
            color: tab === t.key ? '#fff' : '#6B7280',
            fontWeight: 700, fontSize: 13, transition: 'all 0.15s',
          }}>
            {t.label} <span style={{ opacity: 0.7 }}>({counts[t.key]})</span>
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D26', marginBottom: 6 }}>No bookings yet</h3>
          <button onClick={() => navigate('/customer/search')} style={{ marginTop: 12, padding: '10px 24px', background: '#FF8C00', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Find Equipment
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(b => (
            <div key={b.id} onClick={() => navigate(`/customer/bookings/${b.id}`)}
              style={{
                background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
                padding: '18px 22px', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; el.style.borderColor = '#FF8C00'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.borderColor = '#E5E7EB'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1D26' }}>{b.machineModel}</div>
                  <div style={{ fontSize: 12, color: '#FF8C00', fontWeight: 700, marginTop: 2 }}>{b.machineCategory}</div>
                </div>
                <Badge status={b.status} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                <div style={{ background: '#F5F5F5', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', fontSize: 10, marginBottom: 2 }}><Calendar size={10} strokeWidth={1.5} />SCHEDULE</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1D26' }}>{b.startDate}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>→ {b.endDate}</div>
                </div>
                <div style={{ background: '#F5F5F5', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', fontSize: 10, marginBottom: 2 }}><MapPin size={10} strokeWidth={1.5} />LOCATION</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1D26', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.workCity}</div>
                </div>
                <div style={{ background: '#FFF3E0', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', fontSize: 10, marginBottom: 2 }}><IndianRupee size={10} strokeWidth={1.5} />COST</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#FF8C00' }}>₹{b.estimatedCost.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: '#6B7280' }}>Vendor: <strong style={{ color: '#1A1D26' }}>{b.vendorName}</strong></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {b.status === 'in_progress' && (
                    <button onClick={e => { e.stopPropagation(); navigate(`/customer/tracking/${b.id}`); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#3B82F6', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      <Navigation size={11} strokeWidth={2} /> Track Live
                    </button>
                  )}
                  {b.status === 'completed' && !b.rating && (
                    <button onClick={e => { e.stopPropagation(); navigate(`/customer/bookings/${b.id}`); }}
                      style={{ padding: '6px 12px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      ⭐ Rate
                    </button>
                  )}
                  <ChevronRight size={16} color="#9CA3AF" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
