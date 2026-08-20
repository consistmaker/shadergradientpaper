import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
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

export const MotionShader = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const colorsList = useMemo(() => [
    config?.color1 || '#e0eaff',
    config?.color2 || '#241d9a',
    config?.color3 || '#f75092',
    config?.color4 || '#9f50d3'
  ], [config?.color1, config?.color2, config?.color3, config?.color4]);

  // Waktu deterministik per-frame dalam hitungan milidetik untuk animasi yang 100% mulus dan loop
  const progressRatio = frame / durationInFrames;
  const currentSpeed = Number(config?.speed) || 1.0;
  const currentVirtualTime = (frame / fps) * 1000 * currentSpeed;

  const currentGrain = Number(config?.grain) || 0.0;
  const currentDistortion = Number(config?.distortion) ?? 0.8;
  const currentSwirl = Number(config?.swirl) ?? 0.1;
  const currentScale = Number(config?.scale) ?? 1.0;
  const currentRotation = Number(config?.rotation) ?? 0;
  const currentSoftness = Number(config?.softness) ?? 0.8;
  const currentThickness = Number(config?.thickness) ?? 0.4;
  const currentRadius = Number(config?.radius) ?? 0.5;
  const currentIntensity = Number(config?.intensity) ?? 0.8;
  const currentDensity = Number(config?.density) ?? 0.5;

  const shaderType = config?.shaderType || 'mesh-gradient';

  const renderShader = () => {
    switch (shaderType) {
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
            colorBack={config?.color1 || '#0f172a'}
            colorShadow={config?.color2 || '#4338ca'}
            colorHighlight={config?.color3 || '#38bdf8'}
            speed={currentSpeed}
            distortion={currentDistortion}
            scale={currentScale}
            rotation={currentRotation}
            grainOverlay={currentGrain}
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

      case 'paper-texture':
        return (
          <PaperTexture
            colorFront={config?.color1 || '#6366f1'}
            colorBack={config?.color2 || '#0f172a'}
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

      case 'waves':
        return (
          <Waves
            colorBack={config?.color1 || '#0f172a'}
            colorWave1={config?.color2 || '#6366f1'}
            colorWave2={config?.color3 || '#ec4899'}
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
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000'
      }}
    >
      {renderShader()}
    </div>
  );
};
