const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

// Server statis lokal untuk mode render
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
  console.log('📡 Local WebGL Render Server live on 127.0.0.1:4173');
  
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

    // Launch Chrome dengan Akselerasi GPU Penuh (1 browser instance yang menampung multiple concurrent workers)
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

    const fps = (recipe.metadata && recipe.metadata.targetFps) || 30;
    const duration = (recipe.metadata && recipe.metadata.loopDurationSeconds) || 10;
    const totalFrames = fps * duration;
    const CONCURRENCY = parseInt(process.env.CONCURRENCY || '3', 10);

    console.log(`\n========================================================================`);
    console.log(`🚀 MULTI-WORKER GPU PARALLEL RENDER ENGINE`);
    console.log(`🎬 Total Videos: ${queue.length} | Concurrency: ${CONCURRENCY} Videos Simultaneously`);
    console.log(`⚡ Target Specs: TRUE 4K UHD (3840x2160 16:9) @ ${fps} FPS (${duration}s Seamless Loop)`);
    console.log(`========================================================================\n`);

    // Worker Function untuk me-render 1 item video secara paralel
    async function renderSingleVideo(item, videoIdx) {
      const outputFile = path.join(outputDir, `motion_4k_${item.engine || 'paper'}_${videoIdx + 1}.mp4`);
      console.log(`▶️ [Worker Started] Video ${videoIdx + 1}/${queue.length}: ${item.name}`);

      const page = await browser.newPage();
      // Kunci resolusi viewport browser tepat di True 4K UHD 3840x2160
      await page.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 1 });
      
      await page.goto('http://127.0.0.1:4173/?render=clean', { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });

      await page.waitForSelector('canvas', { timeout: 15000 }).catch(() => {});

      // Injeksi konfigurasi shader unik ke canvas worker
      await page.evaluate((conf, eng) => {
        if (typeof window.__SET_ENGINE_RENDER === 'function') {
          window.__SET_ENGINE_RENDER(eng, conf);
        }
      }, item.config, item.engine);

      await new Promise(r => setTimeout(r, 2000));

      // FFmpeg encoder dengan skala paksa True 4K (scale=3840:2160)
      const ffmpegArgs = [
        '-y',
        '-f', 'image2pipe',
        '-vcodec', 'mjpeg',
        '-r', String(fps),
        '-i', '-',
        '-vf', 'scale=3840:2160:flags=lanczos',
        '-c:v', 'h264_nvenc',
        '-preset', 'p4',
        '-tune', 'hq',
        '-pix_fmt', 'yuv420p',
        '-b:v', '35M',
        '-maxrate', '45M',
        '-bufsize', '70M',
        outputFile
      ];

      let ffmpeg = spawn('ffmpeg', ffmpegArgs);
      ffmpeg.on('error', () => {
        ffmpeg = spawn('ffmpeg', [
          '-y',
          '-f', 'image2pipe',
          '-vcodec', 'mjpeg',
          '-r', String(fps),
          '-i', '-',
          '-vf', 'scale=3840:2160:flags=lanczos',
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-pix_fmt', 'yuv420p',
          '-b:v', '35M',
          '-maxrate', '45M',
          '-bufsize', '70M',
          outputFile
        ]);
      });

      ffmpeg.stderr.on('data', () => {});

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
      }

      ffmpeg.stdin.end();

      await new Promise((resolve) => {
        ffmpeg.on('close', resolve);
      });

      await page.close();
      
      const stats = fs.statSync(outputFile);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ Success 4K Render: ${outputFile} (Size: ${sizeInMB} MB | Resolution: 3840x2160)`);
    }

    // Parallel Pool Scheduler (Menjalankan N video sekaligus secara paralel)
    let currentIndex = 0;
    async function workerPool() {
      while (currentIndex < queue.length) {
        const idx = currentIndex++;
        await renderSingleVideo(queue[idx], idx);
      }
    }

    const workers = [];
    for (let w = 0; w < Math.min(CONCURRENCY, queue.length); w++) {
      workers.push(workerPool());
    }

    await Promise.all(workers);

    await browser.close();
    server.close();
    console.log('\n🎉 ALL PARALLEL REAL WEBGL 4K VIDEOS HAVE BEEN RENDERED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Render Error:', err);
    server.close();
    process.exit(1);
  }
});
