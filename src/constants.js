// PRESET SPESIFIK RESMI UNTUK MASING-MASING SHADER DARI REPO @paper-design/shaders
export const PAPER_SHADER_SPECIFIC_PRESETS = {
  "mesh-gradient": [
    {
      id: "mesh_default",
      name: "Default Flow",
      colors: ["#e0eaff", "#241d9a", "#f75092", "#9f50d3"],
      speed: 1.0,
      distortion: 0.8,
      swirl: 0.1,
      grain: 0.0,
      scale: 1.0,
      rotation: 0
    },
    {
      id: "mesh_purple",
      name: "Purple Velvet",
      colors: ["#aaa7d7", "#3c2b8e", "#1e1b4b", "#6d28d9"],
      speed: 0.6,
      distortion: 1.0,
      swirl: 1.0,
      grain: 0.0,
      scale: 1.0,
      rotation: 0
    },
    {
      id: "mesh_beach",
      name: "Beach Breeze",
      colors: ["#bcecf6", "#00aaff", "#00f7ff", "#ffd447"],
      speed: 0.1,
      distortion: 0.8,
      swirl: 0.35,
      grain: 0.0,
      scale: 1.0,
      rotation: 0
    },
    {
      id: "mesh_ink",
      name: "Ink Contrast",
      colors: ["#ffffff", "#000000", "#ffffff", "#000000"],
      speed: 1.0,
      distortion: 1.0,
      swirl: 0.2,
      rotation: 90,
      grain: 0.0,
      scale: 1.0
    }
  ],
  "smoke-ring": [
    {
      id: "smoke_default",
      name: "Default Ring",
      colors: ["#ffffff", "#aaaaaa", "#555555", "#000000"],
      speed: 0.5,
      radius: 0.25,
      thickness: 0.65,
      distortion: 0.7,
      scale: 0.8,
      grain: 0.0
    },
    {
      id: "smoke_solar",
      name: "Solar Flare",
      colors: ["#ffffff", "#ffca0a", "#fc6203", "#000000"],
      speed: 1.0,
      radius: 0.4,
      thickness: 0.8,
      distortion: 1.0,
      scale: 2.0,
      grain: 0.05
    },
    {
      id: "smoke_line",
      name: "Neon Smoke Line",
      colors: ["#4540a4", "#1fe8ff", "#0f172a", "#000000"],
      speed: 0.8,
      radius: 0.38,
      thickness: 0.1,
      distortion: 0.4,
      scale: 1.0,
      grain: 0.1
    }
  ],
  "neuro-noise": [
    {
      id: "neuro_default",
      name: "Default Web",
      colors: ["#000000", "#47a6ff", "#ffffff", "#000000"],
      speed: 1.0,
      intensity: 0.8,
      softness: 0.6,
      scale: 1.0,
      grain: 0.0
    },
    {
      id: "neuro_sensation",
      name: "Sensation Web",
      colors: ["#8b42ff", "#fbff00", "#00c8ff", "#0f172a"],
      speed: 1.0,
      intensity: 1.2,
      softness: 0.6,
      scale: 3.0,
      grain: 0.1
    },
    {
      id: "neuro_bloodstream",
      name: "Bloodstream",
      colors: ["#000000", "#ff0000", "#ff6b6b", "#ffffff"],
      speed: 1.0,
      intensity: 1.5,
      softness: 0.8,
      scale: 0.7,
      grain: 0.0
    }
  ],
  "simplex-noise": [
    {
      id: "simplex_default",
      name: "Default Spectrum",
      colors: ["#4449CF", "#FFD1E0", "#F94446", "#FFD36B"],
      speed: 0.5,
      density: 0.4,
      softness: 0.2,
      scale: 0.6
    },
    {
      id: "simplex_bubblegum",
      name: "Bubblegum",
      colors: ["#ffffff", "#ff9e9e", "#5f57ff", "#00f7ff"],
      speed: 2.0,
      density: 0.2,
      softness: 1.0,
      scale: 1.6
    },
    {
      id: "simplex_spots",
      name: "Orange Spots",
      colors: ["#ff7b00", "#f9ffeb", "#320d82", "#ffaa00"],
      speed: 0.6,
      density: 0.2,
      softness: 0.0,
      scale: 1.0
    }
  ],
  "fluted-glass": [
    {
      id: "glass_default",
      name: "Default Ribbed",
      colors: ["#0f172a", "#000000", "#ffffff", "#38bdf8"],
      speed: 0.5,
      distortion: 0.5,
      scale: 1.0,
      grain: 0.05
    },
    {
      id: "glass_waves",
      name: "Glass Waves",
      colors: ["#1e1b4b", "#312e81", "#818cf8", "#c7d2fe"],
      speed: 0.8,
      distortion: 0.9,
      scale: 1.2,
      grain: 0.1
    }
  ],
  "paper-texture": [
    {
      id: "paper_default_tex",
      name: "Kraft Paper",
      colors: ["#9fadbc", "#ffffff", "#cbd5e1", "#64748b"],
      speed: 0.5,
      scale: 0.6,
      grain: 0.4,
      softness: 0.3
    },
    {
      id: "paper_abstract",
      name: "Cyber Cardboard",
      colors: ["#00eeff", "#ff0a81", "#ffffff", "#0f172a"],
      speed: 0.5,
      scale: 0.6,
      grain: 0.1,
      softness: 0.85
    }
  ],
  "water": [
    {
      id: "water_default",
      name: "Clear Water",
      colors: ["#909090", "#0284c7", "#ffffff", "#38bdf8"],
      speed: 1.0,
      distortion: 0.5,
      intensity: 0.7,
      scale: 0.8
    },
    {
      id: "water_abstract",
      name: "Deep Ocean Waves",
      colors: ["#0369a1", "#0284c7", "#38bdf8", "#ffffff"],
      speed: 1.5,
      distortion: 0.9,
      intensity: 1.0,
      scale: 3.0
    }
  ],
  "grain-gradient": [
    {
      id: "grain_default",
      name: "Neon Grain Mesh",
      colors: ["#7300ff", "#eba8ff", "#00bfff", "#2a00ff"],
      speed: 1.0,
      softness: 0.5,
      intensity: 0.5,
      grain: 0.25
    },
    {
      id: "grain_wave",
      name: "Golden Wave Grain",
      colors: ["#000a0f", "#c4730b", "#bdad5f", "#d8ccc7"],
      speed: 1.0,
      softness: 0.7,
      intensity: 0.3,
      grain: 0.4
    }
  ],
  "metaballs": [
    {
      id: "meta_default",
      name: "Spectrum Blobs",
      colors: ["#000000", "#6e33cc", "#ff5500", "#ffc105"],
      speed: 1.0,
      scale: 1.0,
      density: 0.6
    },
    {
      id: "meta_space",
      name: "Cosmic Drops",
      colors: ["#2a273f", "#ae00ff", "#00ff95", "#ffc105"],
      speed: 0.5,
      scale: 2.0,
      density: 0.8
    }
  ],
  "voronoi": [
    {
      id: "voro_default",
      name: "Cellular Orange",
      colors: ["#ff8247", "#ffe53d", "#ffffff", "#2e0000"],
      speed: 0.5,
      distortion: 0.4,
      scale: 0.5
    },
    {
      id: "voro_bubbles",
      name: "Water Bubbles",
      colors: ["#83c9fb", "#ffffff", "#0284c7", "#0369a1"],
      speed: 0.5,
      distortion: 0.4,
      scale: 0.75
    }
  ],
  "god-rays": [
    {
      id: "rays_default",
      name: "Cosmic Blue Burst",
      colors: ["#000000", "#a600ff", "#6200ff", "#33fff5"],
      speed: 0.75,
      density: 0.3,
      intensity: 0.8,
      softness: 0.4
    },
    {
      id: "rays_warp",
      name: "Hyper Warp Rays",
      colors: ["#000000", "#ff47d4", "#ff8c00", "#ffffff"],
      speed: 2.0,
      density: 0.45,
      intensity: 0.9,
      softness: 0.4
    }
  ]
};

export const SHADERGRADIENT_PRESETS = [
  {
    id: "halo",
    name: "Halo (Plane)",
    props: {
      type: "plane",
      uAmplitude: 1,
      uDensity: 1.3,
      uSpeed: 0.4,
      uStrength: 4.0,
      uFrequency: 5.5,
      brightness: 1.2,
      grain: "on",
      lightType: "3d",
      envPreset: "city",
      cAzimuthAngle: 180,
      cPolarAngle: 90,
      cDistance: 3.6,
      cameraZoom: 1,
      color1: "#ff5005",
      color2: "#dbba95",
      color3: "#d0bce1",
      positionX: -1.4,
      positionY: 0,
      positionZ: 0,
      rotationX: 0,
      rotationY: 10,
      rotationZ: 50,
      pixelDensity: 1,
      wireframe: false,
      animate: "on"
    }
  },
  {
    id: "pensive",
    name: "Pensive (Sphere)",
    props: {
      type: "sphere",
      uAmplitude: 7.0,
      uDensity: 0.8,
      uFrequency: 5.5,
      uSpeed: 0.3,
      uStrength: 0.4,
      brightness: 1.5,
      grain: "on",
      lightType: "3d",
      envPreset: "city",
      cAzimuthAngle: 250,
      cPolarAngle: 140,
      cDistance: 1.5,
      cameraZoom: 12.5,
      color1: "#809bd6",
      color2: "#910aff",
      color3: "#af38ff",
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 140,
      pixelDensity: 1,
      wireframe: false,
      animate: "on"
    }
  },
  {
    id: "mint",
    name: "Mint (Water)",
    props: {
      type: "waterPlane",
      uAmplitude: 0,
      uDensity: 1.2,
      uFrequency: 0,
      uSpeed: 0.2,
      uStrength: 3.4,
      brightness: 1.2,
      grain: "off",
      lightType: "3d",
      envPreset: "city",
      cAzimuthAngle: 170,
      cPolarAngle: 70,
      cDistance: 4.4,
      cameraZoom: 1,
      color1: "#94ffd1",
      color2: "#6bf5ff",
      color3: "#ffffff",
      positionX: 0,
      positionY: 0.9,
      positionZ: -0.3,
      rotationX: 45,
      rotationY: 0,
      rotationZ: 0,
      pixelDensity: 1,
      wireframe: false,
      animate: "on"
    }
  },
  {
    id: "interstella",
    name: "Interstella (Sphere)",
    props: {
      type: "sphere",
      uAmplitude: 3.2,
      uDensity: 0.8,
      uFrequency: 5.5,
      uSpeed: 0.3,
      uStrength: 0.3,
      brightness: 0.8,
      grain: "on",
      lightType: "env",
      envPreset: "city",
      cAzimuthAngle: 270,
      cPolarAngle: 180,
      cDistance: 0.5,
      cameraZoom: 15.1,
      color1: "#73bfc4",
      color2: "#ff810a",
      color3: "#8da0ce",
      positionX: -0.1,
      positionY: 0,
      positionZ: 0,
      rotationX: 0,
      rotationY: 130,
      rotationZ: 70,
      pixelDensity: 1,
      wireframe: false,
      animate: "on"
    }
  },
  {
    id: "nightyNight",
    name: "Nighty Night (Water)",
    props: {
      type: "waterPlane",
      uAmplitude: 0,
      uDensity: 1.5,
      uFrequency: 0,
      uSpeed: 0.3,
      uStrength: 1.5,
      brightness: 1.0,
      grain: "on",
      lightType: "3d",
      envPreset: "city",
      cAzimuthAngle: 180,
      cPolarAngle: 80,
      cDistance: 2.8,
      cameraZoom: 9.1,
      color1: "#606080",
      color2: "#8d7dca",
      color3: "#212121",
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      rotationX: 50,
      rotationY: 0,
      rotationZ: -60,
      pixelDensity: 1,
      wireframe: false,
      animate: "on"
    }
  },
  {
    id: "violaOrientalis",
    name: "Viola (Sphere)",
    props: {
      type: "sphere",
      uAmplitude: 1.4,
      uDensity: 1.1,
      uFrequency: 5.5,
      uSpeed: 0.1,
      uStrength: 1.0,
      brightness: 1.1,
      grain: "off",
      lightType: "3d",
      envPreset: "city",
      cAzimuthAngle: 0,
      cPolarAngle: 140,
      cDistance: 7.1,
      cameraZoom: 17.3,
      color1: "#ffffff",
      color2: "#ffbb00",
      color3: "#0700ff",
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      pixelDensity: 1,
      wireframe: false,
      animate: "on"
    }
  },
  {
    id: "universe",
    name: "Universe (Water)",
    props: {
      type: "waterPlane",
      uAmplitude: 0,
      uDensity: 1.1,
      uFrequency: 5.5,
      uSpeed: 0.1,
      uStrength: 2.4,
      brightness: 1.1,
      grain: "off",
      lightType: "3d",
      envPreset: "city",
      cAzimuthAngle: 180,
      cPolarAngle: 115,
      cDistance: 3.9,
      cameraZoom: 1,
      color1: "#5606ff",
      color2: "#fe8989",
      color3: "#000000",
      positionX: -0.5,
      positionY: 0.1,
      positionZ: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 235,
      pixelDensity: 1,
      wireframe: false,
      animate: "on"
    }
  },
  {
    id: "sunset",
    name: "Sunset (Sphere)",
    props: {
      type: "sphere",
      uAmplitude: 1.4,
      uDensity: 1.1,
      uFrequency: 5.5,
      uSpeed: 0.1,
      uStrength: 0.4,
      brightness: 1.5,
      grain: "off",
      lightType: "3d",
      envPreset: "dawn",
      cAzimuthAngle: 60,
      cDistance: 7.1,
      cPolarAngle: 90,
      cameraZoom: 15.3,
      color1: "#ff7a33",
      color2: "#33a0ff",
      color3: "#ffc53d",
      positionX: 0,
      positionY: -0.15,
      positionZ: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      pixelDensity: 1,
      wireframe: false,
      animate: "on"
    }
  },
  {
    id: "mandarin",
    name: "Mandarin (Water)",
    props: {
      type: "waterPlane",
      uAmplitude: 0,
      uDensity: 1.8,
      uFrequency: 5.5,
      uSpeed: 0.2,
      uStrength: 3.0,
      brightness: 1.2,
      grain: "off",
      lightType: "3d",
      envPreset: "city",
      cAzimuthAngle: 180,
      cDistance: 2.4,
      cPolarAngle: 95,
      cameraZoom: 1,
      color1: "#ff6a1a",
      color2: "#c73c00",
      color3: "#FD4912",
      positionX: 0,
      positionY: -2.1,
      positionZ: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 225,
      pixelDensity: 1,
      wireframe: false,
      animate: "on"
    }
  },
  {
    id: "cottonCandy",
    name: "Cotton Candy (Water)",
    props: {
      type: "waterPlane",
      uAmplitude: 0,
      uDensity: 1.0,
      uFrequency: 5.5,
      uSpeed: 0.3,
      uStrength: 3.0,
      brightness: 1.2,
      grain: "off",
      lightType: "3d",
      envPreset: "city",
      cAzimuthAngle: 180,
      cDistance: 2.9,
      cPolarAngle: 120,
      cameraZoom: 1,
      color1: "#ebedff",
      color2: "#f3f2f8",
      color3: "#dbf8ff",
      positionX: 0,
      positionY: 1.8,
      positionZ: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: -90,
      pixelDensity: 1,
      wireframe: false,
      animate: "on"
    }
  }
];

export const COLOR_PALETTES = [
  {
    name: "Cyber Neon",
    colors: ["#6366f1", "#8b5cf6", "#d946ef", "#06b6d4"]
  },
  {
    name: "Midnight Silk",
    colors: ["#0f172a", "#1e1b4b", "#4c1d95", "#831843"]
  },
  {
    name: "Golden Sunset",
    colors: ["#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"]
  },
  {
    name: "Emerald Fluid",
    colors: ["#064e3b", "#047857", "#10b981", "#06b6d4"]
  },
  {
    name: "Pastel Dreams",
    colors: ["#f472b6", "#c084fc", "#60a5fa", "#34d399"]
  },
  {
    name: "Deep Ocean",
    colors: ["#0284c7", "#0369a1", "#1e3a8a", "#0f172a"]
  }
];

export const DEFAULT_PAPER_CONFIG = {
  shaderType: "mesh-gradient",
  activePresetId: "mesh_default",
  color1: "#e0eaff",
  color2: "#241d9a",
  color3: "#f75092",
  color4: "#9f50d3",
  speed: 1.0,
  grain: 0.0,
  distortion: 0.8,
  swirl: 0.1,
  scale: 1.0,
  rotation: 0,
  softness: 0.8,
  thickness: 0.4,
  radius: 0.5,
  intensity: 0.8,
  density: 0.5,
  isSeamlessLoop: true,
  loopDuration: 10
};

export const DEFAULT_SHADERGRADIENT_CONFIG = {
  activePresetId: "pensive",
  ...SHADERGRADIENT_PRESETS[1].props,
  isSeamlessLoop: true,
  loopDuration: 10
};
