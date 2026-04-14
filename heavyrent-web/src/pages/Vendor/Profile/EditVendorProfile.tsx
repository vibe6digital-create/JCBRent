import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, User, Mail, MapPin, Truck, Check } from 'lucide-react';
import { updateProfile } from '../../../services/api';
import toast from 'react-hot-toast';

export default function EditVendorProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setError('');
    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
      });
      toast.success('Profile updated!');
      navigate('/vendor/profile');
    } catch (e: any) {
      setError(e.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value, onChange, type = 'text', placeholder = '', icon: Icon }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; icon: React.ElementType;
  }) => (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#9CA3AF', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '11px 12px', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <Icon size={15} color="#6B7280" strokeWidth={1.5} />
        </div>
        <input
          type={type}
          value={value}
          onChange={e => { onChange(e.target.value); setError(''); }}
          placeholder={placeholder}
          style={{ flex: 1, padding: '11px 14px', border: 'none', background: 'none', fontSize: 14, color: '#fff', outline: 'none' }}
        />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }} className="fade-in">
      <button onClick={() => navigate('/vendor/profile')} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: '#6B7280', cursor: 'pointer', marginBottom: 20, fontSize: 14, padding: 0,
      }}>
        <ArrowLeft size={16} strokeWidth={2} /> Back to Profile
      </button>

      {/* Avatar */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF8C00, #FFAD33)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 32, margin: '0 auto 12px',
          border: '4px solid rgba(255,140,0,0.2)', boxShadow: '0 4px 20px rgba(255,140,0,0.3)',
        }}>
          {name.charAt(0) || user?.name?.charAt(0) || '?'}
        </div>
        <div style={{ fontSize: 13, color: '#6B7280' }}>Profile photo coming soon</div>
      </div>

      {/* Form */}
      <div style={{ background: '#1A1A2E', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Edit Profile</h2>

        <Field label="Full Name *" value={name} onChange={setName} placeholder="Your full name" icon={User} />
        <Field label="Email ID" value={email} onChange={setEmail} type="email" placeholder="your@email.com (optional)" icon={Mail} />
        <Field label="Business Name" value={businessName} onChange={setBusinessName} placeholder="e.g. Singh Heavy Equipment Co." icon={Truck} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="City" value={city} onChange={setCity} placeholder="Pune" icon={MapPin} />
          <Field label="State" value={state} onChange={setState} placeholder="Maharashtra" icon={MapPin} />
        </div>

        {/* Phone (read-only) */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#9CA3AF', marginBottom: 6 }}>Mobile (cannot change)</label>
          <div style={{ padding: '11px 14px', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 10, background: 'rgba(255,255,255,0.03)', fontSize: 14, color: '#6B7280' }}>
            {user?.phone || '—'}
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ color: '#EF9A9A', fontSize: 13 }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 10,
            background: loading ? '#E07B00' : '#FF8C00',
            color: '#fff', fontWeight: 800, fontSize: 15, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
          onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
        >
          {loading
            ? <><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> Saving...</>
            : <><Check size={16} strokeWidth={2.5} /> Save Changes</>
          }
        </button>
      </div>
    </div>
  );
}
