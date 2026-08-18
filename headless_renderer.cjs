const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

// Static file server untuk folder dist
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

server.listen(4173, async () => {
  console.log('📡 Local Headless WebGL Server live on port 4173');
  
  try {
    const recipeRaw = fs.readFileSync('/content/render_recipe.json', 'utf8');
    const recipe = JSON.parse(recipeRaw);
    const outputDir = '/content/output_4k_videos';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Auto-detect path Google Chrome
    const chromePath = fs.existsSync('/usr/bin/google-chrome-stable') 
      ? '/usr/bin/google-chrome-stable' 
      : (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : '/usr/bin/chromium-browser');

    // Launch Chrome with full GPU WebGL acceleration enabled in headless mode
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
        '--use-gl=egl',
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
      console.log(`\n🎥 [${i + 1}/${queue.length}] Rendering Real WebGL 4K: ${item.name}...`);

      const page = await browser.newPage();
      await page.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 1 });
      await page.goto('http://localhost:4173/?render=clean', { waitUntil: 'networkidle0' });

      // Injeksi konfigurasi shader ke canvas WebGL
      await page.evaluate((conf, eng) => {
        if (typeof window.__SET_ENGINE_RENDER === 'function') {
          window.__SET_ENGINE_RENDER(eng, conf);
        }
      }, item.config, item.engine);

      // Tunggu kompilasi shader WebGL
      await new Promise(r => setTimeout(r, 2500));

      const fps = (recipe.metadata && recipe.metadata.targetFps) || 30;
      const duration = (recipe.metadata && recipe.metadata.loopDurationSeconds) || 10;
      const totalFrames = fps * duration;

      // Encode raw PNG frame stream with FFmpeg libx264
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-f', 'image2pipe',
        '-vcodec', 'png',
        '-r', String(fps),
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-crf', '16',
        '-b:v', '35M',
        '-maxrate', '45M',
        '-bufsize', '70M',
        '-preset', 'medium',
        outputFile
      ]);

      ffmpeg.stderr.on('data', (data) => {
        // Logging error jika ffmpeg mengalami issue
        const str = data.toString();
        if (str.includes('Error') || str.includes('fatal')) {
          console.error('FFmpeg stderr:', str);
        }
      });

      console.log(`   ⏳ Capturing & Encoding ${totalFrames} frames in 4K resolution (3840x2160)...`);
      
      for (let f = 0; f < totalFrames; f++) {
        // Ambil screenshot langsung sebagai Buffer PNG
        const screenshotBuffer = await page.screenshot({
          type: 'png',
          omitBackground: false
        });

        // Tulis ke stdin ffmpeg dan tunggu buffer flush
        const canWrite = ffmpeg.stdin.write(screenshotBuffer);
        if (!canWrite) {
          await new Promise(resolve => ffmpeg.stdin.once('drain', resolve));
        }

        // Delay kecil per frame agar animasi WebGL bergerak maju secara natural
        await page.evaluate(() => new Promise(requestAnimationFrame));

        if (f % 30 === 0 || f === totalFrames - 1) {
          console.log(`      Progress: Frame ${f + 1}/${totalFrames} encoded...`);
        }
      }

      ffmpeg.stdin.end();

      await new Promise((resolve, reject) => {
        ffmpeg.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`FFmpeg exited with code ${code}`));
        });
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
