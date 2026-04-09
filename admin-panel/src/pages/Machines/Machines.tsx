import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, MapPin, IndianRupee } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { getMachines, approveMachine, rejectMachine } from '../../services/api';
import type { Machine, ApprovalStatus } from '../../types';
import toast from 'react-hot-toast';

type FilterStatus = 'all' | ApprovalStatus;

export default function Machines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const load = async () => {
    try {
      const res: any = await getMachines();
      setMachines(res.machines || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load machines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = machines.filter(m => {
    const matchesSearch =
      m.model.toLowerCase().includes(search.toLowerCase()) ||
      m.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.location.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: ApprovalStatus) => {
    try {
      if (status === 'approved') await approveMachine(id);
      else await rejectMachine(id);
      toast.success(`Machine ${status}`);
      setMachines(prev => prev.map(m => m.id === id ? { ...m, approvalStatus: status } : m));
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const counts = {
    all: machines.length,
    pending: machines.filter(m => m.approvalStatus === 'pending').length,
    approved: machines.filter(m => m.approvalStatus === 'approved').length,
    rejected: machines.filter(m => m.approvalStatus === 'rejected').length,
  };

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const filterColors: Record<FilterStatus, string> = {
    all: '#6B7280',
    pending: '#F59E0B',
    approved: '#43A047',
    rejected: '#E53935',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F5F5', borderRadius: 8, padding: '8px 12px', border: '1px solid #E5E7EB', flex: 1, minWidth: 200 }}>
          <Search size={14} color="#9CA3AF" strokeWidth={1.5} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by model, vendor or category..."
            style={{ border: 'none', background: 'none', fontSize: 13, color: '#1A1D26', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: statusFilter === tab.key ? filterColors[tab.key] : '#E5E7EB',
                background: statusFilter === tab.key ? filterColors[tab.key] : '#fff',
                color: statusFilter === tab.key ? '#fff' : '#6B7280',
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

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map(m => (
          <div key={m.id} style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            transition: 'box-shadow 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            {/* Category Banner */}
            <div style={{
              background: m.approvalStatus === 'pending' ? '#1A1A2E' : m.approvalStatus === 'approved' ? '#1A1A2E' : '#F3F4F6',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: m.approvalStatus === 'rejected' ? '#6B7280' : '#FF8C00',
                }}>{m.category}</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: m.approvalStatus === 'rejected' ? '#1A1D26' : '#fff', marginTop: 2 }}>{m.model}</div>
              </div>
              <Badge status={m.approvalStatus} />
            </div>

            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>Vendor</div>
                  <div style={{ color: '#1A1D26', fontWeight: 600 }}>{m.vendorName}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>Location</div>
                  <div style={{ color: '#1A1D26', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} strokeWidth={1.5} />
                    {m.location.city}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                <div>
                  <div style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>Hourly Rate</div>
                  <div style={{ color: '#1A1D26', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IndianRupee size={11} strokeWidth={1.5} />
                    {m.hourlyRate.toLocaleString('en-IN')}/hr
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>Daily Rate</div>
                  <div style={{ color: '#1A1D26', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IndianRupee size={11} strokeWidth={1.5} />
                    {m.dailyRate.toLocaleString('en-IN')}/day
                  </div>
                </div>
                {m.weeklyRate && (
                  <div>
                    <div style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>Weekly Rate</div>
                    <div style={{ color: '#1A1D26', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IndianRupee size={11} strokeWidth={1.5} />
                      {m.weeklyRate.toLocaleString('en-IN')}/wk
                    </div>
                  </div>
                )}
                {m.monthlyRate && (
                  <div>
                    <div style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>Monthly Rate</div>
                    <div style={{ color: '#1A1D26', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IndianRupee size={11} strokeWidth={1.5} />
                      {m.monthlyRate.toLocaleString('en-IN')}/mo
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: 12, color: '#6B7280', borderTop: '1px solid #F3F4F6', paddingTop: 10 }}>
                <span style={{ color: '#9CA3AF' }}>Service areas: </span>
                {m.serviceAreas.join(' · ')}
              </div>

              <div style={{ fontSize: 12, color: '#6B7280' }}>
                <span style={{ color: '#9CA3AF' }}>Availability: </span>
                <span style={{ color: m.isAvailable ? '#43A047' : '#E53935', fontWeight: 600 }}>
                  {m.isAvailable ? 'Available' : 'Not Available'}
                </span>
              </div>

              {m.approvalStatus === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => updateStatus(m.id, 'approved')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 0',
                      borderRadius: 8,
                      background: '#FF8C00',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
                  >
                    <CheckCircle size={13} strokeWidth={1.5} /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(m.id, 'rejected')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 0',
                      borderRadius: 8,
                      background: 'transparent',
                      color: '#E53935',
                      fontSize: 12,
                      fontWeight: 700,
                      border: '1px solid #E53935',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFEBEE'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <XCircle size={13} strokeWidth={1.5} /> Reject
                  </button>
                </div>
              )}
              {m.approvalStatus === 'approved' && (
                <button
                  onClick={() => updateStatus(m.id, 'rejected')}
                  style={{
                    padding: '7px 0',
                    borderRadius: 8,
                    background: 'transparent',
                    color: '#E53935',
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E53935'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
                >
                  Revoke Approval
                </button>
              )}
              {m.approvalStatus === 'rejected' && (
                <button
                  onClick={() => updateStatus(m.id, 'approved')}
                  style={{
                    padding: '7px 0',
                    borderRadius: 8,
                    background: 'transparent',
                    color: '#43A047',
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#43A047'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
                >
                  Approve Machine
                </button>
              )}

              <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right' }}>Added {m.createdAt}</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
          No machines match your filters.
        </div>
      )}
    </div>
  );
}
