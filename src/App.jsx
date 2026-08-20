import React, { useState, useEffect } from 'react';
import ControlPanel from './components/ControlPanel';
import ShaderGradientPreview from './components/ShaderGradientPreview';
import PaperShaderPreview from './components/PaperShaderPreview';
import ExportModal from './components/ExportModal';
import {
  DEFAULT_PAPER_CONFIG,
  DEFAULT_SHADERGRADIENT_CONFIG,
  COLOR_PALETTES,
  SHADERGRADIENT_PRESETS,
  PAPER_SHADER_SPECIFIC_PRESETS
} from './constants';
import { Sparkles, Layers, Sliders, Smartphone, Monitor, Square, ListPlus, Trash2 } from 'lucide-react';

export default function App() {
  const [activeEngine, setActiveEngine] = useState('paper'); // 'paper' | 'shadergradient'
  const [paperConfig, setPaperConfig] = useState(DEFAULT_PAPER_CONFIG);
  const [shaderGradientConfig, setShaderGradientConfig] = useState(DEFAULT_SHADERGRADIENT_CONFIG);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16-9'); // '16-9' | '9-16' | '1-1'
  
  // Custom Manual Batch Queue
  const [renderQueue, setRenderQueue] = useState([]);

  // Cek apakah halaman dibuka dalam Clean Render Mode (?render=clean)
  const isCleanRenderMode = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('render') === 'clean' ||
    window.__IS_CLEAN_RENDER === true
  );

  // Parameter Locks State
  const [lockedParams, setLockedParams] = useState({
    colors: false,
    speed: false,
    geometry: false
  });

  // Parameter Min/Max Ranges State
  const [randomRanges, setRandomRanges] = useState({
    paper: {
      speed: { min: 0.2, max: 2.0 },
      grain: { min: 0.0, max: 0.3 }
    },
    shadergradient: {
      uSpeed: { min: 0.1, max: 0.8 },
      uStrength: { min: 0.3, max: 3.5 }
    }
  });

  // Fungsi untuk mengaplikasikan konfigurasi shader secara langsung (dipanggil saat batch render UI)
  const handleApplyConfig = (engine, config) => {
    if (engine === 'paper') {
      setActiveEngine('paper');
      setPaperConfig(prev => ({ ...prev, ...config }));
    } else if (engine === 'shadergradient') {
      setActiveEngine('shadergradient');
      setShaderGradientConfig(prev => ({ ...prev, ...config }));
    }
  };

  // Global Hook untuk Puppeteer Headless WebGL di Google Colab
  useEffect(() => {
    window.__SET_ENGINE_RENDER = (engine, config) => {
      handleApplyConfig(engine, config);
    };
  }, []);

  const activeConfig = activeEngine === 'paper' ? paperConfig : shaderGradientConfig;
  const setConfig = (newConf) => {
    if (activeEngine === 'paper') {
      setPaperConfig(newConf);
    } else {
      setShaderGradientConfig(newConf);
    }
  };

  const handleAddToQueue = () => {
    const queueItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: activeEngine === 'paper' 
        ? `Paper: ${paperConfig.shaderType} (${paperConfig.color1})`
        : `ShaderGradient: ${shaderGradientConfig.type} (${shaderGradientConfig.color1})`,
      engine: activeEngine,
      config: JSON.parse(JSON.stringify(activeConfig))
    };
    setRenderQueue(prev => [...prev, queueItem]);
  };

  const handleRemoveFromQueue = (id) => {
    setRenderQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleClearQueue = () => {
    setRenderQueue([]);
  };

  const handleRandomize = () => {
    const randomPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    
    if (activeEngine === 'paper') {
      const minSpeed = randomRanges.paper.speed.min;
      const maxSpeed = randomRanges.paper.speed.max;
      const minGrain = randomRanges.paper.grain.min;
      const maxGrain = randomRanges.paper.grain.max;
      
      const specificPresets = PAPER_SHADER_SPECIFIC_PRESETS[paperConfig.shaderType] || [];
      const randomPreset = specificPresets.length > 0
        ? specificPresets[Math.floor(Math.random() * specificPresets.length)]
        : null;

      setPaperConfig(prev => ({
        ...prev,
        color1: lockedParams.colors ? prev.color1 : (randomPreset ? randomPreset.colors[0] : randomPalette.colors[0]),
        color2: lockedParams.colors ? prev.color2 : (randomPreset ? randomPreset.colors[1] : randomPalette.colors[1]),
        color3: lockedParams.colors ? prev.color3 : (randomPreset ? randomPreset.colors[2] : randomPalette.colors[2]),
        color4: lockedParams.colors ? prev.color4 : (randomPreset ? randomPreset.colors[3] : randomPalette.colors[3]),
        speed: lockedParams.speed ? prev.speed : Number((Math.random() * (maxSpeed - minSpeed) + minSpeed).toFixed(2)),
        grain: Number((Math.random() * (maxGrain - minGrain) + minGrain).toFixed(2)),
        distortion: Number((Math.random() * 1.5 + 0.2).toFixed(2)),
        swirl: Number((Math.random() * 1.0 + 0.1).toFixed(2)),
        rotation: Math.floor(Math.random() * 360)
      }));
    } else {
      const minSpeed = randomRanges.shadergradient.uSpeed.min;
      const maxSpeed = randomRanges.shadergradient.uSpeed.max;
      const minStrength = randomRanges.shadergradient.uStrength.min;
      const maxStrength = randomRanges.shadergradient.uStrength.max;
      const randomPreset = SHADERGRADIENT_PRESETS[Math.floor(Math.random() * SHADERGRADIENT_PRESETS.length)];

      setShaderGradientConfig(prev => ({
        ...prev,
        type: lockedParams.geometry ? prev.type : randomPreset.props.type,
        color1: lockedParams.colors ? prev.color1 : randomPalette.colors[0],
        color2: lockedParams.colors ? prev.color2 : randomPalette.colors[1],
        color3: lockedParams.colors ? prev.color3 : randomPalette.colors[2],
        uSpeed: lockedParams.speed ? prev.uSpeed : Number((Math.random() * (maxSpeed - minSpeed) + minSpeed).toFixed(2)),
        uStrength: Number((Math.random() * (maxStrength - minStrength) + minStrength).toFixed(2)),
        uDensity: Number((Math.random() * 1.5 + 0.5).toFixed(2)),
        cAzimuthAngle: Math.floor(Math.random() * 360),
        cPolarAngle: Math.floor(Math.random() * 180)
      }));
    }
  };

  // JIKA CLEAN RENDER MODE (Khusus untuk Puppeteer Colab 4K Fullscreen Canvas)
  if (isCleanRenderMode) {
    return (
      <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', background: '#000' }}>
        {activeEngine === 'paper' ? (
          <PaperShaderPreview config={paperConfig} />
        ) : (
          <ShaderGradientPreview config={shaderGradientConfig} />
        )}
      </div>
    );
  }

  const getAspectStyle = () => {
    switch (aspectRatio) {
      case '9-16':
        return { width: 'min(100%, 450px)', aspectRatio: '9/16', maxHeight: '85vh' };
      case '1-1':
        return { width: 'min(100%, 650px)', aspectRatio: '1/1', maxHeight: '85vh' };
      case '16-9':
      default:
        return { width: '100%', maxWidth: '1100px', aspectRatio: '16/9', maxHeight: '85vh' };
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'row', background: 'var(--bg-base)', overflow: 'hidden' }}>
      {/* Main Preview Container (LEFT on Desktop, TOP on Mobile) */}
      <div className="preview-main-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        
        {/* Navbar */}
        <header style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-color)',
          zIndex: 10,
          background: 'rgba(9, 12, 16, 0.8)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} color="#fff" />
            </div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ShaderMotion Studio
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Aspect Ratio Selector */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-sm)', padding: '3px', gap: '2px', border: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => setAspectRatio('16-9')}
                className={`glass-btn ${aspectRatio === '16-9' ? 'active' : ''}`}
                style={{ padding: '6px 10px', fontSize: '0.75rem', border: 'none' }}
                title="16:9 Landscape Video"
              >
                <Monitor size={14} /> 16:9
              </button>
              <button 
                onClick={() => setAspectRatio('9-16')}
                className={`glass-btn ${aspectRatio === '9-16' ? 'active' : ''}`}
                style={{ padding: '6px 10px', fontSize: '0.75rem', border: 'none' }}
                title="9:16 Vertical Video / Story"
              >
                <Smartphone size={14} /> 9:16
              </button>
              <button 
                onClick={() => setAspectRatio('1-1')}
                className={`glass-btn ${aspectRatio === '1-1' ? 'active' : ''}`}
                style={{ padding: '6px 10px', fontSize: '0.75rem', border: 'none' }}
                title="1:1 Square"
              >
                <Square size={14} /> 1:1
              </button>
            </div>

            {/* Tombol Antrean Navbar */}
            <button
              onClick={handleAddToQueue}
              className="glass-btn"
              style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}
              title="Tambahkan desain visual saat ini ke antrean render batch"
            >
              <ListPlus size={14} /> + Antrean ({renderQueue.length})
            </button>
          </div>
        </header>

        {/* Live Canvas Viewport */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            ...getAspectStyle(),
            transition: 'width 0.3s ease, height 0.3s ease',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            border: '1px solid var(--border-color)',
            position: 'relative',
            display: 'flex'
          }}>
            {activeEngine === 'paper' ? (
              <PaperShaderPreview config={paperConfig} />
            ) : (
              <ShaderGradientPreview config={shaderGradientConfig} />
            )}
          </div>
        </div>

      </div>

      {/* Sidebar Controls (BOTTOM on Mobile, RIGHT on Desktop) */}
      <div className="control-sidebar" style={{ width: '420px', minWidth: '360px', height: '100%', borderLeft: '1px solid var(--border-color)', zIndex: 20 }}>
        <ControlPanel
          activeEngine={activeEngine}
          setActiveEngine={setActiveEngine}
          config={activeConfig}
          setConfig={setConfig}
          onRandomize={handleRandomize}
          onExportJSON={() => setIsExportOpen(true)}
          randomRanges={randomRanges}
          setRandomRanges={setRandomRanges}
          lockedParams={lockedParams}
          setLockedParams={setLockedParams}
          onAddToQueue={handleAddToQueue}
          queueCount={renderQueue.length}
        />
      </div>

      {/* Export Recipe Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        activeEngine={activeEngine}
        paperConfig={paperConfig}
        shaderGradientConfig={shaderGradientConfig}
        randomRanges={randomRanges}
        lockedParams={lockedParams}
        renderQueue={renderQueue}
        onClearQueue={handleClearQueue}
        onRemoveFromQueue={handleRemoveFromQueue}
        onApplyConfig={handleApplyConfig}
      />
    </div>
  );
}
