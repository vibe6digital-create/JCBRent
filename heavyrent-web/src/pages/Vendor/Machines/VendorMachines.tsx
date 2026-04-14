import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, MapPin, IndianRupee, ToggleLeft, ToggleRight, Edit2 } from 'lucide-react';
import { getMyMachines, deleteMachine as apiDeleteMachine, toggleMachineAvailability } from '../../../services/api';
import type { Machine } from '../../../types';
import Badge from '../../../components/common/Badge';
import toast from 'react-hot-toast';

const MACHINE_ICONS: Record<string, string> = {
  JCB: '🚜', Excavator: '⛏️', Crane: '🏗️', Bulldozer: '🚧', Roller: '🛞', Pokelane: '🛣️',
};

export default function VendorMachines() {
  const navigate = useNavigate();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyMachines()
      .then((res: any) => setMachines(res.machines || []))
      .catch((err: any) => setError(err.message || 'Failed to load machines'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleAvailability = async (id: string, current: boolean) => {
    const next = !current;
    setMachines(prev => prev.map(m => m.id === id ? { ...m, isAvailable: next } : m));
    try {
      await toggleMachineAvailability(id, next);
      toast.success(next ? 'Machine set to Available' : 'Machine set to Unavailable');
    } catch (err: any) {
      setMachines(prev => prev.map(m => m.id === id ? { ...m, isAvailable: current } : m));
      toast.error(err.message || 'Failed to update availability');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this machine?')) return;
    try {
      await apiDeleteMachine(id);
      setMachines(prev => prev.filter(m => m.id !== id));
      toast.success('Machine deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete machine');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: 40, color: '#E53935' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26' }}>My Machines</h1>
          <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>{machines.length} machines listed</p>
        </div>
        <button onClick={() => navigate('/vendor/machines/add')} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
          background: '#FF8C00', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'background 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
        >
          <Plus size={15} strokeWidth={2} /> Add Machine
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {machines.map(m => (
          <div key={m.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            <div style={{ background: '#1A1A2E', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, background: 'rgba(255,140,0,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {MACHINE_ICONS[m.category]}
                </div>
                <div>
                  <div style={{ color: '#FF8C00', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.category}</div>
                  <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, marginTop: 2 }}>{m.model}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge status={m.approvalStatus} />
                <button onClick={() => navigate(`/vendor/machines/${m.id}/edit`)} style={{ background: 'rgba(255,140,0,0.1)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#FF8C00', display: 'flex', transition: 'background 0.15s' }}
                  title="Edit machine"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,140,0,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,140,0,0.1)'; }}
                >
                  <Edit2 size={15} strokeWidth={1.5} />
                </button>
                <button onClick={() => handleDelete(m.id)} style={{ background: 'rgba(229,57,53,0.1)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#E53935', display: 'flex', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(229,57,53,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(229,57,53,0.1)'; }}
                >
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>Location</div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 13, color: '#1A1D26', fontWeight: 600 }}>
                    <MapPin size={11} color="#FF8C00" strokeWidth={1.5} />{m.location.city}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>Hourly Rate</div>
                  <div style={{ display: 'flex', gap: 2, alignItems: 'center', fontSize: 13, color: '#1A1D26', fontWeight: 700 }}>
                    <IndianRupee size={11} color="#FF8C00" strokeWidth={1.5} />₹{m.hourlyRate.toLocaleString('en-IN')}/hr
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>Daily Rate</div>
                  <div style={{ fontSize: 13, color: '#1A1D26', fontWeight: 700 }}>₹{m.dailyRate.toLocaleString('en-IN')}/day</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>Service Areas</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{m.serviceAreas.slice(0, 2).join(', ')}{m.serviceAreas.length > 2 ? '...' : ''}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Availability:</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.isAvailable ? '#43A047' : '#E53935' }}>
                    {m.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <button onClick={() => handleToggleAvailability(m.id, m.isAvailable)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: m.isAvailable ? '#FF8C00' : '#9CA3AF', transition: 'color 0.15s' }}>
                  {m.isAvailable ? <ToggleRight size={28} strokeWidth={1.5} /> : <ToggleLeft size={28} strokeWidth={1.5} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {machines.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D26', marginBottom: 6 }}>No machines listed yet</h3>
          <button onClick={() => navigate('/vendor/machines/add')} style={{ marginTop: 12, padding: '10px 24px', background: '#FF8C00', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Add Your First Machine
          </button>
        </div>
      )}
    </div>
  );
}
