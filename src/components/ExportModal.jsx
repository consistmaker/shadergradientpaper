import React, { useState } from 'react';
import { Copy, Check, FileJson, X, Download, ListOrdered, Sparkles, Video, Cpu, Cloud, Loader2, Monitor } from 'lucide-react';

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
  const [exportTarget, setExportTarget] = useState('colab_batch'); // 'colab_batch' | 'local_record'
  const [targetResolution, setTargetResolution] = useState('1080p'); // '1080p' (FHD - Super Cepat) | '4k' (4K UHD)
  const [exportMode, setExportMode] = useState(renderQueue.length > 0 ? 'queue' : 'auto_matrix');
  const [batchCount, setBatchCount] = useState(10);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  if (!isOpen) return null;

  const resolutionConfig = targetResolution === '1080p' 
    ? { width: 1920, height: 1080, label: "1920x1080 (Full HD - Fast Render)", bitrate: "20M" }
    : { width: 3840, height: 2160, label: "3840x2160 (4K UHD - Ultra Quality)", bitrate: "35M" };

  // JSON Recipe Data
  const exportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      targetResolution: resolutionConfig.label,
      resolutionWidth: resolutionConfig.width,
      resolutionHeight: resolutionConfig.height,
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
    a.download = `recipe_${targetResolution}_${exportMode}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Direct Local WebGL Canvas Auto-Recorder (WebM/MP4)
  const handleStartLocalRecord = async () => {
    try {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      const canvas = canvases.find(c => c.width > 100 && c.height > 100) || canvases[0];

      if (!canvas) {
        alert('Kanvas WebGL tidak ditemukan di layar!');
        return;
      }

      setIsRecording(true);
      setRecordingProgress(0);

      const stream = canvas.captureStream ? canvas.captureStream(30) : null;
      if (!stream) {
        alert('Browser Anda tidak mendukung direct canvas stream recording.');
        setIsRecording(false);
        return;
      }

      let mimeType = 'video/webm;codecs=vp8';
      let ext = 'webm';

      if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
        mimeType = 'video/mp4;codecs=avc1';
        ext = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
        ext = 'webm';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
        ext = 'webm';
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: targetResolution === '1080p' ? 20000000 : 35000000
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        if (chunks.length === 0) {
          alert('Perekaman selesai tetapi buffer frame kosong.');
          setIsRecording(false);
          setRecordingProgress(0);
          return;
        }

        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `motion_${targetResolution}_${activeEngine}_${Date.now()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setRecordingProgress(0);
      };

      mediaRecorder.start(500);

      const totalSeconds = 10;
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 0.5;
        const progress = Math.min(Math.round((elapsed / totalSeconds) * 100), 100);
        setRecordingProgress(progress);

        if (elapsed >= totalSeconds) {
          clearInterval(interval);
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }
      }, 500);

    } catch (err) {
      console.error('Local record error:', err);
      alert('Gagal merekam lokal: ' + err.message);
      setIsRecording(false);
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Export & Batch Video Studio</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Pilih resolusi dan target render (FHD Super Fast / 4K UHD Ultra Quality)
              </p>
            </div>
          </div>
          <button className="glass-btn" onClick={onClose} style={{ padding: '6px' }}><X size={18} /></button>
        </div>

        {/* RESOLUTION SELECTOR: FHD 1080p (Fast) vs 4K UHD */}
        <div style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Monitor size={15} color="var(--primary)" /> Pilihan Resolusi Render:
            </span>
            <span style={{ fontSize: '0.7rem', color: targetResolution === '1080p' ? '#10b981' : '#a855f7', fontWeight: '700' }}>
              {targetResolution === '1080p' ? '⚡ 4x Lebih Cepat (~1 Menit/Video)' : '💎 Kualitas Tertinggi (~5 Menit/Video)'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => setTargetResolution('1080p')}
              className={`glass-btn ${targetResolution === '1080p' ? 'active' : ''}`}
              style={{ justifyContent: 'center', flexDirection: 'column', padding: '8px', gap: '2px' }}
            >
              <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Full HD (1080p)</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>1920x1080 (Super Cepat ~1 Min)</span>
            </button>
            <button
              onClick={() => setTargetResolution('4k')}
              className={`glass-btn ${targetResolution === '4k' ? 'active' : ''}`}
              style={{ justifyContent: 'center', flexDirection: 'column', padding: '8px', gap: '2px' }}
            >
              <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>4K UHD (2160p)</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>3840x2160 (Ultra Quality ~5 Min)</span>
            </button>
          </div>
        </div>

        {/* Target Selector: 1. Cloud Colab Batch vs 2. Auto-Download Lokal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setExportTarget('colab_batch')}
            className={`glass-btn ${exportTarget === 'colab_batch' ? 'active' : ''}`}
            style={{ justifyContent: 'center', gap: '6px' }}
          >
            <Cloud size={16} /> 1. Google Colab GPU Batch
          </button>
          <button
            onClick={() => setExportTarget('local_record')}
            className={`glass-btn ${exportTarget === 'local_record' ? 'active' : ''}`}
            style={{ justifyContent: 'center', gap: '6px' }}
          >
            <Cpu size={16} /> 2. Auto-Download Browser
          </button>
        </div>

        {/* PILIHAN 1: GOOGLE COLAB MASSAL */}
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

            {exportMode === 'auto_matrix' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Jumlah Variasi Acak:</span>
                <select
                  value={batchCount}
                  onChange={(e) => setBatchCount(parseInt(e.target.value))}
                  style={{ background: '#0a0c10', color: '#fff', border: '1px solid var(--border-color)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', outline: 'none', fontSize: '0.75rem' }}
                >
                  <option value={5}>5 Video</option>
                  <option value={10}>10 Video</option>
                  <option value={25}>25 Video</option>
                  <option value={50}>50 Video</option>
                  <option value={100}>100 Video</option>
                </select>
              </div>
            )}

            {/* JSON Code Preview */}
            <pre style={{
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '10px',
              overflowY: 'auto',
              maxHeight: '120px',
              fontSize: '0.72rem',
              color: '#a7f3d0'
            }}>
              <code>{jsonString}</code>
            </pre>
          </div>
        )}

        {/* PILIHAN 2: AUTO DOWNLOAD LOKAL INSTAN */}
        {exportTarget === 'local_record' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Video color="#10b981" size={24} />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10b981' }}>Auto-Download Langsung di Browser</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Merekam kanvas visual yang sedang aktif saat ini selama 10 detik loop ({resolutionConfig.label}) dan langsung ter-download ke PC/HP Anda.
                </p>
              </div>
            </div>

            {isRecording ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8' }}>
                    <Loader2 size={14} className="spin" /> Merekam Frame WebGL ({recordingProgress}%)...
                  </span>
                  <span className="font-mono">10 Detik Loop</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${recordingProgress}%`, height: '100%', background: 'var(--primary-gradient)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            ) : (
              <button
                className="glass-btn primary"
                onClick={handleStartLocalRecord}
                style={{ justifyContent: 'center', padding: '12px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
              >
                <Download size={18} /> Mulai Download Video {targetResolution.toUpperCase()} (10s Loop)
              </button>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.72rem', color: exportTarget === 'colab_batch' ? '#818cf8' : '#10b981' }}>
            {exportTarget === 'colab_batch' ? `✓ Resep ${targetResolution.toUpperCase()} siap diekspor ke Colab` : `✓ Siap dirender lokal di browser`}
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
