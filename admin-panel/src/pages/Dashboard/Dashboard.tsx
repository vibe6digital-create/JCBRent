import { useState, useEffect } from 'react';
import { Users, Truck, CalendarCheck, ClipboardList, IndianRupee, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { getDashboardStats, approveMachine, rejectMachine } from '../../services/api';
import toast from 'react-hot-toast';

const formatCurrency = (v: number) => `₹${v.toLocaleString('en-IN')}`;

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res: any = await getDashboardStats();
      setData(res);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (machineId: string) => {
    try {
      await approveMachine(machineId);
      toast.success('Machine approved');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleReject = async (machineId: string) => {
    try {
      await rejectMachine(machineId);
      toast.success('Machine rejected');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const s = data?.dashboard || {};
  const pendingMachines = data?.pendingMachines || [];
  const recentBookings = data?.recentBookings || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
        <StatCard label="Total Users" value={s.totalUsers} icon={Users} accent="#3B82F6" sub={`${s.customers} customers · ${s.vendors} vendors`} />
        <StatCard label="Total Machines" value={s.totalMachines} icon={Truck} accent="#FF8C00" sub={`${s.approvedMachines} approved · ${s.pendingMachines} pending`} />
        <StatCard label="Total Bookings" value={s.totalBookings} icon={CalendarCheck} accent="#43A047" sub={`${s.completedBookings} completed · ${s.pendingBookings} pending`} />
        <StatCard label="Smart Estimates" value={s.totalEstimates} icon={ClipboardList} accent="#9333EA" />
        <StatCard label="Revenue Tracked" value={formatCurrency(s.revenue)} icon={IndianRupee} accent="#E07B00" sub="from completed bookings" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Recent Bookings */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Recent Bookings</h2>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Latest booking activity</p>
            </div>
            <CalendarCheck size={18} color="#6B7280" strokeWidth={1.5} />
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                {['Customer', 'Machine', 'Location', 'Cost', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b: any, i: number) => (
                <tr key={b.id} style={{ borderBottom: i < recentBookings.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1D26' }}>{b.customerName}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{b.customerPhone}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, color: '#1A1D26' }}>{b.machineCategory}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{b.machineModel}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{b.workLocation.city}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1A1D26' }}>{formatCurrency(b.estimatedCost)}</td>
                  <td style={{ padding: '12px 16px' }}><Badge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Machine Approval Queue */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Pending Approvals</h2>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{pendingMachines.length} machines awaiting review</p>
            </div>
            <Clock size={18} color="#F59E0B" strokeWidth={1.5} />
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingMachines.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                <CheckCircle size={32} color="#43A047" strokeWidth={1.5} style={{ margin: '0 auto 8px' }} />
                All machines approved!
              </div>
            )}
            {pendingMachines.map((m: any) => (
              <div key={m.id} style={{
                padding: '12px 14px',
                border: '1px solid #FEF3C7',
                borderRadius: 8,
                background: '#FFFBEB',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D26' }}>{m.model}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{m.category} · {m.location.city}</div>
                  </div>
                  <Badge status="pending" />
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Vendor: {m.vendorName}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  ₹{m.hourlyRate.toLocaleString('en-IN')}/hr · ₹{m.dailyRate.toLocaleString('en-IN')}/day
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                  <button
                    onClick={() => handleApprove(m.id)}
                    style={{
                      flex: 1, padding: '6px 0', borderRadius: 6,
                      background: '#FF8C00', color: '#fff', fontSize: 12,
                      fontWeight: 600, border: 'none', cursor: 'pointer',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(m.id)}
                    style={{
                      flex: 1, padding: '6px 0', borderRadius: 6,
                      background: 'transparent', color: '#E53935', fontSize: 12,
                      fontWeight: 600, border: '1px solid #E53935', cursor: 'pointer',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFEBEE'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Pending Bookings', value: s.pendingBookings, color: '#F59E0B', icon: Clock },
          { label: 'Active Vendors', value: s.vendors, color: '#3B82F6', icon: Users },
          { label: 'Pending Machines', value: s.pendingMachines, color: '#FF8C00', icon: AlertCircle },
          { label: 'Completed Bookings', value: s.completedBookings, color: '#43A047', icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            background: '#fff',
            borderRadius: 10,
            padding: '14px 18px',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <Icon size={18} color={color} strokeWidth={1.5} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1D26' }}>{value}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
