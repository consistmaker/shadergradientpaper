import React, { useState } from 'react';
import { Copy, Check, FileJson, X, Download, ListOrdered, Sparkles, Video, Cpu, Cloud, Loader2, Play } from 'lucide-react';

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
  onRemoveFromQueue,
  onApplyConfig
}) {
  const [copied, setCopied] = useState(false);
  const [exportTarget, setExportTarget] = useState('ui_batch_render'); // 'ui_batch_render' | 'colab_batch'
  const [exportMode, setExportMode] = useState(renderQueue.length > 0 ? 'queue' : 'auto_matrix');
  const [batchCount, setBatchCount] = useState(5);
  
  // UI Batch Renderer Progress State
  const [isBatchRendering, setIsBatchRendering] = useState(false);
  const [currentRenderIdx, setCurrentRenderIdx] = useState(0);
  const [currentVideoName, setCurrentVideoName] = useState('');
  const [renderProgress, setRenderProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  if (!isOpen) return null;

  // JSON Recipe Data
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

  const handleDownloadJSON = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `colab_${exportMode}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper fungsi untuk merekam 1 kanvas video selama 10 detik penuh dengan bitrate 40 Mbps
  const recordSingleVideoPromise = (videoName, filePrefix) => {
    return new Promise((resolve, reject) => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      const canvas = canvases.find(c => c.width > 100 && c.height > 100) || canvases[0];

      if (!canvas) {
        return reject(new Error('Kanvas WebGL tidak ditemukan di layar!'));
      }

      // Pastikan captureStream 30 FPS eksak
      const stream = canvas.captureStream ? canvas.captureStream(30) : null;
      if (!stream) {
        return reject(new Error('Browser tidak mendukung canvas capture stream.'));
      }

      let mimeType = 'video/webm;codecs=vp9';
      let ext = 'webm';

      if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.640028')) {
        mimeType = 'video/mp4;codecs=avc1.640028';
        ext = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
        ext = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
        ext = 'webm';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
        ext = 'webm';
      }

      // Bitrate 40 Mbps untuk ukuran 35MB - 50MB
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 40000000
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filePrefix}_${Date.now()}.${ext}`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        }
        resolve();
      };

      mediaRecorder.start(250);

      // Perekaman 10.0 detik eksak (20 interval x 500ms = 10000ms)
      const totalSeconds = 10;
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 0.5;
        const progress = Math.min(Math.round((elapsed / totalSeconds) * 100), 100);
        setRenderProgress(progress);

        if (elapsed >= totalSeconds) {
          clearInterval(interval);
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }
      }, 500);
    });
  };

  // UI BATCH RENDERER: Merender seluruh antrean video secara berurutan dan auto-download satu per satu
  const handleStartUIBatchRender = async () => {
    const listToRender = exportMode === 'queue' && renderQueue.length > 0
      ? renderQueue
      : [
          {
            name: activeEngine === 'paper' 
              ? `Paper: ${paperConfig.shaderType} (${paperConfig.color1})`
              : `ShaderGradient: ${shaderGradientConfig.type} (${shaderGradientConfig.color1})`,
            engine: activeEngine,
            config: JSON.parse(JSON.stringify(activeEngine === 'paper' ? paperConfig : shaderGradientConfig))
          }
        ];

    setIsBatchRendering(true);
    setCompletedCount(0);

    try {
      for (let i = 0; i < listToRender.length; i++) {
        const item = listToRender[i];
        setCurrentRenderIdx(i + 1);
        setCurrentVideoName(item.name || `Video #${i + 1}`);
        setRenderProgress(0);

        // 1. Ubah kanvas aktif ke konfigurasi video item saat ini
        if (typeof onApplyConfig === 'function') {
          onApplyConfig(item.engine || 'paper', item.config);
        } else if (typeof window.__SET_ENGINE_RENDER === 'function') {
          window.__SET_ENGINE_RENDER(item.engine || 'paper', item.config);
        }

        // 2. Tunggu inisialisasi dan kompilasi WebGL shader selama 2.5 detik
        await new Promise(r => setTimeout(r, 2500));

        // 3. Rekam video selama 10 detik penuh dan auto download
        await recordSingleVideoPromise(item.name, `motion_${item.engine || 'paper'}_${i + 1}`);
        setCompletedCount(i + 1);

        // 4. Jeda kecil sebelum beralih ke video berikutnya
        await new Promise(r => setTimeout(r, 1500));
      }

      alert(`🎉 SELESAI! Seluruh ${listToRender.length} video antrean telah berhasil dirender 10 detik & ter-download ke komputer Anda.`);
    } catch (err) {
      console.error('Batch render error:', err);
      alert('Terjadi kesalahan render: ' + err.message);
    } finally {
      setIsBatchRendering(false);
      setRenderProgress(0);
    }
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Direct UI Batch Video Render & Export</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Render seluruh antrean video langsung di UI atau gunakan GPU Parallel Colab
              </p>
            </div>
          </div>
          <button className="glass-btn" onClick={onClose} disabled={isBatchRendering} style={{ padding: '6px' }}><X size={18} /></button>
        </div>

        {/* Target Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setExportTarget('ui_batch_render')}
            className={`glass-btn ${exportTarget === 'ui_batch_render' ? 'active' : ''}`}
            style={{ justifyContent: 'center', gap: '6px' }}
          >
            <Play size={16} /> 1. Render BATCH Langsung di UI
          </button>
          <button
            onClick={() => setExportTarget('colab_batch')}
            className={`glass-btn ${exportTarget === 'colab_batch' ? 'active' : ''}`}
            style={{ justifyContent: 'center', gap: '6px' }}
          >
            <Cloud size={16} /> 2. GPU Parallel Colab
          </button>
        </div>

        {/* PILIHAN 1: RENDER BATCH LANGSUNG DI UI */}
        {exportTarget === 'ui_batch_render' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Video color="#10b981" size={24} />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10b981' }}>
                  Direct UI Batch Renderer (100% Otomatis Berurutan)
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Sistem akan memutar setiap video di antrean satu per satu selama <b>10 detik penuh (Bitrate 40 Mbps ~40MB per video)</b> dan langsung otomatis mendownloadnya ke komputer Anda tanpa error!
                </p>
              </div>
            </div>

            {/* Mode Pemilihan: Manual Queue vs Single */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.75rem' }}>
                Total Video di Antrean: <b>{renderQueue.length > 0 ? `${renderQueue.length} Video Terpilih` : '1 Video Aktif'}</b>
              </span>
              <span style={{ fontSize: '0.72rem', color: '#10b981' }}>✓ 10 Detik Loop | Bitrate 40 Mbps</span>
            </div>

            {isBatchRendering ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', background: 'rgba(99,102,241,0.12)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontWeight: '600' }}>
                    <Loader2 size={16} className="spin" /> Sedang Merender [{currentRenderIdx}/{renderQueue.length || 1}]: {currentVideoName}
                  </span>
                  <span className="font-mono">{renderProgress}% (10s Loop)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${renderProgress}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #6366f1)', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Selesai di-download: {completedCount} dari {renderQueue.length || 1} video...
                </span>
              </div>
            ) : (
              <button
                className="glass-btn primary"
                onClick={handleStartUIBatchRender}
                style={{ justifyContent: 'center', padding: '14px', fontSize: '0.9rem', fontWeight: '700', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
              >
                <Play size={18} /> MULAI RENDER SELURUH BATCH SEKARANG ({renderQueue.length > 0 ? `${renderQueue.length} Video` : '1 Video'})
              </button>
            )}
          </div>
        )}

        {/* PILIHAN 2: GOOGLE COLAB MASSAL */}
        {exportTarget === 'colab_batch' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setExportMode('queue')}
                className={`glass-btn ${exportMode === 'queue' ? 'active' : ''}`}
                style={{ justifyContent: 'center', gap: '6px', fontSize: '0.75rem' }}
              >
                <ListOrdered size={14} /> Antrean Manual Queue ({renderQueue.length})
              </button>
              <button
                onClick={() => setExportMode('auto_matrix')}
                className={`glass-btn ${exportMode === 'auto_matrix' ? 'active' : ''}`}
                style={{ justifyContent: 'center', gap: '6px', fontSize: '0.75rem' }}
              >
                <Sparkles size={14} /> Auto-Matrix Randomizer
              </button>
            </div>

            {/* JSON Code Preview */}
            <pre style={{
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '10px',
              overflowY: 'auto',
              maxHeight: '140px',
              fontSize: '0.72rem',
              color: '#a7f3d0'
            }}>
              <code>{jsonString}</code>
            </pre>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.72rem', color: exportTarget === 'ui_batch_render' ? '#10b981' : '#818cf8' }}>
            {exportTarget === 'ui_batch_render' ? '✓ Mode Render Batch UI Langsung Aktif' : `✓ Siap diekspor ke GPU Parallel Colab`}
          </span>
          {exportTarget === 'colab_batch' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="glass-btn" onClick={handleDownloadJSON} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                <Download size={14} /> Download JSON
              </button>
              <button className="glass-btn primary" onClick={handleCopy} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Tersalin!' : 'Copy JSON'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
