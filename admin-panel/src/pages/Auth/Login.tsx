import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { loginWithEmail, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Enter email and password'); return; }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#F3F4F6',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '48px 40px',
        width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, background: '#FF8C00',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <Shield size={28} color="#fff" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1D26', margin: 0 }}>HeavyRent Admin</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>Sign in with your admin credentials</p>
        </div>

        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Email
          </label>
          <div style={{
            display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB',
            borderRadius: 10, overflow: 'hidden', marginBottom: 16,
          }}>
            <span style={{ padding: '12px 14px', background: '#F9FAFB', borderRight: '1.5px solid #E5E7EB' }}>
              <Mail size={16} color="#9CA3AF" strokeWidth={1.5} />
            </span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@heavyrent.com"
              autoFocus
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '12px 16px', fontSize: 15, color: '#1A1D26',
              }}
            />
          </div>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Password
          </label>
          <div style={{
            display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB',
            borderRadius: 10, overflow: 'hidden', marginBottom: 28,
          }}>
            <span style={{ padding: '12px 14px', background: '#F9FAFB', borderRight: '1.5px solid #E5E7EB' }}>
              <Lock size={16} color="#9CA3AF" strokeWidth={1.5} />
            </span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
