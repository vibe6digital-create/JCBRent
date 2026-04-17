import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, IndianRupee, ChevronRight, Navigation, Star, X } from 'lucide-react';
import { getCustomerBookings, rateBooking } from '../../../services/api';
import type { Booking, BookingStatus } from '../../../types';
import Badge from '../../../components/common/Badge';
import toast from 'react-hot-toast';

type Tab = 'all' | 'active' | 'completed';

const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'accepted', 'in_progress'];

const STAR_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

interface RateTarget {
  bookingId: string;
  machineModel: string;
  machineCategory: string;
  vendorName: string;
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rating modal state
  const [rateTarget, setRateTarget] = useState<RateTarget | null>(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCustomerBookings()
      .then((res: any) => setBookings(res.bookings || []))
      .catch((err: any) => setError(err.message || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => {
    if (tab === 'active') return ACTIVE_STATUSES.includes(b.status);
    if (tab === 'completed') return b.status === 'completed' || b.status === 'rejected';
    return true;
  });

  const counts = {
    all: bookings.length,
    active: bookings.filter(b => ACTIVE_STATUSES.includes(b.status)).length,
    completed: bookings.filter(b => ['completed', 'rejected'].includes(b.status)).length,
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Done' },
  ];

  const openRateModal = (e: React.MouseEvent, b: Booking) => {
    e.stopPropagation();
    setRateTarget({ bookingId: b.id, machineModel: b.machineModel, machineCategory: b.machineCategory, vendorName: b.vendorName });
    setRating(0);
    setHovered(0);
    setReview('');
    setDone(false);
  };

  const closeModal = () => {
    if (submitting) return;
    setRateTarget(null);
  };

  const handleSubmitRating = async () => {
    if (!rateTarget || rating === 0) return;
    setSubmitting(true);
    try {
      await rateBooking(rateTarget.bookingId, { rating, review: review || undefined });
      setBookings(prev => prev.map(b =>
        b.id === rateTarget.bookingId ? { ...b, rating } : b
      ));
      setDone(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const activeStars = hovered || rating;

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: 40, color: '#E53935' }}>{error}</div>;

  return (
    <>
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
                      <button
                        onClick={e => openRateModal(e, b)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                      >
                        <Star size={12} color="#D97706" fill="#D97706" strokeWidth={1.5} /> Rate
                      </button>
                    )}
                    {b.status === 'completed' && b.rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={11} color="#FF8C00" fill={b.rating! >= s ? '#FF8C00' : 'none'} strokeWidth={1.5} />
                        ))}
                      </div>
                    )}
                    <ChevronRight size={16} color="#9CA3AF" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Rating Modal ─── */}
      {rateTarget && (
        <div
          onClick={closeModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, position: 'relative' }}
          >
            {/* Close */}
            {!done && (
              <button onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16, background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} color="#6B7280" strokeWidth={2} />
              </button>
            )}

            {done ? (
              /* Thank-you state */
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1D26', marginBottom: 8 }}>Thank You!</h2>
                <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 6 }}>Your {rating}-star review has been submitted.</p>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 24 }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={24} color="#FF8C00" fill={rating >= s ? '#FF8C00' : 'none'} strokeWidth={1.5} />
                  ))}
                </div>
                <p style={{ color: '#9CA3AF', fontSize: 13 }}>Your feedback helps other customers find the best equipment.</p>
                <button
                  onClick={closeModal}
                  style={{ marginTop: 20, width: '100%', padding: '12px', borderRadius: 10, background: '#FF8C00', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            ) : (
              /* Rating form */
              <>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: '#FF8C00', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{rateTarget.machineCategory}</div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D26', marginBottom: 2 }}>{rateTarget.machineModel}</h2>
                  <div style={{ fontSize: 13, color: '#9CA3AF' }}>by {rateTarget.vendorName}</div>
                </div>

                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D26', marginBottom: 12 }}>How was your experience?</div>

                {/* Stars */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 8, justifyContent: 'center' }}>
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, transition: 'transform 0.1s', transform: activeStars >= s ? 'scale(1.15)' : 'scale(1)' }}
                    >
                      <Star
                        size={36}
                        color="#FF8C00"
                        fill={activeStars >= s ? '#FF8C00' : 'none'}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>

                {/* Label */}
                <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: activeStars ? '#FF8C00' : '#9CA3AF', marginBottom: 20, minHeight: 20, transition: 'color 0.15s' }}>
                  {activeStars ? STAR_LABELS[activeStars] : 'Tap a star to rate'}
                </div>

                {/* Review textarea */}
                <textarea
                  value={review}
                  onChange={e => setReview(e.target.value)}
                  placeholder="Share details about your experience (optional)"
                  rows={3}
                  maxLength={400}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, color: '#1A1D26', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 4 }}
                />
                <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginBottom: 16 }}>{review.length}/400</div>

                <button
                  onClick={handleSubmitRating}
                  disabled={rating === 0 || submitting}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                    background: rating > 0 ? '#FF8C00' : '#E5E7EB',
                    color: rating > 0 ? '#fff' : '#9CA3AF',
                    fontWeight: 700, fontSize: 14,
                    cursor: rating > 0 && !submitting ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
