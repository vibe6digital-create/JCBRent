import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader } from 'lucide-react';
import { getMachineById, updateMachine } from '../../../services/api';
import type { MachineCategory } from '../../../types';
import toast from 'react-hot-toast';

const CATEGORIES: MachineCategory[] = ['JCB', 'Excavator', 'Crane', 'Bulldozer', 'Roller', 'Pokelane'];
const MACHINE_ICONS: Record<string, string> = {
  JCB: '🚜', Excavator: '⛏️', Crane: '🏗️', Bulldozer: '🚧', Roller: '🛞', Pokelane: '🛣️',
};

interface EditFieldProps {
  label: string;
  field: string;
  type?: string;
  placeholder?: string;
  prefix?: string;
  form: Record<string, unknown>;
  errors: Record<string, string>;
  set: (k: string, v: string) => void;
}

function EditField({ label, field, type = 'text', placeholder = '', prefix = '', form, errors, set }: EditFieldProps) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${errors[field] ? '#E53935' : '#E5E7EB'}`, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        {prefix && <span style={{ padding: '0 12px', background: '#F5F5F5', borderRight: '1px solid #E5E7EB', color: '#6B7280', fontSize: 14, alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>{prefix}</span>}
        <input type={type} value={form[field] as string} onChange={e => set(field, e.target.value)} placeholder={placeholder}
          style={{ flex: 1, padding: '10px 14px', border: 'none', fontSize: 14, color: '#1A1D26', outline: 'none' }} />
      </div>
      {errors[field] && <p style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>{errors[field]}</p>}
    </div>
  );
}

export default function EditMachine() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: '' as MachineCategory | '',
    model: '', description: '', hourlyRate: '', dailyRate: '', weeklyRate: '', monthlyRate: '',
    city: '', state: '', serviceAreas: '', isAvailable: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    getMachineById(id)
      .then((res: any) => {
        const m = res.machine || res;
        setForm({
          category: m.category || '',
          model: m.model || '',
          description: m.description || '',
          hourlyRate: String(m.hourlyRate || ''),
          dailyRate: String(m.dailyRate || ''),
          weeklyRate: String(m.weeklyRate || ''),
          monthlyRate: String(m.monthlyRate || ''),
          city: m.location?.city || '',
          state: m.location?.state || '',
          serviceAreas: (m.serviceAreas || []).join(', '),
          isAvailable: m.isAvailable ?? true,
        });
      })
      .catch(() => toast.error('Failed to load machine'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k: string, v: string | boolean) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.model.trim()) e.model = 'Required';
    if (!form.hourlyRate || isNaN(Number(form.hourlyRate))) e.hourlyRate = 'Enter a valid number';
    if (!form.dailyRate || isNaN(Number(form.dailyRate))) e.dailyRate = 'Enter a valid number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !id) return;
    setSaving(true);
    try {
      await updateMachine(id, {
        model: form.model.trim(),
        description: form.description.trim(),
        hourlyRate: Number(form.hourlyRate),
        dailyRate: Number(form.dailyRate),
        weeklyRate: form.weeklyRate ? Number(form.weeklyRate) : undefined,
        monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : undefined,
        serviceAreas: form.serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
        isAvailable: form.isAvailable,
      });
      toast.success('Machine updated!');
      navigate('/vendor/machines');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update machine');
    } finally {
      setSaving(false);
    }
  };

  const formAsRecord = form as Record<string, unknown>;
  const setStr = set as (k: string, v: string) => void;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 10, color: '#9CA3AF' }}>
      <Loader size={20} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} /> Loading machine...
    </div>
  );

  return (
    <div className="fade-in">
      <button onClick={() => navigate('/vendor/machines')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: 20, fontSize: 14, padding: 0 }}>
        <ArrowLeft size={16} strokeWidth={2} /> Back to Machines
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26', marginBottom: 24 }}>Edit Machine</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Category (read-only in edit) */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Machine Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => set('category', cat)} style={{
                  padding: '12px', borderRadius: 10, border: `2px solid ${form.category === cat ? '#FF8C00' : '#E5E7EB'}`,
                  background: form.category === cat ? '#FFF3E0' : '#FAFAFA', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  color: form.category === cat ? '#E07B00' : '#1A1D26', transition: 'all 0.15s',
                }}>
                  <span style={{ marginRight: 6 }}>{MACHINE_ICONS[cat]}</span>{cat}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Machine Details</h3>
            <EditField label="Model Name *" field="model" placeholder="e.g. JCB 3DX Plus" form={formAsRecord} errors={errors} set={setStr} />
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the machine condition, features..."
                rows={3} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: 8, fontSize: 14, color: '#1A1D26', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Pricing */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Pricing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <EditField label="Hourly Rate (₹) *" field="hourlyRate" type="number" placeholder="1200" prefix="₹" form={formAsRecord} errors={errors} set={setStr} />
              <EditField label="Daily Rate (₹) *" field="dailyRate" type="number" placeholder="8000" prefix="₹" form={formAsRecord} errors={errors} set={setStr} />
              <EditField label="Weekly Rate (₹)" field="weeklyRate" type="number" placeholder="45000" prefix="₹" form={formAsRecord} errors={errors} set={setStr} />
              <EditField label="Monthly Rate (₹)" field="monthlyRate" type="number" placeholder="160000" prefix="₹" form={formAsRecord} errors={errors} set={setStr} />
            </div>
          </div>

          {/* Service Areas */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Service Areas</h3>
            <EditField label="Service Areas (comma-separated)" field="serviceAreas" placeholder="Pune, Mumbai, Nashik" form={formAsRecord} errors={errors} set={setStr} />
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: -10 }}>City & State are set at listing time and cannot be changed here.</p>
          </div>

          {/* Availability */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>Available for Booking</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                {form.isAvailable ? 'Customers can book this machine' : 'Machine hidden from customers'}
              </div>
            </div>
            <button onClick={() => set('isAvailable', !form.isAvailable)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              {form.isAvailable
                ? <svg width="48" height="26" viewBox="0 0 48 26" fill="none"><rect width="48" height="26" rx="13" fill="#FF8C00"/><circle cx="35" cy="13" r="10" fill="white"/></svg>
                : <svg width="48" height="26" viewBox="0 0 48 26" fill="none"><rect width="48" height="26" rx="13" fill="#E5E7EB"/><circle cx="13" cy="13" r="10" fill="white"/></svg>}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: '#1A1A2E', borderRadius: 14, padding: '20px', marginBottom: 14 }}>
            <div style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Preview</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,140,0,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {form.category ? MACHINE_ICONS[form.category] : '❓'}
              </div>
              <div>
                <div style={{ color: '#FF8C00', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{form.category || 'Category'}</div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{form.model || 'Model Name'}</div>
              </div>
            </div>
            {[
              { label: 'Hourly', value: form.hourlyRate ? `₹${Number(form.hourlyRate).toLocaleString('en-IN')}/hr` : '—' },
              { label: 'Daily', value: form.dailyRate ? `₹${Number(form.dailyRate).toLocaleString('en-IN')}/day` : '—' },
              ...(form.weeklyRate ? [{ label: 'Weekly', value: `₹${Number(form.weeklyRate).toLocaleString('en-IN')}/wk` }] : []),
              ...(form.monthlyRate ? [{ label: 'Monthly', value: `₹${Number(form.monthlyRate).toLocaleString('en-IN')}/mo` }] : []),
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#6B7280', fontSize: 12 }}>{r.label}</span>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: '#6B7280', fontSize: 12 }}>Status</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: form.isAvailable ? '#43A047' : '#9CA3AF' }}>
                {form.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            width: '100%', padding: '14px', borderRadius: 12, background: saving ? '#E07B00' : '#FF8C00',
            color: '#fff', fontWeight: 800, fontSize: 15, border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
            onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
            onMouseLeave={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
          >
            {saving
              ? <><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> Saving...</>
              : <><Check size={16} strokeWidth={2.5} /> Save Changes</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
