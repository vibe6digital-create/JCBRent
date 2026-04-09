import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Clock, IndianRupee, Info, Upload, X } from 'lucide-react';
import type { WorkType, AreaSize, SoilType, MachineCategory } from '../../../types';

interface EstimateResult {
  machineCategory: MachineCategory;
  timeMin: number;
  timeMax: number;
  costMin: number;
  costMax: number;
}

const WORK_TYPES: { key: WorkType; label: string; icon: string }[] = [
  { key: 'excavation', label: 'Excavation', icon: '⛏️' },
  { key: 'leveling', label: 'Land Leveling', icon: '📐' },
  { key: 'trenching', label: 'Trenching', icon: '🚿' },
  { key: 'foundation', label: 'Foundation', icon: '🏗️' },
  { key: 'debris_removal', label: 'Debris Removal', icon: '🧹' },
];

const AREA_SIZES: { key: AreaSize; label: string; desc: string }[] = [
  { key: 'small', label: 'Small', desc: '< 500 sqft' },
  { key: 'medium', label: 'Medium', desc: '500 – 2000 sqft' },
  { key: 'large', label: 'Large', desc: '> 2000 sqft' },
];

const SOIL_TYPES: { key: SoilType; label: string }[] = [
  { key: 'soft', label: 'Soft Soil' },
  { key: 'mixed', label: 'Mixed' },
  { key: 'hard_rocky', label: 'Hard / Rocky' },
  { key: 'not_sure', label: 'Not Sure' },
];

function computeEstimate(workType: WorkType, area: AreaSize, soil: SoilType): EstimateResult {
  const baseHours: Record<AreaSize, [number, number]> = { small: [2, 4], medium: [6, 10], large: [14, 22] };
  const soilMult: Record<SoilType, number> = { soft: 1, mixed: 1.3, hard_rocky: 1.8, not_sure: 1.4 };
  const machine: Record<WorkType, MachineCategory> = { excavation: 'Excavator', leveling: 'Bulldozer', trenching: 'JCB', foundation: 'JCB', debris_removal: 'Excavator' };
  const rate: Record<MachineCategory, number> = { Excavator: 1800, Bulldozer: 1600, JCB: 1200, Crane: 2500, Roller: 900, Pokelane: 2200 };
  const [hMin, hMax] = baseHours[area];
  const mult = soilMult[soil];
  const tMin = Math.round(hMin * mult);
  const tMax = Math.round(hMax * mult);
  const r = rate[machine[workType]];
  return { machineCategory: machine[workType], timeMin: tMin, timeMax: tMax, costMin: tMin * r, costMax: tMax * r };
}

export default function CustomerEstimate() {
  const navigate = useNavigate();
  const [workType, setWorkType] = useState<WorkType | ''>('');
  const [areaSize, setAreaSize] = useState<AreaSize | ''>('');
  const [soilType, setSoilType] = useState<SoilType | ''>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [result, setResult] = useState<EstimateResult | null>(null);

  const canSubmit = workType && areaSize && soilType;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setResult(computeEstimate(workType as WorkType, areaSize as AreaSize, soilType as SoilType));
  };

  const handlePhotoAdd = () => {
    setPhotos(p => [...p, `Photo ${p.length + 1}`]);
  };

  if (result) return (
    <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🤖</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D26', marginBottom: 6 }}>Smart Estimate Ready!</h1>
        <p style={{ color: '#9CA3AF', fontSize: 14 }}>Based on your site conditions and work type</p>
      </div>

      <div style={{ background: '#1A1A2E', borderRadius: 16, padding: '24px', marginBottom: 16 }}>
        <div style={{ color: '#FF8C00', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Recommended Machine</div>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 16 }}>{result.machineCategory}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#3B82F6', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
              <Clock size={11} strokeWidth={2} />Time Range
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26' }}>{result.timeMin}–{result.timeMax} hrs</div>
          </div>
          <div style={{ background: '#E8F5E9', borderRadius: 10, padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#43A047', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
              <IndianRupee size={11} strokeWidth={2} />Cost Range
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1D26' }}>₹{result.costMin.toLocaleString('en-IN')}–<br />₹{result.costMax.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A', padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 10 }}>
        <Info size={16} color="#D97706" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ color: '#92400E', fontSize: 13, lineHeight: 1.6 }}>
          This is an AI-powered estimate based on typical conditions. Actual costs may vary based on site accessibility, operator rates, and local factors.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate(`/customer/search?category=${result.machineCategory}`)} style={{
          flex: 1, padding: '14px', borderRadius: 12, background: '#FF8C00', color: '#fff',
          fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Book {result.machineCategory} Now <ArrowRight size={15} strokeWidth={2} />
        </button>
        <button onClick={() => setResult(null)} style={{
          flex: 1, padding: '14px', borderRadius: 12, background: '#fff', color: '#6B7280',
          fontWeight: 700, fontSize: 14, border: '1.5px solid #E5E7EB', cursor: 'pointer',
        }}>
          New Estimate
        </button>
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF3E0', border: '1px solid rgba(255,140,0,0.3)', borderRadius: 20, padding: '4px 12px', marginBottom: 10 }}>
          <Zap size={12} color="#FF8C00" strokeWidth={2} fill="#FF8C00" />
          <span style={{ color: '#E07B00', fontSize: 12, fontWeight: 700 }}>AI Powered</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D26', marginBottom: 4 }}>Smart Cost Estimate</h1>
        <p style={{ color: '#9CA3AF', fontSize: 14 }}>Answer 3 questions to get an instant time and cost estimate</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Photo Upload */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px dashed #E5E7EB', padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 12 }}>Site Photos (Optional)</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ width: 72, height: 72, background: '#F5F5F5', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: 20 }}>📷</span>
                <span style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{p}</span>
                <button onClick={() => setPhotos(ph => ph.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#E53935', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={10} strokeWidth={2.5} />
                </button>
              </div>
            ))}
            <button onClick={handlePhotoAdd} style={{ width: 72, height: 72, background: '#F5F5F5', borderRadius: 8, border: '1.5px dashed #D1D5DB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4 }}>
              <Upload size={16} color="#9CA3AF" strokeWidth={1.5} />
              <span style={{ fontSize: 10, color: '#9CA3AF' }}>Add Photo</span>
            </button>
          </div>
        </div>

        {/* Work Type */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 14 }}>1. Type of Work *</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {WORK_TYPES.map(wt => (
              <button key={wt.key} onClick={() => setWorkType(wt.key)} style={{
                padding: '12px', borderRadius: 10, border: `2px solid ${workType === wt.key ? '#FF8C00' : '#E5E7EB'}`,
                background: workType === wt.key ? '#FFF3E0' : '#FAFAFA', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{wt.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: workType === wt.key ? '#E07B00' : '#1A1D26' }}>{wt.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Area Size */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 14 }}>2. Area Size *</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {AREA_SIZES.map(a => (
              <button key={a.key} onClick={() => setAreaSize(a.key)} style={{
                padding: '14px', borderRadius: 10, border: `2px solid ${areaSize === a.key ? '#FF8C00' : '#E5E7EB'}`,
                background: areaSize === a.key ? '#FFF3E0' : '#FAFAFA', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: areaSize === a.key ? '#E07B00' : '#1A1D26', marginBottom: 3 }}>{a.label}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{a.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Soil Type */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 14 }}>3. Soil Type *</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {SOIL_TYPES.map(s => (
              <button key={s.key} onClick={() => setSoilType(s.key)} style={{
                padding: '12px 16px', borderRadius: 10, border: `2px solid ${soilType === s.key ? '#FF8C00' : '#E5E7EB'}`,
                background: soilType === s.key ? '#FFF3E0' : '#FAFAFA', cursor: 'pointer',
                textAlign: 'left', fontSize: 14, fontWeight: 600,
                color: soilType === s.key ? '#E07B00' : '#1A1D26', transition: 'all 0.15s',
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!canSubmit} style={{
          padding: '16px', borderRadius: 12, background: canSubmit ? '#FF8C00' : '#E5E7EB',
          color: canSubmit ? '#fff' : '#9CA3AF', fontWeight: 800, fontSize: 15, border: 'none',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s',
        }}
          onMouseEnter={e => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
          onMouseLeave={e => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
        >
          <Zap size={16} strokeWidth={2} fill={canSubmit ? '#fff' : '#9CA3AF'} />
          Get Smart Estimate
        </button>
      </div>
    </div>
  );
}
