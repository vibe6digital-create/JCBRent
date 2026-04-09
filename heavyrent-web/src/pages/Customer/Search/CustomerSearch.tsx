import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Clock, IndianRupee, ChevronRight, X } from 'lucide-react';
import { mockMachines, MACHINE_ICONS } from '../../../data/mockData';
import type { MachineCategory } from '../../../types';
import Badge from '../../../components/common/Badge';

const CATEGORIES: MachineCategory[] = ['JCB', 'Excavator', 'Crane', 'Bulldozer', 'Roller', 'Pokelane'];

export default function CustomerSearch() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(params.get('q') || '');
  const [category, setCategory] = useState<MachineCategory | 'All'>((params.get('category') as MachineCategory) || 'All');
  const [sort, setSort] = useState<'price_asc' | 'price_desc'>('price_asc');

  const filtered = useMemo(() => {
    let list = mockMachines.filter(m => m.approvalStatus === 'approved');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.model.toLowerCase().includes(q) ||
        m.location.city.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.vendorName.toLowerCase().includes(q)
      );
    }
    if (category !== 'All') list = list.filter(m => m.category === category);
    list.sort((a, b) => sort === 'price_asc' ? a.dailyRate - b.dailyRate : b.dailyRate - a.dailyRate);
    return list;
  }, [search, category, sort]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-in">
      {/* Search Bar */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: '#F5F5F5', borderRadius: 8, padding: '10px 14px', border: '1px solid #E5E7EB' }}>
          <Search size={15} color="#9CA3AF" strokeWidth={1.5} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search city, machine type or model..."
            style={{ flex: 1, border: 'none', background: 'none', fontSize: 14, color: '#1A1D26' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex' }}><X size={13} strokeWidth={2} /></button>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={14} color="#9CA3AF" strokeWidth={1.5} />
          <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
            style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#1A1D26', background: '#fff', cursor: 'pointer' }}>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['All', ...CATEGORIES] as const).map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            style={{
              padding: '7px 16px', borderRadius: 20, border: '1px solid',
              borderColor: category === cat ? '#FF8C00' : '#E5E7EB',
              background: category === cat ? '#FF8C00' : '#fff',
              color: category === cat ? '#fff' : '#6B7280',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {cat === 'All' ? 'All Machines' : cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 14, color: '#6B7280' }}>
          <strong style={{ color: '#1A1D26' }}>{filtered.length}</strong> machines found
        </p>
      </div>

      {/* Machine Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filtered.map(m => (
          <div key={m.id} onClick={() => navigate(`/customer/machine/${m.id}`)}
            style={{
              background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
              overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 6px 24px rgba(0,0,0,0.10)'; el.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.transform = 'none'; }}
          >
            {/* Banner */}
            <div style={{
              background: '#1A1A2E', padding: '18px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, background: 'rgba(255,140,0,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {MACHINE_ICONS[m.category]}
                </div>
                <div>
                  <div style={{ color: '#FF8C00', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{m.category}</div>
                  <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, marginTop: 2 }}>{m.model}</div>
                </div>
              </div>
              <Badge status={m.isAvailable ? 'available' : 'unavailable'} />
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <MapPin size={13} color="#9CA3AF" strokeWidth={1.5} />
                <span style={{ fontSize: 13, color: '#6B7280' }}>{m.location.city}, {m.location.state}</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, background: '#F5F5F5', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase' }}>Hourly</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Clock size={11} color="#FF8C00" strokeWidth={1.5} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1D26' }}>₹{m.hourlyRate.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div style={{ flex: 1, background: '#FFF3E0', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase' }}>Daily</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IndianRupee size={11} color="#FF8C00" strokeWidth={1.5} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1D26' }}>{m.dailyRate.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                <span style={{ fontWeight: 600, color: '#6B7280' }}>Vendor:</span> {m.vendorName}
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {m.serviceAreas.slice(0, 3).map(a => (
                  <span key={a} style={{ fontSize: 10, background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{a}</span>
                ))}
                {m.serviceAreas.length > 3 && <span style={{ fontSize: 10, color: '#9CA3AF' }}>+{m.serviceAreas.length - 3} more</span>}
              </div>

              <button style={{
                marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px', borderRadius: 8, background: '#FF8C00', color: '#fff',
                fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E07B00'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF8C00'; }}
              >
                View Details <ChevronRight size={13} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 48, textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D26', marginBottom: 6 }}>No machines found</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Try a different city or category</p>
          <button onClick={() => { setSearch(''); setCategory('All'); }} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, background: '#FF8C00', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
