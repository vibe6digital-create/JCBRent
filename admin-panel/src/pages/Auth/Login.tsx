import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Phone, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const RECAPTCHA_ID = 'admin-recaptcha-container';

export default function Login() {
  const { sendOTP, verifyOTP } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) { toast.error('Enter a valid 10-digit number'); return; }
    setLoading(true);
    try {
      await sendOTP(phone, RECAPTCHA_ID);
      setStep('otp');
      toast.success('OTP sent!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter the full 6-digit OTP'); return; }
    setLoading(true);
    try {
      await verifyOTP(code);
    } catch (err: any) {
      toast.error(err?.message || 'Verification failed');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#F3F4F6',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div id={RECAPTCHA_ID} style={{ display: 'none' }} />

      <div style={{
        background: '#fff', borderRadius: 16, padding: '48px 40px',
        width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, background: '#FF8C00',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <Shield size={28} color="#fff" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1D26', margin: 0 }}>HeavyRent Admin</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>Sign in with your admin phone number</p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handleSendOTP}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Phone Number
            </label>
            <div style={{
              display: 'flex', border: '1.5px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', marginBottom: 24,
            }}>
              <span style={{
                padding: '12px 14px', fontSize: 14, fontWeight: 600,
                background: '#F9FAFB', borderRight: '1.5px solid #E5E7EB', color: '#374151',
              }}>+91</span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                maxLength={10}
                autoFocus
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  padding: '12px 16px', fontSize: 15, color: '#1A1D26',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 10,
                background: '#FF8C00', color: '#fff', border: 'none',
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerify}>
            <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 24 }}>
              OTP sent to <strong>+91 {phone}</strong>
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                  style={{
                    width: 46, height: 52, borderRadius: 10,
                    border: `1.5px solid ${digit ? '#FF8C00' : '#E5E7EB'}`,
                    textAlign: 'center', fontSize: 20, fontWeight: 700,
                    color: '#1A1D26', outline: 'none',
                  }}
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 10,
                background: '#FF8C00', color: '#fff', border: 'none',
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, marginBottom: 16,
              }}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'none',
                border: 'none', color: '#FF8C00', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', margin: '0 auto',
              }}
            >
              <ArrowLeft size={14} /> Change number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
