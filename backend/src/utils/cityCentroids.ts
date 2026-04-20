// Approximate centroid coordinates for major Indian cities.
// Used to place city-level booking aggregates on a map when exact
// lat/lng is not captured on the workLocation. Add more as needed.

export const CITY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Surat': { lat: 21.1702, lng: 72.8311 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Kanpur': { lat: 26.4499, lng: 80.3319 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Thane': { lat: 19.2183, lng: 72.9781 },
  'Bhopal': { lat: 23.2599, lng: 77.4126 },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'Patna': { lat: 25.5941, lng: 85.1376 },
  'Vadodara': { lat: 22.3072, lng: 73.1812 },
  'Ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'Ludhiana': { lat: 30.9010, lng: 75.8573 },
  'Agra': { lat: 27.1767, lng: 78.0081 },
  'Nashik': { lat: 19.9975, lng: 73.7898 },
  'Faridabad': { lat: 28.4089, lng: 77.3178 },
  'Meerut': { lat: 28.9845, lng: 77.7064 },
  'Rajkot': { lat: 22.3039, lng: 70.8022 },
  'Varanasi': { lat: 25.3176, lng: 82.9739 },
  'Srinagar': { lat: 34.0837, lng: 74.7973 },
  'Aurangabad': { lat: 19.8762, lng: 75.3433 },
  'Dhanbad': { lat: 23.7957, lng: 86.4304 },
  'Amritsar': { lat: 31.6340, lng: 74.8723 },
  'Navi Mumbai': { lat: 19.0330, lng: 73.0297 },
  'Allahabad': { lat: 25.4358, lng: 81.8463 },
  'Prayagraj': { lat: 25.4358, lng: 81.8463 },
  'Ranchi': { lat: 23.3441, lng: 85.3096 },
  'Howrah': { lat: 22.5958, lng: 88.2636 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558 },
  'Jabalpur': { lat: 23.1815, lng: 79.9864 },
  'Gwalior': { lat: 26.2183, lng: 78.1828 },
  'Vijayawada': { lat: 16.5062, lng: 80.6480 },
  'Jodhpur': { lat: 26.2389, lng: 73.0243 },
  'Madurai': { lat: 9.9252, lng: 78.1198 },
  'Raipur': { lat: 21.2514, lng: 81.6296 },
  'Kota': { lat: 25.2138, lng: 75.8648 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794 },
  'Guwahati': { lat: 26.1445, lng: 91.7362 },
  'Solapur': { lat: 17.6599, lng: 75.9064 },
  'Hubli': { lat: 15.3647, lng: 75.1240 },
  'Mysore': { lat: 12.2958, lng: 76.6394 },
  'Tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'Bareilly': { lat: 28.3670, lng: 79.4304 },
  'Aligarh': { lat: 27.8974, lng: 78.0880 },
  'Moradabad': { lat: 28.8386, lng: 78.7733 },
  'Gurgaon': { lat: 28.4595, lng: 77.0266 },
  'Gurugram': { lat: 28.4595, lng: 77.0266 },
  'Noida': { lat: 28.5355, lng: 77.3910 },
  'Kochi': { lat: 9.9312, lng: 76.2673 },
  'Thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'Dehradun': { lat: 30.3165, lng: 78.0322 },
};

export function lookupCentroid(city?: string): { lat: number; lng: number } | null {
  if (!city) return null;
  // Case-insensitive exact match, then case-insensitive trimmed match
  const trimmed = city.trim();
  if (CITY_CENTROIDS[trimmed]) return CITY_CENTROIDS[trimmed];
  const lower = trimmed.toLowerCase();
  for (const [name, coords] of Object.entries(CITY_CENTROIDS)) {
    if (name.toLowerCase() === lower) return coords;
  }
  return null;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371; // Earth radius in km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function findNearestCity(
  lat: number,
  lng: number,
): { city: string; lat: number; lng: number; distanceKm: number } | null {
  const point = { lat, lng };
  let best: { city: string; lat: number; lng: number; distanceKm: number } | null = null;
  for (const [city, coords] of Object.entries(CITY_CENTROIDS)) {
    const d = haversineKm(point, coords);
    if (!best || d < best.distanceKm) {
      best = { city, lat: coords.lat, lng: coords.lng, distanceKm: d };
    }
  }
  return best;
}
