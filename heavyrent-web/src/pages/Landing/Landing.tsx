import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Users, Truck, Star, MapPin, Shield, ChevronRight, CheckCircle } from 'lucide-react';

const STATS = [
  { value: '500+', label: 'Machines Listed' },
  { value: '1,200+', label: 'Successful Bookings' },
  { value: '120+', label: 'Verified Vendors' },
  { value: '28', label: 'Cities Covered' },
];

const CATEGORIES = [
  { icon: '🚜', name: 'JCB' }, { icon: '⛏️', name: 'Excavator' },
  { icon: '🏗️', name: 'Crane' }, { icon: '🚧', name: 'Bulldozer' },
  { icon: '🛞', name: 'Roller' }, { icon: '🛣️', name: 'Pokelane' },
];

export default function Landing() {
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const handleRole = (role: 'customer' | 'vendor') => {
    setRole(role);
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#1A1A2E', borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#FF8C00', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={18} color="#fff" strokeWidth={1.5} />
          </div>
          <div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>Heavy</span>
            <span style={{ color: '#FF8C00', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>Rent</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => handleRole('customer')} style={{
            padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >Login</button>
          <button onClick={() => handleRole('vendor')} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: '#FF8C00', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
          >Become a Vendor</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #252545 60%, #1A1A2E 100%)',
        padding: '80px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,140,0,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,140,0,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,140,0,0.15)', border: '1px solid rgba(255,140,0,0.3)',
            borderRadius: 20, padding: '4px 14px', marginBottom: 28,
          }}>
            <Star size={12} color="#FF8C00" strokeWidth={2} fill="#FF8C00" />
            <span style={{ color: '#FFAD33', fontSize: 12, fontWeight: 600 }}>India's #1 Heavy Equipment Rental Platform</span>
          </div>

          <h1 style={{ color: '#fff', fontSize: 52, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 20 }}>
            Rent Heavy Equipment<br />
            <span style={{ color: '#FF8C00' }}>Near You, Instantly</span>
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: 18, lineHeight: 1.7, marginBottom: 48, maxWidth: 540, margin: '0 auto 48px' }}>
            Connect with verified vendors for JCBs, Excavators, Cranes and more. Smart pricing, live tracking, and zero hassle.
          </p>

          {/* Role Selection Cards */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>

            {/* Customer Card */}
            <div
              onClick={() => handleRole('customer')}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: 16,
                padding: '32px 36px',
                width: 280,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'rgba(255,140,0,0.1)';
                el.style.borderColor = '#FF8C00';
                el.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'rgba(255,255,255,0.04)';
                el.style.borderColor = 'rgba(255,255,255,0.12)';
                el.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'rgba(255,140,0,0.15)', border: '1px solid rgba(255,140,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: 28,
              }}>👷</div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>I'm a Customer</div>
              <div style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                Find and book heavy equipment for your construction, farming, or infrastructure project.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                {['Search 500+ machines', 'Smart AI Estimate', 'Live vehicle tracking'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={13} color="#43A047" strokeWidth={2} />
                    <span style={{ color: '#9CA3AF', fontSize: 12 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button style={{
                marginTop: 20, width: '100%', padding: '10px 0', borderRadius: 10,
                background: '#FF8C00', color: '#fff', fontWeight: 700, fontSize: 14,
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                Get Started <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>

            {/* Vendor Card */}
            <div
              onClick={() => handleRole('vendor')}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: 16,
                padding: '32px 36px',
                width: 280,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'rgba(255,140,0,0.1)';
                el.style.borderColor = '#FF8C00';
                el.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'rgba(255,255,255,0.04)';
                el.style.borderColor = 'rgba(255,255,255,0.12)';
                el.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'rgba(255,140,0,0.15)', border: '1px solid rgba(255,140,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: 28,
              }}>🏭</div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>I'm a Vendor</div>
              <div style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                List your heavy equipment and earn money by renting to contractors and builders near you.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                {['List machines for free', 'Manage all bookings', 'Track your earnings'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={13} color="#43A047" strokeWidth={2} />
                    <span style={{ color: '#9CA3AF', fontSize: 12 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button style={{
                marginTop: 20, width: '100%', padding: '10px 0', borderRadius: 10,
                background: '#1A1A2E', border: '1px solid #FF8C00', color: '#FF8C00', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                Join as Vendor <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#FF8C00', padding: '32px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ color: '#fff', fontSize: 32, fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ background: '#fff', padding: '64px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#1A1D26', letterSpacing: '-0.02em' }}>Equipment Categories</h2>
            <p style={{ color: '#6B7280', marginTop: 8 }}>Find the right machine for every job</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
            {CATEGORIES.map(c => (
              <div key={c.name} onClick={() => handleRole('customer')} style={{
                textAlign: 'center', padding: '24px 12px', borderRadius: 12,
                border: '1px solid #E5E7EB', background: '#FAFAFA', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#FF8C00'; el.style.background = '#FFF3E0'; el.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#E5E7EB'; el.style.background = '#FAFAFA'; el.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ background: '#F5F5F5', padding: '64px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#1A1D26', letterSpacing: '-0.02em' }}>Why Choose HeavyRent?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: Shield, title: 'Verified Vendors', desc: 'Every vendor and machine is verified by our team before listing.' },
              { icon: MapPin, title: 'Live Tracking', desc: 'Track your rented machine in real-time from dispatch to job site.' },
              { icon: Users, title: 'Smart Estimates', desc: 'AI-powered estimates based on your work type, area, and soil condition.' },
              { icon: Truck, title: '500+ Machines', desc: 'Huge inventory across 28 cities — JCB, Excavator, Crane and more.' },
              { icon: Star, title: 'Rated Operators', desc: 'All operators are rated by customers for quality and professionalism.' },
              { icon: Wrench, title: '24/7 Support', desc: 'Round-the-clock customer support via phone, chat, and WhatsApp.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E5E7EB' }}>
                <div style={{ width: 44, height: 44, background: '#FFF3E0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={20} color="#FF8C00" strokeWidth={1.5} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26', marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#1A1A2E', padding: '64px 40px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
          Ready to Get Started?
        </h2>
        <p style={{ color: '#6B7280', fontSize: 16, marginBottom: 32 }}>Join 1,200+ contractors already using HeavyRent</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => handleRole('customer')} style={{
            padding: '14px 32px', borderRadius: 10, background: '#FF8C00', color: '#fff',
            fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
          }}>Book Equipment Now</button>
          <button onClick={() => handleRole('vendor')} style={{
            padding: '14px 32px', borderRadius: 10, background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
            fontWeight: 600, fontSize: 15, cursor: 'pointer',
          }}>List Your Machine</button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#111827', padding: '20px 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ color: '#4B5563', fontSize: 13 }}>© 2025 HeavyRent · Vibe6 Digital LLP · All rights reserved</span>
      </div>
    </div>
  );
}
