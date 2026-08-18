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

  // Global Hook untuk Puppeteer Headless WebGL di Google Colab
  useEffect(() => {
    window.__SET_ENGINE_RENDER = (engine, config) => {
      if (engine === 'paper') {
        setActiveEngine('paper');
        setPaperConfig(prev => ({ ...prev, ...config }));
      } else if (engine === 'shadergradient') {
        setActiveEngine('shadergradient');
        setShaderGradientConfig(prev => ({ ...prev, ...config }));
      }
    };
  }, []);

  const activeConfig = activeEngine === 'paper' ? paperConfig : shaderGradientConfig;
  const setConfig = activeEngine === 'paper' ? setPaperConfig : setShaderGradientConfig;

  // Add Current Setting to Manual Batch Queue
  const handleAddToQueue = () => {
    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      engine: activeEngine,
      timestamp: new Date().toLocaleTimeString(),
      config: { ...activeConfig },
      name: activeEngine === 'paper' 
        ? `Paper: ${activeConfig.shaderType} (${activeConfig.color1 || '#fff'})` 
        : `3D: ${activeConfig.type || 'sphere'} (${activeConfig.activePresetId || 'custom'})`
    };
    setRenderQueue(prev => [newItem, ...prev]);
  };

  // Remove Item from Queue
  const handleRemoveFromQueue = (id) => {
    setRenderQueue(prev => prev.filter(item => item.id !== id));
  };

  // Clear Entire Queue
  const handleClearQueue = () => {
    setRenderQueue([]);
  };

  // Smart Randomizer based on locks and safe min/max ranges
  const handleRandomize = () => {
    const randomPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

    if (activeEngine === 'paper') {
      const shaderKeys = Object.keys(PAPER_SHADER_SPECIFIC_PRESETS);
      const randomShader = shaderKeys[Math.floor(Math.random() * shaderKeys.length)];
      const minSpeed = randomRanges.paper.speed.min;
      const maxSpeed = randomRanges.paper.speed.max;
      const minGrain = randomRanges.paper.grain.min;
      const maxGrain = randomRanges.paper.grain.max;

      setPaperConfig(prev => ({
        ...prev,
        shaderType: lockedParams.geometry ? prev.shaderType : randomShader,
        color1: lockedParams.colors ? prev.color1 : randomPalette.colors[0],
        color2: lockedParams.colors ? prev.color2 : randomPalette.colors[1],
        color3: lockedParams.colors ? prev.color3 : randomPalette.colors[2],
        color4: lockedParams.colors ? prev.color4 : (randomPalette.colors[3] || randomPalette.colors[0]),
        speed: lockedParams.speed ? prev.speed : Number((Math.random() * (maxSpeed - minSpeed) + minSpeed).toFixed(1)),
        grain: Number((Math.random() * (maxGrain - minGrain) + minGrain).toFixed(2)),
        distortion: Number((Math.random() * 0.7 + 0.3).toFixed(2)),
        swirl: Number((Math.random() * 0.8 + 0.1).toFixed(2)),
        scale: Number((Math.random() * 0.8 + 0.7).toFixed(1))
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

  const getAspectStyle = () => {
    switch (aspectRatio) {
      case '9-16':
        return { width: '320px', height: '568px', maxWidth: '100%', maxHeight: '100%' };
      case '1-1':
        return { width: '340px', height: '340px', maxWidth: '100%', maxHeight: '100%' };
      case '16-9':
      default:
        return { width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' };
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-dark)', color: 'var(--text-main)', overflow: 'hidden' }}>
      
      {/* Main Preview Area (TOP on Mobile, LEFT on Desktop) */}
      <div className="preview-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '380px', position: 'relative' }}>
        
        {/* Top Navbar */}
        <div className="top-navbar" style={{
          height: '56px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: 'rgba(10, 12, 16, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ANTIGRAVITY 4K
            </span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.6rem', padding: '2px 5px' }}>
              PWA
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Quick Add to Queue Button */}
            <button
              className="glass-btn primary"
              onClick={handleAddToQueue}
              style={{ padding: '5px 8px', fontSize: '0.7rem' }}
              title="Tambahkan racikan visual saat ini ke antrean render Colab"
            >
              <ListPlus size={13} /> + Antrean ({renderQueue.length})
            </button>

            {/* Aspect Ratio Switcher */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <button
                className={`glass-btn ${aspectRatio === '16-9' ? 'active' : ''}`}
                onClick={() => setAspectRatio('16-9')}
                style={{ padding: '4px 6px', fontSize: '0.65rem' }}
                title="16:9 Landscape"
              >
                <Monitor size={11} /> 16:9
              </button>
              <button
                className={`glass-btn ${aspectRatio === '9-16' ? 'active' : ''}`}
                onClick={() => setAspectRatio('9-16')}
                style={{ padding: '4px 6px', fontSize: '0.65rem' }}
                title="9:16 Reels/TikTok"
              >
                <Smartphone size={11} /> 9:16
              </button>
              <button
                className={`glass-btn ${aspectRatio === '1-1' ? 'active' : ''}`}
                onClick={() => setAspectRatio('1-1')}
                style={{ padding: '4px 6px', fontSize: '0.65rem' }}
                title="1:1 Square"
              >
                <Square size={11} /> 1:1
              </button>
            </div>
          </div>
        </div>

        {/* Viewport Canvas Container */}
        <div className="canvas-viewport" style={{
          flex: 1,
          width: '100%',
          height: '100%',
          minHeight: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
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
      />
    </div>
  );
}
