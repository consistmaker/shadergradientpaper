import React, { useMemo } from 'react';
import {
  MeshGradient,
  FlutedGlass,
  PaperTexture,
  GrainGradient,
  SmokeRing,
  NeuroNoise,
  DotOrbit,
  DotGrid,
  SimplexNoise,
  Metaballs,
  Waves,
  PerlinNoise,
  Voronoi,
  Warp,
  GodRays,
  Spiral,
  Swirl,
  Dithering,
  PulsingBorder,
  ColorPanels,
  Water,
  LensDistortion,
  Heatmap,
  LiquidMetal
} from '@paper-design/shaders-react';

export default function PaperShaderPreview({ config }) {
  const colorsList = useMemo(() => [
    config.color1 || '#6366f1',
    config.color2 || '#8b5cf6',
    config.color3 || '#d946ef',
    config.color4 || '#06b6d4'
  ], [config.color1, config.color2, config.color3, config.color4]);

  const currentSpeed = Number(config.speed) || 1.0;
  const currentGrain = Number(config.grain) || 0.15;
  const currentDistortion = Number(config.distortion) ?? 0.8;
  const currentSwirl = Number(config.swirl) ?? 0.5;
  const currentScale = Number(config.scale) ?? 1.0;
  const currentRotation = Number(config.rotation) ?? 0;
  const currentSoftness = Number(config.softness) ?? 0.8;
  const currentThickness = Number(config.thickness) ?? 0.4;
  const currentRadius = Number(config.radius) ?? 0.5;
  const currentIntensity = Number(config.intensity) ?? 0.8;
  const currentDensity = Number(config.density) ?? 0.5;

  // 100% Procedural Geometric Texture Generator
  const proceduralInputImage = useMemo(() => {
    if (typeof document === 'undefined') return undefined;
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
    bgGrad.addColorStop(0, config.color1 || '#6366f1');
    bgGrad.addColorStop(0.5, config.color2 || '#8b5cf6');
    bgGrad.addColorStop(1, config.color3 || '#d946ef');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 512);

    const radialGrad = ctx.createRadialGradient(256, 256, 20, 256, 256, 220);
    radialGrad.addColorStop(0, '#ffffff');
    radialGrad.addColorStop(0.4, config.color4 || '#06b6d4');
    radialGrad.addColorStop(0.8, config.color2 || '#8b5cf6');
    radialGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radialGrad;
    ctx.beginPath();
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.fill();

    return c.toDataURL();
  }, [config.color1, config.color2, config.color3, config.color4]);

  const renderShader = () => {
    switch (config.shaderType) {
      case 'mesh-gradient':
        return (
          <MeshGradient
            colors={colorsList}
            speed={currentSpeed}
            distortion={currentDistortion}
            swirl={currentSwirl}
            scale={currentScale}
            rotation={currentRotation}
            grainOverlay={currentGrain}
            grainMixer={currentGrain}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'fluted-glass':
        return (
          <FlutedGlass
            colorBack={config.color1 || '#0f172a'}
            colorShadow={config.color2 || '#4338ca'}
            colorHighlight={config.color3 || '#38bdf8'}
            speed={currentSpeed}
            distortion={currentDistortion}
            scale={currentScale}
            rotation={currentRotation}
            grainOverlay={currentGrain}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'paper-texture':
        return (
          <PaperTexture
            colorFront={config.color1 || '#6366f1'}
            colorBack={config.color2 || '#0f172a'}
            speed={currentSpeed * 0.5}
            scale={currentScale}
            rotation={currentRotation}
            roughness={currentGrain}
            fiber={currentDistortion * 0.5}
            crumples={currentSwirl * 0.5}
            contrast={currentSoftness}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'grain-gradient':
        return (
          <GrainGradient
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            grainOverlay={currentGrain}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'smoke-ring':
        return (
          <SmokeRing
            colors={colorsList}
            colorBack={config.color1 || '#0f172a'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            radius={currentRadius}
            thickness={currentThickness}
            noiseScale={currentDistortion * 2}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'neuro-noise':
        return (
          <NeuroNoise
            colorFront={config.color3 || '#38bdf8'}
            colorMid={config.color2 || '#6366f1'}
            colorBack={config.color1 || '#0f172a'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            brightness={currentIntensity}
            contrast={currentSoftness}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'god-rays':
        return (
          <GodRays
            colors={colorsList.slice(0, 5)}
            colorBack={config.color1 || '#0f172a'}
            colorBloom={config.color3 || '#38bdf8'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            intensity={currentIntensity}
            density={currentDensity}
            spotty={currentDistortion * 0.5}
            bloom={currentSoftness}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'simplex-noise':
        return (
          <SimplexNoise
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            stepsPerColor={Math.round(currentDensity * 4 + 1)}
            softness={currentSoftness}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'metaballs':
        return (
          <Metaballs
            colors={colorsList}
            colorBack={config.color1 || '#0a0c10'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'waves':
        return (
          <Waves
            colorBack={config.color1 || '#0f172a'}
            colorLines={config.color2 || '#6366f1'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'perlin-noise':
        return (
          <PerlinNoise
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'voronoi':
        return (
          <Voronoi
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'warp':
        return (
          <Warp
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'spiral':
        return (
          <Spiral
            colorBack={config.color1 || '#0f172a'}
            colorSpiral={config.color2 || '#6366f1'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'swirl':
        return (
          <Swirl
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'dithering':
        return (
          <Dithering
            colorFront={config.color2 || '#6366f1'}
            colorBack={config.color1 || '#0f172a'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'pulsing-border':
        return (
          <PulsingBorder
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'color-panels':
        return (
          <ColorPanels
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'water':
        return (
          <Water
            colorBack={config.color1 || '#0f172a'}
            colorHighlight={config.color3 || '#38bdf8'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            caustic={currentDistortion}
            highlights={currentIntensity}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'liquid-metal':
        return (
          <LiquidMetal
            shape="circle"
            colorBack={config.color1 || '#0f172a'}
            colorTint={config.color3 || '#38bdf8'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            repetition={Math.round(currentDensity * 8 + 1)}
            distortion={currentDistortion}
            contour={currentSoftness}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'lens-distortion':
        return (
          <LensDistortion
            image={proceduralInputImage}
            spread={currentDistortion}
            dispersion={currentSoftness}
            lensBulge={currentSwirl - 0.5}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            grainOverlay={currentGrain}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'heatmap':
        return (
          <Heatmap
            image={proceduralInputImage}
            colors={colorsList}
            colorBack={config.color1 || '#0a0c10'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            contour={currentDistortion}
            innerGlow={currentRadius}
            outerGlow={currentThickness}
            noise={currentGrain}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'dot-orbit':
        return (
          <DotOrbit
            colors={colorsList}
            colorBack={config.color1 || '#0f172a'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      case 'dot-grid':
        return (
          <DotGrid
            colorBack={config.color1 || '#0f172a'}
            colorDots={config.color2 || '#6366f1'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );

      default:
        return (
          <MeshGradient
            colors={colorsList}
            speed={currentSpeed}
            distortion={currentDistortion}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />
        );
    }
  };

  return (
    <div
      key={config.shaderType}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 'inherit' }}
    >
      {renderShader()}

      {/* Badge Indicator */}
      <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
        <span className="badge badge-engine">Paper Shaders ({config.shaderType})</span>
        {config.isSeamlessLoop && (
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            Seamless Loop ({config.loopDuration}s)
          </span>
        )}
      </div>
    </div>
  );
}
