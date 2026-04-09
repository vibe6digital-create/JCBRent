import { IndianRupee, TrendingUp, Calendar, Star } from 'lucide-react';
import { mockVendorBookings, MACHINE_ICONS, VENDOR_EARNINGS } from '../../../data/mockData';

export default function VendorEarnings() {
  const completedBookings = mockVendorBookings.filter(b => b.status === 'completed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-in">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26' }}>Earnings</h1>
        <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Track your revenue and completed work</p>
      </div>

      {/* Total Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #FF8C00 0%, #1A1A2E 100%)',
        borderRadius: 16, padding: '28px 32px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Total Lifetime Earnings</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <IndianRupee size={28} color="#fff" strokeWidth={1.5} />
            <span style={{ color: '#fff', fontSize: 42, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {VENDOR_EARNINGS.total.toLocaleString('en-IN')}
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
            From {VENDOR_EARNINGS.completedCount} completed bookings
          </div>
        </div>
      </div>

      {/* Period Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { icon: Calendar, label: 'Today', value: VENDOR_EARNINGS.today, color: '#43A047', bg: '#E8F5E9' },
          { icon: TrendingUp, label: 'This Week', value: VENDOR_EARNINGS.thisWeek, color: '#3B82F6', bg: '#EFF6FF' },
          { icon: IndianRupee, label: 'This Month', value: VENDOR_EARNINGS.thisMonth, color: '#FF8C00', bg: '#FFF3E0' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 22px' }}>
            <div style={{ width: 42, height: 42, background: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <s.icon size={20} color={s.color} strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1A1D26', marginBottom: 4 }}>
              {s.value > 0 ? `₹${s.value.toLocaleString('en-IN')}` : '—'}
            </div>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Completed Bookings */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Completed Bookings</h2>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>{completedBookings.length} bookings</span>
        </div>
        {completedBookings.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>💰</div>
            No completed bookings yet
          </div>
        ) : completedBookings.map((b, i) => (
          <div key={b.id} style={{
            padding: '16px 20px',
            borderBottom: i < completedBookings.length - 1 ? '1px solid #F3F4F6' : 'none',
            display: 'flex', gap: 14, alignItems: 'center', transition: 'background 0.1s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
          >
            <div style={{ width: 42, height: 42, background: '#FFF3E0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {MACHINE_ICONS[b.machineCategory]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 2 }}>{b.customerName}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{b.machineModel} · {b.startDate} → {b.endDate}</div>
              {b.rating && (
                <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={11} color="#FF8C00" fill={s <= b.rating! ? '#FF8C00' : 'none'} strokeWidth={1.5} />
                  ))}
                  {b.review && <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 4, fontStyle: 'italic' }}>"{b.review.slice(0, 40)}..."</span>}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#43A047' }}>+₹{b.estimatedCost.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{b.endDate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
