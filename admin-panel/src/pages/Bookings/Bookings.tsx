import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, IndianRupee } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { getBookings } from '../../services/api';
import type { Booking, BookingStatus } from '../../types';
import toast from 'react-hot-toast';

function formatDate(val: any): string {
  if (!val) return '—';
  if (typeof val === 'string') return new Date(val).toLocaleDateString('en-IN');
  if (typeof val === 'object' && val._seconds) return new Date(val._seconds * 1000).toLocaleDateString('en-IN');
  return '—';
}

function getCity(workLocation: any): string {
  if (!workLocation) return '—';
  return workLocation.city || workLocation.address?.split(',').pop()?.trim() || '—';
}

function getAddress(workLocation: any): string {
  if (!workLocation) return '';
  return workLocation.address || '';
}

type FilterStatus = 'all' | BookingStatus;

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    (async () => {
      try {
        const res: any = await getBookings();
        setBookings(res.bookings || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = bookings.filter(b => {
    const matchesSearch =
      (b.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      b.machineModel.toLowerCase().includes(search.toLowerCase()) ||
      getCity(b.workLocation).toLowerCase().includes(search.toLowerCase()) ||
      (b.vendorName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts: Record<FilterStatus, number> = {
    all: bookings.length,
    pending: bookings.filter((b: any) => b.status === 'pending').length,
    approved: bookings.filter((b: any) => b.status === 'approved').length,
    rejected: bookings.filter((b: any) => b.status === 'rejected').length,
    completed: bookings.filter((b: any) => b.status === 'completed').length,
  };

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected', label: 'Rejected' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F5F5', borderRadius: 8, padding: '8px 12px', border: '1px solid #E5E7EB', flex: 1, minWidth: 200 }}>
          <Search size={14} color="#9CA3AF" strokeWidth={1.5} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer, machine, vendor or city..."
            style={{ border: 'none', background: 'none', fontSize: 13, color: '#1A1D26', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: statusFilter === tab.key ? '#FF8C00' : '#E5E7EB',
                background: statusFilter === tab.key ? '#FF8C00' : '#fff',
                color: statusFilter === tab.key ? '#fff' : '#6B7280',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label} ({counts[tab.key]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>{filtered.length} bookings found</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                {['Booking ID', 'Customer', 'Machine', 'Vendor', 'Schedule', 'Location', 'Cost', 'Rate', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#9CA3AF', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>
                      #{b.id.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1D26' }}>{b.customerName}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{b.customerPhone}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, color: '#1A1D26' }}>{b.machineCategory}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{b.machineModel}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{b.vendorName}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
                      <Calendar size={11} strokeWidth={1.5} />
                      {formatDate(b.startDate)}
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 15 }}>→ {formatDate(b.endDate)}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
                      <MapPin size={11} strokeWidth={1.5} />
                      {getCity(b.workLocation)}
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, whiteSpace: 'nowrap' }}>{getAddress(b.workLocation)}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>
                      <IndianRupee size={12} strokeWidth={1.5} />
                      {b.estimatedCost.toLocaleString('en-IN')}
                    </div>
                    {b.couponCode && (
                      <div style={{ fontSize: 10, color: '#43A047', marginTop: 2 }}>
                        🎟 {b.couponCode} {b.discountAmount ? `(-₹${b.discountAmount.toLocaleString('en-IN')})` : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: 4, textTransform: 'capitalize', display: 'inline-block', marginBottom: 3 }}>
                      {b.rateType}
                    </span>
                    {b.bookingType && (
                      <div style={{ fontSize: 10, color: b.bookingType === 'instant' ? '#43A047' : '#3B82F6', fontWeight: 600, textTransform: 'capitalize' }}>
                        {b.bookingType === 'instant' ? '⚡ Instant' : '📅 Scheduled'}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}><Badge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            No bookings match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
