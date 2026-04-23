import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Zap, ArrowRight, Clock, IndianRupee, Info, Upload, X, Sparkles } from 'lucide-react';
import { createEstimate } from '../../../services/api';
import { storage, auth } from '../../../config/firebase';
import type { WorkType, AreaSize, SoilType, MachineCategory } from '../../../types';

// Machine category hint per work type (sent to backend as context for Gemini)
const MACHINE_HINT: Record<WorkType, MachineCategory> = {
  excavation: 'Excavator',
  leveling: 'Bulldozer',
  trenching: 'JCB',
  foundation: 'JCB',
  debris_removal: 'Excavator',
};

interface EstimateResult {
  id: string;
  machineCategory: MachineCategory;
  estimatedTimeHoursMin: number;
  estimatedTimeHoursMax: number;
  estimatedCostMin: number;
  estimatedCostMax: number;
  aiInsight?: string;
  disclaimer: string;
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

export default function CustomerEstimate() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [workType, setWorkType] = useState<WorkType | ''>('');
  const [areaSize, setAreaSize] = useState<AreaSize | ''>('');
  const [soilType, setSoilType] = useState<SoilType | ''>('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');

  const canSubmit = workType && areaSize && soilType && photoFiles.length > 0 && !loading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 5 - photoFiles.length;
    const toAdd = files.slice(0, remaining);
    setPhotoFiles(prev => [...prev, ...toAdd]);
    setPhotoPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    // Reset input so same file can be re-added after removal
    e.target.value = '';
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(photoPreviews[idx]);
    setPhotoFiles(prev => prev.filter((_, i) => i !== idx));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const uid = auth.currentUser?.uid ?? 'anonymous';
    const urls: string[] = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];
      const storageRef = ref(storage, `estimates/${uid}/${Date.now()}_${i}.jpg`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      urls.push(url);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    setLoadingMsg('Uploading site photos...');
    try {
      const photoUrls = await uploadPhotos();
      setLoadingMsg('Analyzing with Gemini AI...');
      const machineCategory = MACHINE_HINT[workType as WorkType];
      const response = await createEstimate({
        workType: workType as WorkType,
        areaSize: areaSize as AreaSize,
        soilType: soilType as SoilType,
        photoUrls,
        machineCategory,
      });
      setResult((response as { estimate: EstimateResult }).estimate);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get estimate. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleReset = () => {
    photoPreviews.forEach(url => URL.revokeObjectURL(url));
    setResult(null);
    setWorkType('');
    setAreaSize('');
    setSoilType('');
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setError('');
  };

  // ─── Result Screen ────────────────────────────────────────────────────────────
  if (result) return (
    <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🤖</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D26', marginBottom: 6 }}>Smart Estimate Ready!</h1>
        <p style={{ color: '#9CA3AF', fontSize: 14 }}>AI-analyzed based on your site photos and conditions</p>
      </div>

      <div style={{ background: '#1A1A2E', borderRadius: 16, padding: '24px', marginBottom: 16 }}>
        <div style={{ color: '#FF8C00', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Recommended Machine</div>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 16 }}>{result.machineCategory}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#3B82F6', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
              <Clock size={11} strokeWidth={2} />Time Range
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26' }}>
              {result.estimatedTimeHoursMin}–{result.estimatedTimeHoursMax} hrs
            </div>
          </div>
          <div style={{ background: '#E8F5E9', borderRadius: 10, padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#43A047', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
              <IndianRupee size={11} strokeWidth={2} />Cost Range
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1D26' }}>
              ₹{result.estimatedCostMin.toLocaleString('en-IN')}–<br />
              ₹{result.estimatedCostMax.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {result.aiInsight && (
        <div style={{ background: '#F0FDF4', borderRadius: 12, border: '1px solid #86EFAC', padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 10 }}>
          <Sparkles size={16} color="#16A34A" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ color: '#15803D', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>AI Insight</div>
            <p style={{ color: '#166534', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{result.aiInsight}</p>
          </div>
        </div>
      )}

      <div style={{ background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A', padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 10 }}>
        <Info size={16} color="#D97706" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ color: '#92400E', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
          {result.disclaimer || 'This is an AI-powered estimate. Actual costs may vary based on site accessibility, operator rates, and local factors.'}
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
        <button onClick={handleReset} style={{
          flex: 1, padding: '14px', borderRadius: 12, background: '#fff', color: '#6B7280',
          fontWeight: 700, fontSize: 14, border: '1.5px solid #E5E7EB', cursor: 'pointer',
        }}>
          New Estimate
        </button>
      </div>
    </div>
  );

  // ─── Input Screen ─────────────────────────────────────────────────────────────
  return (
    <div className="fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF3E0', border: '1px solid rgba(255,140,0,0.3)', borderRadius: 20, padding: '4px 12px', marginBottom: 10 }}>
          <Zap size={12} color="#FF8C00" strokeWidth={2} fill="#FF8C00" />
          <span style={{ color: '#E07B00', fontSize: 12, fontWeight: 700 }}>AI Powered by Gemini</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D26', marginBottom: 4 }}>Smart Cost Estimate</h1>
        <p style={{ color: '#9CA3AF', fontSize: 14 }}>Upload a site photo + answer 3 questions for an AI-powered estimate</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Photo Upload — Required */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1.5px ${photoFiles.length === 0 ? 'dashed #F59E0B' : 'solid #E5E7EB'}`, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>Site Photos</div>
            <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>Required</span>
            <span style={{ color: '#9CA3AF', fontSize: 12, marginLeft: 'auto' }}>{photoFiles.length}/5</span>
          </div>
          <p style={{ color: '#9CA3AF', fontSize: 12, margin: '0 0 12px' }}>
            Gemini AI will analyze your work site photos to give a more accurate estimate
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {photoPreviews.map((src, i) => (
              <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                <img src={src} alt={`Site photo ${i + 1}`} style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', display: 'block', border: '1px solid #E5E7EB' }} />
                <button onClick={() => removePhoto(i)} style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 20, height: 20, borderRadius: '50%', background: '#E53935',
                  border: 'none', color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', padding: 0,
                }}>
                  <X size={11} strokeWidth={3} />
                </button>
              </div>
            ))}
            {photoFiles.length < 5 && (
              <button onClick={() => fileInputRef.current?.click()} style={{
                width: 80, height: 80, background: '#F9FAFB', borderRadius: 10,
                border: '1.5px dashed #D1D5DB', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4,
              }}>
                <Upload size={18} color="#9CA3AF" strokeWidth={1.5} />
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>Add Photo</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Work Type */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26', marginBottom: 14 }}>1. Type of Work *</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {WORK_TYPES.map(wt => (
              <button key={wt.key} onClick={() => setWorkType(wt.key)} style={{
                padding: '12px', borderRadius: 10,
                border: `2px solid ${workType === wt.key ? '#FF8C00' : '#E5E7EB'}`,
                background: workType === wt.key ? '#FFF3E0' : '#FAFAFA',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
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
                padding: '14px', borderRadius: 10,
                border: `2px solid ${areaSize === a.key ? '#FF8C00' : '#E5E7EB'}`,
                background: areaSize === a.key ? '#FFF3E0' : '#FAFAFA',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
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
                padding: '12px 16px', borderRadius: 10,
                border: `2px solid ${soilType === s.key ? '#FF8C00' : '#E5E7EB'}`,
                background: soilType === s.key ? '#FFF3E0' : '#FAFAFA',
                cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 600,
                color: soilType === s.key ? '#E07B00' : '#1A1D26', transition: 'all 0.15s',
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', color: '#DC2626', fontSize: 13 }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={!canSubmit} style={{
          padding: '16px', borderRadius: 12,
          background: canSubmit ? '#FF8C00' : '#E5E7EB',
          color: canSubmit ? '#fff' : '#9CA3AF',
          fontWeight: 800, fontSize: 15, border: 'none',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.15s',
        }}>
          {loading ? (
            <>
              <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              {loadingMsg || 'Processing...'}
            </>
          ) : (
            <>
              <Zap size={16} strokeWidth={2} fill={canSubmit ? '#fff' : '#9CA3AF'} />
              {photoFiles.length === 0 ? 'Upload a photo to continue' : 'Get AI Estimate'}
            </>
          )}
        </button>

        {photoFiles.length === 0 && (
          <p style={{ textAlign: 'center', color: '#F59E0B', fontSize: 13, fontWeight: 600, margin: '-10px 0 0' }}>
            At least 1 site photo is required for AI analysis
          </p>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
