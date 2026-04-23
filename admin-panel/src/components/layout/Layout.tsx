import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/machines': 'Machines',
  '/bookings': 'Bookings',
  '/estimates': 'Estimates',
  '/notifications': 'Notifications',
  '/categories': 'Categories',
  '/service-areas': 'Service Areas',
  '/coupons': 'Coupons',
  '/analytics': 'Analytics',
  '/reported-machines': 'Reported Machines',
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/vendor-earnings/') ? 'Vendor Earnings' : 'HeavyRent Admin');
  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>
      <Sidebar collapsed={collapsed} />
      <div style={{
        flex: 1,
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <Header onToggleSidebar={() => setCollapsed(c => !c)} title={title} />
        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
