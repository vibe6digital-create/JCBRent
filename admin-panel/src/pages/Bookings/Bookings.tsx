import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, IndianRupee, X, Phone, User, Truck, FileText, AlertCircle, Printer } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { getBookings, adminCancelBooking } from '../../services/api';
import { printReceipt } from '../../utils/printReceipt';
import type { Booking, BookingStatus } from '../../types';
import toast from 'react-hot-toast';

function formatDate(val: any): string {
  if (!val) return '—';
  if (typeof val === 'string') return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  if (typeof val === 'object' && val._seconds) return new Date(val._seconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  return '—';
}

function formatDateTime(val: any): string {
  if (!val) return '—';
  if (typeof val === 'string') return new Date(val).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  if (typeof val === 'object' && val._seconds) return new Date(val._seconds * 1000).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

const CANCEL_REASONS = [
  'Customer no-show',
  'Duplicate booking',
  'Machine not available',
  'Payment issue',
  'Fraudulent booking',
  'Other',
];

type FilterStatus = 'all' | BookingStatus;

// ─── Booking Detail Drawer ────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#1A1D26', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0 8px', borderBottom: '1px solid #F3F4F6', marginBottom: 12 }}>
      <span style={{ color: '#FF8C00' }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1D26', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
    </div>
  );
}

interface DrawerProps {
  booking: Booking;
  onClose: () => void;
  onCancelled: (updated: Booking) => void;
}

function BookingDrawer({ booking: initialBooking, onClose, onCancelled }: DrawerProps) {
  const [booking, setBooking] = useState(initialBooking);
  const [showCancelSection, setShowCancelSection] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelOther, setCancelOther] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const isCancellable = booking.status === 'pending' || booking.status === 'accepted';

  async function handleCancel() {
    const finalReason = cancelReason === 'Other' ? cancelOther.trim() : cancelReason;
    if (!finalReason) { toast.error('Please select or enter a reason'); return; }
    setCancelling(true);
    try {
      await adminCancelBooking(booking.id, finalReason);
      const updated: Booking = { ...booking, status: 'cancelled', cancellationReason: finalReason, cancelledBy: 'admin' };
      setBooking(updated);
      onCancelled(updated);
      setShowCancelSection(false);
      toast.success('Booking cancelled');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40, backdropFilter: 'blur(2px)' }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, background: '#fff',
        zIndex: 50, boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12, background: '#FAFAFA', position: 'sticky', top: 0, zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#9CA3AF', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>
                #{booking.id.slice(0, 8).toUpperCase()}
              </span>
              <Badge status={booking.status} />
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Created {formatDateTime(booking.createdAt)}</div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#6B7280" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

          {/* Cancellation info box */}
          {booking.status === 'cancelled' && booking.cancellationReason && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <AlertCircle size={14} color="#DC2626" strokeWidth={1.5} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>Cancelled by {booking.cancelledBy || 'customer'}</span>
              </div>
              <div style={{ fontSize: 13, color: '#7F1D1D' }}>{booking.cancellationReason}</div>
            </div>
          )}

          {/* Customer */}
          <div>
            <SectionHeader icon={<User size={14} strokeWidth={1.5} />} title="Customer" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <DetailRow label="Name" value={booking.customerName} />
              <DetailRow label="Phone" value={
                <a href={`tel:${booking.customerPhone}`} style={{ color: '#FF8C00', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={11} strokeWidth={1.5} />{booking.customerPhone}
                </a>
              } />
            </div>
          </div>

          {/* Vendor */}
          <div>
            <SectionHeader icon={<Truck size={14} strokeWidth={1.5} />} title="Vendor" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <DetailRow label="Name" value={booking.vendorName} />
              <DetailRow label="Machine" value={`${booking.machineCategory} · ${booking.machineModel}`} />
            </div>
          </div>

          {/* Schedule & Location */}
          <div>
            <SectionHeader icon={<Calendar size={14} strokeWidth={1.5} />} title="Schedule & Location" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <DetailRow label="Start Date" value={formatDate(booking.startDate)} />
              <DetailRow label="End Date" value={formatDate(booking.endDate)} />
              <DetailRow label="Rate Type" value={
                <span style={{ textTransform: 'capitalize' }}>{booking.rateType}</span>
              } />
              <DetailRow label="Booking Type" value={
                booking.bookingType === 'instant'
                  ? <span style={{ color: '#43A047' }}>⚡ Instant</span>
                  : booking.bookingType === 'scheduled'
                  ? <span style={{ color: '#3B82F6' }}>📅 Scheduled</span>
                  : '—'
              } />
              <div style={{ gridColumn: '1 / -1' }}>
                <DetailRow label="Work Location" value={
                  <span style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                    <MapPin size={12} strokeWidth={1.5} style={{ marginTop: 1, flexShrink: 0, color: '#FF8C00' }} />
                    <span>{getAddress(booking.workLocation) || getCity(booking.workLocation)}</span>
                  </span>
                } />
              </div>
            </div>
          </div>

          {/* Financials */}
          <div>
            <SectionHeader icon={<IndianRupee size={14} strokeWidth={1.5} />} title="Financials" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <DetailRow label="Rate" value={
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IndianRupee size={11} strokeWidth={1.5} />{booking.rate?.toLocaleString('en-IN') ?? '—'}/{booking.rateType}
                </span>
              } />
              <DetailRow label="Estimated Cost" value={
                <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 700, color: '#1A1D26' }}>
                  <IndianRupee size={11} strokeWidth={1.5} />{booking.estimatedCost?.toLocaleString('en-IN') ?? '—'}
                </span>
              } />
              {booking.couponCode && (
                <DetailRow label="Coupon Applied" value={
                  <span style={{ color: '#43A047' }}>
                    🎟 {booking.couponCode}{booking.discountAmount ? ` (−₹${booking.discountAmount.toLocaleString('en-IN')})` : ''}
                  </span>
                } />
              )}
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div>
              <SectionHeader icon={<FileText size={14} strokeWidth={1.5} />} title="Notes" />
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', border: '1px solid #F3F4F6' }}>
                {booking.notes}
              </div>
            </div>
          )}

          {/* Print Receipt — completed bookings */}
          {booking.status === 'completed' && (
            <div style={{ marginTop: 'auto', paddingTop: 12 }}>
              <button
                onClick={() => printReceipt(booking)}
                style={{
                  width: '100%', padding: '10px 0', borderRadius: 8,
                  border: '1px solid #D1FAE5', background: '#ECFDF5',
                  color: '#15803D', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Printer size={15} strokeWidth={1.5} /> Print / Download Receipt
              </button>
            </div>
          )}

          {/* Admin Cancel Section */}
          {isCancellable && !showCancelSection && (
            <div style={{ marginTop: 'auto', paddingTop: 12 }}>
              <button
                onClick={() => setShowCancelSection(true)}
                style={{
                  width: '100%', padding: '10px 0', borderRadius: 8,
                  border: '1px solid #FECACA', background: '#FEF2F2',
                  color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel This Booking
              </button>
            </div>
          )}

          {isCancellable && showCancelSection && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 16, marginTop: 'auto' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginBottom: 12 }}>Select Cancellation Reason</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CANCEL_REASONS.map(r => (
                  <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={r}
                      checked={cancelReason === r}
                      onChange={() => setCancelReason(r)}
                      style={{ accentColor: '#DC2626' }}
                    />
                    {r}
                  </label>
                ))}
              </div>
              {cancelReason === 'Other' && (
                <textarea
                  value={cancelOther}
                  onChange={e => setCancelOther(e.target.value)}
                  placeholder="Describe the reason..."
                  rows={3}
                  style={{
                    width: '100%', marginTop: 10, padding: '8px 10px', borderRadius: 6,
                    border: '1px solid #FECACA', fontSize: 13, color: '#374151',
                    resize: 'vertical', boxSizing: 'border-box', background: '#fff',
                  }}
                />
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => { setShowCancelSection(false); setCancelReason(''); setCancelOther(''); }}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, fontWeight: 600, color: '#6B7280', cursor: 'pointer' }}
                >
                  Back
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling || !cancelReason || (cancelReason === 'Other' && !cancelOther.trim())}
                  style={{
                    flex: 2, padding: '8px 0', borderRadius: 6, border: 'none',
                    background: cancelling ? '#FCA5A5' : '#DC2626', color: '#fff',
                    fontSize: 13, fontWeight: 700, cursor: cancelling ? 'not-allowed' : 'pointer',
                  }}
                >
                  {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selected, setSelected] = useState<Booking | null>(null);

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

  const counts: Record<string, number> = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved' || b.status === 'accepted').length,
    in_progress: bookings.filter(b => b.status === 'arrived' || b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
  };

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'rejected', label: 'Rejected' },
  ];

  function handleBookingCancelled(updated: Booking) {
    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
    setSelected(updated);
  }

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
              {tab.label} ({counts[tab.key] ?? bookings.filter(b => b.status === tab.key).length})
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
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                  onClick={() => setSelected(b)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selected?.id === b.id ? '#FFF7ED' : '#fff'; }}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
                    transition: 'background 0.1s', cursor: 'pointer',
                    background: selected?.id === b.id ? '#FFF7ED' : '#fff',
                  }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#9CA3AF', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>
                      #{b.id.slice(0, 8).toUpperCase()}
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
                  <td style={{ padding: '14px 16px' }}>
                    <Badge status={b.status} />
                    {b.status === 'cancelled' && b.cancellationReason && (
                      <div style={{ fontSize: 10, color: '#DC2626', marginTop: 3, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={b.cancellationReason}>
                        {b.cancellationReason}
                      </div>
                    )}
                  </td>
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

      {/* Detail Drawer */}
      {selected && (
        <BookingDrawer
          booking={selected}
          onClose={() => setSelected(null)}
          onCancelled={handleBookingCancelled}
        />
      )}
    </div>
  );
}
