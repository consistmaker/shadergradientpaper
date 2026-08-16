import React, { useState } from 'react';
import { Copy, Check, FileJson, X, Download, ListOrdered, Sparkles, Trash2 } from 'lucide-react';

export default function ExportModal({
  isOpen,
  onClose,
  activeEngine,
  paperConfig,
  shaderGradientConfig,
  randomRanges,
  lockedParams,
  renderQueue = [],
  onClearQueue,
  onRemoveFromQueue
}) {
  const [copied, setCopied] = useState(false);
  const [exportMode, setExportMode] = useState(renderQueue.length > 0 ? 'queue' : 'auto_matrix'); // 'auto_matrix' | 'queue'
  const [batchCount, setBatchCount] = useState(10);

  if (!isOpen) return null;

  // Mode A: Manual Queue List
  // Mode B: Auto-Generated Matrix based on current config & min/max locks
  const exportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      targetResolution: "3840x2160 (4K UHD)",
      targetFps: 30,
      loopDurationSeconds: 10,
      isSeamlessLoop: true,
      batchMode: exportMode === 'queue' ? 'manual_queue' : 'auto_matrix_generator'
    },
    ...(exportMode === 'queue' ? {
      manualQueueList: renderQueue.map((qItem, idx) => ({
        index: idx + 1,
        id: qItem.id,
        name: qItem.name,
        engine: qItem.engine,
        config: qItem.config
      })),
      totalVideosInQueue: renderQueue.length
    } : {
      baseConfig: activeEngine === 'paper' ? paperConfig : shaderGradientConfig,
      batchMatrixSettings: {
        totalVideosToGenerate: batchCount,
        autoDeduplication: true,
        lockedParameters: lockedParams,
        randomRanges: activeEngine === 'paper' ? randomRanges.paper : randomRanges.shadergradient
      }
    })
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `colab_${exportMode}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '750px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileJson color="var(--primary)" size={26} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Google Colab 4K Batch Exporter</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Pilih antara Antrean Manual (Custom Presets) atau Otomatisasi Matriks Acak Colab
              </p>
            </div>
          </div>
          <button className="glass-btn" onClick={onClose} style={{ padding: '6px' }}><X size={18} /></button>
        </div>

        {/* Mode Selector Tabs: Manual Queue vs Auto-Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setExportMode('queue')}
            className={`glass-btn ${exportMode === 'queue' ? 'active' : ''}`}
            style={{ justifyContent: 'center', gap: '6px' }}
          >
            <ListOrdered size={16} /> 1. Antrean Manual Queue ({renderQueue.length})
          </button>
          <button
            onClick={() => setExportMode('auto_matrix')}
            className={`glass-btn ${exportMode === 'auto_matrix' ? 'active' : ''}`}
            style={{ justifyContent: 'center', gap: '6px' }}
          >
            <Sparkles size={16} /> 2. Auto-Matrix Randomizer
          </button>
        </div>

        {/* Mode 1: Manual Queue Info & List */}
        {exportMode === 'queue' && (
          <div style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10b981' }}>
                ✓ {renderQueue.length} Preset Pilihan Anda Telah Disimpan di Antrean:
              </span>
              {renderQueue.length > 0 && (
                <button
                  onClick={onClearQueue}
                  style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={12} /> Hapus Semua
                </button>
              )}
            </div>

            {renderQueue.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                Antrean kosong. Klik tombol hijau <b>"+ Tambah ke Antrean Render"</b> di panel samping untuk memasukkan preset racikan Anda satu per satu.
              </p>
            ) : (
              <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {renderQueue.map((item, idx) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem' }}>
                    <span><b>#{idx + 1}</b> {item.name} ({item.timestamp})</span>
                    <button onClick={() => onRemoveFromQueue(item.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Auto Matrix Count Selector */}
        {exportMode === 'auto_matrix' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Jumlah Variasi Acak Colab:</span>
            <select
              value={batchCount}
              onChange={(e) => setBatchCount(parseInt(e.target.value))}
              style={{
                background: '#0a0c10',
                color: '#fff',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value={5}>5 Video (Test Fast)</option>
              <option value={10}>10 Video (Standar Batch)</option>
              <option value={25}>25 Video (Medium Batch)</option>
              <option value={50}>50 Video (Stock Portfolio Mass)</option>
              <option value={100}>100 Video (Extreme Mass Production)</option>
            </select>
          </div>
        )}

        {/* JSON Code Preview */}
        <pre style={{
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          overflowY: 'auto',
          flex: 1,
          fontSize: '0.78rem',
          color: '#a7f3d0'
        }}>
          <code>{jsonString}</code>
        </pre>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: exportMode === 'queue' ? '#10b981' : '#818cf8' }}>
            {exportMode === 'queue' ? `✓ Siap mengekspor ${renderQueue.length} video pilihan manual` : `✓ Colab akan mengacak ${batchCount} variasi dalam batas aman`}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="glass-btn" onClick={handleDownload}>
              <Download size={16} /> Download JSON
            </button>
            <button className="glass-btn primary" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Tersalin ke Clipboard!' : 'Copy JSON'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
