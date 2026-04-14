import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, ChevronDown, ChevronUp, MessageCircle, Clock, Shield, Star } from 'lucide-react';

const FAQS = [
  {
    q: 'How do I book a machine?',
    a: 'Go to Search, find your machine, click "Book Now". Choose duration, location, and confirm. You\'ll receive updates as the vendor accepts your booking.',
  },
  {
    q: 'What is the OTP-to-start process?',
    a: 'When the operator arrives at your site, you\'ll receive a 4-digit OTP on this app. Share it with the operator to start the work. This ensures work begins only when you confirm.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'You can cancel bookings that are still in "Pending" status. Once accepted by the vendor, please contact the vendor directly or reach our support team.',
  },
  {
    q: 'How is the cost calculated?',
    a: 'Cost is based on the rate type (hourly/daily/weekly/monthly) and the duration you select. You can also apply coupon codes for discounts at checkout.',
  },
  {
    q: 'How does the Smart Estimate work?',
    a: 'Our AI-powered estimator takes your work type, area size, and soil type to calculate approximate time and cost. It\'s a guide — final cost depends on the actual work.',
  },
  {
    q: 'What is the referral program?',
    a: 'Share your unique referral code with friends. When they complete their first booking, you earn rewards. Find your code in Profile.',
  },
  {
    q: 'How do I rate a completed booking?',
    a: 'After your booking is marked complete, open the Booking Detail and rate your experience with stars and an optional review.',
  },
  {
    q: 'What machines are available?',
    a: 'We have JCBs, Excavators, Cranes, Bulldozers, Rollers, and Pokelanes available across multiple cities in India.',
  },
];

export default function HelpSupport() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }} className="fade-in">
      <button onClick={() => navigate('/customer/profile')} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: '#6B7280', cursor: 'pointer', marginBottom: 20, fontSize: 14, padding: 0,
      }}>
        <ArrowLeft size={16} strokeWidth={2} /> Back to Profile
      </button>

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E, #2D2D4E)',
        borderRadius: 16, padding: '28px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,140,0,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 100, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,140,0,0.05)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ width: 52, height: 52, background: 'rgba(255,140,0,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <MessageCircle size={24} color="#FF8C00" strokeWidth={1.5} />
          </div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Help & Support</h1>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>We're here to help. Reach out anytime.</p>
        </div>
      </div>

      {/* Contact Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <a href="tel:+918000000000" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px',
            textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            <div style={{ width: 44, height: 44, background: '#E8F5E9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Phone size={20} color="#43A047" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 3 }}>Call Us</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>+91 80000 00000</div>
          </div>
        </a>
        <a href="mailto:support@heavyrent.in" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px',
            textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            <div style={{ width: 44, height: 44, background: '#EFF6FF', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Mail size={20} color="#3B82F6" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 3 }}>Email Us</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>support@heavyrent.in</div>
          </div>
        </a>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { icon: Clock, label: 'Support Hours', value: '9am – 8pm', color: '#FFF3E0', iconColor: '#FF8C00' },
          { icon: Shield, label: 'Safe & Secure', value: 'Verified vendors', color: '#E8F5E9', iconColor: '#43A047' },
          { icon: Star, label: 'Response Time', value: 'Within 2 hrs', color: '#EFF6FF', iconColor: '#3B82F6' },
        ].map(({ icon: Icon, label, value, color, iconColor }) => (
          <div key={label} style={{ background: color, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
            <Icon size={18} color={iconColor} strokeWidth={1.5} style={{ margin: '0 auto 6px' }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1D26', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #F3F4F6' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1D26' }}>Frequently Asked Questions</h2>
        </div>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', background: openFaq === i ? '#FFFBF0' : 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1D26', flex: 1, paddingRight: 12 }}>{faq.q}</span>
              {openFaq === i
                ? <ChevronUp size={16} color="#FF8C00" strokeWidth={2} style={{ flexShrink: 0 }} />
                : <ChevronDown size={16} color="#9CA3AF" strokeWidth={2} style={{ flexShrink: 0 }} />
              }
            </button>
            {openFaq === i && (
              <div style={{ padding: '0 20px 16px', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
        HeavyRent v1.0 · Vibe6 Digital LLP
      </p>
    </div>
  );
}
