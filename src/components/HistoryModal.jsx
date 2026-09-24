import React, { useState } from 'react';
import {
  History,
  X,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
  FileVideo,
  Copy,
  Check,
  Search,
  ExternalLink
} from 'lucide-react';
import { clearRenderHistory, removeRenderRecord } from '../utils/deduplication';

export default function HistoryModal({
  isOpen,
  onClose,
  history = [],
  onRefreshHistory,
  onRestoreConfig
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (item.name || '').toLowerCase().includes(q);
    const fileMatch = (item.fileName || '').toLowerCase().includes(q);
    const engineMatch = (item.engine || '').toLowerCase().includes(q);
    const shaderMatch = (item.shaderType || '').toLowerCase().includes(q);
    return nameMatch || fileMatch || engineMatch || shaderMatch;
  });

  const handleClearAll = () => {
    if (window.confirm('Hapus seluruh riwayat pencatatan render? Tindakan ini tidak bisa dibatalkan.')) {
      clearRenderHistory();
      if (onRefreshHistory) onRefreshHistory();
    }
  };

  const handleDeleteItem = (id) => {
    removeRenderRecord(id);
    if (onRefreshHistory) onRefreshHistory();
  };

  const handleExportHistoryJSON = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `render_vault_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyFp = (id, fp) => {
    navigator.clipboard.writeText(fp);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(99,102,241,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--primary)'
            }}>
              <History color="var(--primary)" size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Render Vault & Anti-Duplicate Log
                <span className="badge" style={{ background: '#10b981', color: '#fff', fontSize: '0.65rem', padding: '2px 8px' }}>
                  {history.length} Terdata
                </span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Daftar rekaman aset yang sudah pernah dirender. Sistem otomatis mencegah duplikasi saat Anda mendesain.
              </p>
            </div>
          </div>
          <button className="glass-btn" onClick={onClose} style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Search & Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0 10px'
          }}>
            <Search size={15} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama shader, warna, file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.8rem',
                padding: '8px 8px'
              }}
            />
          </div>

          <button
            className="glass-btn"
            onClick={handleExportHistoryJSON}
            disabled={history.length === 0}
            style={{ fontSize: '0.75rem', padding: '8px 12px', gap: '6px' }}
            title="Download database riwayat sebagai file JSON cadangan"
          >
            <Download size={14} /> Backup JSON
          </button>

          {history.length > 0 && (
            <button
              className="glass-btn"
              onClick={handleClearAll}
              style={{ fontSize: '0.75rem', padding: '8px 12px', gap: '6px', color: '#ef4444' }}
              title="Kosongkan database riwayat"
            >
              <Trash2 size={14} /> Reset
            </button>
          )}
        </div>

        {/* List Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '4px'
        }}>
          {filteredHistory.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color)'
            }}>
              <CheckCircle size={32} color="#10b981" style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                {history.length === 0 ? 'Belum Ada Aset Terender' : 'Tidak Ada Hasil yang Cocok'}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '380px' }}>
                {history.length === 0 
                  ? 'Setiap video yang Anda unduh lewat tombol "Render & Download" otomatis terdaftar di sini dengan sidik jari unik untuk melindungi dari duplikasi.'
                  : 'Coba ubah kata kunci pencarian Anda.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  gap: '12px'
                }}
              >
                {/* Left: Info & Color Swatches */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {(item.colors || []).slice(0, 4).map((c, i) => (
                        <div
                          key={i}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            backgroundColor: c,
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}
                          title={c}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                      #{history.length - idx}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name || item.shaderType || 'Untitled Asset'}
                      </span>
                      <span className="badge" style={{
                        fontSize: '0.6rem',
                        padding: '1px 5px',
                        background: item.engine === 'paper' ? 'rgba(99,102,241,0.2)' : 'rgba(236,72,153,0.2)',
                        color: item.engine === 'paper' ? '#a5b4fc' : '#f472b6'
                      }}>
                        {item.engine}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '600' }}>
                        {item.resolution || '1080p'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>{item.formattedDate || item.timestamp}</span>
                      <span>•</span>
                      <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                        {item.fileName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    className="glass-btn"
                    onClick={() => handleCopyFp(item.id, item.fingerprint)}
                    style={{ padding: '5px 8px', fontSize: '0.68rem', gap: '4px' }}
                    title="Copy Sidik Jari / Fingerprint"
                  >
                    {copiedId === item.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copiedId === item.id ? 'Tersalin' : 'Hash'}
                  </button>

                  <button
                    className="glass-btn"
                    onClick={() => handleDeleteItem(item.id)}
                    style={{ padding: '5px 8px', color: '#ef4444' }}
                    title="Hapus dari daftar riwayat (akan membebaskan proteksi duplikat)"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div style={{
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-dim)'
        }}>
          <span>🛡️ Algoritma 100% Anti-Duplikat aktif memindai setiap perubahan warna & parameter.</span>
          <button className="glass-btn" onClick={onClose} style={{ padding: '5px 14px', fontSize: '0.75rem' }}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
