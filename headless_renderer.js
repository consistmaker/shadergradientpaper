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

    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--use-gl=angle',
        '--use-angle=gl',
        '--enable-webgl',
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
      console.log(`\n🎥 [${i + 1}/${queue.length}] Rendering Real WebGL 4K: ${item.name}...`);

      const page = await browser.newPage();
      await page.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 1 });
      await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

      // Injeksi konfigurasi shader ke canvas WebGL
      await page.evaluate((conf, eng) => {
        if (typeof window.__SET_ENGINE_RENDER === 'function') {
          window.__SET_ENGINE_RENDER(eng, conf);
        }
      }, item.config, item.engine);

      // Tunggu kompilasi shader WebGL
      await new Promise(r => setTimeout(r, 2000));

      const fps = (recipe.metadata && recipe.metadata.targetFps) || 30;
      const duration = (recipe.metadata && recipe.metadata.loopDurationSeconds) || 10;
      const totalFrames = fps * duration;

      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-f', 'image2pipe',
        '-vcodec', 'png',
        '-r', String(fps),
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-b:v', '45M',
        '-preset', 'fast',
        outputFile
      ]);

      console.log(`   ⏳ Capturing ${totalFrames} frames in 4K resolution (3840x2160)...`);
      for (let f = 0; f < totalFrames; f++) {
        const screenshot = await page.screenshot({ type: 'png' });
        ffmpeg.stdin.write(screenshot);
        if (f % 30 === 0) {
          console.log(`      Progress: Frame ${f}/${totalFrames} encoded...`);
        }
      }

      ffmpeg.stdin.end();
      await new Promise((resolve) => ffmpeg.on('close', resolve));
      await page.close();
      console.log(`   ✅ Success 4K Render: ${outputFile}`);
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
