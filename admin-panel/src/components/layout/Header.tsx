import { Menu, Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
}

export default function Header({ onToggleSidebar, title }: HeaderProps) {
  const { admin, logout } = useAuth();
  return (
    <header style={{
      height: 60,
      background: '#fff',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <button
        onClick={onToggleSidebar}
        style={{
          background: 'none',
          border: 'none',
          color: '#6B7280',
          display: 'flex',
          alignItems: 'center',
          padding: 6,
          borderRadius: 6,
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
      >
        <Menu size={20} strokeWidth={1.5} />
      </button>

      <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1A1D26', flex: 1 }}>{title}</h1>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#F5F5F5',
        borderRadius: 8,
        padding: '6px 12px',
        border: '1px solid #E5E7EB',
        width: 220,
      }}>
        <Search size={14} color="#9CA3AF" strokeWidth={1.5} />
        <input
          placeholder="Search..."
          style={{
            border: 'none',
            background: 'none',
            fontSize: 13,
            color: '#1A1D26',
            width: '100%',
          }}
        />
      </div>

      <button style={{
        position: 'relative',
        background: 'none',
        border: 'none',
        color: '#6B7280',
        display: 'flex',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
      >
        <Bell size={18} strokeWidth={1.5} />
        <span style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 7,
          height: 7,
          background: '#FF8C00',
          borderRadius: '50%',
          border: '1.5px solid #fff',
        }} />
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 8px',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#1A1A2E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#FF8C00', fontWeight: 700, fontSize: 13,
        }}>
          {(admin?.name || admin?.phone || 'A').charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1D26', lineHeight: 1.2 }}>
            {admin?.name || 'Admin'}
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>Admin</div>
        </div>
      </div>

      <button
        onClick={logout}
        title="Sign out"
        style={{
          background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer',
          padding: 8, borderRadius: 8, display: 'flex', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEE2E2'; (e.currentTarget as HTMLElement).style.color = '#E53935'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; }}
      >
        <LogOut size={18} strokeWidth={1.5} />
      </button>
    </header>
  );
}
