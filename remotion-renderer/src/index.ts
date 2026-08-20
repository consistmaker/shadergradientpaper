import { Composition, registerRoot } from 'remotion';
import React from 'react';
import { MotionShader } from './MotionShader';

const defaultPaperConfig = {
  shaderType: 'mesh-gradient',
  color1: '#e0eaff',
  color2: '#241d9a',
  color3: '#f75092',
  color4: '#9f50d3',
  speed: 1.0,
  distortion: 0.8,
  swirl: 0.1
};

export const RootComposition = () => {
  return (
    <>
      {/* Full HD Composition (1080p - 30 FPS - 10s = 300 Frames) */}
      <Composition
        id="MotionShaderFHD"
        component={MotionShader}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          config: defaultPaperConfig
        }}
      />

      {/* 4K UHD Composition (2160p - 30 FPS - 10s = 300 Frames) */}
      <Composition
        id="MotionShader4K"
        component={MotionShader}
        durationInFrames={300}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          config: defaultPaperConfig
        }}
      />
    </>
  );
};

registerRoot(RootComposition);
