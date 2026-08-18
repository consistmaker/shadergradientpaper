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
    config.color1 || '#e0eaff',
    config.color2 || '#241d9a',
    config.color3 || '#f75092',
    config.color4 || '#9f50d3'
  ], [config.color1, config.color2, config.color3, config.color4]);

  const currentSpeed = Number(config.speed) || 1.0;
  const currentGrain = Number(config.grain) || 0.0;
  const currentDistortion = Number(config.distortion) ?? 0.8;
  const currentSwirl = Number(config.swirl) ?? 0.1;
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
    bgGrad.addColorStop(0, config.color1 || '#e0eaff');
    bgGrad.addColorStop(0.5, config.color2 || '#241d9a');
    bgGrad.addColorStop(1, config.color3 || '#f75092');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 512);

    const radialGrad = ctx.createRadialGradient(256, 256, 20, 256, 256, 220);
    radialGrad.addColorStop(0, '#ffffff');
    radialGrad.addColorStop(0.4, config.color4 || '#9f50d3');
    radialGrad.addColorStop(0.8, config.color2 || '#241d9a');
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
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
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
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
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
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
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
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'smoke-ring':
        return (
          <SmokeRing
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            thickness={currentThickness}
            radius={currentRadius}
            grainOverlay={currentGrain}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'neuro-noise':
        return (
          <NeuroNoise
            colorFront={config.color1 || '#f8fafc'}
            colorBack={config.color2 || '#0a0c10'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            brightness={currentIntensity}
            grainOverlay={currentGrain}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'god-rays':
        return (
          <GodRays
            colorBack={config.color1 || '#090a0f'}
            colorRays={config.color2 || '#6366f1'}
            colorGlow={config.color3 || '#06b6d4'}
            speed={currentSpeed}
            scale={currentScale}
            intensity={currentIntensity}
            density={currentDensity}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'simplex-noise':
        return (
          <SimplexNoise
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            contrast={currentSoftness}
            grainOverlay={currentGrain}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'metaballs':
        return (
          <Metaballs
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            contrast={currentSoftness}
            grainOverlay={currentGrain}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'water':
        return (
          <Water
            colorBack={config.color1 || '#082f49'}
            colorCaustics={config.color2 || '#38bdf8'}
            colorHighlight={config.color3 || '#e0f2fe'}
            speed={currentSpeed}
            scale={currentScale}
            distortion={currentDistortion}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'waves':
        return (
          <Waves
            colorBack={config.color1 || '#0f172a'}
            colorWave1={config.color2 || '#6366f1'}
            colorWave2={config.color3 || '#ec4899'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'perlin-noise':
        return (
          <PerlinNoise
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'voronoi':
        return (
          <Voronoi
            colorBack={config.color1 || '#0f172a'}
            colorCells={config.color2 || '#8b5cf6'}
            colorBorders={config.color3 || '#06b6d4'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'warp':
        return (
          <Warp
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'spiral':
        return (
          <Spiral
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'swirl':
        return (
          <Swirl
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'dithering':
        return (
          <Dithering
            colorFront={config.color1 || '#6366f1'}
            colorBack={config.color2 || '#090a0f'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'pulsing-border':
        return (
          <PulsingBorder
            colorFront={config.color1 || '#6366f1'}
            colorBack={config.color2 || '#0f172a'}
            speed={currentSpeed}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'color-panels':
        return (
          <ColorPanels
            colors={colorsList}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'lens-distortion':
        return (
          <LensDistortion
            image={proceduralInputImage}
            speed={currentSpeed}
            distortion={currentDistortion}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'heatmap':
        return (
          <Heatmap
            image={proceduralInputImage}
            speed={currentSpeed}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'liquid-metal':
        return (
          <LiquidMetal
            colorBack={config.color1 || '#0f172a'}
            colorLiquid={config.color2 || '#6366f1'}
            shape="circle"
            speed={currentSpeed}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      case 'dot-orbit':
        return (
          <DotOrbit
            colorBack={config.color1 || '#0f172a'}
            colorDots={config.color2 || '#38bdf8'}
            speed={currentSpeed}
            scale={currentScale}
            rotation={currentRotation}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
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
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );

      default:
        return (
          <MeshGradient
            colors={colorsList}
            speed={currentSpeed}
            distortion={currentDistortion}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }}
          />
        );
    }
  };

  return (
    <div
      key={`${config.shaderType}_${config.color1}_${config.color2}`}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 'inherit' }}
    >
      {renderShader()}
    </div>
  );
}
