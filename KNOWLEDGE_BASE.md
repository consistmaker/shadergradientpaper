# 📚 KNOWLEDGE BASE & SYSTEM ARCHITECTURE
## Antigravity 4K Motion Graphics Studio (Paper Design & ShaderGradient)

---

## 1. 🎯 Apa Itu Web App Ini & Untuk Apa Tujuannya?

**Antigravity 4K Studio** adalah studio visual hybrid berbasis WebGL yang dirancang khusus untuk memproduksi aset latar belakang video gerak dinamis (*Motion Graphics Background Video*) beresolusi **4K UHD (3840x2160, 30 FPS, Seamless Loop)** secara massal dan otomatis untuk pasar **Microstock (Adobe Stock, Freepik, Shutterstock)**, **Framer Component Design**, serta **Content Creation**.

### Arsitektur Dual-Layer:
1. **Frontend Studio (Live Web Previewer)**:
   - Antarmuka ringan (*client-side*) untuk meracik estetika, mengatur warna, gerakan, zoom, kunci parameter (*Lock Parameters*), batas aman (*Safe Range Limits*), dan menyusun antrean render (*Render Queue*).
   - **URL Live**: [https://shadergradientpaper.vercel.app](https://shadergradientpaper.vercel.app)
   - **GitHub Repo**: [https://github.com/consistmaker/shadergradientpaper](https://github.com/consistmaker/shadergradientpaper)
2. **Cloud Batch Renderer Engine (`Batch_Renderer_4K.ipynb`)**:
   - Skrip Python + Headless WebGL + FFmpeg GPU-Accelerated di Google Colab yang mengeksekusi render puluhan/ratusan video 4K secara headless dan otomatis tanpa membebani laptop/PC pengguna.

---

## 2. 📖 Cara Menggunakan Web App & Workflow Produksi

```
[ Buka Web Previewer ]
         │
         ▼
[ Pilih Engine: Paper Shaders / ShaderGradient ]
         │
         ▼
[ Racik Visual / Pilih Preset Resmi / Gunakan Lock & Range Sliders ]
         │
         ▼
[ Pilihan Jalur Produksi ]
 ├── Jalur A: Klik "+ Tambah ke Antrean Render" (Pilihan manual satu per satu)
 └── Jalur B: Gunakan "Auto-Matrix Randomizer" (Colab otomatis mengacak 5 - 100 variasi unik)
         │
         ▼
[ Klik "Export Batch" -> Download / Copy JSON Recipe ]
         │
         ▼
[ Buka Batch_Renderer_4K.ipynb di Google Colab ]
         │
         ▼
[ Paste JSON & Jalankan Notebook ] ──► GPU T4 Render 4K 30fps MP4 Seamless Loop
         │
         ▼
[ Download File ZIP Berisi Semua Video Siap Jual di Microstock ]
```

---

## 3. 🛠️ Kendala Teknis yang Terjadi & Solusinya

| No | Kendala yang Dihadapi | Akar Masalah | Solusi yang Diterapkan |
|---|---|---|---|
| 1 | **Crash WebGL ShaderGradient** (`waterplane undefined` & `vertex of undefined`) | Nama parameter mesh Three.js internal `@shadergradient/react` bersifat case-sensitive (`waterPlane` bukan `waterplane`), dan mode `control="props"` wajib menyediakan seluruh props kamera/rotasi/pencahayaan. | Normalisasi tipe shape ke camelCase (`waterPlane`, `plane`, `sphere`) dan melengkapi default props matriks Three.js secara ketat di `src/constants.js`. |
| 2 | **Layar Hitam / Blank pada Paper Shaders** | Library `@paper-design/shaders-react` me-render canvas WebGL di lapisan belakang (`z-index: -1`). Container induk sebelumnya memiliki `background: #0a0c10` (hitam pekat) sehingga menutupi canvas WebGL. | Menghapus warna latar belakang solid pada elemen pembungkus dan menyetel posisi shader menjadi `position: absolute; inset: 0` agar kanvas WebGL langsung terlihat di depan. |
| 3 | **Animasi Hang/Freeze saat Slider Digeser** | Atribut `key` pada kontainer induk memuat seluruh nilai parameter slider, menyebabkan React meremount/menghancurkan konteks WebGL puluhan kali per detik. | Mengubah `key` menjadi hanya `key={config.shaderType}`, sehingga canvas WebGL tetap hidup di memori dan nilai uniform diperbarui secara *smooth* tanpa merusak canvas. |
| 4 | **Shader Image Filter Blank (`LensDistortion` & `Heatmap`)** | Komponen ini memerlukan tekstur input gambar agar bisa membiaskan distorsi/gelombang panas. Tanpa gambar, shader tidak menampilkan apa pun. | Mengembangkan generator tekstur prosedural berbasis Canvas 2D internal (`proceduralInputImage`) yang membaca 4 Color Pickers secara otomatis tanpa butuh file gambar eksternal. |
| 5 | **Risiko Duplikasi Konten di Microstock** | Mengacak variasi secara murni berpotensi menghasilkan parameter yang mirip/sama sehingga rentan ditolak reviewer Adobe Stock/Freepik. | Menerapkan algoritma **Cryptographic Fingerprint Deduplication (MD5 Hash Set)** di Google Colab. Sistem otomatis menolak parameter yang pernah ada dan mengacak ulang hingga 100% unik. |

---

## 4. 🎛️ Fitur Unggulan Sistem

1. **Dual Engine Terintegrasi**:
   - **24+ Paper Design Shaders** (MeshGradient, SmokeRing, NeuroNoise, SimplexNoise, FlutedGlass, PaperTexture, Water, Waves, Voronoi, Warp, GodRays, Metaballs, dll.)
   - **10 Preset Resmi ShaderGradient 3D** (Halo, Pensive, Mint, Interstella, Nighty Night, Viola, Universe, Sunset, Mandarin, Cotton Candy)
2. **Preset Dinamis per Komponen Shader**: Setiap jenis shader memiliki tombol preset resmi bawaan repositori yang berganti secara kontekstual.
3. **Parameter Locks & Safe Range Limits**: Fitur mengunci warna, kecepatan, atau shape, serta membatasi nilai minimum/maksimum acakan.
4. **Dual Batch Mode**:
   - **Manual Queue**: Menyusun antrean video pilihan tangan sendiri.
   - **Auto-Matrix Generator**: Memproduksi 5–100 video otomatis dengan algoritma anti-duplikat.
5. **Multi-Aspect Ratio Preview**: Sakelar instan untuk 16:9 (Landscape YouTube), 9:16 (Portrait TikTok/Reels), dan 1:1 (Square Feed).
