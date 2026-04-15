import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Calendar, MapPin, IndianRupee, Clock, Star, Navigation, Check, XCircle, Printer } from 'lucide-react';
import { getBookingById, rateBooking, cancelBooking } from '../../../services/api';
import type { Booking } from '../../../types';
import Badge from '../../../components/common/Badge';
import { printReceipt } from '../../../utils/printReceipt';
import toast from 'react-hot-toast';

const MACHINE_ICONS: Record<string, string> = {
  JCB: '🚜', Excavator: '⛏️', Crane: '🏗️', Bulldozer: '🚧', Roller: '🛞', Pokelane: '🛣️',
};

const TIMELINE = [
  { key: 'pending', label: 'Booking Requested', icon: '📋' },
  { key: 'accepted', label: 'Vendor Accepted', icon: '✅' },
  { key: 'in_progress', label: 'Work In Progress', icon: '🔧' },
  { key: 'completed', label: 'Completed', icon: '🎉' },
];
const STATUS_ORDER = ['pending', 'accepted', 'in_progress', 'completed'];

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [rated, setRated] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelOther, setCancelOther] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBookingById(id)
      .then((res: any) => setBooking(res.booking || res))
      .catch((err: any) => setError(err.message || 'Booking not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>;
  if (error || !booking) return <div style={{ padding: 40, textAlign: 'center', color: '#E53935' }}>{error || 'Booking not found'}</div>;

  const currentIdx = STATUS_ORDER.indexOf(booking.status === 'rejected' ? 'pending' : booking.status);

  const CANCEL_REASONS = ['Change of plans', 'Found a better option', 'Work postponed', 'Wrong booking details', 'Other'];

  const handleCancel = async () => {
    const reason = cancelReason === 'Other' ? cancelOther.trim() : cancelReason;
    if (!reason || !id) return;
    setCancelling(true);
    try {
      await cancelBooking(id, reason);
      const res: any = await getBookingById(id);
      setBooking(res.booking || res);
      setShowCancelModal(false);
      toast.success('Booking cancelled successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleRate = async () => {
    if (rating === 0 || !id) return;
    setSubmittingRating(true);
    try {
      await rateBooking(id, { rating, review: review || undefined });
      setRated(true);
      toast.success('Rating submitted!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="fade-in">
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: 20, fontSize: 14 }}>
        <ArrowLeft size={16} strokeWidth={2} /> Back to Bookings
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Status Header */}
          <div style={{
            borderRadius: 14, padding: '20px 24px',
            background: (booking.status === 'rejected' || booking.status === 'cancelled') ? '#FFEBEE' : booking.status === 'completed' ? '#E8F5E9' : booking.status === 'in_progress' ? '#EFF6FF' : '#FFFBEB',
            border: `1px solid ${(booking.status === 'rejected' || booking.status === 'cancelled') ? '#FFCDD2' : booking.status === 'completed' ? '#C8E6C9' : booking.status === 'in_progress' ? '#BFDBFE' : '#FDE68A'}`,
            display: 'flex', gap: 14, alignItems: 'center',
          }}>
            <div style={{ fontSize: 36 }}>
              {booking.status === 'pending' ? '⏳' : booking.status === 'accepted' ? '✅' : booking.status === 'in_progress' ? '🔧' : booking.status === 'completed' ? '🎉' : booking.status === 'cancelled' ? '🚫' : '❌'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#1A1D26', marginBottom: 4 }}><Badge status={booking.status} /></div>
              <div style={{ color: '#6B7280', fontSize: 13 }}>
                {booking.status === 'pending' && 'Waiting for vendor to accept your booking.'}
                {booking.status === 'accepted' && 'Vendor accepted! Work will begin on ' + booking.startDate}
                {booking.status === 'in_progress' && 'Machine is currently at your work site.'}
                {booking.status === 'completed' && 'Work completed successfully!'}
                {booking.status === 'rejected' && 'Vendor declined this booking request.'}
                {booking.status === 'cancelled' && 'This booking was cancelled.'}
              </div>
            </div>
          </div>

          {/* Timeline */}
          {booking.status !== 'rejected' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 16 }}>Booking Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {TIMELINE.map((t, i) => {
                  const done = i <= currentIdx;
                  const active = i === currentIdx;
                  return (
                    <div key={t.key} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: done ? (active ? '#FF8C00' : '#43A047') : '#E5E7EB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, transition: 'all 0.2s',
                        }}>
                          {done && !active ? <Check size={14} color="#fff" strokeWidth={2.5} /> : <span>{t.icon}</span>}
                        </div>
                        {i < TIMELINE.length - 1 && <div style={{ width: 2, height: 28, background: i < currentIdx ? '#43A047' : '#E5E7EB', marginTop: 2 }} />}
                      </div>
                      <div style={{ paddingBottom: 20 }}>
                        <div style={{ fontSize: 14, fontWeight: active ? 700 : 500, color: done ? '#1A1D26' : '#9CA3AF' }}>{t.label}</div>
                        {active && <div style={{ fontSize: 12, color: '#FF8C00', fontWeight: 600, marginTop: 2 }}>Current Status</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 14 }}>Booking Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: Calendar, label: 'Schedule', value: `${booking.startDate} → ${booking.endDate}` },
                { icon: Clock, label: 'Start Time', value: booking.startTime || '08:00' },
                { icon: MapPin, label: 'Work Location', value: `${booking.workLocation}, ${booking.workCity}` },
                { icon: IndianRupee, label: 'Rate', value: `₹${booking.rate.toLocaleString('en-IN')} / ${booking.rateType}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <Icon size={16} color="#FF8C00" strokeWidth={1.5} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 14, color: '#1A1D26', fontWeight: 600 }}>{value}</div>
                  </div>
                </div>
              ))}
              {booking.notes && (
                <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FEF3C7' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 2 }}>NOTES</div>
                  <div style={{ fontSize: 13, color: '#6B7280', fontStyle: 'italic' }}>{booking.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Cost */}
          <div style={{ background: '#1A1A2E', borderRadius: 14, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#9CA3AF', fontSize: 14 }}>Estimated Total Cost</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <IndianRupee size={18} color="#FF8C00" strokeWidth={1.5} />
              <span style={{ color: '#FF8C00', fontSize: 26, fontWeight: 800 }}>{booking.estimatedCost.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Rating */}
          {booking.status === 'completed' && !rated && !booking.rating && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 14 }}>Rate Your Experience</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                    transform: rating >= s ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.1s',
                  }}>
                    <Star size={32} color="#FF8C00" fill={rating >= s ? '#FF8C00' : 'none'} strokeWidth={1.5} />
                  </button>
                ))}
              </div>
              <textarea value={review} onChange={e => setReview(e.target.value)} placeholder="Share your experience (optional)..." rows={3}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, color: '#1A1D26', resize: 'none', marginBottom: 12 }} />
              <button onClick={handleRate} disabled={rating === 0 || submittingRating}
                style={{ padding: '10px 24px', borderRadius: 8, background: rating > 0 ? '#FF8C00' : '#E5E7EB', color: rating > 0 ? '#fff' : '#9CA3AF', fontWeight: 700, fontSize: 13, border: 'none', cursor: rating > 0 ? 'pointer' : 'not-allowed' }}>
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          )}
          {(rated || (booking.status === 'completed' && booking.rating)) && (
            <div style={{ background: '#FFFBEB', borderRadius: 14, border: '1px solid #FDE68A', padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ fontSize: 32 }}>⭐</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1D26', marginBottom: 2 }}>
                  You rated {rated ? rating : booking.rating} stars
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', fontStyle: 'italic' }}>{review || booking.review}</div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 80 }}>
          {/* Machine */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '18px 20px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Machine</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, background: '#FFF3E0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                {MACHINE_ICONS[booking.machineCategory]}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#1A1D26' }}>{booking.machineModel}</div>
                <div style={{ fontSize: 12, color: '#FF8C00', fontWeight: 600 }}>{booking.machineCategory}</div>
              </div>
            </div>
          </div>

          {/* Vendor */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '18px 20px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Vendor</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF8C00', fontWeight: 800 }}>
                {booking.vendorName.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#1A1D26' }}>{booking.vendorName}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Equipment Provider</div>
              </div>
            </div>
            <a href={`tel:${booking.vendorPhone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '9px', borderRadius: 8, background: '#1A1A2E', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              <Phone size={13} strokeWidth={1.5} /> {booking.vendorPhone}
            </a>
          </div>

          {/* Receipt button for completed bookings */}
          {booking.status === 'completed' && (
            <button
              onClick={() => printReceipt(booking)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 12, background: '#ECFDF5',
                color: '#15803D', fontWeight: 700, fontSize: 14,
                border: '1.5px solid #BBF7D0', cursor: 'pointer', width: '100%',
              }}
            >
              <Printer size={16} strokeWidth={1.5} /> Download Receipt
            </button>
          )}

          {booking.status === 'in_progress' && (
            <button onClick={() => navigate(`/customer/tracking/${booking.id}`)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', borderRadius: 12, background: '#3B82F6', color: '#fff',
              fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer',
            }}>
              <Navigation size={16} strokeWidth={2} /> Track Vehicle Live
            </button>
          )}

          {/* Cancel button — only for pending/accepted */}
          {(booking.status === 'pending' || booking.status === 'accepted') && (
            <button onClick={() => setShowCancelModal(true)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', borderRadius: 12, background: 'transparent', color: '#DC2626',
              fontWeight: 700, fontSize: 14, border: '1.5px solid #DC2626', cursor: 'pointer',
            }}>
              <XCircle size={16} strokeWidth={2} /> Cancel Booking
            </button>
          )}

          {/* Cancellation reason display */}
          {booking.status === 'cancelled' && booking.cancellationReason && (
            <div style={{ background: '#FEF2F2', borderRadius: 12, border: '1px solid #FECACA', padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Cancellation Reason</div>
              <div style={{ fontSize: 13, color: '#7F1D1D' }}>{booking.cancellationReason}</div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <XCircle size={22} color="#DC2626" strokeWidth={1.5} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D26', margin: 0 }}>Cancel Booking</h2>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
              This cannot be undone. Please select a reason.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {CANCEL_REASONS.map(r => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${cancelReason === r ? '#FF8C00' : '#E5E7EB'}`, background: cancelReason === r ? '#FFF3E0' : '#fff' }}>
                  <input type="radio" name="reason" value={r} checked={cancelReason === r} onChange={() => setCancelReason(r)} style={{ accentColor: '#FF8C00' }} />
                  <span style={{ fontSize: 14, color: '#1A1D26', fontWeight: cancelReason === r ? 600 : 400 }}>{r}</span>
                </label>
              ))}
            </div>
            {cancelReason === 'Other' && (
              <textarea
                value={cancelOther}
                onChange={e => setCancelOther(e.target.value)}
                placeholder="Describe your reason..."
                rows={3}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, resize: 'none', marginBottom: 16, boxSizing: 'border-box' }}
              />
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setShowCancelModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling || (cancelReason === 'Other' && !cancelOther.trim())}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: cancelling ? '#9CA3AF' : '#DC2626', color: '#fff', fontWeight: 700, fontSize: 14, cursor: cancelling ? 'not-allowed' : 'pointer' }}>
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
