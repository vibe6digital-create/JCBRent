import { useState, useEffect } from 'react';
import { Send, Users, Truck, User, Globe, Clock, CheckCircle, Bell } from 'lucide-react';
import { broadcastNotification, getBroadcastHistory } from '../../services/api';
import toast from 'react-hot-toast';

type Target = 'all' | 'customers' | 'vendors' | 'user';

interface Broadcast {
  id: string;
  title: string;
  body: string;
  target: Target;
  targetUserId?: string;
  recipientCount: number;
  createdAt: string;
}

const TARGET_OPTIONS: { value: Target; label: string; icon: typeof Globe; desc: string }[] = [
  { value: 'all',       label: 'Everyone',   icon: Globe,  desc: 'All customers + vendors' },
  { value: 'customers', label: 'Customers',  icon: Users,  desc: 'All customer accounts' },
  { value: 'vendors',   label: 'Vendors',    icon: Truck,  desc: 'All vendor accounts' },
  { value: 'user',      label: 'One User',   icon: User,   desc: 'Single user by phone/UID' },
];

const targetColor: Record<Target, { bg: string; color: string; border: string }> = {
  all:       { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  customers: { bg: '#F0FDF4', color: '#16A34A', border: '#86EFAC' },
  vendors:   { bg: '#FFF7ED', color: '#C2410C', border: '#FDBA74' },
  user:      { bg: '#F5F3FF', color: '#7C3AED', border: '#C4B5FD' },
};

export default function Notifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<Target>('all');
  const [userId, setUserId] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<Broadcast[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const res: any = await getBroadcastHistory();
      setHistory(res.broadcasts || []);
    } catch {
      // non-fatal
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const handleSend = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!body.trim())  { toast.error('Message is required'); return; }
    if (target === 'user' && !userId.trim()) { toast.error('User phone or UID is required'); return; }

    setSending(true);
    try {
      const res: any = await broadcastNotification({
        title: title.trim(),
        body: body.trim(),
        target,
        ...(target === 'user' ? { userId: userId.trim() } : {}),
      });
      toast.success(`Sent to ${res.recipientCount} recipient${res.recipientCount !== 1 ? 's' : ''}`);
      setTitle('');
      setBody('');
      setUserId('');
      loadHistory();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Compose */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{ width: 32, height: 32, background: '#FFF3E0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={16} color="#FF8C00" strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>Broadcast Notification</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Send push + in-app notification to a target group</div>
          </div>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Target selector */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Send To
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              {TARGET_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const selected = target === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTarget(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: `1.5px solid ${selected ? '#FF8C00' : '#E5E7EB'}`,
                      background: selected ? '#FFF3E0' : '#FAFAFA',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                      background: selected ? '#FF8C00' : '#F3F4F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} color={selected ? '#fff' : '#9CA3AF'} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: selected ? '#FF8C00' : '#1A1D26' }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User ID field — only for 'user' target */}
          {target === 'user' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                User UID
              </label>
              <input
                value={userId}
                onChange={e => setUserId(e.target.value)}
                placeholder="Paste the user UID from Users table"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  fontSize: 13,
                  color: '#1A1D26',
                  background: '#FAFAFA',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Title
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. New machines available near you!"
              maxLength={100}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                fontSize: 13,
                color: '#1A1D26',
                background: '#FAFAFA',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, textAlign: 'right' }}>{title.length}/100</div>
          </div>

          {/* Body */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Message
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your notification message here..."
              maxLength={300}
              rows={4}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                fontSize: 13,
                color: '#1A1D26',
                background: '#FAFAFA',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, textAlign: 'right' }}>{body.length}/300</div>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              padding: 14,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: '#FF8C00',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Bell size={18} color="#fff" strokeWidth={1.5} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Push Preview</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>{title || 'Notification Title'}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{body || 'Message body...'}</div>
              </div>
            </div>
          )}

          {/* Send button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: sending ? '#E5E7EB' : '#FF8C00',
                color: sending ? '#9CA3AF' : '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: sending ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {sending ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid #9CA3AF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={14} strokeWidth={1.5} />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>Broadcast History</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{history.length} total</span>
        </div>

        {historyLoading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #E5E7EB', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            No notifications sent yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                  {['Title & Message', 'Target', 'Recipients', 'Sent At'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((b, i) => {
                  const tc = targetColor[b.target];
                  return (
                    <tr
                      key={b.id}
                      style={{ borderBottom: i < history.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                    >
                      <td style={{ padding: '14px 16px', maxWidth: 340 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1D26', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.body}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 8px', borderRadius: 20,
                          background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                          fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                        }}>
                          {b.target === 'all' && <Globe size={11} strokeWidth={1.5} />}
                          {b.target === 'customers' && <Users size={11} strokeWidth={1.5} />}
                          {b.target === 'vendors' && <Truck size={11} strokeWidth={1.5} />}
                          {b.target === 'user' && <User size={11} strokeWidth={1.5} />}
                          {b.target === 'user' ? 'Single User' : b.target.charAt(0).toUpperCase() + b.target.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle size={13} color="#16A34A" strokeWidth={1.5} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D26' }}>{b.recipientCount}</span>
                          <span style={{ fontSize: 12, color: '#9CA3AF' }}>received</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                          <Clock size={12} strokeWidth={1.5} />
                          {fmt(b.createdAt)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
