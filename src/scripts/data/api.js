// api.js
import CONFIG from '../utils/config.js';

function ensureBaseUrlOk() {
  if (!CONFIG?.BASE_URL) throw new Error('BASE_URL belum diset');
  // Hindari double slash saat join path
  return CONFIG.BASE_URL.replace(/\/+$/,''); 
}

async function parseJsonSafe(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    // lemparkan potongan HTML biar mudah dilacak
    const preview = text.slice(0, 200).replace(/\s+/g, ' ');
    throw new Error(`HTTP ${response.status} ${response.statusText} — body: ${preview}`);
  }
}

export const API = {
  async register(name, email, password) {
    const base = ensureBaseUrlOk();
    const res = await fetch(`${base}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) return parseJsonSafe(res);
    return res.json();
  },

  async login(email, password) {
    const base = ensureBaseUrlOk();
    const res = await fetch(`${base}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return parseJsonSafe(res);
    return res.json();
  },

  // ===== Perbaikan di sini =====
  async getStories(token, params = {}) {
    const base = ensureBaseUrlOk();
    const q = new URLSearchParams();

    // pastikan hanya ambil story yg punya koordinat
    q.set('location', params.location === 0 ? 0 : 1);
    if (params.page) q.set('page', params.page);
    if (params.size) q.set('size', params.size);

    const url = `${base}/stories${q.toString() ? `?${q}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
    });

    if (!res.ok) {
      // ini akan melempar error berisi potongan HTML jika body bukan JSON
      throw new Error(await (async () => {
        try { return JSON.stringify(await res.json()); }
        catch { 
          const t = await res.text();
          return `HTTP ${res.status} ${res.statusText} — ${t.slice(0,200).replace(/\s+/g,' ')}`;
        }
      })());
    }
    return res.json();
  },

  async getStoryDetail(token, id) {
    const base = ensureBaseUrlOk();
    const res = await fetch(`${base}/stories/${id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept':'application/json' },
    });
    if (!res.ok) return parseJsonSafe(res);
    return res.json();
  },

  async addStory({ description, photoFile, lat, lon, token }) {
    const base = ensureBaseUrlOk();
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photoFile);
    if (lat !== undefined) formData.append('lat', lat);
    if (lon !== undefined) formData.append('lon', lon);

    const res = await fetch(`${base}/stories`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) return parseJsonSafe(res);
    return res.json();
  },

  async addStoryGuest({ description, photoFile, lat, lon }) {
    const base = ensureBaseUrlOk();
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photoFile);
    if (lat !== undefined) formData.append('lat', lat);
    if (lon !== undefined) formData.append('lon', lon);

    const res = await fetch(`${base}/stories/guest`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) return parseJsonSafe(res);
    return res.json();
  },
};
