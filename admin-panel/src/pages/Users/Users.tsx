import { useState, useEffect } from 'react';
import { Search, Filter, UserCheck, UserX, Phone, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { getUsers, toggleUserStatus, updateVendorApproval } from '../../services/api';
import type { User, UserRole, VendorApprovalStatus } from '../../types';
import toast from 'react-hot-toast';

type RoleFilter = 'all' | UserRole;

const vendorApprovalColors: Record<VendorApprovalStatus, { bg: string; color: string; border: string }> = {
  pending:  { bg: '#FFFBEB', color: '#B45309', border: '#FCD34D' },
  approved: { bg: '#F0FDF4', color: '#16A34A', border: '#86EFAC' },
  rejected: { bg: '#FEF2F2', color: '#DC2626', border: '#FCA5A5' },
};

const vendorApprovalIcon = (status: VendorApprovalStatus) => {
  if (status === 'approved') return <CheckCircle size={12} strokeWidth={1.5} />;
  if (status === 'rejected') return <XCircle size={12} strokeWidth={1.5} />;
  return <Clock size={12} strokeWidth={1.5} />;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [approvalLoading, setApprovalLoading] = useState<string | null>(null);

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

  const handleVendorApproval = async (uid: string, status: 'approved' | 'rejected') => {
    setApprovalLoading(uid + status);
    try {
      await updateVendorApproval(uid, status);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, vendorApprovalStatus: status } : u));
      toast.success(`Vendor ${status}`);
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setApprovalLoading(null);
    }
  };

  const pendingVendors = users.filter(u => u.role === 'vendor' && u.vendorApprovalStatus === 'pending').length;

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

  const showApprovalCol = roleFilter === 'vendor' || roleFilter === 'all';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Pending Vendors Alert Banner */}
      {pendingVendors > 0 && (
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FCD34D',
          borderRadius: 10,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <Clock size={16} color="#B45309" strokeWidth={1.5} />
          <span style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>
            {pendingVendors} vendor{pendingVendors > 1 ? 's' : ''} waiting for approval
          </span>
          <button
            onClick={() => setRoleFilter('vendor')}
            style={{
              marginLeft: 'auto',
              padding: '4px 12px',
              borderRadius: 6,
              border: '1px solid #B45309',
              background: 'transparent',
              color: '#B45309',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Review Now
          </button>
        </div>
      )}

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
                position: 'relative',
              }}
            >
              {tab.label} ({counts[tab.key]})
              {tab.key === 'vendor' && pendingVendors > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  background: '#EF4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  fontSize: 9,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {pendingVendors}
                </span>
              )}
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
                {['User', 'Phone', 'Location', 'Role', showApprovalCol ? 'Vendor Approval' : null, 'Status', 'Joined', 'Actions'].filter(Boolean).map(h => (
                  <th key={h!} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
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
                  <td style={{ padding: '14px 16px' }}><Badge status={user.role} /></td>

                  {/* Vendor Approval column — only shown when filtering all or vendor */}
                  {showApprovalCol && (
                    <td style={{ padding: '14px 16px' }}>
                      {user.role === 'vendor' ? (() => {
                        const status: VendorApprovalStatus = user.vendorApprovalStatus || 'pending';
                        const c = vendorApprovalColors[status];
                        return (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: 20,
                            background: c.bg,
                            color: c.color,
                            border: `1px solid ${c.border}`,
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}>
                            {vendorApprovalIcon(status)}
                            {status}
                          </span>
                        );
                      })() : <span style={{ color: '#9CA3AF', fontSize: 13 }}>—</span>}
                    </td>
                  )}

                  <td style={{ padding: '14px 16px' }}><Badge status={user.isActive ? 'active' : 'inactive'} /></td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>
                    {(user.createdAt as any)?._seconds ? new Date((user.createdAt as any)._seconds * 1000).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {/* Vendor approval buttons — only for pending vendors */}
                      {user.role === 'vendor' && (user.vendorApprovalStatus === 'pending' || !user.vendorApprovalStatus) && (
                        <>
                          <button
                            onClick={() => handleVendorApproval(user.uid, 'approved')}
                            disabled={approvalLoading === user.uid + 'approved'}
                            title="Approve vendor"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #43A047',
                              background: 'transparent',
                              color: '#43A047',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              opacity: approvalLoading === user.uid + 'approved' ? 0.6 : 1,
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E8F5E9'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          >
                            <CheckCircle size={12} strokeWidth={1.5} /> Approve
                          </button>
                          <button
                            onClick={() => handleVendorApproval(user.uid, 'rejected')}
                            disabled={approvalLoading === user.uid + 'rejected'}
                            title="Reject vendor"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #E53935',
                              background: 'transparent',
                              color: '#E53935',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              opacity: approvalLoading === user.uid + 'rejected' ? 0.6 : 1,
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFEBEE'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          >
                            <XCircle size={12} strokeWidth={1.5} /> Reject
                          </button>
                        </>
                      )}
                      {/* Re-review: approved vendor can be rejected and vice versa */}
                      {user.role === 'vendor' && user.vendorApprovalStatus === 'approved' && (
                        <button
                          onClick={() => handleVendorApproval(user.uid, 'rejected')}
                          disabled={approvalLoading === user.uid + 'rejected'}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 6,
                            border: '1px solid #E53935', background: 'transparent',
                            color: '#E53935', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFEBEE'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          <XCircle size={12} strokeWidth={1.5} /> Revoke
                        </button>
                      )}
                      {user.role === 'vendor' && user.vendorApprovalStatus === 'rejected' && (
                        <button
                          onClick={() => handleVendorApproval(user.uid, 'approved')}
                          disabled={approvalLoading === user.uid + 'approved'}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 6,
                            border: '1px solid #43A047', background: 'transparent',
                            color: '#43A047', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E8F5E9'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          <CheckCircle size={12} strokeWidth={1.5} /> Re-approve
                        </button>
                      )}
                      {/* Activate / Deactivate (all roles) */}
                      <button
                        onClick={() => toggle(user.uid, user.isActive)}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: '1px solid',
                          borderColor: user.isActive ? '#E53935' : '#43A047',
                          background: 'transparent',
                          color: user.isActive ? '#E53935' : '#43A047',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          whiteSpace: 'nowrap',
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
    </div>
  );
}
