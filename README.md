# Anteraja MAA Web Application

Replikasi web client workflow bisnis aplikasi **Anteraja MAA Android (`id.anteraja.maa`)** berbasis Next.js 14, TypeScript, Tailwind CSS, dan Supabase Cloud Database.

---

## 🌟 Fitur Utama

1. **Autentikasi & Sesi Aman (Zero Token Leak)**
   - Terhubung langsung dengan SSO **`cas.anteraja.id`** (Handshake 4 tahap).
   - Menggunakan HttpOnly Encrypted Session Cookies (AES-256-GCM / Jose) tanpa mengekspos token JWT di browser.
2. **Dashboard Agent**
   - Tampilan profil agent, NIA (`50004786`), nama gerai, dan district origin (`31.74.02`).
   - Akses cepat ke fitur operasional utama.
3. **Scan & Validasi Paket (`/scan`)**
   - Mendukung scan barcode kamera HP/Webcam (HTML5-QRCode), USB scanner, & manual input.
   - Deteksi klaim ganda (*Already Claimed Detection*) via `GET /maa-task/order/v2/search/{awb}`.
   - Informasi detail pengirim, penerima, deskripsi paket, dan ongkir.
4. **Buat Order Manual & QRIS GoPay (`/order/create`)**
   - Autocomplete kecamatan penerima terhubung dengan **Supabase Master Location Database** (`6.545 kecamatan`).
   - Kalkulasi tarif ongkir resmi real-time (`/maa-task/rates`).
   - Validasi kode promo (`/maa-task/promo/redeem`).
   - Pembuatan dropoff task (`/maa-task/task/dropoff`) & inisiasi QRIS/GoPay resmi Anteraja (`/maa-task/payment/initiateInApps`).
   - Render QR code dinamis dengan validasi nominal backend (anti-price tampering).
5. **Tracking Shipment Real-Time (`/tracking`)**
   - Pelacakan resi via `GET /maa-task/tracking?waybill={awb}`.
   - Timeline riwayat operasional lengkap dengan pemetaan opcode Anteraja (`src/lib/opcode-map.ts`).

---

## 🏗️ Arsitektur Sistem

```text
Browser (Web Client)
        │  (HttpOnly Session)
        ▼
Next.js Backend Server
   ├── Anteraja CAS SSO Handshake Engine
   ├── Supabase Master District Database (public.districts)
   └── Anteraja Core API Proxy (api.anteraja.id)
```

---

## 🚀 Panduan Memulai

### 1. Prasyarat
- Node.js v18+ atau v20+
- npm / pnpm / yarn

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (`.env.local`)
Salin file template `.env.example`:
```bash
cp .env.example .env.local
```
Lengkapi variabel berikut:
```env
ANTERAJA_CAS_URL=https://cas.anteraja.id
ANTERAJA_API_URL=https://api.anteraja.id
NEXT_PUBLIC_SUPABASE_URL=https://wqpomgyktrndktsmojqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SESSION_SECRET=your_32_characters_session_secret_key!
```

### 4. Menjalankan Server
```bash
# Mode Development
npm run dev

# Mode Production
npm run build
npm start
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pengujian Otomatis (E2E Test)

Jalankan test suite end-to-end:
```bash
npm test
```
Hasil pengujian disimpan di `docs/E2E_TEST_REPORT.md`.

---

## 📚 Dokumentasi Lengkap

* [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Desain arsitektur dan batasan keamanan.
* [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) — Inventory seluruh endpoint Retrofit & Supabase.
* [`docs/AUTH_FLOW.md`](docs/AUTH_FLOW.md) — Diagram alur handshake CAS SSO Anteraja.
* [`docs/SCAN_FLOW.md`](docs/SCAN_FLOW.md) — Alur scan resi dan penanganan klaim ganda.
* [`docs/ORDER_FLOW.md`](docs/ORDER_FLOW.md) — Alur pembuatan order dropoff manual.
* [`docs/PAYMENT_FLOW.md`](docs/PAYMENT_FLOW.md) — Alur pembayaran QRIS dan validasi nominal.
* [`docs/TRACKING_FLOW.md`](docs/TRACKING_FLOW.md) — Alur tracking dan mapping opcode operasional.
* [`docs/DISTRICT_FLOW.md`](docs/DISTRICT_FLOW.md) — Integrasi data master kecamatan Supabase.
* [`docs/E2E_TEST_REPORT.md`](docs/E2E_TEST_REPORT.md) — Laporan pengujian live E2E (100% PASS).
