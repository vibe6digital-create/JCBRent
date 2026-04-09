import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Clock, IndianRupee, Zap, Star, CheckCircle } from 'lucide-react';
import { mockMachines, MACHINE_ICONS } from '../../../data/mockData';
import Badge from '../../../components/common/Badge';

export default function MachineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const machine = mockMachines.find(m => m.id === id);

  if (!machine) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
      <h2 style={{ color: '#1A1D26' }}>Machine not found</h2>
      <button onClick={() => navigate('/customer/search')} style={{ marginTop: 16, padding: '10px 24px', background: '#FF8C00', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Back to Search</button>
    </div>
  );

  return (
    <div className="fade-in">
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: 20, fontSize: 14 }}>
        <ArrowLeft size={16} strokeWidth={2} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Hero Card */}
          <div style={{ background: '#1A1A2E', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '32px 32px 0', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 80, height: 80, background: 'rgba(255,140,0,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, flexShrink: 0 }}>
                {MACHINE_ICONS[machine.category]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#FF8C00', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{machine.category}</div>
                    <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>{machine.model}</h1>
                  </div>
                  <Badge status={machine.isAvailable ? 'available' : 'unavailable'} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF', fontSize: 14 }}>
                  <MapPin size={14} strokeWidth={1.5} />
                  {machine.location.city}, {machine.location.state}
                </div>
              </div>
            </div>
            {/* Rate Banners */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, margin: '24px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ padding: '18px 32px', background: 'rgba(255,140,0,0.1)' }}>
                <div style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hourly Rate</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} color="#FF8C00" strokeWidth={1.5} />
                  <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>₹{machine.hourlyRate.toLocaleString('en-IN')}</span>
                  <span style={{ color: '#6B7280', fontSize: 13 }}>/hr</span>
                </div>
              </div>
              <div style={{ padding: '18px 32px', background: 'rgba(255,140,0,0.06)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daily Rate</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IndianRupee size={14} color="#FF8C00" strokeWidth={1.5} />
                  <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>{machine.dailyRate.toLocaleString('en-IN')}</span>
                  <span style={{ color: '#6B7280', fontSize: 13 }}>/day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26', marginBottom: 10 }}>About this Machine</h3>
            <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.8 }}>{machine.description}</p>
          </div>

          {/* Service Areas */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26', marginBottom: 12 }}>Service Areas</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {machine.serviceAreas.map(a => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F5F5F5', borderRadius: 20, padding: '4px 12px', border: '1px solid #E5E7EB' }}>
                  <MapPin size={11} color="#FF8C00" strokeWidth={1.5} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D26' }}>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Estimate CTA */}
          <div onClick={() => navigate('/customer/estimate')}
            style={{ background: 'linear-gradient(135deg, #FF8C00, #FFAD33)', borderRadius: 14, padding: '18px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'opacity 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Not sure about the cost?</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Get a Smart Estimate for your specific work</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 14px' }}>
              <Zap size={14} color="#fff" strokeWidth={2} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Estimate</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>
          {/* Vendor Card */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 22px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 14 }}>Vendor Details</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF8C00', fontWeight: 800, fontSize: 18 }}>
                {machine.vendorName.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1D26' }}>{machine.vendorName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  <CheckCircle size={11} color="#43A047" strokeWidth={2} />
                  Verified Vendor
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={13} color="#FF8C00" fill="#FF8C00" strokeWidth={0} />)}
              <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 4 }}>4.8 (24 reviews)</span>
            </div>
            <a href={`tel:${machine.vendorPhone}`} style={{
              display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
              padding: '10px', borderRadius: 8, marginTop: 14,
              background: 'transparent', border: '1.5px solid #1A1A2E', color: '#1A1D26',
              fontWeight: 700, fontSize: 13, textDecoration: 'none', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1A1A2E'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#1A1D26'; }}
            >
              <Phone size={14} strokeWidth={1.5} /> Call Vendor
            </a>
          </div>

          {/* Book Now */}
          {machine.isAvailable ? (
            <button onClick={() => navigate(`/customer/book/${machine.id}`)} style={{
              width: '100%', padding: '16px', borderRadius: 12, background: '#FF8C00',
              color: '#fff', fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
            >
              📋 Book Now
            </button>
          ) : (
            <div style={{ background: '#F3F4F6', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ color: '#E53935', fontWeight: 700, fontSize: 14 }}>Currently Unavailable</div>
              <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Check back later or browse similar machines</div>
            </div>
          )}

          {/* Quick Info */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '16px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Quick Info</div>
            {[
              { label: 'Category', value: machine.category },
              { label: 'Location', value: `${machine.location.city}, ${machine.location.state}` },
              { label: 'Listed', value: machine.createdAt },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ color: '#9CA3AF' }}>{label}</span>
                <span style={{ color: '#1A1D26', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
