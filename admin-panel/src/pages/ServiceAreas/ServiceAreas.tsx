import { useState, useEffect } from 'react';
import { Plus, MapPin, Edit2, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';
import {
  getServiceAreas, createServiceArea, updateServiceArea,
} from '../../services/api';
import type { ServiceArea } from '../../types';
import toast from 'react-hot-toast';

export default function ServiceAreas() {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ city: '', state: '' });
  const [editForm, setEditForm] = useState({ city: '', state: '' });
  const [stateFilter, setStateFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res: any = await getServiceAreas();
        setAreas(res.serviceAreas || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load service areas');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const states = ['all', ...Array.from(new Set(areas.map(a => a.state))).sort()];
  const filtered = stateFilter === 'all' ? areas : areas.filter(a => a.state === stateFilter);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await updateServiceArea(id, { isActive: !current });
      setAreas(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleAdd = async () => {
    if (!form.city.trim() || !form.state.trim()) return;
    try {
      const res: any = await createServiceArea({ city: form.city.trim(), state: form.state.trim() });
      setAreas(prev => [...prev, res.serviceArea]);
      setForm({ city: '', state: '' });
      setShowAdd(false);
      toast.success('Service area added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add service area');
    }
  };

  const startEdit = (a: ServiceArea) => {
    setEditId(a.id);
    setEditForm({ city: a.city, state: a.state });
  };

  const saveEdit = async () => {
    if (!editForm.city.trim() || !editId) return;
    try {
      await updateServiceArea(editId, { city: editForm.city.trim(), state: editForm.state.trim() });
      setAreas(prev => prev.map(a => a.id === editId ? { ...a, city: editForm.city.trim(), state: editForm.state.trim() } : a));
      setEditId(null);
      toast.success('Service area updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Service Areas</h2>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>{areas.length} areas · {areas.filter(a => a.isActive).length} active</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 8,
            background: '#FF8C00',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
        >
          <Plus size={16} strokeWidth={1.5} />
          Add Service Area
        </button>
      </div>

      {/* State Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {states.map(s => (
          <button
            key={s}
            onClick={() => setStateFilter(s)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: stateFilter === s ? '#FF8C00' : '#E5E7EB',
              background: stateFilter === s ? '#FF8C00' : '#fff',
              color: stateFilter === s ? '#fff' : '#6B7280',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              textTransform: s === 'all' ? 'none' : 'none',
            }}
          >
            {s === 'all' ? 'All States' : s}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{ background: '#fff', borderRadius: 12, border: '2px solid #FF8C00', padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 16 }}>Add Service Area</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>City *</label>
              <input
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="e.g. Surat"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, color: '#1A1D26', background: '#FAFAFA' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>State *</label>
              <input
                value={form.state}
                onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                placeholder="e.g. Gujarat"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, color: '#1A1D26', background: '#FAFAFA' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleAdd}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, background: '#FF8C00', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                <Check size={14} strokeWidth={2} /> Save
              </button>
              <button
                onClick={() => { setShowAdd(false); setForm({ city: '', state: '' }); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, background: '#F3F4F6', color: '#6B7280', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                <X size={14} strokeWidth={2} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Areas Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>{filtered.length} areas</span>
        </div>
        <div>
          {filtered.map((area, i) => (
            <div key={area.id} style={{
              padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              opacity: area.isActive ? 1 : 0.55,
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
            >
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: area.isActive ? '#FFF3E0' : '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <MapPin size={16} color={area.isActive ? '#FF8C00' : '#9CA3AF'} strokeWidth={1.5} />
              </div>

              {editId === area.id ? (
                <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={editForm.city}
                    onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                    style={{ flex: 1, border: '1px solid #FF8C00', borderRadius: 6, padding: '5px 10px', fontSize: 13 }}
                    autoFocus
                  />
                  <input
                    value={editForm.state}
                    onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))}
                    style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 6, padding: '5px 10px', fontSize: 13 }}
                  />
                  <button onClick={saveEdit} style={{ background: '#FF8C00', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Save</button>
                  <button onClick={() => setEditId(null)} style={{ background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                </div>
              ) : (
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>{area.city}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{area.state}</div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: area.isActive ? '#43A047' : '#9CA3AF',
                  background: area.isActive ? '#E8F5E9' : '#F3F4F6',
                  padding: '2px 8px',
                  borderRadius: 20,
                }}>
                  {area.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ fontSize: 12, color: '#9CA3AF', marginRight: 12, whiteSpace: 'nowrap' }}>{area.createdAt}</div>

              <div style={{ display: 'flex', gap: 6 }}>
                {editId !== area.id && (
                  <button
                    onClick={() => startEdit(area)}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#6B7280'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; }}
                  >
                    <Edit2 size={14} strokeWidth={1.5} />
                  </button>
                )}
                <button
                  onClick={() => toggleActive(area.id, area.isActive)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: area.isActive ? '#FF8C00' : '#9CA3AF', transition: 'color 0.15s' }}
                  title={area.isActive ? 'Deactivate' : 'Activate'}
                >
                  {area.isActive ? <ToggleRight size={22} strokeWidth={1.5} /> : <ToggleLeft size={22} strokeWidth={1.5} />}
                </button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            No service areas found for this state.
          </div>
        )}
      </div>
    </div>
  );
}
