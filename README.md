# Delcom Blog — Frontend (ReactJS + Vite + Tailwind CSS)

Frontend SPA untuk Studi Kasus PABWE 2026 P9. Mengonsumsi REST API backend Golang Gin (port 8081).

## Menjalankan
```powershell
npm install
npm run dev        # http://localhost:5174 (proxy /api -> http://localhost:8081)
```
Jalankan backend lebih dulu: `go run cmd/server/main.go` di folder backend.

## Pengujian
```powershell
npm test           # Vitest + coverage (threshold 100%)
```

## Build statis
```powershell
npm run build      # hasil di dist/, siap dideploy ke Vercel/Netlify/Cloudflare Pages
```
Catatan deploy terpisah: karena `/api` hanya diproxy saat `npm run dev`, untuk produksi atur rewrite `/api/*` ke URL backend pada hosting.

## Rute SPA
`/`, `/public`, `/posts/:slug`, `/author`, `/admin`, `/login`, `/register`.
Id wajib login: `login-username`, `login-password`, `login-submit`.

## Alamat backend saat produksi
Set `VITE_API_BASE_URL` (lihat `.env.production` / `.env.example`) ke alamat backend, lalu `npm run build`.
Backend sudah mengaktifkan CORS `*`, jadi frontend memanggil backend langsung tanpa proxy.
Di hosting statis, aktifkan fallback SPA ke `index.html` (sudah ada di `vercel.json` dan `nginx.conf`).
