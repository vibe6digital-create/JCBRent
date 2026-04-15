import { useState, useEffect } from 'react';
import { Plus, ToggleLeft, ToggleRight, Trash2, X, Check, Tag, AlertCircle } from 'lucide-react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../services/api';
import type { Coupon } from '../../types';
import toast from 'react-hot-toast';

const emptyForm = {
  code: '',
  discountType: 'percent' as 'percent' | 'flat',
  discountValue: '',
  description: '',
  expiryDate: '',
  maxUses: '',
  minBookingAmount: '',
  maxDiscount: '',
};

function fmtDate(val: any): string {
  if (!val) return '—';
  const d = val?._seconds ? new Date(val._seconds * 1000) : new Date(val);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isExpired(val: any): boolean {
  if (!val) return false;
  const d = val?._seconds ? new Date(val._seconds * 1000) : new Date(val);
  return d < new Date();
}

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await getCoupons();
        setCoupons(res.coupons || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load coupons');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAdd = async () => {
    if (!form.code.trim() || !form.discountValue) {
      toast.error('Code and discount value are required');
      return;
    }
    setSaving(true);
    try {
      const body: any = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
      };
      if (form.description.trim()) body.description = form.description.trim();
      if (form.expiryDate) body.expiryDate = form.expiryDate;
      if (form.maxUses) body.maxUses = Number(form.maxUses);
      if (form.minBookingAmount) body.minBookingAmount = Number(form.minBookingAmount);
      if (form.maxDiscount && form.discountType === 'percent') body.maxDiscount = Number(form.maxDiscount);

      const res: any = await createCoupon(body);
      setCoupons(prev => [res.coupon, ...prev]);
      setForm(emptyForm);
      setShowAdd(false);
      toast.success(`Coupon ${body.code} created`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await updateCoupon(coupon.id, { isActive: !coupon.isActive });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
      toast.success(coupon.isActive ? 'Coupon deactivated' : 'Coupon activated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update coupon');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success('Coupon deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete coupon');
    } finally {
      setDeletingId(null);
    }
  };

  const f = (key: keyof typeof emptyForm, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const active = coupons.filter(c => c.isActive && !isExpired(c.expiryDate)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>Coupon Codes</h2>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>
            {coupons.length} total · {active} active
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8, background: '#FF8C00', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
        >
          <Plus size={16} strokeWidth={1.5} /> Create Coupon
        </button>
      </div>

      {/* Create Form */}
      {showAdd && (
        <div style={{ background: '#fff', borderRadius: 12, border: '2px solid #FF8C00', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>New Coupon</h3>
            <button onClick={() => { setShowAdd(false); setForm(emptyForm); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={lbl}>Coupon Code *</label>
              <input value={form.code} onChange={e => f('code', e.target.value.toUpperCase())} placeholder="e.g. SAVE20"
                style={inp} />
            </div>

            <div>
              <label style={lbl}>Discount Type *</label>
              <select value={form.discountType} onChange={e => f('discountType', e.target.value as any)} style={inp}>
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>

            <div>
              <label style={lbl}>
                {form.discountType === 'percent' ? 'Discount (%) *' : 'Discount Amount (₹) *'}
              </label>
              <input type="number" min={1} value={form.discountValue} onChange={e => f('discountValue', e.target.value)}
                placeholder={form.discountType === 'percent' ? '20' : '500'} style={inp} />
            </div>

            {form.discountType === 'percent' && (
              <div>
                <label style={lbl}>Max Discount Cap (₹)</label>
                <input type="number" min={1} value={form.maxDiscount} onChange={e => f('maxDiscount', e.target.value)}
                  placeholder="e.g. 1000" style={inp} />
              </div>
            )}

            <div>
              <label style={lbl}>Min Booking Amount (₹)</label>
              <input type="number" min={0} value={form.minBookingAmount} onChange={e => f('minBookingAmount', e.target.value)}
                placeholder="e.g. 500" style={inp} />
            </div>

            <div>
              <label style={lbl}>Max Uses (leave blank = unlimited)</label>
              <input type="number" min={1} value={form.maxUses} onChange={e => f('maxUses', e.target.value)}
                placeholder="e.g. 100" style={inp} />
            </div>

            <div>
              <label style={lbl}>Expiry Date</label>
              <input type="date" value={form.expiryDate} min={new Date().toISOString().split('T')[0]}
                onChange={e => f('expiryDate', e.target.value)} style={inp} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Description (shown to users)</label>
              <input value={form.description} onChange={e => f('description', e.target.value)}
                placeholder="e.g. First booking discount" style={inp} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowAdd(false); setForm(emptyForm); }}
              style={{ padding: '9px 18px', borderRadius: 8, background: '#F3F4F6', color: '#6B7280', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleAdd} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: saving ? '#FFC166' : '#FF8C00', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
              <Check size={14} strokeWidth={2} /> {saving ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {coupons.length === 0 && !showAdd && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB' }}>
          <div style={{ width: 56, height: 56, background: '#FFF3E0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Tag size={24} color="#FF8C00" strokeWidth={1.5} />
          </div>
          <p style={{ color: '#6B7280', fontSize: 14 }}>No coupons yet. Create one to offer discounts.</p>
        </div>
      )}

      {/* Coupon Table */}
      {coupons.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                {['Code', 'Discount', 'Description', 'Min Order', 'Used / Max', 'Expiry', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => {
                const expired = isExpired(c.expiryDate);
                const exhausted = c.maxUses ? c.usedCount >= c.maxUses : false;
                const statusBad = !c.isActive || expired || exhausted;

                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F9FAFB', transition: 'background 0.1s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 14, color: '#1A1D26', letterSpacing: '0.05em', background: '#FFF3E0', padding: '3px 8px', borderRadius: 6 }}>
                        {c.code}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#FF8C00' }}>
                      {c.discountType === 'percent'
                        ? `${c.discountValue}%${c.maxDiscount ? ` (max ₹${c.maxDiscount.toLocaleString('en-IN')})` : ''}`
                        : `₹${c.discountValue.toLocaleString('en-IN')}`}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6B7280', maxWidth: 200 }}>
                      {c.description || <span style={{ color: '#D1D5DB' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>
                      {c.minBookingAmount ? `₹${c.minBookingAmount.toLocaleString('en-IN')}` : <span style={{ color: '#D1D5DB' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: exhausted ? '#E53935' : '#374151', fontWeight: exhausted ? 700 : 400 }}>
                        {c.usedCount ?? 0}{c.maxUses ? ` / ${c.maxUses}` : ' / ∞'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {c.expiryDate ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: expired ? '#E53935' : '#6B7280' }}>
                          {expired && <AlertCircle size={12} strokeWidth={2} />}
                          {fmtDate(c.expiryDate)}
                        </span>
                      ) : <span style={{ color: '#D1D5DB' }}>No expiry</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                        background: statusBad ? '#FEF2F2' : '#F0FDF4',
                        color: statusBad ? '#E53935' : '#16A34A',
                        border: `1px solid ${statusBad ? '#FECACA' : '#BBF7D0'}`,
                      }}>
                        {!c.isActive ? 'Inactive' : expired ? 'Expired' : exhausted ? 'Exhausted' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => toggleActive(c)}
                          title={c.isActive ? 'Deactivate' : 'Activate'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: c.isActive ? '#FF8C00' : '#9CA3AF', padding: 4, borderRadius: 6 }}>
                          {c.isActive ? <ToggleRight size={22} strokeWidth={1.5} /> : <ToggleLeft size={22} strokeWidth={1.5} />}
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          disabled={deletingId === c.id}
                          title="Delete coupon"
                          style={{ background: 'none', border: 'none', cursor: deletingId === c.id ? 'not-allowed' : 'pointer', display: 'flex', color: '#9CA3AF', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E53935'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; }}>
                          <Trash2 size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 };
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#1A1D26', background: '#FAFAFA', boxSizing: 'border-box' };
