import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, AlertTriangle } from 'lucide-react';
import { mockCustomerBookings, MACHINE_ICONS } from '../../../data/mockData';

export default function LiveTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const booking = mockCustomerBookings.find(b => b.id === id);
  const [progress, setProgress] = useState(35);
  const [arrived, setArrived] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(t); setArrived(true); return 100; }
        return p + 1;
      });
    }, 300);
    return () => clearInterval(t);
  }, []);

  if (!booking) return null;

  const eta = Math.max(0, Math.round((100 - progress) * 0.4));
  const dist = ((100 - progress) * 0.12).toFixed(1);

  const routePoints = 'M 60,260 C 100,220 140,200 180,180 C 220,160 260,150 300,140 C 340,130 380,120 400,80';

  const handleSOS = () => {
    setSosActive(true);
    // In production: call emergency API + open native dialer
    window.open('tel:100', '_self');
  };

  return (
    <div className="fade-in">
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: 20, fontSize: 14 }}>
        <ArrowLeft size={16} strokeWidth={2} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Map */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#43A047', boxShadow: '0 0 0 3px rgba(67,160,71,0.2)' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>Live Vehicle Tracking</span>
            </div>
            {arrived && <span style={{ background: '#E8F5E9', color: '#43A047', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>Arrived!</span>}
          </div>

          {/* SVG Map Canvas */}
          <div style={{ position: 'relative', background: '#F8FAFC' }}>
            <svg viewBox="0 0 480 320" style={{ width: '100%', height: 320 }}>
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="480" height="320" fill="url(#grid)" />
              <path d="M 0,160 L 480,160" stroke="#CBD5E1" strokeWidth="3" />
              <path d="M 240,0 L 240,320" stroke="#CBD5E1" strokeWidth="3" />
              <path d="M 0,80 L 480,80" stroke="#E2E8F0" strokeWidth="2" />
              <path d="M 0,240 L 480,240" stroke="#E2E8F0" strokeWidth="2" />
              <path d={routePoints} fill="none" stroke="#BFDBFE" strokeWidth="4" strokeLinecap="round" />
              <path d={routePoints} fill="none" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round"
                strokeDasharray="340" strokeDashoffset={340 - (340 * progress / 100)} />
              <circle cx="400" cy="80" r="12" fill="#FFEBEE" stroke="#E53935" strokeWidth="2" />
              <text x="400" y="85" textAnchor="middle" fontSize="12">🏗️</text>
              <text x="400" y="60" textAnchor="middle" fontSize="10" fill="#E53935" fontWeight="700">Work Site</text>
              <circle cx="60" cy="260" r="10" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
              <text x="60" y="265" textAnchor="middle" fontSize="10">🏭</text>
              <text x="60" y="282" textAnchor="middle" fontSize="9" fill="#3B82F6" fontWeight="700">Vendor</text>
              {!arrived && (
                <>
                  <circle cx={60 + (340 * progress / 100)} cy={260 - (180 * progress / 100)} r="16" fill="none" stroke="#FF8C00" strokeWidth="1" opacity="0.4">
                    <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={60 + (340 * progress / 100)} cy={260 - (180 * progress / 100)} r="12" fill="#FF8C00" stroke="#fff" strokeWidth="2" />
                  <text x={60 + (340 * progress / 100)} y={260 - (180 * progress / 100) + 5} textAnchor="middle" fontSize="12">🚜</text>
                </>
              )}
              {arrived && (
                <>
                  <circle cx="400" cy="80" r="18" fill="#E8F5E9" stroke="#43A047" strokeWidth="2" />
                  <text x="400" y="86" textAnchor="middle" fontSize="16">✅</text>
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Info Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Machine */}
          <div style={{ background: '#1A1A2E', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,140,0,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {MACHINE_ICONS[booking.machineCategory]}
              </div>
              <div>
                <div style={{ color: '#FF8C00', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{booking.machineCategory}</div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{booking.machineModel}</div>
              </div>
            </div>
            <a href={`tel:${booking.vendorPhone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              <Phone size={13} strokeWidth={1.5} /> Call Vendor
            </a>
          </div>

          {/* ETA Stats */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '16px' }}>
            {[
              { icon: '⏱️', label: 'ETA', value: arrived ? 'Arrived!' : `${eta} min`, color: arrived ? '#43A047' : '#3B82F6' },
              { icon: '📍', label: 'Distance', value: arrived ? '0.0 km' : `${dist} km`, color: '#FF8C00' },
              { icon: '🔄', label: 'Status', value: arrived ? 'Arrived' : 'En Route', color: arrived ? '#43A047' : '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{s.label}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>Trip Progress</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#FF8C00' }}>{progress}%</span>
            </div>
            <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: arrived ? '#43A047' : '#FF8C00', borderRadius: 4, transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Vendor</span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Work Site</span>
            </div>
          </div>

          {/* Work Location */}
          <div style={{ background: '#F5F5F5', borderRadius: 14, border: '1px solid #E5E7EB', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Delivery Address</div>
            <div style={{ fontSize: 13, color: '#1A1D26', fontWeight: 600 }}>{booking.workLocation}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{booking.workCity}</div>
          </div>

          {/* Emergency SOS */}
          <button
            onClick={handleSOS}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: 14,
              border: 'none', transition: 'all 0.15s',
              background: sosActive ? '#B71C1C' : '#E53935',
              color: '#fff',
              boxShadow: sosActive ? '0 0 0 4px rgba(229,57,53,0.25)' : 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#C62828'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = sosActive ? '#B71C1C' : '#E53935'; }}
            aria-label="Emergency SOS — call police"
          >
            <AlertTriangle size={18} strokeWidth={2} />
            {sosActive ? 'SOS Activated — Calling...' : 'Emergency SOS'}
          </button>
          <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: -8 }}>Calls Police (100) + Customer Care</p>
        </div>
      </div>
    </div>
  );
}
