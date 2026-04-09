import { useNavigate } from 'react-router-dom';
import { Plus, Clock, IndianRupee, ArrowRight } from 'lucide-react';
import { mockEstimates } from '../../../data/mockData';

const WORK_LABELS: Record<string, string> = {
  excavation: 'Excavation', leveling: 'Land Leveling', trenching: 'Trenching',
  foundation: 'Foundation', debris_removal: 'Debris Removal',
};
const AREA_LABELS: Record<string, string> = { small: 'Small (<500 sqft)', medium: 'Medium (500-2000 sqft)', large: 'Large (>2000 sqft)' };
const SOIL_LABELS: Record<string, string> = { soft: 'Soft Soil', mixed: 'Mixed', hard_rocky: 'Hard/Rocky', not_sure: 'Not Sure' };

export default function MyEstimates() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D26' }}>My Estimates</h1>
          <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Smart AI estimates you've generated</p>
        </div>
        <button onClick={() => navigate('/customer/estimate')} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
          background: '#FF8C00', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
        }}>
          <Plus size={15} strokeWidth={2} /> New Estimate
        </button>
      </div>

      {mockEstimates.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D26', marginBottom: 6 }}>No estimates yet</h3>
          <button onClick={() => navigate('/customer/estimate')} style={{ marginTop: 12, padding: '10px 24px', background: '#FF8C00', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Get First Estimate
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {mockEstimates.map(e => (
            <div key={e.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
              onMouseEnter={el => { (el.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
              onMouseLeave={el => { (el.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              <div style={{ background: '#1A1A2E', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#FF8C00', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Smart Estimate</div>
                  <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginTop: 2 }}>{WORK_LABELS[e.workType]}</div>
                </div>
                <div style={{ fontSize: 28 }}>🤖</div>
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: '#F5F5F5', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginBottom: 2 }}>AREA</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1D26' }}>{AREA_LABELS[e.areaSize]}</div>
                  </div>
                  <div style={{ background: '#F5F5F5', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginBottom: 2 }}>SOIL</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1D26' }}>{SOIL_LABELS[e.soilType]}</div>
                  </div>
                </div>
                <div style={{ background: '#FFF3E0', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginBottom: 2 }}>RECOMMENDED</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#FF8C00' }}>{e.machineCategory}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3B82F6', fontSize: 10, fontWeight: 600, marginBottom: 4 }}><Clock size={9} strokeWidth={2} />TIME</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1D26' }}>{e.estimatedTimeHoursMin}–{e.estimatedTimeHoursMax}h</div>
                  </div>
                  <div style={{ background: '#E8F5E9', borderRadius: 8, padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#43A047', fontSize: 10, fontWeight: 600, marginBottom: 4 }}><IndianRupee size={9} strokeWidth={2} />COST</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#1A1D26' }}>₹{(e.estimatedCostMin / 1000).toFixed(0)}k–₹{(e.estimatedCostMax / 1000).toFixed(0)}k</div>
                  </div>
                </div>
                <button onClick={() => navigate(`/customer/search?category=${e.machineCategory}`)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 8, background: '#FF8C00', color: '#fff',
                  fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer',
                }}>
                  Book {e.machineCategory} <ArrowRight size={12} strokeWidth={2} />
                </button>
                <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right' }}>{e.createdAt}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
