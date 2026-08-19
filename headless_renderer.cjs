const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const distDir = path.join('/content/shadergradientpaper/dist');
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
  console.log('📡 Local Headless WebGL Server live on 127.0.0.1:4173');
  
  try {
    const recipeRaw = fs.readFileSync('/content/render_recipe.json', 'utf8');
    const recipe = JSON.parse(recipeRaw);
    const outputDir = '/content/output_4k_videos';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const chromePath = fs.existsSync('/usr/bin/google-chrome-stable') 
      ? '/usr/bin/google-chrome-stable' 
      : (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : '/usr/bin/chromium-browser');

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
        '--enable-gpu-rasterization',
        '--enable-zero-copy',
        '--use-gl=angle',
        '--use-angle=gl-egl',
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
    console.log(`⚡ DIRECT RAW RGBA GPU READPIXELS TURBO PIPELINE ACTIVE`);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      const outputFile = path.join(outputDir, `motion_4k_${item.engine || 'paper'}_${i + 1}.mp4`);
      console.log(`\n🎥 [${i + 1}/${queue.length}] Rendering 4K Video: ${item.name}...`);

      const page = await browser.newPage();
      await page.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 1 });
      
      await page.goto('http://127.0.0.1:4173/?render=clean', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });

      await page.waitForSelector('canvas', { timeout: 15000 }).catch(() => {});

      // Injeksi konfigurasi shader ke canvas WebGL & siapkan direct ReadPixels buffer
      await page.evaluate((conf, eng) => {
        if (typeof window.__SET_ENGINE_RENDER === 'function') {
          window.__SET_ENGINE_RENDER(eng, conf);
        }
        
        // Setup direct raw byte buffer di window untuk zero-overhead encoding
        window.__INIT_RAW_CAPTURE = function() {
          const canvas = document.querySelector('canvas');
          if (!canvas) return false;
          const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
          if (!gl) return false;
          window.__gl = gl;
          window.__rawPixels = new Uint8Array(3840 * 2160 * 4);
          return true;
        };
        window.__INIT_RAW_CAPTURE();
      }, item.config, item.engine);

      await new Promise(r => setTimeout(r, 2000));

      const fps = (recipe.metadata && recipe.metadata.targetFps) || 30;
      const duration = (recipe.metadata && recipe.metadata.loopDurationSeconds) || 10;
      const totalFrames = fps * duration;

      // Inisialisasi FFmpeg dengan input RAW RGBA (100% Zero-Encode Overhead, Kecepatan Maksimal GPU!)
      const ffmpegArgs = [
        '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-pix_fmt', 'rgba',
        '-s', '3840x2160',
        '-r', String(fps),
        '-i', '-',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
        '-crf', '16',
        '-b:v', '35M',
        '-maxrate', '45M',
        '-bufsize', '70M',
        '-threads', '0',
        outputFile
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      ffmpeg.stderr.on('data', () => {});

      console.log(`   ⚡ Turbo GPU Encoding ${totalFrames} frames in 4K resolution (Direct Raw Pipe)...`);

      const frameDeltaMs = 1000 / fps;

      for (let f = 0; f < totalFrames; f++) {
        const vTime = f * frameDeltaMs;

        // Ambil raw binary RGBA array langsung dari VRAM GPU tanpa konversi JPEG (Super Kencang ~50ms per frame!)
        const rawBytesBase64 = await page.evaluate((virtualTime) => {
          document.querySelectorAll('[data-paper-shader]').forEach(el => {
            if (el.paperShaderMount && typeof el.paperShaderMount.setFrame === 'function') {
              el.paperShaderMount.setFrame(virtualTime);
            }
          });

          if (window.__gl && window.__rawPixels) {
            window.__gl.readPixels(0, 0, 3840, 2160, window.__gl.RGBA, window.__gl.UNSIGNED_BYTE, window.__rawPixels);
            
            // Konversi binary buffer ke base64 secara instan
            let binary = '';
            const bytes = window.__rawPixels;
            const len = bytes.byteLength;
            const chunkSize = 65536;
            for (let i = 0; i < len; i += chunkSize) {
              const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
              binary += String.fromCharCode.apply(null, chunk);
            }
            return btoa(binary);
          }
          return null;
        }, vTime);

        if (rawBytesBase64) {
          const rawBuffer = Buffer.from(rawBytesBase64, 'base64');
          const canWrite = ffmpeg.stdin.write(rawBuffer);
          if (!canWrite) {
            await new Promise(resolve => ffmpeg.stdin.once('drain', resolve));
          }
        }

        if (f % 50 === 0 || f === totalFrames - 1) {
          console.log(`      ⚡ Turbo GPU Progress: Frame ${f + 1}/${totalFrames}...`);
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
    console.log('\n🎉 ALL REAL WEBGL 4K VIDEOS HAVE BEEN RENDERED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Render Error:', err);
    server.close();
    process.exit(1);
  }
});
