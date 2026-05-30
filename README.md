# 🍽️ FEAST — Frontend

**Food Ecosystem Alliance & Smart Technology**
Frontend application untuk platform multi-tenant F&B, dibangun dengan React + Vite.

---

## 📋 Prerequisites

Sebelum menjalankan project ini, pastikan komputer kamu sudah terinstall:

| Software | Versi Minimum | Cara Cek | Download |
|----------|--------------|----------|----------|
| **Node.js** | `v20.19.0` atau `≥ v22.12.0` | `node -v` | [nodejs.org](https://nodejs.org/) |
| **npm** | `v10+` (otomatis bundled sama Node.js) | `npm -v` | Sudah termasuk di Node.js |
| **Git** | Versi terbaru | `git --version` | [git-scm.com](https://git-scm.com/) |

> ⚠️ **PENTING**: Project ini menggunakan **Vite 8** yang **HANYA mendukung Node.js ^20.19.0 atau ≥22.12.0**. Jika kamu menggunakan Node.js versi lama (misalnya v18 atau v20.0–v20.18), project ini **tidak akan berjalan**. Pastikan update ke versi yang didukung.

### Cek Versi Node.js

```bash
node -v
# Harus output: v20.19.x, v22.x.x, v23.x.x, atau v24.x.x
```

Jika versi terlalu lama, download versi LTS terbaru dari [nodejs.org](https://nodejs.org/).

**Rekomendasi**: Gunakan [nvm](https://github.com/nvm-sh/nvm) (Linux/Mac) atau [nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows) untuk mengelola versi Node.js.

```bash
# Install Node.js 22 via nvm (contoh)
nvm install 22
nvm use 22
```

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd feast-frontend
```

### 2. Install Dependencies

```bash
npm install
```

> Perintah ini akan membaca `package.json` dan `package-lock.json` lalu mengunduh semua library yang dibutuhkan ke folder `node_modules/`.

### 3. Setup Environment Variables

File `.env` sudah ada di repository. Jika tidak ada, buat manual:

```bash
# Buat file .env di root project
```

Isi file `.env`:

```env
# Base URL API Backend
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Base URL WebSocket
VITE_WS_BASE_URL=ws://localhost:8000

# Midtrans Client Key (opsional, untuk payment)
VITE_MIDTRANS_CLIENT_KEY=
```

> **Catatan**: Ubah URL di atas jika backend berjalan di port atau domain berbeda.

### 4. Jalankan Development Server

```bash
npm run dev
```

Output yang diharapkan:

```
  VITE v8.0.7  ready in 3000 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Buka `http://localhost:5173/` di browser.

### 5. Build untuk Production (opsional)

```bash
npm run build
```

File hasil build akan ada di folder `dist/`.

Untuk preview hasil build:

```bash
npm run preview
```

---

## 📦 Dependencies

### Production Dependencies

| Package | Versi | Fungsi |
|---------|-------|--------|
| `react` | ^19.2.4 | Library UI |
| `react-dom` | ^19.2.4 | React DOM renderer |
| `react-router-dom` | ^7.14.0 | Client-side routing (navigasi halaman) |
| `framer-motion` | ^12.38.0 | Animasi & transisi |
| `lucide-react` | ^1.7.0 | Icon library |
| `axios` | ^1.16.1 | HTTP client untuk API calls |

### Dev Dependencies

| Package | Versi | Fungsi |
|---------|-------|--------|
| `vite` | ^8.0.4 | Build tool & dev server |
| `@vitejs/plugin-react` | ^6.0.1 | Plugin React untuk Vite |
| `tailwindcss` | ^3.4.19 | CSS utility framework |
| `postcss` | ^8.5.9 | CSS processor |
| `autoprefixer` | ^10.4.27 | Auto vendor prefix CSS |
| `eslint` | ^9.39.4 | Code linter |
| `eslint-plugin-react-hooks` | ^7.0.1 | Lint rules untuk React hooks |
| `eslint-plugin-react-refresh` | ^0.5.2 | Lint rules untuk React refresh |

---

## 📁 Struktur Project

```
feast-frontend/
├── public/                     # Static files
├── src/
│   ├── api/                    # API layer (komunikasi dengan backend)
│   │   ├── client.js           # Axios instance + JWT interceptor
│   │   ├── auth.js             # Token management & permission helpers
│   │   ├── websocket.js        # WebSocket client (real-time Kitchen/Dashboard)
│   │   └── errorHandler.js     # Centralized error handler
│   ├── assets/                 # Gambar & media
│   │   ├── Chef plating food.jpg
│   │   ├── Culinary team in action.jpg
│   │   ├── Dynamic food plating.jpg
│   │   ├── Epicurean District Location.jpg
│   │   ├── Kinetic Kitchen Action.jpg
│   │   └── Professional kitchen in motion.jpg
│   ├── components/             # Reusable components
│   │   ├── AdminLayout.jsx     # Layout wrapper untuk admin pages
│   │   ├── Footer.jsx          # Footer landing pages
│   │   ├── LandingLayout.jsx   # Layout wrapper untuk landing pages
│   │   ├── Navbar.jsx          # Navigation bar landing pages
│   │   ├── ProtectedRoute.jsx  # Auth guard (redirect jika belum login)
│   │   └── Sidebar.jsx         # Sidebar admin (permission-based)
│   ├── pages/                  # Halaman-halaman
│   │   ├── LandingPage.jsx     # Landing page (public)
│   │   ├── BrandPage.jsx       # Brand page (public)
│   │   ├── ContactPage.jsx     # Contact page (public)
│   │   ├── CareerPage.jsx      # Career page (public)
│   │   ├── OrderPage.jsx       # POS Order (admin — API integrated)
│   │   ├── KitchenPage.jsx     # Kitchen Display System (admin — real-time)
│   │   ├── TablePage.jsx       # Table & QR management (admin — CRUD)
│   │   ├── RolesPage.jsx       # Role & permission management (admin — CRUD)
│   │   ├── RestaurantProfilePage.jsx  # Restaurant profile (admin)
│   │   └── MarketingPage.jsx   # Marketing page (admin)
│   ├── App.jsx                 # Root component + routing
│   ├── App.css                 # Global styles
│   ├── Dashboard.jsx           # Dashboard analytics (admin — API integrated)
│   ├── Login.jsx               # Login page (hidden link)
│   ├── index.css               # Tailwind imports
│   └── main.jsx                # Entry point
├── .env                        # Environment variables
├── index.html                  # HTML entry point
├── package.json                # Dependencies & scripts
├── package-lock.json           # Lockfile
├── tailwind.config.js          # Tailwind configuration (custom FEAST theme)
├── postcss.config.js           # PostCSS configuration
├── vite.config.js              # Vite configuration
└── eslint.config.js            # ESLint configuration
```

---

## 🔧 Troubleshooting

### ❌ `npm install` gagal

**Gejala**: Error saat menjalankan `npm install`

**Solusi**:
```bash
# 1. Pastikan Node.js versi yang benar
node -v  # Harus ^20.19.0 atau ≥22.12.0

# 2. Hapus cache npm
npm cache clean --force

# 3. Hapus node_modules & lockfile, install ulang
rm -rf node_modules package-lock.json
npm install
```

### ❌ `npm run dev` error — Vite tidak ditemukan

**Gejala**: `vite: command not found` atau `'vite' is not recognized`

**Solusi**:
```bash
# Install ulang dependencies
npm install

# Atau jalankan via npx
npx vite
```

### ❌ `npm run build` error — Parse error JSX

**Gejala**: Error `Transform failed with X errors` atau `Expected corresponding JSX closing tag`

**Solusi**: Ini biasanya bug di source code. Laporkan ke maintainer project.

### ❌ Halaman blank / 404 setelah login

**Gejala**: Setelah login, halaman kosong atau 404

**Solusi**: Pastikan backend berjalan di URL yang sesuai dengan `.env`:
```bash
# Cek apakah backend aktif
curl http://localhost:8000/api/v1/health/
```

### ❌ `CORS` error di console browser

**Gejala**: `Access to XMLHttpRequest blocked by CORS policy`

**Solusi**: Pastikan URL frontend (`http://localhost:5173`) sudah terdaftar di `CORS_ALLOWED_ORIGINS` pada `.env` backend.

### ❌ Port 5173 sudah terpakai

**Gejala**: `Port 5173 is in use, trying another one...`

**Solusi**: Vite otomatis pakai port berikutnya (5174, 5175, dst). Atau kill proses yang memakai port:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

---

## 🔌 Koneksi ke Backend

Frontend ini dirancang untuk terhubung ke backend **FEAST Django API**. 

### Tanpa Backend (Frontend-only)
Frontend tetap bisa dijalankan tanpa backend. Halaman publik (Landing, Brand, Contact, Career) akan berfungsi normal. Halaman admin akan menampilkan loading/error state karena API tidak tersedia.

### Dengan Backend
1. Jalankan backend FEAST Django di `http://localhost:8000`
2. Pastikan `.env` frontend mengarah ke URL backend yang benar
3. Login via `http://localhost:5173/login` menggunakan kredensial staff dari database backend

### Mengubah Backend URL
Edit file `.env` di root project:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_BASE_URL=ws://localhost:8000
```

> **Catatan**: Restart `npm run dev` setelah mengubah `.env`.

---

## 📜 npm Scripts

| Script | Perintah | Fungsi |
|--------|----------|--------|
| `dev` | `npm run dev` | Jalankan development server (hot reload) |
| `build` | `npm run build` | Build production bundle ke `dist/` |
| `preview` | `npm run preview` | Preview production build secara lokal |
| `lint` | `npm run lint` | Jalankan ESLint untuk cek kode |

---

## 🎨 Tech Stack

- **React 19** — UI Library
- **Vite 8** — Build Tool & Dev Server
- **Tailwind CSS 3** — Utility-first CSS Framework
- **Framer Motion** — Animation Library
- **Axios** — HTTP Client
- **React Router DOM 7** — Client-side Routing
- **Lucide React** — Icon Library

---

## 📝 Catatan Tambahan

- Halaman admin login berada di `/login` (hidden link — tidak ada tombol di public pages)
- Semua halaman admin memerlukan autentikasi JWT
- Sidebar menu otomatis menyesuaikan berdasarkan permission user
- WebSocket digunakan untuk real-time updates di Kitchen dan Dashboard
- Font Google Fonts (Plus Jakarta Sans & Be Vietnam Pro) dimuat dari CDN

---

*Dibuat oleh tim FEAST — Food Ecosystem Alliance & Smart Technology*
