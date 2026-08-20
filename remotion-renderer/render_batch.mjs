import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startBatchRender() {
  console.log('========================================================================');
  console.log('🎬 REMOTION VIDEO BATCH RENDERER ENGINE (FHD & 4K UHD)');
  console.log('========================================================================\n');

  // Baca file resep JSON (bisa dari render_recipe.json di root project)
  let recipePath = path.join(__dirname, 'render_recipe.json');
  if (!fs.existsSync(recipePath)) {
    recipePath = path.join(__dirname, '..', 'render_recipe.json');
  }

  if (!fs.existsSync(recipePath)) {
    console.error('❌ File render_recipe.json tidak ditemukan!');
    process.exit(1);
  }

  const recipe = JSON.parse(fs.readFileSync(recipePath, 'utf8'));
  const outputDir = path.join(__dirname, 'out');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const isFHD = (recipe.metadata?.resolutionWidth || 1920) <= 1920;
  const compositionId = isFHD ? 'MotionShaderFHD' : 'MotionShader4K';
  const resolutionName = isFHD ? 'Full HD (1920x1080)' : '4K UHD (3840x2160)';

  console.log(`📦 [1/3] Bundling Remotion WebGL Studio (Webpack)...`);
  const bundleLocation = await bundle({
    entryPoint: path.join(__dirname, 'src', 'index.tsx'),
    webpackOverride: (config) => config
  });

  console.log(`🔍 [2/3] Memilih Komposisi Video: ${compositionId} (${resolutionName})...`);
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId
  });

  const queue = recipe.manualQueueList || [
    {
      id: 'single',
      name: 'Video',
      engine: recipe.metadata?.engine || 'paper',
      config: recipe.baseConfig || {}
    }
  ];

  console.log(`\n🚀 [3/3] Memulai Render ${queue.length} Video dengan Remotion Frame-Accurate Engine...\n`);

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    const prefix = isFHD ? 'remotion_fhd' : 'remotion_4k';
    const outputFile = path.join(outputDir, `${prefix}_${i + 1}.mp4`);

    console.log(`🎥 [${i + 1}/${queue.length}] Rendering: ${item.name}...`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputFile,
      inputProps: {
        config: item.config
      },
      onProgress: ({ progress }) => {
        const percent = Math.round(progress * 100);
        if (percent % 25 === 0) {
          process.stdout.write(`   Progress: ${percent}%\r`);
        }
      }
    });

    const stats = fs.statSync(outputFile);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   ✅ Selesai Render: ${outputFile} (Ukuran: ${sizeMB} MB)\n`);
  }

  console.log('🎉 SEMUA VIDEO BERHASIL DIRENDER MENGGUNAKAN REMOTION!');
}

startBatchRender().catch((err) => {
  console.error('❌ Remotion Render Error:', err);
  process.exit(1);
});
