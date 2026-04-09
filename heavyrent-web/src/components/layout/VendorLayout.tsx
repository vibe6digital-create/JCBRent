import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, LayoutDashboard, Truck, CalendarCheck, IndianRupee, User, Bell, LogOut, Menu, X } from 'lucide-react';
import { mockVendorNotifications } from '../../data/mockData';

const NAV = [
  { to: '/vendor/home', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vendor/machines', icon: Truck, label: 'My Machines' },
  { to: '/vendor/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/vendor/earnings', icon: IndianRupee, label: 'Earnings' },
  { to: '/vendor/profile', icon: User, label: 'Profile' },
];

export default function VendorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const unread = mockVendorNotifications.filter(n => !n.isRead).length;
  const w = collapsed ? 64 : 230;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>
      {/* Sidebar */}
      <aside style={{ width: w, background: '#1A1A2E', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100, transition: 'width 0.2s ease', overflowX: 'hidden' }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 0' : '22px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: 34, height: 34, background: '#FF8C00', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Wrench size={16} color="#fff" strokeWidth={1.5} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>HeavyRent</div>
              <div style={{ color: '#FF8C00', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vendor Portal</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/vendor/home'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8, marginBottom: 2, textDecoration: 'none',
                color: isActive ? '#FF8C00' : '#9CA3AF',
                background: isActive ? 'rgba(255,140,0,0.12)' : 'transparent',
                fontWeight: isActive ? 700 : 400, fontSize: 14, whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              })}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; if (!el.style.color.includes('140')) { el.style.color = '#fff'; el.style.background = 'rgba(255,255,255,0.06)'; } }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; if (!el.style.color.includes('140')) { el.style.color = '#9CA3AF'; el.style.background = 'transparent'; } }}
            >
              <Icon size={18} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: collapsed ? '14px 8px' : '14px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '8px 0' : '8px 10px', justifyContent: collapsed ? 'center' : 'flex-start', marginBottom: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#FF8C00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
              {user?.name.charAt(0)}
            </div>
            {!collapsed && (
              <div>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{user?.name}</div>
                <div style={{ color: '#6B7280', fontSize: 10 }}>Verified Vendor</div>
              </div>
            )}
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: collapsed ? '8px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', borderRadius: 8, transition: 'all 0.15s',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(229,57,53,0.1)'; el.style.color = '#E53935'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'none'; el.style.color = '#6B7280'; }}
          >
            <LogOut size={15} strokeWidth={1.5} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, marginLeft: w, transition: 'margin-left 0.2s ease', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ height: 58, background: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: 'none', color: '#6B7280', display: 'flex', cursor: 'pointer', padding: 6, borderRadius: 6, transition: 'background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
          >
            {collapsed ? <Menu size={18} strokeWidth={1.5} /> : <X size={18} strokeWidth={1.5} />}
          </button>
          <div style={{ flex: 1 }} />
          <NavLink to="/vendor/notifications" style={{ position: 'relative', display: 'flex', padding: 8, borderRadius: 8, color: '#6B7280', textDecoration: 'none', transition: 'background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
          >
            <Bell size={18} strokeWidth={1.5} />
            {unread > 0 && <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, background: '#FF8C00', borderRadius: '50%', border: '2px solid #fff' }} />}
          </NavLink>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF8C00', fontWeight: 800, fontSize: 13 }}>
              {user?.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>Vendor</div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
