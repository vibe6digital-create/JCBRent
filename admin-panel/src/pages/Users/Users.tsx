import { useState, useEffect } from 'react';
import { Search, Filter, UserCheck, UserX, Phone, MapPin, ShieldCheck, X, Check, ShieldAlert } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { getUsers, toggleUserStatus, verifyVendor } from '../../services/api';
import type { User, UserRole, VerificationStatus } from '../../types';
import toast from 'react-hot-toast';

type RoleFilter = 'all' | UserRole;

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [kycUser, setKycUser] = useState<User | null>(null);
  const [kycBusy, setKycBusy] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res: any = await getUsers();
        setUsers(res.users || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = users.filter(u => {
    const matchesSearch = (u.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone ?? '').includes(search) ||
      (u.city?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggle = async (uid: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(uid, !currentStatus);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleVerify = async (status: 'verified' | 'rejected') => {
    if (!kycUser) return;
    if (status === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setKycBusy(true);
    try {
      await verifyVendor(kycUser.uid, status, status === 'rejected' ? rejectionReason.trim() : undefined);
      setUsers(prev => prev.map(u => u.uid === kycUser.uid
        ? { ...u, verificationStatus: status, rejectionReason: status === 'rejected' ? rejectionReason.trim() : undefined }
        : u));
      toast.success(`Vendor ${status}`);
      setKycUser(null);
      setRejectionReason('');
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setKycBusy(false);
    }
  };

  const statusPill = (s?: VerificationStatus) => {
    if (!s) return null;
    const styles: Record<VerificationStatus, { bg: string; fg: string; label: string }> = {
      pending:  { bg: '#FEF3C7', fg: '#92400E', label: 'KYC Pending' },
      verified: { bg: '#DCFCE7', fg: '#166534', label: 'Verified' },
      rejected: { bg: '#FEE2E2', fg: '#991B1B', label: 'Rejected' },
    };
    const style = styles[s];
    return (
      <span style={{ padding: '3px 8px', borderRadius: 6, background: style.bg, color: style.fg, fontSize: 11, fontWeight: 700 }}>
        {style.label}
      </span>
    );
  };

  const roleTabs: { key: RoleFilter; label: string }[] = [
    { key: 'all', label: 'All Users' },
    { key: 'customer', label: 'Customers' },
    { key: 'vendor', label: 'Vendors' },
    { key: 'admin', label: 'Admins' },
  ];

  const counts = {
    all: users.length,
    customer: users.filter(u => u.role === 'customer').length,
    vendor: users.filter(u => u.role === 'vendor').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Filter Bar */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F5F5', borderRadius: 8, padding: '8px 12px', border: '1px solid #E5E7EB', flex: 1, minWidth: 200 }}>
          <Search size={14} color="#9CA3AF" strokeWidth={1.5} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone or city..."
            style={{ border: 'none', background: 'none', fontSize: 13, color: '#1A1D26', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Filter size={14} color="#9CA3AF" strokeWidth={1.5} style={{ marginRight: 4, alignSelf: 'center' }} />
          {roleTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: roleFilter === tab.key ? '#FF8C00' : '#E5E7EB',
                background: roleFilter === tab.key ? '#FF8C00' : '#fff',
                color: roleFilter === tab.key ? '#fff' : '#6B7280',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label} ({counts[tab.key]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>{filtered.length} users found</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                {['User', 'Phone', 'Location', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.uid} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: user.role === 'vendor' ? '#FFF3E0' : user.role === 'admin' ? '#1A1A2E' : '#F0FDF4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: user.role === 'vendor' ? '#FF8C00' : user.role === 'admin' ? '#FF8C00' : '#16A34A',
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                      }}>
                        {(user.name || user.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1D26' }}>{user.name}</div>
                        {user.email && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{user.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                      <Phone size={12} strokeWidth={1.5} />
                      {user.phone}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {user.city ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                        <MapPin size={12} strokeWidth={1.5} />
                        {user.city}, {user.state}
                      </div>
                    ) : <span style={{ color: '#9CA3AF', fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                      <Badge status={user.role} />
                      {user.role === 'vendor' && statusPill(user.verificationStatus)}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}><Badge status={user.isActive ? 'active' : 'inactive'} /></td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>
                    {(user.createdAt as any)?._seconds ? new Date((user.createdAt as any)._seconds * 1000).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {user.role === 'vendor' && (user.licenseUrl || user.aadhaarUrl || user.verificationStatus) && (
                        <button
                          onClick={() => { setKycUser(user); setRejectionReason(user.rejectionReason || ''); }}
                          title="Review KYC"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '5px 10px', borderRadius: 6,
                            border: '1px solid #FF8C00', background: 'transparent', color: '#FF8C00',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFF7ED'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          <ShieldCheck size={12} strokeWidth={1.5} /> Review KYC
                        </button>
                      )}
                      <button
                        onClick={() => toggle(user.uid, user.isActive)}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '5px 10px', borderRadius: 6,
                          border: '1px solid',
                          borderColor: user.isActive ? '#E53935' : '#43A047',
                          background: 'transparent',
                          color: user.isActive ? '#E53935' : '#43A047',
                          fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = user.isActive ? '#FFEBEE' : '#E8F5E9'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        {user.isActive ? <><UserX size={12} strokeWidth={1.5} /> Deactivate</> : <><UserCheck size={12} strokeWidth={1.5} /> Activate</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            No users match your filters.
          </div>
        )}
      </div>

      {/* KYC Review modal */}
      {kycUser && (
        <div
          onClick={() => { if (!kycBusy) { setKycUser(null); setRejectionReason(''); } }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, width: '100%', maxWidth: 720,
              maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D26' }}>KYC Review — {kycUser.name}</h3>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{kycUser.phone} · {kycUser.city || '—'}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {statusPill(kycUser.verificationStatus)}
                <button onClick={() => { if (!kycBusy) { setKycUser(null); setRejectionReason(''); } }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <KycDocPreview label="Driving Licence" url={kycUser.licenseUrl} />
                <KycDocPreview label="Aadhaar Card" url={kycUser.aadhaarUrl} />
              </div>
              <KycDocPreview label="Digital Signature" url={kycUser.signatureUrl} />

              {kycUser.verificationStatus === 'rejected' && kycUser.rejectionReason && (
                <div style={{ marginTop: 14, padding: 12, background: '#FEE2E2', borderRadius: 8, fontSize: 13, color: '#991B1B' }}>
                  <strong>Previous rejection reason:</strong> {kycUser.rejectionReason}
                </div>
              )}

              <div style={{ marginTop: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>
                  Rejection reason (required if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. Licence is expired / Aadhaar not legible"
                  rows={2}
                  style={{
                    width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB',
                    borderRadius: 8, fontSize: 13, resize: 'vertical',
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                disabled={kycBusy}
                onClick={() => handleVerify('rejected')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 8,
                  background: '#fff', color: '#991B1B', fontSize: 13, fontWeight: 700,
                  border: '1px solid #991B1B', cursor: kycBusy ? 'not-allowed' : 'pointer',
                  opacity: kycBusy ? 0.6 : 1,
                }}
              >
                <ShieldAlert size={14} /> Reject
              </button>
              <button
                disabled={kycBusy}
                onClick={() => handleVerify('verified')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 8,
                  background: '#16A34A', color: '#fff', fontSize: 13, fontWeight: 700,
                  border: 'none', cursor: kycBusy ? 'not-allowed' : 'pointer',
                  opacity: kycBusy ? 0.6 : 1,
                }}
              >
                <Check size={14} /> Approve & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KycDocPreview({ label, url }: { label: string; url?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>{label}</div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer"
          style={{ display: 'block', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', background: '#F9FAFB' }}>
          <img src={url} alt={label} style={{ width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block' }} />
        </a>
      ) : (
        <div style={{
          border: '1px dashed #E5E7EB', borderRadius: 10, padding: 24,
          textAlign: 'center', color: '#9CA3AF', fontSize: 12, background: '#FAFAFA',
        }}>
          Not uploaded
        </div>
      )}
    </div>
  );
}
