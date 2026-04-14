import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, User, Mail, Gift, ArrowRight, Building2 } from 'lucide-react';
import { registerUser } from '../../services/api';
import toast from 'react-hot-toast';
import type { ProfileType } from '../../types';

export default function ProfileSetup() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [referral, setReferral] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('personal');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter your full name'); return; }
    if (!termsAccepted) { setError('Please accept the Terms of Use & Privacy Policy to continue'); return; }
    setError('');
    setLoading(true);
    try {
      await registerUser({
        name: name.trim(),
        role: role ?? 'customer',
        email: email.trim() || undefined,
        referralCode: referral.trim().toUpperCase() || undefined,
        profileType,
      });
      toast.success('Welcome to HeavyRent!');
      navigate(role === 'vendor' ? '/vendor/home' : '/customer/home', { replace: true });
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 480 }} className="fade-in">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, background: '#1A1A2E', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={18} color="#FF8C00" strokeWidth={1.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#1A1D26' }}>HeavyRent</span>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', border: '1px solid #E5E7EB', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div style={{ width: 56, height: 56, background: '#FFF3E0', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '2px solid rgba(255,140,0,0.2)' }}>
            <User size={26} color="#FF8C00" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D26', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Create Your Account
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>
            Just a few details to get you started — phone verified ✓
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Full Name <span style={{ color: '#E53935' }}>*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${error && !name ? '#E53935' : '#E5E7EB'}`, borderRadius: 10, background: '#FAFAFA', overflow: 'hidden' }}>
                <div style={{ padding: '11px 12px', borderRight: '1px solid #E5E7EB' }}>
                  <User size={15} color="#9CA3AF" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  placeholder="Enter your full name"
                  style={{ flex: 1, padding: '11px 14px', border: 'none', background: 'none', fontSize: 14, color: '#1A1D26' }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                Email ID <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>Optional</span>
              </label>
              <p style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 6 }}>Invoices and receipts will be sent to this email</p>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: 10, background: '#FAFAFA', overflow: 'hidden' }}>
                <div style={{ padding: '11px 12px', borderRight: '1px solid #E5E7EB' }}>
                  <Mail size={15} color="#9CA3AF" strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com (optional)"
                  style={{ flex: 1, padding: '11px 14px', border: 'none', background: 'none', fontSize: 14, color: '#1A1D26' }}
                />
              </div>
            </div>

            {/* Referral Code */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                Referral Code <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>Optional</span>
              </label>
              <p style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 6 }}>Get a discount on your first booking</p>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: 10, background: '#FAFAFA', overflow: 'hidden' }}>
                <div style={{ padding: '11px 12px', borderRight: '1px solid #E5E7EB' }}>
                  <Gift size={15} color="#9CA3AF" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  value={referral}
                  onChange={e => setReferral(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123 (optional)"
                  style={{ flex: 1, padding: '11px 14px', border: 'none', background: 'none', fontSize: 14, color: '#1A1D26', letterSpacing: '0.05em' }}
                />
              </div>
            </div>

            {/* Profile Type */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
                Account Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {([
                  { key: 'personal', label: 'Personal', icon: User, desc: 'For individual use' },
                  { key: 'corporate', label: 'Corporate', icon: Building2, desc: 'For business use' },
                ] as const).map(({ key, label, icon: Icon, desc }) => (
                  <button key={key} onClick={() => setProfileType(key)} style={{
                    padding: '12px', borderRadius: 10,
                    border: `2px solid ${profileType === key ? '#FF8C00' : '#E5E7EB'}`,
                    background: profileType === key ? '#FFF3E0' : '#FAFAFA',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <Icon size={14} color={profileType === key ? '#E07B00' : '#6B7280'} strokeWidth={1.5} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: profileType === key ? '#E07B00' : '#1A1D26' }}>{label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div style={{
              padding: '16px', borderRadius: 12,
              background: termsAccepted ? 'rgba(255,140,0,0.05)' : '#F9FAFB',
              border: `1.5px solid ${termsAccepted ? 'rgba(255,140,0,0.3)' : '#E5E7EB'}`,
              transition: 'all 0.15s',
            }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                Enjoy HeavyRent services by accepting our Terms & Privacy Policy.
              </p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>
                Your data is always secure and used only to give you a suitable experience.
              </p>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 8 }}>
                <input type="checkbox" checked={termsAccepted} onChange={e => { setTermsAccepted(e.target.checked); setError(''); }}
                  style={{ marginTop: 2, accentColor: '#FF8C00', width: 15, height: 15, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                  I accept the <span style={{ color: '#FF8C00', fontWeight: 600, cursor: 'pointer' }}>Terms of Use</span> &{' '}
                  <span style={{ color: '#FF8C00', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#FF8C00', width: 15, height: 15, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
                  Stay informed of discounts, offers & news from HeavyRent. Unsubscribe anytime.
                </span>
              </label>
            </div>

            {error && (
              <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ color: '#E53935', fontSize: 13 }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 10,
                background: loading ? '#FFAD33' : '#FF8C00',
                color: '#fff', fontWeight: 800, fontSize: 15, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s',
              }}
            >
              {loading ? (
                <><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> Creating Account...</>
              ) : (
                <>Accept & Register <ArrowRight size={16} strokeWidth={2} /></>
              )}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
          Phone verified: {user?.phone || '—'}
        </p>
      </div>
    </div>
  );
}
