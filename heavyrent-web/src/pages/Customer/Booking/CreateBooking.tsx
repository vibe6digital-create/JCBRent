import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Calendar, MapPin, Clock, IndianRupee, Tag, AlertCircle } from 'lucide-react';
import { mockMachines, MACHINE_ICONS } from '../../../data/mockData';
import { createBooking, validateCoupon } from '../../../services/api';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3;
type RateType = 'hourly' | 'daily' | 'weekly' | 'monthly';
type BookingType = 'instant' | 'scheduled';

const RATE_LABELS: Record<RateType, string> = {
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export default function CreateBooking() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const machine = mockMachines.find(m => m.id === machineId);

  const [step, setStep] = useState<Step>(1);
  const [rateType, setRateType] = useState<RateType>('daily');
  const [bookingType, setBookingType] = useState<BookingType>('instant');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!machine) return <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Machine not found</div>;

  const calcUnits = () => {
    if (!startDate || !endDate) return 0;
    const days = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1);
    if (rateType === 'daily') return days;
    if (rateType === 'weekly') return Math.ceil(days / 7);
    if (rateType === 'monthly') return Math.ceil(days / 30);
    return 8; // hourly → fixed 8hrs
  };

  const getRateForType = (): number => {
    if (rateType === 'hourly') return machine.hourlyRate;
    if (rateType === 'daily') return machine.dailyRate;
    if (rateType === 'weekly') return (machine as any).weeklyRate ?? machine.dailyRate * 6;
    if (rateType === 'monthly') return (machine as any).monthlyRate ?? machine.dailyRate * 22;
    return machine.dailyRate;
  };

  const units = calcUnits();
  const baseRate = getRateForType();
  const baseCost = units * baseRate;
  const cost = Math.max(0, baseCost - couponDiscount);

  const unitLabel = () => {
    if (rateType === 'hourly') return '8 hrs';
    if (rateType === 'daily') return `${units} day${units !== 1 ? 's' : ''}`;
    if (rateType === 'weekly') return `${units} wk`;
    if (rateType === 'monthly') return `${units} mo`;
    return '';
  };

  const minStartDate = bookingType === 'instant'
    ? new Date().toISOString().split('T')[0]
    : new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const maxStartDate = bookingType === 'scheduled'
    ? new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
    : undefined;

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (bookingType === 'instant' && !startDate) {
      setStartDate(new Date().toISOString().split('T')[0]);
    }
    if (!startDate && bookingType !== 'instant') e.startDate = 'Required';
    if (!endDate) e.endDate = 'Required';
    if (startDate && endDate && endDate < startDate) e.endDate = 'End date must be after start date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!address.trim()) e.address = 'Work location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon(couponCode.trim(), machine.id) as any;
      setCouponDiscount(res.discountAmount || 0);
      setCouponApplied(true);
      toast.success(`Coupon applied! ₹${(res.discountAmount || 0).toLocaleString('en-IN')} off`);
    } catch {
      toast.error('Invalid or expired coupon code');
      setCouponApplied(false);
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    const sd = bookingType === 'instant' ? new Date().toISOString().split('T')[0] : startDate;
    try {
      await createBooking({
        machineId: machine.id,
        startDate: sd,
        endDate,
        startTime,
        rateType,
        bookingType,
        workLocation: { address, city: '' },
        notes: notes || undefined,
        couponCode: couponApplied ? couponCode : undefined,
      });
      setDone(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, padding: 40 }} className="fade-in">
      <div style={{ width: 80, height: 80, background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={40} color="#43A047" strokeWidth={2.5} />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D26' }}>Booking Request Sent!</h2>
      <p style={{ color: '#6B7280', fontSize: 15, textAlign: 'center', maxWidth: 400 }}>
        Your booking request has been sent to {machine.vendorName}. You'll be notified once they accept.
      </p>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '16px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#FF8C00' }}>₹{cost.toLocaleString('en-IN')}</div>
        <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>Estimated Cost{couponApplied ? ' (after discount)' : ''}</div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate('/customer/bookings')} style={{ padding: '12px 28px', borderRadius: 10, background: '#FF8C00', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
          View My Bookings
        </button>
        <button onClick={() => navigate('/customer/home')} style={{ padding: '12px 28px', borderRadius: 10, background: '#fff', color: '#6B7280', fontWeight: 700, fontSize: 14, border: '1px solid #E5E7EB', cursor: 'pointer' }}>
          Back to Home
        </button>
      </div>
    </div>
  );

  const STEPS = ['Schedule', 'Location', 'Confirm'];

  return (
    <div className="fade-in">
      <button onClick={() => step === 1 ? navigate(-1) : setStep(s => (s - 1) as Step)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: 20, fontSize: 14 }}>
        <ArrowLeft size={16} strokeWidth={2} /> {step === 1 ? 'Back' : 'Previous Step'}
      </button>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
        {STEPS.map((s, i) => {
          const stepNum = (i + 1) as Step;
          const active = step === stepNum;
          const completed = step > stepNum;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: completed ? '#43A047' : active ? '#FF8C00' : '#E5E7EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: completed || active ? '#fff' : '#9CA3AF', fontWeight: 700, fontSize: 13,
                  transition: 'all 0.2s',
                }}>
                  {completed ? <Check size={14} strokeWidth={2.5} /> : stepNum}
                </div>
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#FF8C00' : completed ? '#43A047' : '#9CA3AF' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ width: 40, height: 2, background: step > stepNum ? '#43A047' : '#E5E7EB', margin: '0 8px', transition: 'background 0.2s' }} />}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '28px 32px' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1D26' }}>Set Schedule</h2>

              {/* Book Now vs Book Later */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 10 }}>Booking Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {([
                    { value: 'instant', label: 'Book Now', sub: 'Start today' },
                    { value: 'scheduled', label: 'Book Later', sub: 'Up to 10 days ahead' },
                  ] as const).map(bt => (
                    <button key={bt.value} onClick={() => { setBookingType(bt.value); setStartDate(''); setEndDate(''); setErrors({}); }} style={{
                      padding: '12px', borderRadius: 10,
                      border: `2px solid ${bookingType === bt.value ? '#FF8C00' : '#E5E7EB'}`,
                      background: bookingType === bt.value ? '#FFF3E0' : '#fff',
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: bookingType === bt.value ? '#FF8C00' : '#1A1D26' }}>{bt.label}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{bt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate Type */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 10 }}>Rate Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {(['hourly', 'daily', 'weekly', 'monthly'] as const).map(rt => {
                    const rate = rt === 'hourly' ? machine.hourlyRate
                      : rt === 'daily' ? machine.dailyRate
                      : rt === 'weekly' ? ((machine as any).weeklyRate ?? machine.dailyRate * 6)
                      : ((machine as any).monthlyRate ?? machine.dailyRate * 22);
                    const suffix = rt === 'hourly' ? '/hr' : rt === 'daily' ? '/day' : rt === 'weekly' ? '/wk' : '/mo';
                    return (
                      <button key={rt} onClick={() => setRateType(rt)} style={{
                        padding: '10px 6px', borderRadius: 10,
                        border: `2px solid ${rateType === rt ? '#FF8C00' : '#E5E7EB'}`,
                        background: rateType === rt ? '#FFF3E0' : '#fff',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: rateType === rt ? '#FF8C00' : '#1A1D26', textTransform: 'capitalize' }}>{RATE_LABELS[rt]}</div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>₹{rate.toLocaleString('en-IN')}{suffix}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {bookingType === 'scheduled' ? (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Start Date *</label>
                    <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setErrors({}); }}
                      min={minStartDate} max={maxStartDate}
                      style={{ width: '100%', padding: '10px 14px', border: `2px solid ${errors.startDate ? '#E53935' : '#E5E7EB'}`, borderRadius: 8, fontSize: 14, color: '#1A1D26' }} />
                    {errors.startDate && <p style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>{errors.startDate}</p>}
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Start Date</label>
                    <div style={{ padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: 8, fontSize: 14, color: '#9CA3AF', background: '#FAFAFA' }}>Today (immediate)</div>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>End Date *</label>
                  <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setErrors({}); }}
                    min={bookingType === 'instant' ? new Date().toISOString().split('T')[0] : (startDate || minStartDate)}
                    style={{ width: '100%', padding: '10px 14px', border: `2px solid ${errors.endDate ? '#E53935' : '#E5E7EB'}`, borderRadius: 8, fontSize: 14, color: '#1A1D26' }} />
                  {errors.endDate && <p style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>{errors.endDate}</p>}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                  style={{ padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: 8, fontSize: 14, color: '#1A1D26' }} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1D26' }}>Work Location</h2>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Complete Address *</label>
                <textarea value={address} onChange={e => { setAddress(e.target.value); setErrors({}); }}
                  placeholder="Plot no., Street, Locality, City, Pincode"
                  rows={4}
                  style={{ width: '100%', padding: '12px 14px', border: `2px solid ${errors.address ? '#E53935' : '#E5E7EB'}`, borderRadius: 8, fontSize: 14, color: '#1A1D26', resize: 'vertical' }} />
                {errors.address && <p style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>{errors.address}</p>}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Additional Notes (Optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any special requirements, instructions for the operator..."
                  rows={3}
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #E5E7EB', borderRadius: 8, fontSize: 14, color: '#1A1D26', resize: 'vertical' }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1D26' }}>Confirm Booking</h2>

              {[
                { icon: Calendar, label: 'Schedule', value: `${bookingType === 'instant' ? 'Today' : startDate} → ${endDate} at ${startTime}` },
                { icon: Clock, label: 'Rate', value: `${unitLabel()} × ₹${baseRate.toLocaleString('en-IN')}/${rateType === 'hourly' ? 'hr' : rateType === 'daily' ? 'day' : rateType === 'weekly' ? 'wk' : 'mo'}` },
                { icon: MapPin, label: 'Work Location', value: address },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 12, padding: '14px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #F3F4F6' }}>
                  <div style={{ width: 36, height: 36, background: '#FFF3E0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color="#FF8C00" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 14, color: '#1A1D26', fontWeight: 600 }}>{value}</div>
                  </div>
                </div>
              ))}

              {notes && (
                <div style={{ padding: '12px 14px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FEF3C7' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 2 }}>NOTES</div>
                  <div style={{ fontSize: 13, color: '#6B7280', fontStyle: 'italic' }}>{notes}</div>
                </div>
              )}

              {/* Coupon Code */}
              <div style={{ background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Tag size={14} color="#6B7280" strokeWidth={1.5} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Coupon Code</span>
                </div>
                {couponApplied ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check size={14} color="#43A047" strokeWidth={2.5} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#43A047' }}>{couponCode} applied</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 13, color: '#43A047', fontWeight: 800 }}>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                      <button onClick={() => { setCouponApplied(false); setCouponDiscount(0); setCouponCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 11, textDecoration: 'underline' }}>Remove</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      style={{ flex: 1, padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#1A1D26', letterSpacing: '0.05em' }}
                    />
                    <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} style={{
                      padding: '9px 14px', borderRadius: 8, background: '#FF8C00', color: '#fff',
                      fontWeight: 700, fontSize: 13, border: 'none', cursor: couponLoading ? 'not-allowed' : 'pointer',
                      opacity: couponLoading || !couponCode.trim() ? 0.6 : 1,
                    }}>
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Cost Summary */}
              <div style={{ background: '#FF8C00', borderRadius: 10, padding: '16px 20px' }}>
                {couponApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Subtotal</span>
                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, textDecoration: 'line-through' }}>₹{baseCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {couponApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Discount</span>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Estimated Total</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IndianRupee size={20} color="#fff" strokeWidth={2} />
                    <span style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>{cost.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '10px 12px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FEF3C7' }}>
                <AlertCircle size={14} color="#F59E0B" strokeWidth={1.5} style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#92400E' }}>Final cost may vary based on actual work duration. You'll only be charged after booking is completed.</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as Step)} style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#fff', border: '1.5px solid #E5E7EB', color: '#6B7280', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Back
              </button>
            )}
            <button
              onClick={step === 3 ? handleConfirm : handleNext}
              disabled={submitting}
              style={{
                flex: 2, padding: '12px', borderRadius: 10, background: '#FF8C00', color: '#fff',
                fontWeight: 700, fontSize: 14, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s', opacity: submitting ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
            >
              {submitting ? 'Sending...' : step === 3 ? 'Confirm Booking' : 'Continue'} {!submitting && <ArrowRight size={15} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* Machine Summary */}
        <div style={{ background: '#1A1A2E', borderRadius: 16, padding: '22px', position: 'sticky', top: 80 }}>
          <div style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Booking Summary</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(255,140,0,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              {MACHINE_ICONS[machine.category]}
            </div>
            <div>
              <div style={{ color: '#FF8C00', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{machine.category}</div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginTop: 2 }}>{machine.model}</div>
              <div style={{ color: '#6B7280', fontSize: 12, marginTop: 1 }}>{machine.vendorName}</div>
            </div>
          </div>

          {/* Booking type badge */}
          <div style={{ marginBottom: 12 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: bookingType === 'instant' ? 'rgba(67,160,71,0.15)' : 'rgba(59,130,246,0.15)',
              color: bookingType === 'instant' ? '#43A047' : '#3B82F6',
              border: `1px solid ${bookingType === 'instant' ? 'rgba(67,160,71,0.3)' : 'rgba(59,130,246,0.3)'}`,
            }}>
              {bookingType === 'instant' ? '⚡ Book Now' : '📅 Scheduled'}
            </span>
          </div>

          {endDate && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Rate Type', value: RATE_LABELS[rateType] },
                { label: 'Duration', value: unitLabel() },
                { label: 'Rate', value: `₹${baseRate.toLocaleString('en-IN')}/${rateType === 'hourly' ? 'hr' : rateType === 'daily' ? 'day' : rateType === 'weekly' ? 'wk' : 'mo'}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#6B7280' }}>{label}</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              {couponApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#6B7280' }}>Discount</span>
                  <span style={{ color: '#43A047', fontWeight: 700 }}>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 6, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>Est. Total</span>
                <span style={{ color: '#FF8C00', fontSize: 18, fontWeight: 800 }}>₹{cost.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
