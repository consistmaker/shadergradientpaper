const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

// Auto-detect path FFmpeg binary bawaan package / sistem
let ffmpegPath = 'ffmpeg';
try {
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  if (ffmpegInstaller && ffmpegInstaller.path) {
    ffmpegPath = ffmpegInstaller.path;
  }
} catch (e) {}

// Path folder dist lokal / Colab
const distDir = path.join(__dirname, 'dist');
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(distDir, reqPath === '/' ? 'index.html' : reqPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }
  
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  if (ext === '.js') contentType = 'text/javascript';
  else if (ext === '.css') contentType = 'text/css';
  else if (ext === '.svg') contentType = 'image/svg+xml';
  else if (ext === '.json') contentType = 'application/json';
  
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(4173, '127.0.0.1', async () => {
  console.log('📡 Local Headless WebGL Server live on http://127.0.0.1:4173');
  
  try {
    let recipePath = path.join(__dirname, 'render_recipe.json');
    if (!fs.existsSync(recipePath)) {
      recipePath = '/content/render_recipe.json';
    }

    if (!fs.existsSync(recipePath)) {
      const defaultRecipe = {
        metadata: { targetResolution: "3840x2160 (4K UHD)", targetFps: 30, loopDurationSeconds: 10, isSeamlessLoop: true },
        manualQueueList: [{ id: 'test_1', name: 'Test Paper MeshGradient', engine: 'paper', config: { shaderType: 'mesh-gradient', color1: '#e0eaff', color2: '#241d9a', color3: '#f75092', color4: '#9f50d3', speed: 1.0, distortion: 0.8, swirl: 0.1 } }]
      };
      fs.writeFileSync(path.join(__dirname, 'render_recipe.json'), JSON.stringify(defaultRecipe, null, 2));
      recipePath = path.join(__dirname, 'render_recipe.json');
    }

    const recipeRaw = fs.readFileSync(recipePath, 'utf8');
    const recipe = JSON.parse(recipeRaw);
    const outputDir = path.join(__dirname, 'output_4k_videos');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Auto-detect Chrome di Windows / Linux / Mac
    let chromePath = '';
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser'
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        chromePath = p;
        break;
      }
    }

    if (!chromePath) {
      throw new Error('Google Chrome executable tidak ditemukan di komputer ini.');
    }

    console.log(`🚀 Using Chrome Path: ${chromePath}`);
    console.log(`🎬 Using FFmpeg Binary: ${ffmpegPath}`);

    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--enable-webgl',
        '--enable-webgl2',
        '--ignore-gpu-blocklist',
        '--window-size=3840,2160'
      ]
    });

    const queue = recipe.manualQueueList || [
      {
        id: 'single',
        name: 'Video',
        engine: recipe.metadata ? recipe.metadata.engine : 'paper',
        config: recipe.baseConfig || {}
      }
    ];

    console.log(`🎬 Total Videos to Render: ${queue.length}`);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      const outputFile = path.join(outputDir, `motion_4k_${item.engine || 'paper'}_${i + 1}.mp4`);
      console.log(`\n🎥 [${i + 1}/${queue.length}] Rendering: ${item.name}...`);

      const page = await browser.newPage();
      await page.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 1 });
      
      await page.goto('http://127.0.0.1:4173/?render=clean', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });

      await page.waitForSelector('canvas', { timeout: 15000 }).catch(() => {});

      // Injeksi konfigurasi shader ke canvas WebGL
      await page.evaluate((conf, eng) => {
        if (typeof window.__SET_ENGINE_RENDER === 'function') {
          window.__SET_ENGINE_RENDER(eng, conf);
        }
      }, item.config, item.engine);

      await new Promise(r => setTimeout(r, 2000));

      const fps = (recipe.metadata && recipe.metadata.targetFps) || 30;
      const duration = (recipe.metadata && recipe.metadata.loopDurationSeconds) || 10;
      const totalFrames = fps * duration;

      // Inisialisasi FFmpeg dengan bundle binary otomatis
      const ffmpegArgs = [
        '-y',
        '-f', 'image2pipe',
        '-vcodec', 'mjpeg',
        '-r', String(fps),
        '-i', '-',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
        '-crf', '16',
        '-b:v', '35M',
        '-maxrate', '45M',
        '-bufsize', '70M',
        outputFile
      ];

      const ffmpeg = spawn(ffmpegPath, ffmpegArgs);
      ffmpeg.stderr.on('data', () => {});

      console.log(`   ⚡ Capturing & Encoding ${totalFrames} frames...`);

      const frameDeltaMs = 1000 / fps;

      for (let f = 0; f < totalFrames; f++) {
        const vTime = f * frameDeltaMs;

        const base64Data = await page.evaluate((virtualTime) => {
          document.querySelectorAll('[data-paper-shader]').forEach(el => {
            if (el.paperShaderMount && typeof el.paperShaderMount.setFrame === 'function') {
              el.paperShaderMount.setFrame(virtualTime);
            }
          });

          const canvas = document.querySelector('canvas');
          if (canvas) {
            return canvas.toDataURL('image/jpeg', 0.9);
          }
          return null;
        }, vTime);

        if (base64Data) {
          const rawBuffer = Buffer.from(base64Data.split(',')[1], 'base64');
          const canWrite = ffmpeg.stdin.write(rawBuffer);
          if (!canWrite) {
            await new Promise(resolve => ffmpeg.stdin.once('drain', resolve));
          }
        }

        if (f % 30 === 0 || f === totalFrames - 1) {
          console.log(`      Progress: Frame ${f + 1}/${totalFrames} encoded...`);
        }
      }

      ffmpeg.stdin.end();

      await new Promise((resolve) => {
        ffmpeg.on('close', resolve);
      });

      await page.close();
      
      const stats = fs.statSync(outputFile);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`   ✅ Success 4K Render: ${outputFile} (Size: ${sizeInMB} MB)`);
    }

    await browser.close();
    server.close();
    console.log('\n🎉 ALL VIDEOS HAVE BEEN RENDERED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Render Error:', err);
    server.close();
    process.exit(1);
  }
});
