import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Truck, CalendarCheck,
  Tags, MapPin, ClipboardList, LogOut, Wrench, Ticket, BarChart2, Bell
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/machines', icon: Truck, label: 'Machines' },
  { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/estimates', icon: ClipboardList, label: 'Estimates' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/service-areas', icon: MapPin, label: 'Service Areas' },
  { to: '/coupons', icon: Ticket, label: 'Coupons' },
];

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      minHeight: '100vh',
      background: '#1A1A2E',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
      overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 34,
          height: 34,
          background: '#FF8C00',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Wrench size={18} color="#fff" strokeWidth={1.5} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>HeavyRent</div>
            <div style={{ color: '#FF8C00', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Panel</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 8,
              marginBottom: 2,
              color: isActive ? '#FF8C00' : '#9CA3AF',
              background: isActive ? 'rgba(255, 140, 0, 0.12)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            })}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              if (!el.classList.contains('active')) {
                el.style.background = 'rgba(255,255,255,0.06)';
                el.style.color = '#fff';
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              if (!el.classList.contains('active')) {
                el.style.background = 'transparent';
                el.style.color = '#9CA3AF';
              }
            }}
          >
            <Icon size={18} strokeWidth={1.5} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: collapsed ? '16px 8px' : '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '8px 0' : '8px 12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          marginBottom: 8,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.04)',
        }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: '#FF8C00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 12,
            flexShrink: 0,
          }}>S</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>Suryaprakash</div>
              <div style={{ color: '#6B7280', fontSize: 11 }}>Administrator</div>
            </div>
          )}
        </div>
        <button style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: collapsed ? '8px 0' : '8px 12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 8,
          background: 'transparent',
          color: '#6B7280',
          fontSize: 13,
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(229,57,53,0.1)'; (e.currentTarget as HTMLElement).style.color = '#E53935'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280'; }}
        >
          <LogOut size={16} strokeWidth={1.5} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
