import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Home, Search, CalendarCheck, ClipboardList, Bell, User, LogOut, ChevronDown, X } from 'lucide-react';
import { mockCustomerNotifications } from '../../data/mockData';

const NAV = [
  { to: '/customer/home', icon: Home, label: 'Home' },
  { to: '/customer/search', icon: Search, label: 'Search' },
  { to: '/customer/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/customer/estimates', icon: ClipboardList, label: 'Estimates' },
];

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const unread = mockCustomerNotifications.filter(n => !n.isRead).length;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      {/* Top Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#fff', borderBottom: '1px solid #E5E7EB',
        padding: '0 32px', height: 62,
        display: 'flex', alignItems: 'center', gap: 32,
      }}>
        {/* Logo */}
        <NavLink to="/customer/home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: '#1A1A2E', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={14} color="#FF8C00" strokeWidth={1.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#1A1D26' }}>Heavy<span style={{ color: '#FF8C00' }}>Rent</span></span>
        </NavLink>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              color: isActive ? '#FF8C00' : '#6B7280',
              background: isActive ? '#FFF3E0' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            })}>
              <Icon size={15} strokeWidth={1.5} />{label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowNotif(v => !v); setShowProfile(false); }} style={{
              position: 'relative', background: 'none', border: 'none',
              color: '#6B7280', padding: 8, borderRadius: 8, display: 'flex',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
            >
              <Bell size={18} strokeWidth={1.5} />
              {unread > 0 && <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, background: '#FF8C00', borderRadius: '50%', border: '2px solid #fff' }} />}
            </button>

            {showNotif && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 8,
                width: 340, background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200,
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#1A1D26' }}>Notifications</span>
                  <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex' }}><X size={14} strokeWidth={2} /></button>
                </div>
                {mockCustomerNotifications.slice(0, 4).map(n => (
                  <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #F9FAFB', background: n.isRead ? '#fff' : '#FFFBF0' }}>
                    <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 700, color: '#1A1D26', marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{n.body}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{n.createdAt}</div>
                  </div>
                ))}
                <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                  <NavLink to="/customer/notifications" onClick={() => setShowNotif(false)} style={{ color: '#FF8C00', fontSize: 13, fontWeight: 600 }}>View all notifications</NavLink>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowProfile(v => !v); setShowNotif(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 8, background: 'none', border: 'none',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FF8C00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                {user?.name.charAt(0)}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26', lineHeight: 1.2 }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>Customer</div>
              </div>
              <ChevronDown size={14} color="#9CA3AF" strokeWidth={2} />
            </button>

            {showProfile && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 200, background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
                <NavLink to="/customer/profile" onClick={() => setShowProfile(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: '#1A1D26', fontSize: 14, textDecoration: 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                >
                  <User size={14} strokeWidth={1.5} /> My Profile
                </NavLink>
                <div style={{ borderTop: '1px solid #F3F4F6' }} />
                <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: '#E53935', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFEBEE'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                >
                  <LogOut size={14} strokeWidth={1.5} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        <Outlet />
      </main>
    </div>
  );
}
