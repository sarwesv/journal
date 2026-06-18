function getCoords() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('no geolocation'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      reject,
      { timeout: 5000 }
    );
  });
}

async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  const a = data.address || {};
  return a.city || a.town || a.village || a.county || a.state || 'Unknown';
}

export async function getLocation() {
  try {
    const { lat, lon } = await getCoords();
    const name = await reverseGeocode(lat, lon);
    return { lat, lon, name };
  } catch {
    return null;
  }
}
