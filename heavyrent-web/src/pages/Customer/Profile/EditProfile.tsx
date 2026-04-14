import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, User, Mail, MapPin, Building2, Check } from 'lucide-react';
import { updateProfile } from '../../../services/api';
import toast from 'react-hot-toast';
import type { ProfileType } from '../../../types';

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [profileType, setProfileType] = useState<ProfileType>(user?.profileType ?? 'personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setError('');
    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() || undefined, city: city.trim(), state: state.trim(), profileType });
      toast.success('Profile updated!');
      navigate('/customer/profile');
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
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: 10, background: '#FAFAFA', overflow: 'hidden' }}>
        <div style={{ padding: '11px 12px', borderRight: '1px solid #E5E7EB', background: '#F9FAFB' }}>
          <Icon size={15} color="#9CA3AF" strokeWidth={1.5} />
        </div>
        <input
          type={type}
          value={value}
          onChange={e => { onChange(e.target.value); setError(''); }}
          placeholder={placeholder}
          style={{ flex: 1, padding: '11px 14px', border: 'none', background: 'none', fontSize: 14, color: '#1A1D26', outline: 'none' }}
        />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }} className="fade-in">
      {/* Back */}
      <button onClick={() => navigate('/customer/profile')} style={{
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
          border: '4px solid #FFF3E0', boxShadow: '0 4px 16px rgba(255,140,0,0.25)',
        }}>
          {name.charAt(0) || user?.name?.charAt(0) || '?'}
        </div>
        <div style={{ fontSize: 13, color: '#9CA3AF' }}>Profile photo coming soon</div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1D26', marginBottom: 4 }}>Edit Profile</h2>

        <Field label="Full Name *" value={name} onChange={setName} placeholder="Your full name" icon={User} />
        <Field label="Email ID" value={email} onChange={setEmail} type="email" placeholder="your@email.com (optional)" icon={Mail} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="City" value={city} onChange={setCity} placeholder="Pune" icon={MapPin} />
          <Field label="State" value={state} onChange={setState} placeholder="Maharashtra" icon={MapPin} />
        </div>

        {/* Account Type */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Account Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {([
              { key: 'personal' as ProfileType, label: 'Personal', icon: User, desc: 'For individual use' },
              { key: 'corporate' as ProfileType, label: 'Corporate', icon: Building2, desc: 'For business use' },
            ]).map(({ key, label, icon: Icon, desc }) => (
              <button key={key} onClick={() => setProfileType(key)} style={{
                padding: '12px', borderRadius: 10,
                border: `2px solid ${profileType === key ? '#FF8C00' : '#E5E7EB'}`,
                background: profileType === key ? '#FFF3E0' : '#FAFAFA',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <Icon size={14} color={profileType === key ? '#E07B00' : '#6B7280'} strokeWidth={1.5} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: profileType === key ? '#E07B00' : '#1A1D26' }}>{label}</span>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ color: '#E53935', fontSize: 13 }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 10,
            background: loading ? '#FFAD33' : '#FF8C00',
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
