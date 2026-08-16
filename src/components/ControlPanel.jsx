import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  RefreshCw,
  Layers,
  ShieldCheck,
  FileJson,
  Shapes,
  Eye,
  Activity,
  Lock,
  Unlock,
  Sliders,
  ListPlus
} from 'lucide-react';
import {
  COLOR_PALETTES,
  SHADERGRADIENT_PRESETS,
  PAPER_SHADER_SPECIFIC_PRESETS
} from '../constants';

export default function ControlPanel({
  activeEngine,
  setActiveEngine,
  config,
  setConfig,
  onRandomize,
  onExportJSON,
  randomRanges,
  setRandomRanges,
  lockedParams,
  setLockedParams,
  onAddToQueue,
  queueCount
}) {
  const [shaderGradientTab, setShaderGradientTab] = useState('shape'); // 'shape' | 'colors' | 'motion' | 'view'
  const [paperTab, setPaperTab] = useState('params'); // 'params' | 'sizing' | 'colors'
  const [showRangeModal, setShowRangeModal] = useState(false);
  const isPaper = activeEngine === 'paper';

  const handleColorChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handlePaletteSelect = (colors) => {
    if (lockedParams.colors) return;
    setConfig(prev => ({
      ...prev,
      color1: colors[0],
      color2: colors[1],
      color3: colors[2],
      color4: colors[3] || colors[0]
    }));
  };

  const handleApplyPreset = (preset) => {
    setConfig(prev => ({
      ...prev,
      activePresetId: preset.id,
      ...preset.props
    }));
  };

  const handleApplyShaderSpecificPreset = (preset) => {
    setConfig(prev => {
      const next = {
        ...prev,
        activePresetId: preset.id,
        ...preset
      };
      if (preset.colors && preset.colors.length >= 2) {
        next.color1 = preset.colors[0];
        next.color2 = preset.colors[1];
        next.color3 = preset.colors[2] || preset.colors[0];
        next.color4 = preset.colors[3] || preset.colors[1];
      }
      return next;
    });
  };

  const toggleLock = (paramKey) => {
    setLockedParams(prev => ({
      ...prev,
      [paramKey]: !prev[paramKey]
    }));
  };

  const handleRangeChange = (engine, param, minOrMax, value) => {
    setRandomRanges(prev => ({
      ...prev,
      [engine]: {
        ...prev[engine],
        [param]: {
          ...prev[engine][param],
          [minOrMax]: parseFloat(value)
        }
      }
    }));
  };

  const currentPaperPresets = PAPER_SHADER_SPECIFIC_PRESETS[config.shaderType] || [];

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', height: '100%', overflowY: 'auto' }}>
      
      {/* Engine Switcher */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
          Select Shader Engine
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            className={`glass-btn ${isPaper ? 'active' : ''}`}
            onClick={() => setActiveEngine('paper')}
            style={{ justifyContent: 'center' }}
          >
            <Layers size={16} /> Paper Shaders
          </button>
          <button
            className={`glass-btn ${!isPaper ? 'active' : ''}`}
            onClick={() => setActiveEngine('shadergradient')}
            style={{ justifyContent: 'center' }}
          >
            <Sparkles size={16} /> ShaderGradient
          </button>
        </div>
      </div>

      {/* Preset Action Buttons: Add Queue | Randomize | Export */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          className="glass-btn primary"
          onClick={onAddToQueue}
          style={{ justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
        >
          <ListPlus size={16} /> + Tambah ke Antrean Render ({queueCount})
        </button>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
          <button className="glass-btn" onClick={onRandomize} style={{ justifyContent: 'center' }}>
            <RefreshCw size={16} /> Random Recipe
          </button>
          <button className="glass-btn" onClick={onExportJSON} style={{ justifyContent: 'center' }}>
            <FileJson size={16} /> Export Batch
          </button>
        </div>
      </div>

      {/* Lock & Safe Range Controller Banner */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={14} /> BATCH RANDOMIZATION LIMITS
          </span>
          <button
            onClick={() => setShowRangeModal(!showRangeModal)}
            style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {showRangeModal ? 'Tutup Range' : 'Atur Min/Max Range'}
          </button>
        </div>

        {/* Quick Parameter Locks */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <button
            onClick={() => toggleLock('colors')}
            className={`glass-btn ${lockedParams.colors ? 'active' : ''}`}
            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
          >
            {lockedParams.colors ? <Lock size={12} color="#f87171" /> : <Unlock size={12} />} Lock Colors
          </button>
          <button
            onClick={() => toggleLock('speed')}
            className={`glass-btn ${lockedParams.speed ? 'active' : ''}`}
            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
          >
            {lockedParams.speed ? <Lock size={12} color="#f87171" /> : <Unlock size={12} />} Lock Speed
          </button>
          <button
            onClick={() => toggleLock('geometry')}
            className={`glass-btn ${lockedParams.geometry ? 'active' : ''}`}
            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
          >
            {lockedParams.geometry ? <Lock size={12} color="#f87171" /> : <Unlock size={12} />} Lock Type/Shape
          </button>
        </div>

        {/* Min/Max Range Sliders Form */}
        {showRangeModal && (
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isPaper ? (
              <>
                <div>
                  <label style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Speed Range (Min - Max)</span>
                    <span className="font-mono">{randomRanges.paper.speed.min} - {randomRanges.paper.speed.max}x</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="range" min="0.1" max="1.5" step="0.1" value={randomRanges.paper.speed.min} onChange={(e) => handleRangeChange('paper', 'speed', 'min', e.target.value)} />
                    <input type="range" min="1.5" max="3.0" step="0.1" value={randomRanges.paper.speed.max} onChange={(e) => handleRangeChange('paper', 'speed', 'max', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Grain Range (Min - Max)</span>
                    <span className="font-mono">{randomRanges.paper.grain.min} - {randomRanges.paper.grain.max}</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="range" min="0" max="0.2" step="0.02" value={randomRanges.paper.grain.min} onChange={(e) => handleRangeChange('paper', 'grain', 'min', e.target.value)} />
                    <input type="range" min="0.2" max="0.5" step="0.02" value={randomRanges.paper.grain.max} onChange={(e) => handleRangeChange('paper', 'grain', 'max', e.target.value)} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Speed Range (uSpeed)</span>
                    <span className="font-mono">{randomRanges.shadergradient.uSpeed.min} - {randomRanges.shadergradient.uSpeed.max}</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="range" min="0.1" max="0.8" step="0.05" value={randomRanges.shadergradient.uSpeed.min} onChange={(e) => handleRangeChange('shadergradient', 'uSpeed', 'min', e.target.value)} />
                    <input type="range" min="0.8" max="2.0" step="0.05" value={randomRanges.shadergradient.uSpeed.max} onChange={(e) => handleRangeChange('shadergradient', 'uSpeed', 'max', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Strength Range (uStrength)</span>
                    <span className="font-mono">{randomRanges.shadergradient.uStrength.min} - {randomRanges.shadergradient.uStrength.max}</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="range" min="0.2" max="2.0" step="0.1" value={randomRanges.shadergradient.uStrength.min} onChange={(e) => handleRangeChange('shadergradient', 'uStrength', 'min', e.target.value)} />
                    <input type="range" min="2.0" max="6.0" step="0.1" value={randomRanges.shadergradient.uStrength.max} onChange={(e) => handleRangeChange('shadergradient', 'uStrength', 'max', e.target.value)} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* === PAPER DESIGN ENGINE FULL PARAMETER CONTROLS === */}
      {isPaper && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Shader Component Selection */}
          <div>
            <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Paper Shader (24+ Components)</span>
              <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>{config.shaderType}</span>
            </label>
            <select
              disabled={lockedParams.geometry}
              value={config.shaderType}
              onChange={(e) => handleColorChange('shaderType', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                outline: 'none',
                opacity: lockedParams.geometry ? 0.6 : 1
              }}
            >
              <option value="mesh-gradient">MeshGradient (Flowing Color Interplay)</option>
              <option value="smoke-ring">SmokeRing (Layered Radial Noise)</option>
              <option value="neuro-noise">NeuroNoise (Glowing Web Fluid Lines)</option>
              <option value="god-rays">GodRays (Light Rays Radiating)</option>
              <option value="simplex-noise">SimplexNoise (Multi-Color Smooth Curves)</option>
              <option value="fluted-glass">FlutedGlass (Caustic Streaks)</option>
              <option value="paper-texture">PaperTexture (Organic Fibers)</option>
              <option value="water">Water (Caustic Realism)</option>
              <option value="grain-gradient">GrainGradient (Grainy Noise Warp)</option>
              <option value="metaballs">Metaballs (Gooey Merging Blobs)</option>
              <option value="voronoi">Voronoi (Anti-aliased Cells)</option>
              <option value="liquid-metal">LiquidMetal (Futuristic Liquid)</option>
              <option value="waves">Waves (Sharp to Smooth Lines)</option>
              <option value="warp">Warp (Swirls & Noise)</option>
              <option value="spiral">Spiral (Morphing Abstract Rings)</option>
              <option value="swirl">Swirl (Twisting Bands)</option>
              <option value="dot-orbit">DotOrbit (Orbiting Cells)</option>
              <option value="dot-grid">DotGrid (Geometric Matrix)</option>
              <option value="perlin-noise">PerlinNoise (3D Noise Field)</option>
              <option value="dithering">Dithering (2-Color Pattern)</option>
              <option value="pulsing-border">PulsingBorder (Luminous Trails)</option>
              <option value="color-panels">ColorPanels (Translucent 3D Panels)</option>
              <option value="lens-distortion">LensDistortion (Chromatic Aberration)</option>
              <option value="heatmap">Heatmap (Flowing Intensity Waves)</option>
            </select>
          </div>

          {/* DYNAMIC SHADER-SPECIFIC PRESETS BUTTONS */}
          {currentPaperPresets.length > 0 && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>
                {config.shaderType} Official Presets
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(currentPaperPresets.length, 3)}, 1fr)`, gap: '6px' }}>
                {currentPaperPresets.map((preset) => {
                  const isActive = config.activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyShaderSpecificPreset(preset)}
                      className={`glass-btn ${isActive ? 'active' : ''}`}
                      style={{
                        padding: '6px 8px',
                        fontSize: '0.75rem',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: preset.colors?.[0] || '#6366f1' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-Tabs: Params | Colors | Sizing */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
            {[
              { id: 'params', label: 'Params', icon: Sliders },
              { id: 'colors', label: 'Colors', icon: Palette },
              { id: 'sizing', label: 'Sizing', icon: Eye }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = paperTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPaperTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '6px 2px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: PARAMS */}
          {paperTab === 'params' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Animation Speed {lockedParams.speed && '(Locked)'}</span>
                  <span className="font-mono">{config.speed}x</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={config.speed ?? 1.0}
                  onChange={(e) => handleColorChange('speed', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Distortion (u_distortion / noiseScale)</span>
                  <span className="font-mono">{config.distortion}</span>
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={config.distortion ?? 0.8}
                  onChange={(e) => handleColorChange('distortion', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Swirl / Vortex (u_swirl)</span>
                  <span className="font-mono">{config.swirl}</span>
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={config.swirl ?? 0.5}
                  onChange={(e) => handleColorChange('swirl', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Softness / Contrast</span>
                  <span className="font-mono">{config.softness}</span>
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={config.softness ?? 0.8}
                  onChange={(e) => handleColorChange('softness', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Intensity / Brightness</span>
                  <span className="font-mono">{config.intensity}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={config.intensity ?? 0.8}
                  onChange={(e) => handleColorChange('intensity', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Density / Frequency</span>
                  <span className="font-mono">{config.density}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.density ?? 0.5}
                  onChange={(e) => handleColorChange('density', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Grain Overlay (u_grainOverlay)</span>
                  <span className="font-mono">{Math.round((config.grain || 0) * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.02"
                  value={config.grain ?? 0.0}
                  onChange={(e) => handleColorChange('grain', parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* TAB 2: COLORS */}
          {paperTab === 'colors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Curated Palettes</span>
                {lockedParams.colors && <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 'bold' }}>LOCKED</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', opacity: lockedParams.colors ? 0.6 : 1 }}>
                {COLOR_PALETTES.map((pal, i) => (
                  <button
                    key={i}
                    disabled={lockedParams.colors}
                    onClick={() => handlePaletteSelect(pal.colors)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px',
                      cursor: lockedParams.colors ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      gap: '3px',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={pal.name}
                  >
                    {pal.colors.slice(0, 4).map((c, idx) => (
                      <span key={idx} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c }} />
                    ))}
                  </button>
                ))}
              </div>

              {['color1', 'color2', 'color3', 'color4'].map((colKey, index) => (
                <div key={colKey} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: lockedParams.colors ? 0.6 : 1 }}>
                  <span style={{ fontSize: '0.8rem', width: '60px', fontWeight: '600' }}>Color {index + 1}</span>
                  <div style={{ flex: 1, height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: config[colKey] || '#6366f1', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <input
                      type="color"
                      disabled={lockedParams.colors}
                      value={config[colKey] || '#6366f1'}
                      onChange={(e) => handleColorChange(colKey, e.target.value)}
                      style={{ opacity: 0, width: '100%', height: '100%', cursor: lockedParams.colors ? 'not-allowed' : 'pointer' }}
                    />
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{config[colKey]}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SIZING */}
          {paperTab === 'sizing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Scale / Zoom (u_scale)</span>
                  <span className="font-mono">{config.scale}x</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={config.scale ?? 1.0}
                  onChange={(e) => handleColorChange('scale', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Rotation (u_rotation)</span>
                  <span className="font-mono">{config.rotation}°</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={config.rotation ?? 0}
                  onChange={(e) => handleColorChange('rotation', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Radius (u_radius / InnerGlow)</span>
                  <span className="font-mono">{config.radius}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.radius ?? 0.5}
                  onChange={(e) => handleColorChange('radius', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Thickness (u_thickness / OuterGlow)</span>
                  <span className="font-mono">{config.thickness}</span>
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={config.thickness ?? 0.4}
                  onChange={(e) => handleColorChange('thickness', parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}

        </div>
      )}

      {/* === SHADERGRADIENT 10 SHAPES & TAB CONTROLS === */}
      {!isPaper && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 10 Official Presets Selector */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
              10 Official Presets (shadergradient.co)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {SHADERGRADIENT_PRESETS.map((preset) => {
                const isActive = config.activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`glass-btn ${isActive ? 'active' : ''}`}
                    style={{
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      justifyContent: 'flex-start',
                      gap: '6px'
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: preset.props.color1 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-Tabs: Shape | Colors | Motion | View */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
            {[
              { id: 'shape', label: 'Shape', icon: Shapes },
              { id: 'colors', label: 'Colors', icon: Palette },
              { id: 'motion', label: 'Motion', icon: Activity },
              { id: 'view', label: 'View', icon: Eye }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = shaderGradientTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setShaderGradientTab(tab.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    padding: '6px 2px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: SHAPE */}
          {shaderGradientTab === 'shape' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {[
                    { id: 'plane', label: 'Plane' },
                    { id: 'sphere', label: 'Sphere' },
                    { id: 'waterPlane', label: 'Water' }
                  ].map(t => (
                    <button
                      key={t.id}
                      disabled={lockedParams.geometry}
                      className={`glass-btn ${config.type === t.id ? 'active' : ''}`}
                      onClick={() => handleColorChange('type', t.id)}
                      style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '6px', opacity: lockedParams.geometry ? 0.6 : 1 }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Noise Strength</span>
                  <span className="font-mono">{config.uStrength}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="6.0"
                  step="0.1"
                  value={config.uStrength || 1.5}
                  onChange={(e) => handleColorChange('uStrength', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Noise Density</span>
                  <span className="font-mono">{config.uDensity}</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={config.uDensity || 1.2}
                  onChange={(e) => handleColorChange('uDensity', parseFloat(e.target.value))}
                />
              </div>

              {config.type === 'sphere' && (
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Spiral (Amplitude)</span>
                    <span className="font-mono">{config.uAmplitude}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10.0"
                    step="0.2"
                    value={config.uAmplitude || 1.4}
                    onChange={(e) => handleColorChange('uAmplitude', parseFloat(e.target.value))}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Pixel Density</span>
                  <span className="font-mono">{config.pixelDensity || 1}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.5"
                  value={config.pixelDensity || 1}
                  onChange={(e) => handleColorChange('pixelDensity', parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* TAB 2: COLORS */}
          {shaderGradientTab === 'colors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {['color1', 'color2', 'color3'].map((colKey, index) => (
                <div key={colKey} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: lockedParams.colors ? 0.6 : 1 }}>
                  <span style={{ fontSize: '0.8rem', width: '60px', fontWeight: '600' }}>Color {index + 1}</span>
                  <div style={{ flex: 1, height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: config[colKey] || '#6366f1', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <input
                      type="color"
                      disabled={lockedParams.colors}
                      value={config[colKey] || '#6366f1'}
                      onChange={(e) => handleColorChange(colKey, e.target.value)}
                      style={{ opacity: 0, width: '100%', height: '100%', cursor: lockedParams.colors ? 'not-allowed' : 'pointer' }}
                    />
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{config[colKey]}</span>
                </div>
              ))}

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Grain</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    className={`glass-btn ${config.grain === 'on' ? 'active' : ''}`}
                    onClick={() => handleColorChange('grain', 'on')}
                    style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
                  >
                    On
                  </button>
                  <button
                    className={`glass-btn ${config.grain === 'off' ? 'active' : ''}`}
                    onClick={() => handleColorChange('grain', 'off')}
                    style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
                  >
                    Off
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Environment Lighting</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    className={`glass-btn ${config.lightType === '3d' ? 'active' : ''}`}
                    onClick={() => handleColorChange('lightType', '3d')}
                    style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
                  >
                    3D Direct
                  </button>
                  <button
                    className={`glass-btn ${config.lightType === 'env' ? 'active' : ''}`}
                    onClick={() => handleColorChange('lightType', 'env')}
                    style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
                  >
                    HDRI Env
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Brightness</span>
                  <span className="font-mono">{config.brightness || 1.2}</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={config.brightness || 1.2}
                  onChange={(e) => handleColorChange('brightness', parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* TAB 3: MOTION */}
          {shaderGradientTab === 'motion' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Animate</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    className={`glass-btn ${config.animate === 'on' ? 'active' : ''}`}
                    onClick={() => handleColorChange('animate', 'on')}
                    style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
                  >
                    On
                  </button>
                  <button
                    className={`glass-btn ${config.animate === 'off' ? 'active' : ''}`}
                    onClick={() => handleColorChange('animate', 'off')}
                    style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
                  >
                    Off
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Speed {lockedParams.speed && '(Locked)'}</span>
                  <span className="font-mono">{config.uSpeed}</span>
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.05"
                  value={config.uSpeed || 0.3}
                  onChange={(e) => handleColorChange('uSpeed', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Frequency</span>
                  <span className="font-mono">{config.uFrequency || 5.5}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={config.uFrequency || 5.5}
                  onChange={(e) => handleColorChange('uFrequency', parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* TAB 4: VIEW */}
          {shaderGradientTab === 'view' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Camera Zoom</span>
                  <span className="font-mono">{config.cameraZoom || 1}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={config.cameraZoom || 1}
                  onChange={(e) => handleColorChange('cameraZoom', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Camera Distance</span>
                  <span className="font-mono">{config.cDistance || 2.8}</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.2"
                  value={config.cDistance || 2.8}
                  onChange={(e) => handleColorChange('cDistance', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Azimuth Angle</span>
                  <span className="font-mono">{config.cAzimuthAngle}°</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={config.cAzimuthAngle || 180}
                  onChange={(e) => handleColorChange('cAzimuthAngle', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Polar Angle</span>
                  <span className="font-mono">{config.cPolarAngle}°</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="5"
                  value={config.cPolarAngle || 80}
                  onChange={(e) => handleColorChange('cPolarAngle', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Wireframe Mode</label>
                <button
                  className={`glass-btn ${config.wireframe ? 'active' : ''}`}
                  onClick={() => handleColorChange('wireframe', !config.wireframe)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Toggle Wireframe ({config.wireframe ? 'ON' : 'OFF'})
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

      {/* Seamless Loop Options */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#10b981" /> Seamless 4K Loop
          </label>
          <input
            type="checkbox"
            checked={config.isSeamlessLoop}
            onChange={(e) => handleColorChange('isSeamlessLoop', e.target.checked)}
            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
          />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Periodik loop dikunci per <span style={{ color: '#10b981', fontWeight: 'bold' }}>{config.loopDuration || 10} detik</span>.
        </p>
      </div>

    </div>
  );
}
