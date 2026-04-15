import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Upload } from 'lucide-react';
import { createMachine } from '../../../services/api';
import type { MachineCategory } from '../../../types';
import toast from 'react-hot-toast';

const CATEGORIES: MachineCategory[] = ['JCB', 'Excavator', 'Crane', 'Bulldozer', 'Roller', 'Pokelane'];

// ─── Field lives OUTSIDE the component so it never remounts on re-render ─────
interface FieldProps {
  label: string;
  field: string;
  type?: string;
  placeholder?: string;
  prefix?: string;
  form: Record<string, unknown>;
  errors: Record<string, string>;
  set: (k: string, v: string) => void;
}

function Field({ label, field, type = 'text', placeholder = '', prefix = '', form, errors, set }: FieldProps) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${errors[field] ? '#E53935' : '#E5E7EB'}`, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        {prefix && <span style={{ padding: '0 12px', background: '#F5F5F5', borderRight: '1px solid #E5E7EB', color: '#6B7280', fontSize: 14, alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>{prefix}</span>}
        <input
          type={type}
          value={(form[field] as string) ?? ''}
          onChange={e => set(field, e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, padding: '10px 14px', border: 'none', fontSize: 14, color: '#1A1D26', outline: 'none' }}
        />
      </div>
      {errors[field] && <p style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>{errors[field]}</p>}
    </div>
  );
}

export default function AddMachine() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: '' as MachineCategory | '',
    model: '', description: '', hourlyRate: '', dailyRate: '', weeklyRate: '', monthlyRate: '',
    city: '', state: '', serviceAreas: '', isAvailable: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.category) e.category = 'Required';
    if (!form.model.trim()) e.model = 'Required';
    if (!form.hourlyRate || isNaN(Number(form.hourlyRate))) e.hourlyRate = 'Enter a valid number';
    if (!form.dailyRate || isNaN(Number(form.dailyRate))) e.dailyRate = 'Enter a valid number';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await createMachine({
        category: form.category as MachineCategory,
        model: form.model.trim(),
        description: form.description.trim(),
        hourlyRate: Number(form.hourlyRate),
        dailyRate: Number(form.dailyRate),
        weeklyRate: form.weeklyRate ? Number(form.weeklyRate) : undefined,
        monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : undefined,
        location: { city: form.city.trim(), state: form.state.trim(), latitude: 0, longitude: 0 },
        serviceAreas: form.serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
        isAvailable: form.isAvailable,
      });
      setSaved(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit machine');
    } finally {
      setSaving(false);
    }
  };

  const formAsRecord = form as Record<string, unknown>;

  if (saved) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, padding: 40 }} className="fade-in">
      <div style={{ width: 72, height: 72, background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={36} color="#43A047" strokeWidth={2.5} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26' }}>Machine Submitted!</h2>
      <p style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', maxWidth: 360 }}>
        <strong>{form.model}</strong> has been submitted for admin approval. You'll be notified once it's approved.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate('/vendor/machines')} style={{ padding: '12px 28px', borderRadius: 10, background: '#FF8C00', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
          View My Machines
        </button>
        <button onClick={() => { setSaved(false); setForm({ category: '', model: '', description: '', hourlyRate: '', dailyRate: '', weeklyRate: '', monthlyRate: '', city: '', state: '', serviceAreas: '', isAvailable: true }); }}
          style={{ padding: '12px 28px', borderRadius: 10, background: '#fff', color: '#6B7280', fontWeight: 700, fontSize: 14, border: '1px solid #E5E7EB', cursor: 'pointer' }}>
          Add Another
        </button>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: 20, fontSize: 14 }}>
        <ArrowLeft size={16} strokeWidth={2} /> Back
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26', marginBottom: 24 }}>Add New Machine</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Photos */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px dashed #E5E7EB', padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#FF8C00'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
          >
            <Upload size={28} color="#9CA3AF" strokeWidth={1.5} style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 4 }}>Upload Machine Photos</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Click to add photos (JPG, PNG · Max 5MB each)</div>
          </div>

          {/* Category */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Machine Category *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => set('category', cat)} style={{
                  padding: '12px', borderRadius: 10, border: `2px solid ${form.category === cat ? '#FF8C00' : '#E5E7EB'}`,
                  background: form.category === cat ? '#FFF3E0' : '#FAFAFA', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  color: form.category === cat ? '#E07B00' : '#1A1D26', transition: 'all 0.15s',
                }}>
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && <p style={{ color: '#E53935', fontSize: 12, marginTop: 6 }}>{errors.category}</p>}
          </div>

          {/* Details */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Machine Details</h3>
            <Field label="Model Name *" field="model" placeholder="e.g. JCB 3DX Plus" form={formAsRecord} errors={errors} set={set} />
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe the machine condition, features, and any special capabilities..."
                rows={3} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: 8, fontSize: 14, color: '#1A1D26', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Pricing */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Pricing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Hourly Rate (₹) *" field="hourlyRate" type="number" placeholder="1200" prefix="₹" form={formAsRecord} errors={errors} set={set} />
              <Field label="Daily Rate (₹) *" field="dailyRate" type="number" placeholder="8000" prefix="₹" form={formAsRecord} errors={errors} set={set} />
              <Field label="Weekly Rate (₹)" field="weeklyRate" type="number" placeholder="45000" prefix="₹" form={formAsRecord} errors={errors} set={set} />
              <Field label="Monthly Rate (₹)" field="monthlyRate" type="number" placeholder="1,60,000" prefix="₹" form={formAsRecord} errors={errors} set={set} />
            </div>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: -6 }}>Weekly & monthly rates are optional.</p>
          </div>

          {/* Location */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Location & Service</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="City *" field="city" placeholder="Pune" form={formAsRecord} errors={errors} set={set} />
              <Field label="State *" field="state" placeholder="Maharashtra" form={formAsRecord} errors={errors} set={set} />
            </div>
            <Field label="Service Areas (comma-separated)" field="serviceAreas" placeholder="Pune, Mumbai, Nashik" form={formAsRecord} errors={errors} set={set} />
          </div>

          {/* Availability */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>Available for Booking</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Toggle to mark machine as available</div>
            </div>
            <button onClick={() => set('isAvailable', !form.isAvailable as unknown as string)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              {form.isAvailable
                ? <svg width="48" height="26" viewBox="0 0 48 26" fill="none"><rect width="48" height="26" rx="13" fill="#FF8C00"/><circle cx="35" cy="13" r="10" fill="white"/></svg>
                : <svg width="48" height="26" viewBox="0 0 48 26" fill="none"><rect width="48" height="26" rx="13" fill="#E5E7EB"/><circle cx="13" cy="13" r="10" fill="white"/></svg>}
            </button>
          </div>
        </div>

        {/* Sidebar Preview */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: '#1A1A2E', borderRadius: 14, padding: '20px', marginBottom: 14 }}>
            <div style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Preview</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,140,0,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {form.category ? ({ JCB: '🚜', Excavator: '⛏️', Crane: '🏗️', Bulldozer: '🚧', Roller: '🛞', Pokelane: '🛣️' } as Record<string, string>)[form.category] : '❓'}
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
              { label: 'Location', value: form.city || '—' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#6B7280', fontSize: 12 }}>{r.label}</span>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            width: '100%', padding: '14px', borderRadius: 12, background: saving ? '#E07B00' : '#FF8C00',
            color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
            onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
            onMouseLeave={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
          >
            {saving
              ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
              : 'Submit for Approval'
            }
          </button>
          <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>Admin will review and approve within 24 hours</p>
        </div>
      </div>
    </div>
  );
}
