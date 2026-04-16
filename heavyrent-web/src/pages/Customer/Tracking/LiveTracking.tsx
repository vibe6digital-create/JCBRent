import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, AlertTriangle, Wifi, WifiOff, RefreshCw, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getBookingById } from '../../../services/api';
import type { Booking } from '../../../types';

// ─── Fix Leaflet default icons broken by Vite's asset bundling ────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Custom map icons ─────────────────────────────────────────────────────────
const vendorIcon = L.divIcon({
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -26],
  html: `
    <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(255,140,0,0.25);
        animation:liveRing 2s ease-out infinite;
      "></div>
      <div style="
        width:36px;height:36px;background:#FF8C00;border-radius:50%;
        border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;
        font-size:18px;position:relative;z-index:1;
      ">🚜</div>
    </div>`,
});

const workSiteIcon = L.divIcon({
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
  html: `
    <div style="
      width:36px;height:36px;background:#E53935;border-radius:50%;
      border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;font-size:17px;
    ">🏗️</div>`,
});

// ─── Machine emoji map ────────────────────────────────────────────────────────
const MACHINE_ICONS: Record<string, string> = {
  JCB: '🚜', Excavator: '⛏️', Crane: '🏗️', Bulldozer: '🚧', Roller: '🛞', Pokelane: '🛣️',
};

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Smoothly re-centres the map when vendor moves ───────────────────────────
function MapPanner({ center }: { center: [number, number] }) {
  const map = useMap();
  const prev = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!prev.current || prev.current[0] !== center[0] || prev.current[1] !== center[1]) {
      map.panTo(center, { animate: true, duration: 0.8 });
      prev.current = center;
    }
  }, [center, map]);
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LiveTracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking]           = useState<Booking | null>(null);
  const [loading, setLoading]           = useState(true);
  const [vendorLat, setVendorLat]       = useState<number | null>(null);
  const [vendorLng, setVendorLng]       = useState<number | null>(null);
  const [workLat, setWorkLat]           = useState<number | null>(null);
  const [workLng, setWorkLng]           = useState<number | null>(null);
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo]     = useState(0);
  const [geocoding, setGeocoding]       = useState(false);
  const [geocoded, setGeocoded]         = useState(false);
  const [sosActive, setSosActive]       = useState(false);

  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const bookingRef = useRef<Booking | null>(null);

  // ── Poll backend for vendor GPS every 5 s ──
  const fetchLocation = useCallback(async () => {
    if (!id) return;
    try {
      const res: any = await getBookingById(id);
      const b: Booking = res.booking ?? res;
      setBooking(b);
      bookingRef.current = b;

      const lat = b.vendorLat;
      const lng = b.vendorLng;
      if (lat && lng && lat !== 0 && lng !== 0) {
        setVendorLat(lat);
        setVendorLng(lng);
        setLastUpdated(new Date());
        setSecondsAgo(0);
      }
    } catch (_) {
      // network blip — keep existing data
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLocation();
    pollRef.current = setInterval(fetchLocation, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchLocation]);

  // ── "X seconds ago" ticker ──
  useEffect(() => {
    tickRef.current = setInterval(() => setSecondsAgo(s => s + 1), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  // ── Geocode work-site address once via Nominatim (free, no key) ──
  useEffect(() => {
    if (!booking || geocoded) return;
    const address = booking.workLocation;
    const city    = booking.workCity ?? '';
    if (!address) return;

    setGeocoding(true);
    setGeocoded(true);  // only try once even if it fails
    const q = encodeURIComponent(`${address}, ${city}, India`);
    fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'HeavyRent/1.0' },
    })
      .then(r => r.json())
      .then((data: { lat: string; lon: string }[]) => {
        if (data.length > 0) {
          setWorkLat(parseFloat(data[0].lat));
          setWorkLng(parseFloat(data[0].lon));
        }
      })
      .catch(() => {/* no work site pin if geocoding fails */})
      .finally(() => setGeocoding(false));
  }, [booking, geocoded]);

  // ─── Derived state ────────────────────────────────────────────────────────
  const distance =
    vendorLat && vendorLng && workLat && workLng
      ? haversineKm(vendorLat, vendorLng, workLat, workLng)
      : null;

  const isArrived  = distance !== null && distance < 0.15;
  const mapCenter: [number, number] =
    vendorLat && vendorLng ? [vendorLat, vendorLng] : [20.5937, 78.9629];

  const staleSec = 30;   // GPS is "stale" if > 30 s old
  const gpsStale = lastUpdated && secondsAgo > staleSec;

  const handleSOS = () => {
    setSosActive(true);
    window.open('tel:100', '_self');
  };

  // ─── Loading / not found ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <div>Loading tracking...</div>
      </div>
    );
  }
  if (!booking) return null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fade-in">
      {/* CSS for Leaflet marker animation + map rounding */}
      <style>{`
        @keyframes liveRing {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .leaflet-container { font-family: inherit; }
      `}</style>

      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: 20, fontSize: 14 }}
      >
        <ArrowLeft size={16} strokeWidth={2} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

        {/* ── Left: Map ───────────────────────────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>

          {/* Map header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: vendorLat ? (gpsStale ? '#F59E0B' : '#43A047') : '#9CA3AF',
                boxShadow: vendorLat && !gpsStale ? '0 0 0 3px rgba(67,160,71,0.2)' : 'none',
              }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1D26' }}>
                {vendorLat ? 'Live Vehicle Tracking' : 'Waiting for Vendor GPS…'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {vendorLat ? (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
                  color: gpsStale ? '#F59E0B' : '#43A047',
                }}>
                  {gpsStale ? <WifiOff size={12} /> : <Wifi size={12} />}
                  {secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', fontSize: 12 }}>
                  <WifiOff size={12} /> No GPS yet
                </span>
              )}
              {isArrived && (
                <span style={{ background: '#E8F5E9', color: '#43A047', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                  Arrived!
                </span>
              )}
            </div>
          </div>

          {/* Map or waiting state */}
          {vendorLat && vendorLng ? (
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ height: 400, width: '100%' }}
              scrollWheelZoom
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapPanner center={mapCenter} />

              {/* Vendor live marker */}
              <Marker position={[vendorLat, vendorLng]} icon={vendorIcon}>
                <Popup>
                  <strong>{booking.vendorName || 'Vendor'}</strong><br />
                  Updated: {secondsAgo < 5 ? 'just now' : `${secondsAgo}s ago`}
                </Popup>
              </Marker>

              {/* Work site marker */}
              {workLat && workLng && (
                <Marker position={[workLat, workLng]} icon={workSiteIcon}>
                  <Popup>
                    <strong>Work Site</strong><br />
                    {booking.workLocation}
                  </Popup>
                </Marker>
              )}

              {/* Dashed route line */}
              {workLat && workLng && (
                <Polyline
                  positions={[[vendorLat, vendorLng], [workLat, workLng]]}
                  pathOptions={{ color: '#FF8C00', weight: 3, dashArray: '10 7', opacity: 0.8 }}
                />
              )}
            </MapContainer>
          ) : (
            /* ── No GPS yet placeholder ── */
            <div style={{
              height: 400, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: '#F8FAFC', gap: 14,
            }}>
              <div style={{ fontSize: 52 }}>📡</div>
              <div style={{ fontWeight: 700, color: '#1A1D26', fontSize: 16 }}>Waiting for vendor location</div>
              <div style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', maxWidth: 260 }}>
                The vendor's GPS marker will appear here automatically once they start travelling to your site.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F59E0B', fontSize: 13, fontWeight: 600 }}>
                <RefreshCw size={13} />
                Checking every 5 seconds…
              </div>
            </div>
          )}

          {/* Map legend */}
          {vendorLat && (
            <div style={{ padding: '10px 20px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF8C00', display: 'inline-block' }} />
                Vendor (live)
              </div>
              {workLat && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#E53935', display: 'inline-block' }} />
                  Your Work Site
                </div>
              )}
              {workLat && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                  <span style={{ width: 22, height: 3, background: '#FF8C00', display: 'inline-block', borderTop: '2px dashed #FF8C00' }} />
                  Route
                </div>
              )}
              <div style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF' }}>
                Map © OpenStreetMap
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Info panel ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Machine card */}
          <div style={{ background: '#1A1A2E', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,140,0,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {MACHINE_ICONS[booking.machineCategory] ?? '🚜'}
              </div>
              <div>
                <div style={{ color: '#FF8C00', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {booking.machineCategory}
                </div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{booking.machineModel}</div>
              </div>
            </div>
            <a
              href={`tel:${booking.vendorPhone}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '9px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}
            >
              <Phone size={13} strokeWidth={1.5} /> Call Vendor
            </a>
          </div>

          {/* Live stats */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            {[
              {
                icon: '📍',
                label: 'Distance',
                value: distance !== null ? `${distance.toFixed(2)} km` : '—',
                color: '#FF8C00',
              },
              {
                icon: '🔄',
                label: 'Status',
                value: isArrived ? 'Arrived ✓' : vendorLat ? 'En Route' : 'Awaiting',
                color: isArrived ? '#43A047' : vendorLat ? '#F59E0B' : '#9CA3AF',
              },
              {
                icon: '⏱️',
                label: 'GPS Signal',
                value: !vendorLat ? 'No signal' : gpsStale ? `Stale (${secondsAgo}s)` : secondsAgo < 5 ? 'Live' : `${secondsAgo}s ago`,
                color: !vendorLat ? '#9CA3AF' : gpsStale ? '#F59E0B' : '#43A047',
              },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #F9FAFB' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{s.label}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Work address */}
          <div style={{ background: '#F8FAFC', borderRadius: 14, border: '1px solid #E5E7EB', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <MapPin size={13} color="#9CA3AF" />
              <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Work Site Address
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#1A1D26', fontWeight: 600, lineHeight: 1.4 }}>{booking.workLocation}</div>
            {booking.workCity && (
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{booking.workCity}</div>
            )}
            {geocoding && (
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={10} /> Locating on map…
              </div>
            )}
          </div>

          {/* Emergency SOS */}
          <button
            onClick={handleSOS}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: 14,
              border: 'none', transition: 'all 0.15s',
              background: sosActive ? '#B71C1C' : '#E53935',
              color: '#fff',
              boxShadow: sosActive ? '0 0 0 5px rgba(229,57,53,0.2)' : '0 2px 8px rgba(229,57,53,0.3)',
            }}
            aria-label="Emergency SOS — calls police"
          >
            <AlertTriangle size={18} strokeWidth={2} />
            {sosActive ? 'SOS Activated — Calling…' : 'Emergency SOS'}
          </button>
          <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: -8 }}>
            Calls Police (100) in emergency
          </p>
        </div>
      </div>
    </div>
  );
}
