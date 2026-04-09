const configs: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: '#E8F5E9', color: '#43A047', label: 'Approved' },
  pending: { bg: '#FFFBEB', color: '#F59E0B', label: 'Pending' },
  rejected: { bg: '#FFEBEE', color: '#E53935', label: 'Rejected' },
  accepted: { bg: '#E8F5E9', color: '#43A047', label: 'Accepted' },
  in_progress: { bg: '#EFF6FF', color: '#3B82F6', label: 'In Progress' },
  completed: { bg: '#F0FDF4', color: '#16A34A', label: 'Completed' },
  available: { bg: '#E8F5E9', color: '#43A047', label: 'Available' },
  unavailable: { bg: '#FFEBEE', color: '#E53935', label: 'Not Available' },
  hourly: { bg: '#F0F9FF', color: '#0284C7', label: 'Hourly' },
  daily: { bg: '#FFF7ED', color: '#EA580C', label: 'Daily' },
};

export default function Badge({ status, label }: { status: string; label?: string }) {
  const cfg = configs[status] ?? { bg: '#F3F4F6', color: '#6B7280', label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
    }}>{label ?? cfg.label}</span>
  );
}
