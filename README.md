# TikTok Intelligence Dashboard (Source Code)

Selamat datang di **TikTok Intelligence Dashboard**. Ini adalah source code aplikasi web modern yang dirancang untuk melakukan scraping dan analisis data komentar TikTok secara mendalam.

Aplikasi ini dibangun menggunakan teknologi web terkini seperti **React (Vite)**, **TypeScript**, dan **Tailwind CSS**, dengan integrasi ke layanan **Apify** untuk ekstraksi data yang handal.

## 🚀 Fitur Utama

-   **Modern UI/UX**: Desain antarmuka "Cyber/TikTok" yang menarik dengan efek neon dan glassmorphism.
-   **Monthly Discovery (New!)**: Temukan dan scrape video TikTok berdasarkan kata kunci dan rentang tanggal spesifik menggunakan integrasi Google Dorking.
-   **Multi-Video Analysis**: Scraping komentar dari beberapa URL video TikTok sekaligus.
-   **Deep Insights**: Menampilkan total komentar, engagement (likes), dan jumlah user unik.
-   **CSV Export**: Fitur export data hasil scrapping ke format CSV yang rapi.
-   **Responsive**: Tampilan optimal di desktop maupun perangkat mobile.
-   **Secure**: API Key tersimpan secara lokal di browser (Local Storage) dan tidak pernah dikirim ke server kami.

---

## 🔍 Fitur Monthly Discovery (Baru)

Fitur ini memungkinkan Anda untuk mencari konten TikTok tanpa perlu memiliki URL video secara manual.

1.  **Pilih Mode**: Klik tombol "Monthly Discovery" di form pencarian.
2.  **Masukkan Keyword**: Ketik topik yang ingin dicari (contoh: "Skincare Review", "Pemilu 2024").
3.  **Tentukan Tanggal**: Pilih **Start Date** dan **End Date** untuk memfilter hasil pencarian.
4.  **Mulai Scraping**: Sistem akan otomatis:
    -   Mencari video relevan via Google (Google Dorking).
    -   Mengambil URL video yang ditemukan.
    -   Melakukan scraping komentar secara otomatis.

> **Teknologi**: Fitur ini menggunakan teknik *API Chaining*, menghubungkan `Google Search Scraper` dengan `TikTok Comments Scraper` dalam satu alur kerja otomatis.

---

## 📋 Prasyarat

Sebelum memulai, pastikan komputer Anda sudah terinstall:

1.  **Node.js** (Versi 18 atau terbaru) - [Download Disini](https://nodejs.org/)
2.  **Git** (Opsional, jika menggunakan git clone)

---

## 🛠️ Cara Instalasi

Ikuti langkah-langkah berikut untuk menjalankan project di komputer Anda:

1.  **Ekstrak File ZIP**
    Ekstrak file source code yang sudah Anda download ke folder tujuan.

2.  **Buka Terminal / Command Prompt**
    Arahkan terminal ke dalam folder project tersebut.

3.  **Install Dependencies**
    Jalankan perintah berikut untuk mengunduh semua library yang dibutuhkan:
    ```bash
    npm install
    ```
    *Atau jika menggunakan yarn:*
    ```bash
    yarn install
    ```

4.  **Jalankan Aplikasi (Development)**
    Untuk menjalankan aplikasi dalam mode development:
    ```bash
    npm run dev
    ```
    Buka browser dan akses alamat yang muncul (biasanya `http://localhost:5173`).

---

## ⚙️ Konfigurasi API (PENTING)

Aplikasi ini membutuhkan **Apify API Token** agar fitur scraping dapat berjalan.

1.  Daftar akun di [Apify Console](https://console.apify.com/).
2.  Masuk ke menu **Settings > Integrations**.
3.  Salin **Personal API Token** Anda.
4.  Buka aplikasi TikTok Intelligence Dashboard di browser.
5.  Masuk ke menu **Settings** (ikon gear).
6.  Tempelkan token Anda di kolom "API Token" dan klik **Save**.

> **Catatan**: Pastikan Anda memiliki saldo atau kredit trial di akun Apify Anda, karena scraping membutuhkan resource dari Apify.

---

## 🏗️ Build untuk Production

Jika Anda ingin men-deploy aplikasi ini ke hosting (seperti Vercel, Netlify, atau VPS), jalankan perintah build untuk menghasilkan file statis yang optimal:

```bash
npm run build
```

Hasil build akan berada di dalam folder `dist`.

---

## 📂 Struktur Project

-   `src/components`: Komponen-komponen UI (Tombol, Form, Tabel).
-   `src/hooks`: Logika bisnis dan state management (Zustand).
-   `src/pages`: Halaman utama (Home, Settings).
-   `src/lib`: Utilitas dan helper function.

---

## 📞 Support & Kontak

Jika ada pertanyaan seputar source code ini, silakan hubungi pengembang melalui kontak yang tersedia di zenmatho62@gmail.com.

---

*Terima kasih telah membeli source code ini!*
# ScrappingTiktok
# ScrappingTiktok
