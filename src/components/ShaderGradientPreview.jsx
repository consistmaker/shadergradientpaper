import React from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export default function ShaderGradientPreview({ config }) {
  const currentType = config.type === 'plane' ? 'plane' : config.type === 'sphere' ? 'sphere' : 'waterPlane';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 'inherit', background: '#0a0c10' }}>
      
      <ShaderGradientCanvas
        key={`${currentType}-${config.color1}-${config.color2}-${config.color3}-${config.wireframe}-${config.grain}-${config.lightType}-${config.activePresetId}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
        pixelDensity={Number(config.pixelDensity) || 1}
        fov={Number(config.fov) || 45}
      >
        <ShaderGradient
          control="props"
          shader="defaults"
          type={currentType}
          animate={config.animate || "on"}
          uTime={0}
          uSpeed={Number(config.uSpeed) ?? 0.3}
          uStrength={Number(config.uStrength) ?? 1.5}
          uDensity={Number(config.uDensity) ?? 1.2}
          uFrequency={Number(config.uFrequency) ?? 5.5}
          uAmplitude={Number(config.uAmplitude) ?? (currentType === 'sphere' ? 1.4 : 0)}
          cAzimuthAngle={Number(config.cAzimuthAngle) ?? 180}
          cPolarAngle={Number(config.cPolarAngle) ?? 80}
          cDistance={Number(config.cDistance) ?? 2.8}
          cameraZoom={Number(config.cameraZoom) ?? 1}
          color1={config.color1 || "#809bd6"}
          color2={config.color2 || "#910aff"}
          color3={config.color3 || "#af38ff"}
          grain={config.grain || "on"}
          lightType={config.lightType || "3d"}
          brightness={Number(config.brightness) ?? 1.2}
          envPreset={config.envPreset || "city"}
          reflection={Number(config.reflection) ?? 0.1}
          positionX={Number(config.positionX) ?? 0}
          positionY={Number(config.positionY) ?? 0}
          positionZ={Number(config.positionZ) ?? 0}
          rotationX={Number(config.rotationX) ?? (currentType === 'waterPlane' ? 50 : 0)}
          rotationY={Number(config.rotationY) ?? 0}
          rotationZ={Number(config.rotationZ) ?? (currentType === 'waterPlane' ? -60 : 0)}
          wireframe={Boolean(config.wireframe)}
        />
      </ShaderGradientCanvas>

      {/* Badge Indicator */}
      <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
        <span className="badge badge-engine">
          ShaderGradient ({config.activePresetId ? config.activePresetId.toUpperCase() : currentType.toUpperCase()})
        </span>
        {config.wireframe && <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>Wireframe Mode</span>}
        {config.isSeamlessLoop && <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)' }}>Seamless Loop ({config.loopDuration}s)</span>}
      </div>

    </div>
  );
}
