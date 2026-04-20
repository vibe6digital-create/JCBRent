import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, ToggleLeft, ToggleRight, X, Check, Trash2 } from 'lucide-react';
import {
  getMachineModels, createMachineModel, updateMachineModel, deleteMachineModel,
  getCategories,
} from '../../services/api';
import type { MachineModel, Category } from '../../types';
import toast from 'react-hot-toast';

export default function Models() {
  const [models, setModels] = useState<MachineModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: '' });
  const [editForm, setEditForm] = useState({ name: '', category: '' });
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    (async () => {
      try {
        const [mRes, cRes]: any = await Promise.all([
          getMachineModels(),
          getCategories(),
        ]);
        setModels(mRes.models || []);
        const cats: Category[] = (cRes.categories || []).filter((c: Category) => c.isActive);
        setCategories(cats);
        if (cats.length > 0) setForm(f => ({ ...f, category: cats[0].name }));
      } catch (err: any) {
        toast.error(err.message || 'Failed to load models');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filterCategory === 'all') return models;
    return models.filter(m => m.category === filterCategory);
  }, [models, filterCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, MachineModel[]>();
    for (const m of filtered) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await updateMachineModel(id, { isActive: !current });
      setModels(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleAdd = async () => {
    const name = form.name.trim();
    const category = form.category.trim();
    if (!name || !category) { toast.error('Name and category are required'); return; }
    try {
      const res: any = await createMachineModel({ name, category });
      setModels(prev => [...prev, res.model]);
      setForm({ name: '', category: categories[0]?.name || '' });
      setShowAdd(false);
      toast.success('Model added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add model');
    }
  };

  const startEdit = (m: MachineModel) => {
    setEditId(m.id);
    setEditForm({ name: m.name, category: m.category });
  };

  const saveEdit = async () => {
    if (!editForm.name.trim() || !editId) return;
    try {
      await updateMachineModel(editId, { name: editForm.name.trim(), category: editForm.category });
      setModels(prev => prev.map(m => m.id === editId ? { ...m, name: editForm.name.trim(), category: editForm.category } : m));
      setEditId(null);
      toast.success('Model updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteMachineModel(id);
      setModels(prev => prev.filter(m => m.id !== id));
      toast.success('Model deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
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
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Machine Models</h2>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>
            {models.length} models across {new Set(models.map(m => m.category)).size} categories · {models.filter(m => m.isActive).length} active
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{
              padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
              background: '#fff', fontSize: 13, color: '#1A1D26',
            }}
          >
            <option value="all">All categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <button
            onClick={() => setShowAdd(true)}
            disabled={categories.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 8,
              background: categories.length === 0 ? '#D1D5DB' : '#FF8C00',
              color: '#fff', fontSize: 13, fontWeight: 700, border: 'none',
              cursor: categories.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <Plus size={16} strokeWidth={1.5} /> Add Model
          </button>
        </div>
      </div>

      {categories.length === 0 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 10, padding: 14, fontSize: 13, color: '#92400E' }}>
          No categories exist yet. Please add at least one machine category before adding models.
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div style={{ background: '#fff', borderRadius: 12, border: '2px solid #FF8C00', padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 16 }}>Add New Model</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ width: 200 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Category *</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{
                  width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB',
                  borderRadius: 8, fontSize: 14, background: '#FAFAFA',
                }}
              >
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Model Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. JCB 3DX Super"
                style={{
                  width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB',
                  borderRadius: 8, fontSize: 14, background: '#FAFAFA',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleAdd}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 8, background: '#FF8C00', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                }}
              >
                <Check size={14} strokeWidth={2} /> Save
              </button>
              <button
                onClick={() => { setShowAdd(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 8, background: '#F3F4F6', color: '#6B7280', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                }}
              >
                <X size={14} strokeWidth={2} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grouped list */}
      {grouped.length === 0 && !loading && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
          No models yet. Click "Add Model" to create one.
        </div>
      )}

      {grouped.map(([category, items]) => (
        <div key={category}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {category} · {items.length}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {items.map(m => (
              <div key={m.id} style={{
                background: '#fff', borderRadius: 10, border: `1px solid ${m.isActive ? '#E5E7EB' : '#F3F4F6'}`,
                padding: 14, display: 'flex', alignItems: 'center', gap: 10,
                opacity: m.isActive ? 1 : 0.6,
              }}>
                <div style={{ flex: 1 }}>
                  {editId === m.id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <select
                        value={editForm.category}
                        onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                        style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 6px', fontSize: 12 }}
                      >
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                      <input
                        value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        style={{ flex: 1, border: '1px solid #FF8C00', borderRadius: 6, padding: '4px 8px', fontSize: 13 }}
                        autoFocus
                      />
                      <button onClick={saveEdit} style={{ background: '#FF8C00', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>
                        <Check size={12} strokeWidth={2} />
                      </button>
                      <button onClick={() => setEditId(null)} style={{ background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>
                        <X size={12} strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D26' }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{m.category}</div>
                    </>
                  )}
                </div>
                {editId !== m.id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => startEdit(m)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4, display: 'flex' }}>
                      <Edit2 size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => toggleActive(m.id, m.isActive)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: m.isActive ? '#FF8C00' : '#9CA3AF' }}
                      title={m.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {m.isActive ? <ToggleRight size={22} strokeWidth={1.5} /> : <ToggleLeft size={22} strokeWidth={1.5} />}
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4, display: 'flex' }}
                      title="Delete"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
