import { useState, useEffect } from 'react';
import { Search, Clock, IndianRupee } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { getEstimates } from '../../services/api';
import type { Estimate } from '../../types';

const workTypeLabels: Record<string, string> = {
  excavation: 'Excavation',
  leveling: 'Leveling',
  trenching: 'Trenching',
  foundation: 'Foundation',
  debris_removal: 'Debris Removal',
};

const areaSizeLabels: Record<string, string> = {
  small: 'Small (<500 sqft)',
  medium: 'Medium (500-2000 sqft)',
  large: 'Large (>2000 sqft)',
};

const soilTypeLabels: Record<string, string> = {
  soft: 'Soft Soil',
  mixed: 'Mixed Soil',
  hard_rocky: 'Hard / Rocky',
  not_sure: 'Not Sure',
};

export default function Estimates() {
  const [search, setSearch] = useState('');
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEstimates()
      .then((data: any) => setEstimates(data.estimates || data || []))
      .catch(() => setEstimates([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = estimates.filter(e =>
    e.customerName.toLowerCase().includes(search.toLowerCase()) ||
    workTypeLabels[e.workType]?.toLowerCase().includes(search.toLowerCase()) ||
    (e.machineCategory?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ background: '#E5E7EB', height: 60, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#F3F4F6', height: 16, borderRadius: 4, width: '60%' }} />
            <div style={{ background: '#F3F4F6', height: 12, borderRadius: 4, width: '40%' }} />
            <div style={{ background: '#F3F4F6', height: 40, borderRadius: 8 }} />
            <div style={{ background: '#F3F4F6', height: 50, borderRadius: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Search */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F5F5', borderRadius: 8, padding: '8px 12px', border: '1px solid #E5E7EB', maxWidth: 400 }}>
          <Search size={14} color="#9CA3AF" strokeWidth={1.5} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search estimates..."
            style={{ border: 'none', background: 'none', fontSize: 13, color: '#1A1D26', width: '100%' }}
          />
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filtered.map(e => (
          <div key={e.id} style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            transition: 'box-shadow 0.2s',
          }}
            onMouseEnter={el => { (el.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
            onMouseLeave={el => { (el.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            {/* Header */}
            <div style={{ background: '#1A1A2E', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#FF8C00', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Smart Estimate</div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginTop: 2 }}>{workTypeLabels[e.workType]}</div>
              </div>
              <Badge status={e.workType} />
            </div>

            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Customer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Customer</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>{e.customerName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Date</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>{(e.createdAt as any)?._seconds ? new Date((e.createdAt as any)._seconds * 1000).toLocaleDateString('en-IN') : '—'}</div>
                </div>
              </div>

              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ background: '#F5F5F5', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Area Size</div>
                  <div style={{ fontSize: 13, color: '#1A1D26', fontWeight: 600 }}>{areaSizeLabels[e.areaSize]}</div>
                </div>
                <div style={{ background: '#F5F5F5', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Soil Type</div>
                  <div style={{ fontSize: 13, color: '#1A1D26', fontWeight: 600 }}>{soilTypeLabels[e.soilType]}</div>
                </div>
                {e.machineCategory && (
                  <div style={{ background: '#FFF3E0', borderRadius: 8, padding: '10px 12px', gridColumn: '1/-1' }}>
                    <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Recommended Machine</div>
                    <div style={{ fontSize: 13, color: '#FF8C00', fontWeight: 700 }}>{e.machineCategory}</div>
                  </div>
                )}
              </div>

              {/* Estimates */}
              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#3B82F6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    <Clock size={10} strokeWidth={1.5} />Time Range
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>
                    {e.estimatedTimeHoursMin}–{e.estimatedTimeHoursMax} hrs
                  </div>
                </div>
                <div style={{ background: '#E8F5E9', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#43A047', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    <IndianRupee size={10} strokeWidth={1.5} />Cost Range
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1D26' }}>
                    ₹{e.estimatedCostMin.toLocaleString('en-IN')}–₹{e.estimatedCostMax.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
          No estimates found.
        </div>
      )}
    </div>
  );
}
