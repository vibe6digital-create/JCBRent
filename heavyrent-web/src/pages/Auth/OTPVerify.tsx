import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function OTPVerify() {
  const { pendingRole, pendingPhone, verifyOTP, sendOTP } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const role = pendingRole ?? 'customer';

  useEffect(() => {
    inputsRef.current[0]?.focus();
    const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[index] = val.slice(-1);
    setOtp(next);
    setError('');
    if (val && index < 5) inputsRef.current[index + 1]?.focus();
    if (next.every(d => d)) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const entered = code ?? otp.join('');
    if (entered.length < 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true);
    setError('');
    try {
      const loggedInUser = await verifyOTP(entered);
      // New user (no name set) → profile setup, returning user → home
      if (!loggedInUser?.name) {
        navigate('/profile-setup', { replace: true });
      } else {
        navigate(role === 'vendor' ? '/vendor/home' : '/customer/home', { replace: true });
      }
    } catch (e: any) {
      setError(e.message || 'Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      inputsRef.current[5]?.focus();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">
        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '40px 36px', border: '1px solid #E5E7EB', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, background: '#1A1A2E', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={16} color="#FF8C00" strokeWidth={1.5} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#1A1D26' }}>HeavyRent</span>
          </div>

          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: '#FFF3E0',
            border: '2px solid rgba(255,140,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          }}>
            <ShieldCheck size={32} color="#FF8C00" strokeWidth={1.5} />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D26', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Verify OTP
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
            Enter the 6-digit OTP sent to <strong style={{ color: '#1A1D26' }}>{pendingPhone || '+91 XXXXX XXXXX'}</strong>
          </p>

          {/* OTP Inputs */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }} onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
                  border: `2px solid ${digit ? '#FF8C00' : error ? '#E53935' : '#E5E7EB'}`,
                  borderRadius: 10, background: digit ? '#FFF3E0' : '#FAFAFA',
                  color: '#1A1D26', transition: 'all 0.15s',
                }}
              />
            ))}
          </div>

          {error && (
            <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ color: '#E53935', fontSize: 13, textAlign: 'center' }}>{error}</p>
            </div>
          )}

          <button
            onClick={() => handleVerify()}
            disabled={loading || otp.some(d => !d)}
            style={{
              width: '100%', padding: '14px', borderRadius: 10,
              background: loading || otp.some(d => !d) ? '#FFAD33' : '#FF8C00',
              color: '#fff', fontWeight: 700, fontSize: 15, border: 'none',
              cursor: loading || otp.some(d => !d) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading
              ? <><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> Verifying...</>
              : 'Verify & Continue'
            }
          </button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            {countdown > 0 ? (
              <p style={{ color: '#9CA3AF', fontSize: 13 }}>Resend OTP in <strong style={{ color: '#FF8C00' }}>{countdown}s</strong></p>
            ) : (
              <button
                onClick={async () => {
                  try {
                    await sendOTP(pendingPhone);
                    setCountdown(60);
                    setOtp(['', '', '', '', '', '']);
                    setError('');
                    inputsRef.current[0]?.focus();
                  } catch (e: any) {
                    setError(e.message || 'Failed to resend OTP');
                  }
                }}
                style={{ background: 'none', border: 'none', color: '#FF8C00', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Resend OTP
              </button>
            )}
          </div>

        </div>

        <button onClick={() => navigate('/login')} style={{
          background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, margin: '20px auto 0',
        }}>
          <ArrowLeft size={14} strokeWidth={2} /> Change mobile number
        </button>
      </div>
    </div>
  );
}
