import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Phone, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { pendingRole, sendOTP } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef<HTMLDivElement>(null);

  const role = pendingRole ?? 'customer';
  const isVendor = role === 'vendor';

  const handleSendOTP = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) { setError('Please enter a valid 10-digit mobile number'); return; }
    setError('');
    setLoading(true);
    try {
      await sendOTP(digits, 'recaptcha-container');
      navigate('/otp');
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F5F5F5' }}>
      {/* Left Panel */}
      <div style={{
        width: 480, background: isVendor ? '#1A1A2E' : '#FF8C00',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 50px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginBottom: 48, width: 'fit-content', padding: 0 }}>
          <ArrowLeft size={14} strokeWidth={2} /> Back to Home
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={20} color="#fff" strokeWidth={1.5} />
          </div>
          <div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>Heavy</span>
            <span style={{ color: isVendor ? '#FF8C00' : 'rgba(255,255,255,0.85)', fontWeight: 800, fontSize: 20 }}>Rent</span>
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
          {isVendor ? 'Vendor / Driver Portal' : 'Customer Portal'}
        </div>
        <h2 style={{ color: '#fff', fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
          {isVendor ? 'Grow your equipment business' : 'Find the right machine for your project'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.7 }}>
          {isVendor
            ? 'List your machines, manage bookings, and track your earnings — all in one place.'
            : 'Search 500+ verified heavy equipment across 28 cities. Book in minutes.'}
        </p>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(isVendor
            ? ['List machines for free', 'Accept/reject bookings', 'Track daily earnings']
            : ['500+ verified machines', 'Smart cost estimate', 'Live machine tracking']
          ).map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: isVendor ? '#FF8C00' : 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="fade-in">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: isVendor ? '#FFF3E0' : '#E8F5E9',
            border: `1px solid ${isVendor ? '#FFAD33' : '#81C784'}`,
            borderRadius: 20, padding: '4px 14px', marginBottom: 28,
          }}>
            <span style={{ fontSize: 14 }}>{isVendor ? '🏭' : '👷'}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: isVendor ? '#E07B00' : '#2E7D32' }}>
              {isVendor ? 'Vendor Login' : 'Customer Login'}
            </span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1D26', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Enter your mobile number
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 32 }}>
            We'll send a 6-digit OTP to verify your identity
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Mobile Number
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              border: `2px solid ${error ? '#E53935' : '#E5E7EB'}`,
              borderRadius: 10, background: '#fff', overflow: 'hidden',
              transition: 'border-color 0.15s',
            }}
              onFocus={() => {}}
            >
              <div style={{
                padding: '12px 14px', background: '#F5F5F5',
                borderRight: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 6,
                color: '#6B7280', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                <Phone size={14} strokeWidth={1.5} />
                +91
              </div>
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                placeholder="98765 43210"
                style={{
                  flex: 1, padding: '12px 16px', border: 'none', background: 'none',
                  fontSize: 16, color: '#1A1D26', letterSpacing: '0.05em',
                }}
              />
            </div>
            {error && <p style={{ color: '#E53935', fontSize: 12, marginTop: 6 }}>{error}</p>}
          </div>

          <button
            onClick={handleSendOTP}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 10,
              background: loading ? '#FFAD33' : '#FF8C00',
              color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
          >
            {loading ? (
              <><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> Sending OTP...</>
            ) : (
              <>Send OTP <ArrowRight size={16} strokeWidth={2} /></>
            )}
          </button>

          <div id="recaptcha-container" ref={recaptchaRef} />

          <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 20, lineHeight: 1.6 }}>
            By continuing, you agree to our{' '}
            <span style={{ color: '#FF8C00', cursor: 'pointer' }}>Terms of Service</span>{' '}
            and{' '}
            <span style={{ color: '#FF8C00', cursor: 'pointer' }}>Privacy Policy</span>
          </p>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              onClick={() => { document.getElementById('switch-role')?.click(); }}
              style={{ background: 'none', border: 'none', fontSize: 13, color: '#9CA3AF', cursor: 'pointer' }}
            >
              {isVendor ? '👷 Switch to Customer Login' : '🏭 Are you a Vendor? Login here'}
            </button>
          </div>
          {/* Hidden role switch helper */}
          <button id="switch-role" style={{ display: 'none' }} onClick={() => navigate('/')} />
        </div>
      </div>
    </div>
  );
}
