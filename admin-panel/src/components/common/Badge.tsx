interface BadgeProps {
  status: string;
  type?: 'approval' | 'booking' | 'role' | 'active' | 'generic';
}

const configs: Record<string, { bg: string; color: string; label: string }> = {
  // approval
  approved: { bg: '#E8F5E9', color: '#43A047', label: 'Approved' },
  pending: { bg: '#FFFBEB', color: '#F59E0B', label: 'Pending' },
  rejected: { bg: '#FFEBEE', color: '#E53935', label: 'Rejected' },
  // booking
  accepted: { bg: '#E8F5E9', color: '#43A047', label: 'Accepted' },
  arrived: { bg: '#FFF3E0', color: '#FF8C00', label: 'Arrived' },
  in_progress: { bg: '#EFF6FF', color: '#3B82F6', label: 'In Progress' },
  completed: { bg: '#E8F5E9', color: '#166534', label: 'Completed' },
  cancelled: { bg: '#FEF2F2', color: '#DC2626', label: 'Cancelled' },
  // role
  customer: { bg: '#F0FDF4', color: '#16A34A', label: 'Customer' },
  vendor: { bg: '#FFF7ED', color: '#EA580C', label: 'Vendor' },
  admin: { bg: '#EFF6FF', color: '#2563EB', label: 'Admin' },
  // active
  active: { bg: '#E8F5E9', color: '#43A047', label: 'Active' },
  inactive: { bg: '#F3F4F6', color: '#6B7280', label: 'Inactive' },
  // work types
  excavation: { bg: '#FFF3E0', color: '#FF8C00', label: 'Excavation' },
  leveling: { bg: '#F0FDF4', color: '#16A34A', label: 'Leveling' },
  trenching: { bg: '#EFF6FF', color: '#3B82F6', label: 'Trenching' },
  foundation: { bg: '#FDF4FF', color: '#9333EA', label: 'Foundation' },
  debris_removal: { bg: '#FFF1F2', color: '#E11D48', label: 'Debris Removal' },
};

export default function Badge({ status }: BadgeProps) {
  const cfg = configs[status] ?? { bg: '#F3F4F6', color: '#6B7280', label: status };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 20,
      background: cfg.bg,
      color: cfg.color,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}
