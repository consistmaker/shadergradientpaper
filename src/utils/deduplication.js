/**
 * deduplication.js
 * Utility untuk fingerprinting konfigurasi shader dan deteksi duplikasi 100%.
 */

const STORAGE_KEY = 'ANTIGRAVITY_RENDER_HISTORY_V1';

/**
 * Normalisasi warna hex ke lowercase 6-karakter (#RRGGBB)
 */
export function normalizeHex(hex) {
  if (!hex || typeof hex !== 'string') return '#000000';
  let clean = hex.trim().toLowerCase();
  if (!clean.startsWith('#')) clean = '#' + clean;
  // Convert #rgb -> #rrggbb
  if (clean.length === 4) {
    clean = '#' + clean[1] + clean[1] + clean[2] + clean[2] + clean[3] + clean[3];
  }
  return clean;
}

/**
 * Buat representasi kunci unik (fingerprint) dari konfigurasi visual.
 * Memperhitungkan Engine, Shader/Geometry Type, Warna-warna utama, Speed, dan parameter distorsi.
 */
export function generateFingerprint(engine, config) {
  if (!config) return '';

  if (engine === 'paper') {
    const shaderType = config.shaderType || 'mesh-gradient';
    const c1 = normalizeHex(config.color1);
    const c2 = normalizeHex(config.color2);
    const c3 = normalizeHex(config.color3);
    const c4 = normalizeHex(config.color4);
    
    // Bulatkan angka float ke 2 desimal agar perbedaan rounding 0.0001 tidak dianggap beda
    const speed = Number(config.speed || 1).toFixed(2);
    const distortion = Number(config.distortion || 0).toFixed(2);
    const swirl = Number(config.swirl || 0).toFixed(2);
    const grain = Number(config.grain || 0).toFixed(2);
    const scale = Number(config.scale || 1).toFixed(2);
    const rotation = Number(config.rotation || 0).toFixed(0);

    return `paper|${shaderType}|${c1}|${c2}|${c3}|${c4}|sp:${speed}|dist:${distortion}|sw:${swirl}|gr:${grain}|sc:${scale}|rot:${rotation}`;
  } else {
    // ShaderGradient 3D
    const type = config.type || 'plane';
    const c1 = normalizeHex(config.color1);
    const c2 = normalizeHex(config.color2);
    const c3 = normalizeHex(config.color3);
    const uSpeed = Number(config.uSpeed || 0.4).toFixed(2);
    const uStrength = Number(config.uStrength || 1.5).toFixed(2);
    const uDensity = Number(config.uDensity || 1.5).toFixed(2);
    const cDistance = Number(config.cDistance || 3.5).toFixed(1);
    const grain = config.grain || 'off';

    return `shadergradient|${type}|${c1}|${c2}|${c3}|sp:${uSpeed}|str:${uStrength}|den:${uDensity}|cd:${cDistance}|gr:${grain}`;
  }
}

/**
 * Ambil seluruh riwayat render dari localStorage
 */
export function getRenderHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse render history from localStorage:', err);
    return [];
  }
}

/**
 * Simpan item baru ke riwayat render
 */
export function addRenderRecord(record) {
  if (typeof window === 'undefined') return;
  try {
    const history = getRenderHistory();
    const newEntry = {
      id: record.id || `rec_${Date.now()}`,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      fingerprint: record.fingerprint,
      engine: record.engine,
      name: record.name,
      fileName: record.fileName || `motion_${Date.now()}.mp4`,
      resolution: record.resolution || '1920x1080',
      colors: record.colors || [],
      shaderType: record.shaderType || '',
      configSummary: record.configSummary || {}
    };

    // Taruh di paling atas, batasi maksimal 500 item riwayat
    const updated = [newEntry, ...history].slice(0, 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch (err) {
    console.error('Failed to save render record:', err);
  }
}

/**
 * Cek apakah konfigurasi saat ini duplikat dari yang pernah dirender
 * Return: item riwayat yang cocok (atau null jika unik)
 */
export function checkDuplicate(engine, config, history = null) {
  const list = history !== null ? history : getRenderHistory();
  const currentFp = generateFingerprint(engine, config);
  const found = list.find(item => item.fingerprint === currentFp);
  return {
    isDuplicate: Boolean(found),
    fingerprint: currentFp,
    matchedRecord: found || null
  };
}

/**
 * Bersihkan seluruh riwayat render
 */
export function clearRenderHistory() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear render history:', err);
  }
}

/**
 * Hapus satu item dari riwayat berdasarkan ID
 */
export function removeRenderRecord(id) {
  if (typeof window === 'undefined') return;
  try {
    const history = getRenderHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to remove record:', err);
    return [];
  }
}
