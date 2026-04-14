import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { getNotifications, markNotificationRead } from '../../../services/api';
import type { Notification } from '../../../types';

const TYPE_CONFIG: Record<string, { bg: string; icon: string }> = {
  booking_request: { bg: '#FFF3E0', icon: '📋' },
  booking_completed: { bg: '#E8F5E9', icon: '🎉' },
  booking_approved: { bg: '#E8F5E9', icon: '✅' },
  booking_rejected: { bg: '#FFEBEE', icon: '❌' },
  general: { bg: '#F5F5F5', icon: '🔔' },
};

export default function VendorNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getNotifications()
      .then((res: any) => setNotifications(res.notifications || []))
      .catch((err: any) => setError(err.message || 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const unread = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    notifications.filter(n => !n.isRead).forEach(n => markNotificationRead(n.id).catch(() => {}));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    markNotificationRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: 40, color: '#E53935' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 16 }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={20} strokeWidth={1.5} color="#FF8C00" /> Notifications
          </h1>
          {unread > 0 && <p style={{ color: '#FF8C00', fontSize: 13, fontWeight: 600, marginTop: 4 }}>{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#F5F5F5', border: '1px solid #E5E7EB', color: '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Check size={13} strokeWidth={2} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D26', marginBottom: 6 }}>No notifications yet</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>We'll notify you about booking updates here</p>
        </div>
      ) : notifications.map(n => {
        const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
        return (
          <div key={n.id} onClick={() => markRead(n.id)}
            style={{
              background: n.isRead ? '#fff' : '#FFFDF5',
              borderRadius: 12, border: `1px solid ${n.isRead ? '#E5E7EB' : '#FDE68A'}`,
              padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            <div style={{ width: 42, height: 42, background: cfg.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {cfg.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: n.isRead ? 500 : 700, color: '#1A1D26', marginBottom: 4 }}>{n.title}</div>
                {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF8C00', flexShrink: 0, marginTop: 5 }} />}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, marginBottom: 6 }}>{n.body}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{n.createdAt}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
