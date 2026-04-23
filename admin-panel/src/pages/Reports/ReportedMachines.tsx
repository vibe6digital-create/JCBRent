import { useState, useEffect } from 'react';
import { Flag, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Truck } from 'lucide-react';
import { getReports, resolveReport } from '../../services/api';
import type { MachineReport, ReportStatus } from '../../types';
import toast from 'react-hot-toast';

const REASON_LABELS: Record<string, string> = {
  misleading_info: 'Misleading Info',
  safety_concern:  'Safety Concern',
  unavailable:     'Machine Unavailable',
  overpricing:     'Overpricing',
  other:           'Other',
};

const REASON_COLORS: Record<string, { bg: string; color: string }> = {
  misleading_info: { bg: '#FFF3E0', color: '#E07B00' },
  safety_concern:  { bg: '#FFEBEE', color: '#E53935' },
  unavailable:     { bg: '#E3F2FD', color: '#1565C0' },
  overpricing:     { bg: '#F3E5F5', color: '#7B1FA2' },
  other:           { bg: '#F5F5F5', color: '#616161' },
};

type Tab = 'all' | 'pending' | 'resolved' | 'dismissed';

export default function ReportedMachines() {
  const [reports, setReports]     = useState<MachineReport[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<Tab>('all');
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [acting, setActing]       = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    (getReports() as Promise<any>)
      .then((res: any) => setReports(res.reports || []))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = reports.filter(r => tab === 'all' || r.status === tab);

  const counts = {
    all:       reports.length,
    pending:   reports.filter(r => r.status === 'pending').length,
    resolved:  reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  const handleAction = async (id: string, action: 'dismissed' | 'machine_rejected') => {
    setActing(id + action);
    try {
      await resolveReport(id, action);
      const label = action === 'machine_rejected' ? 'Machine rejected & report resolved' : 'Report dismissed';
      toast.success(label);
      setReports(prev => prev.map(r =>
        r.id === id
          ? { ...r, status: (action === 'machine_rejected' ? 'resolved' : 'dismissed') as ReportStatus, actionTaken: action }
          : r
      ));
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  const TABS: { key: Tab; label: string; color?: string }[] = [
    { key: 'all',       label: 'All' },
    { key: 'pending',   label: 'Pending',   color: '#E53935' },
    { key: 'resolved',  label: 'Resolved',  color: '#43A047' },
    { key: 'dismissed', label: 'Dismissed', color: '#9CA3AF' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26' }}>Reported Machines</h1>
          <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
            Customer-flagged listings requiring admin review
          </p>
        </div>
        {counts.pending > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 10, padding: '8px 16px' }}>
            <Flag size={15} color="#E53935" strokeWidth={1.5} />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#E53935' }}>{counts.pending} pending review</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Reports',    value: counts.all,       icon: Flag,        color: '#FF8C00', bg: '#FFF3E0' },
          { label: 'Pending',          value: counts.pending,   icon: Clock,       color: '#E53935', bg: '#FFEBEE' },
          { label: 'Resolved',         value: counts.resolved,  icon: CheckCircle, color: '#43A047', bg: '#E8F5E9' },
          { label: 'Dismissed',        value: counts.dismissed, icon: XCircle,     color: '#9CA3AF', bg: '#F5F5F5' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, background: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} color={s.color} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1A1D26', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 10, padding: 4, border: '1px solid #E5E7EB', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: tab === t.key ? '#1A1A2E' : 'transparent',
            color: tab === t.key ? '#fff' : '#6B7280',
            fontWeight: 700, fontSize: 13, transition: 'all 0.15s',
          }}>
            {t.label}
            {t.color && counts[t.key] > 0 && tab !== t.key && (
              <span style={{ marginLeft: 6, background: t.color, color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>Loading reports...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚩</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26', marginBottom: 6 }}>No reports in this category</div>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>Reports submitted by customers will appear here</div>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr', gap: 12, padding: '10px 20px', background: '#FAFAFA', borderBottom: '1px solid #E5E7EB', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Machine</span>
              <span>Reporter</span>
              <span>Reason</span>
              <span>Date</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {filtered.map((r, i) => {
              const reasonStyle = REASON_COLORS[r.reason] || REASON_COLORS.other;
              const isExpanded = expanded === r.id;

              return (
                <div key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  {/* Main row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr', gap: 12, padding: '14px 20px', alignItems: 'center', transition: 'background 0.1s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                  >
                    {/* Machine */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, background: '#FFF3E0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Truck size={16} color="#FF8C00" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>{r.machineModel}</div>
                        <div style={{ fontSize: 11, color: '#FF8C00', fontWeight: 600 }}>{r.machineCategory}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>by {r.vendorName}</div>
                      </div>
                    </div>

                    {/* Reporter */}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1D26' }}>{r.reporterName}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>Customer</div>
                    </div>

                    {/* Reason */}
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: reasonStyle.bg, color: reasonStyle.color }}>
                      {REASON_LABELS[r.reason] || r.reason}
                    </span>

                    {/* Date */}
                    <div style={{ fontSize: 12, color: '#6B7280' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>

                    {/* Status */}
                    <div>
                      {r.status === 'pending' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#FFEBEE', color: '#E53935' }}>
                          <Clock size={10} strokeWidth={2} /> Pending
                        </span>
                      )}
                      {r.status === 'resolved' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#E8F5E9', color: '#43A047' }}>
                          <CheckCircle size={10} strokeWidth={2} /> Resolved
                        </span>
                      )}
                      {r.status === 'dismissed' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#F5F5F5', color: '#9CA3AF' }}>
                          <XCircle size={10} strokeWidth={2} /> Dismissed
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {r.status === 'pending' && (
                        <>
                          <button
                            disabled={!!acting}
                            onClick={() => handleAction(r.id, 'dismissed')}
                            style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 11, fontWeight: 700, cursor: acting ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                          >
                            {acting === r.id + 'dismissed' ? '...' : 'Dismiss'}
                          </button>
                          <button
                            disabled={!!acting}
                            onClick={() => handleAction(r.id, 'machine_rejected')}
                            style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: '#FFEBEE', color: '#E53935', fontSize: 11, fontWeight: 700, cursor: acting ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                          >
                            {acting === r.id + 'machine_rejected' ? '...' : 'Reject Machine'}
                          </button>
                        </>
                      )}
                      {r.status !== 'pending' && r.actionTaken && (
                        <span style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>
                          {r.actionTaken === 'machine_rejected' ? 'Machine rejected' : 'Dismissed'}
                        </span>
                      )}
                      {/* Expand toggle for details */}
                      {r.details && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : r.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#9CA3AF', padding: 4 }}
                        >
                          {isExpanded ? <ChevronUp size={14} strokeWidth={2} /> : <ChevronDown size={14} strokeWidth={2} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && r.details && (
                    <div style={{ padding: '0 20px 14px 72px', background: '#FAFAFA' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Customer Note</div>
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{r.details}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
