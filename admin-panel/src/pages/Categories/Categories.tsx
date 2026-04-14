import { useState, useEffect } from 'react';
import { Plus, Edit2, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';
import {
  getCategories, createCategory, updateCategory,
} from '../../services/api';
import type { Category } from '../../types';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: '' });
  const [editForm, setEditForm] = useState({ name: '', icon: '' });

  useEffect(() => {
    (async () => {
      try {
        const res: any = await getCategories();
        setCategories(res.categories || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await updateCategory(id, { isActive: !current });
      setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    try {
      const res: any = await createCategory({ name: form.name.trim(), icon: form.icon || '⚙️' });
      setCategories(prev => [...prev, res.category]);
      setForm({ name: '', icon: '' });
      setShowAdd(false);
      toast.success('Category added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add category');
    }
  };

  const startEdit = (c: Category) => {
    setEditId(c.id);
    setEditForm({ name: c.name, icon: c.icon });
  };

  const saveEdit = async () => {
    if (!editForm.name.trim() || !editId) return;
    try {
      await updateCategory(editId, { name: editForm.name.trim(), icon: editForm.icon });
      setCategories(prev => prev.map(c => c.id === editId ? { ...c, name: editForm.name.trim(), icon: editForm.icon } : c));
      setEditId(null);
      toast.success('Category updated');
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
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Machine Categories</h2>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>{categories.length} categories · {categories.filter(c => c.isActive).length} active</p>
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
          Add Category
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{ background: '#fff', borderRadius: 12, border: '2px solid #FF8C00', padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 16 }}>Add New Category</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Category Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Motor Grader"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#1A1D26',
                  background: '#FAFAFA',
                }}
              />
            </div>
            <div style={{ width: 120 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Icon (emoji)</label>
              <input
                value={form.icon}
                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                placeholder="🚛"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 18,
                  textAlign: 'center',
                  background: '#FAFAFA',
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
                onClick={() => { setShowAdd(false); setForm({ name: '', icon: '' }); }}
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

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {categories.map(cat => (
          <div key={cat.id} style={{
            background: '#fff',
            borderRadius: 12,
            border: `1px solid ${cat.isActive ? '#E5E7EB' : '#F3F4F6'}`,
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            opacity: cat.isActive ? 1 : 0.6,
            transition: 'all 0.15s',
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: cat.isActive ? '#FFF3E0' : '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              flexShrink: 0,
            }}>
              {cat.icon}
            </div>

            <div style={{ flex: 1 }}>
              {editId === cat.id ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    value={editForm.icon}
                    onChange={e => setEditForm(f => ({ ...f, icon: e.target.value }))}
                    style={{ width: 40, border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 6px', fontSize: 16, textAlign: 'center' }}
                  />
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
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Added {cat.createdAt ? new Date(typeof cat.createdAt === 'object' ? (cat.createdAt as any)._seconds * 1000 : cat.createdAt).toLocaleDateString() : '—'}</div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {editId !== cat.id && (
                <button
                  onClick={() => startEdit(cat)}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#6B7280'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; }}
                >
                  <Edit2 size={14} strokeWidth={1.5} />
                </button>
              )}
              <button
                onClick={() => toggleActive(cat.id, cat.isActive)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: cat.isActive ? '#FF8C00' : '#9CA3AF', transition: 'color 0.15s' }}
                title={cat.isActive ? 'Deactivate' : 'Activate'}
              >
                {cat.isActive ? <ToggleRight size={24} strokeWidth={1.5} /> : <ToggleLeft size={24} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
