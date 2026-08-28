# VERCEL ENVIRONMENT VARIABLES CONFIGURATION

Panduan konfigurasi Environment Variables untuk deployment **Anteraja MAA Web** di Vercel Dashboard.

---

## 1. DAFTAR ENVIRONMENT VARIABLES YANG DIGUNAKAN

| Nama Variable | Digunakan Oleh | Scope (Client/Server) | Required? | Default / Example Value | Tujuan / Deskripsi |
|---|---|:---:|:---:|---|---|
| **`NEXT_PUBLIC_SUPABASE_URL`** | Supabase Client Helper (`src/lib/supabase.ts`) | Client & Server | **YES** | `https://wqpomgyktrndktsmojqg.supabase.co` | Host project Supabase untuk master data district |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | Supabase Client Helper (`src/lib/supabase.ts`) | Client & Server | **YES** | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` | Public Anon/Publishable Key untuk query `public.districts` (RLS Read-Only) |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Server-side Backend Proxy | Server Only | **OPTIONAL** | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` | Service Role Key jika ingin bypass RLS pada backend (Jangan expose ke browser) |
| **`ANTERAJA_CAS_URL`** | CAS SSO Engine (`src/lib/anteraja-api.ts`) | Server Only | **YES** | `https://cas.anteraja.id` | Host SSO Authentication CAS Anteraja |
| **`ANTERAJA_API_URL`** | API Proxy Engine (`src/lib/anteraja-api.ts`) | Server Only | **YES** | `https://api.anteraja.id` | Host Core Backend API Anteraja |
| **`SESSION_SECRET`** | Cookie Encryption (`src/lib/session.ts`) | Server Only | **YES** | `string minimal 32 karakter acak` | Kunci enkripsi AES-256-GCM untuk session cookie |

---

## 2. PANDUAN PENGISIAN DI VERCEL DASHBOARD

1. Buka [Vercel Dashboard](https://vercel.com/dashboard) $ightarrow$ Pilih project **`maa-endpoint-testing`**.
2. Masuk ke tab **Settings** $ightarrow$ **Environment Variables**.
3. Tambahkan 5 variable utama berikut untuk ketiga environment (**Production**, **Preview**, dan **Development**):

```text
1. NEXT_PUBLIC_SUPABASE_URL
   Value: https://wqpomgyktrndktsmojqg.supabase.co

2. NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [MASUKKAN ANON KEY SUPABASE ANDA]

3. ANTERAJA_CAS_URL
   Value: https://cas.anteraja.id

4. ANTERAJA_API_URL
   Value: https://api.anteraja.id

5. SESSION_SECRET
   Value: anteraja-maa-secure-session-encryption-key-2026!
```

4. Klik **Save**.
5. Jalankan **Redeploy** pada deployment terakhir di Vercel Dashboard.

---

## 3. AUDIT KEAMANAN (ZERO SECRET LEAK)

* Seluruh query master district ke tabel `public.districts` menggunakan **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** dengan kebijakan Row Level Security (**RLS Read-Only Public**).
* Kunci rahasia seperti `SESSION_SECRET` dan credential CAS SSO **hanya dieksekusi di Server-Side API Routes** dan tidak pernah dimasukkan ke client bundle JavaScript browser.
