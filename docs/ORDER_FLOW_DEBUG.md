# DEEP DEBUG & FORENSIC REPORT — RATE & DROP-OFF TASK API

Analisis komprehensif akar masalah (*root cause*), perbandingan kontrak request (*field comparison diff*), dan verifikasi transaksi backend untuk `POST /api/order/rate` dan `POST /api/order/create`.

---

## 1. FORENSIC MATRIX: MAA ORIGINAL CONTRACT VS WEB REQUEST

### A. Rate Calculation Contract (`GET /maa-task/rates`)

| Field / Parameter | MAA Original (Decompiled Source) | Web Request (Next.js Gateway) | Match Status | Keterangan & Type |
|---|---|---|:---:|---|
| **HTTP Method** | `GET` | `GET` | **MATCH** | Idempotent Query |
| **Endpoint** | `/maa-task/rates` | `/maa-task/rates` | **MATCH** | Gateway Pricing Engine |
| **Headers** | `token`, `Authorization: Bearer <JWT>`, `User-Agent: okhttp/4.9.0` | `token`, `Authorization: Bearer <JWT>`, `User-Agent: okhttp/4.9.0` | **MATCH** | Server-side Bearer Auth |
| **`origin`** | `"31.74.02"` (District Code dengan titik) | `"31.74.02"` | **MATCH** | String canonical district code |
| **`destination`** | `"31.74.06"` (District Code dengan titik) | `"31.74.06"` | **MATCH** | String canonical district code |
| **`weight`** | `1.0` (Double, KG) | `1.0` | **MATCH** | Numeric decimal string |
| **`length`** | `10.0` (Double, CM) | `10.0` | **MATCH** | Numeric decimal string |
| **`width`** | `10.0` (Double, CM) | `10.0` | **MATCH** | Numeric decimal string |
| **`height`** | `10.0` (Double, CM) | `10.0` | **MATCH** | Numeric decimal string |

### B. Dropoff Order Creation Contract (`POST /maa-task/task/dropoff`)

| Field / Parameter | MAA Original (Decompiled Source) | Web Request (Next.js Gateway) | Match Status | Keterangan & Type |
|---|---|---|:---:|---|
| **HTTP Method** | `POST` | `POST` | **MATCH** | Transactional Operation |
| **Endpoint** | `/maa-task/task/dropoff` | `/maa-task/task/dropoff` | **MATCH** | Operations Dropoff Queue |
| **Headers** | `token`, `Authorization`, `Content-Type: application/json` | `token`, `Authorization`, `Content-Type: application/json` | **MATCH** | Bearer JWT Authenticated |
| **Payload Structure** | Array of Dropoff Tasks `[ { ... } ]` | Array of Dropoff Tasks `[ { ... } ]` | **MATCH** | Batch Dropoff Protocol |
| **`product_code`** | `"REG"` | `"REG"` | **MATCH** | Anteraja Regular |
| **`delivery_price`** | `11500.0` (Double) | `11500.0` (Double) | **MATCH** | Backend Quoted Rate |
| **`parcel_total_weight`** | `1.0` (Double) | `1.0` (Double) | **MATCH** | Numeric decimal |
| **`agent_staff_id`** | Staff UUID String | Staff UUID String | **MATCH** | Authenticated Staff ID |
| **`shipper_info.district_code`**| `"31.74.02"` | `"31.74.02"` | **MATCH** | Canonical Origin Code |
| **`receiver_info.district_code`**| `"31.74.06"` | `"31.74.06"` | **MATCH** | Canonical Destination Code |
| **`items[0].declared_value`** | `50000` (Double/Int) | `50000` | **MATCH** | Declared value |
| **Response Content Structure**| `Array: [ { task_code: "MAA-..." } ]` | `Array: [ { task_code: "MAA-..." } ]` | **FIXED** | Parser diperbaiki untuk membaca `content[0].task_code` |

---

## 2. DIAGNOSIS & ROOT CAUSE ANALYSIS

### ====================================================
### RATE DEBUG (`POST /api/order/rate`)
### ====================================================

* **Frontend Request:**
  ```json
  {
    "origin": "31.74.02",
    "destination": "31.74.06",
    "weight": 1.0,
    "length": 10.0,
    "width": 10.0,
    "height": 10.0
  }
  ```

* **Upstream Request:**
  `GET https://api.anteraja.id/maa-task/rates?origin=31.74.02&destination=31.74.06&weight=1.0&length=10.0&width=10.0&height=10.0`
  *Header:* `token: [JWT]`, `Authorization: Bearer [JWT]`, `User-Agent: okhttp/4.9.0`

* **Upstream HTTP Status:** `200 OK`
* **Upstream Business Code:** `0` (Success)
* **Upstream Response:**
  ```json
  {
    "status": 0,
    "info": "OK",
    "content": [
      { "product_code": "REG", "product_name": "Anteraja Regular", "duration": "1-2 Days", "delivery_price": 11500.0, "status": "ACTIVE" },
      { "product_code": "ND", "product_name": "Anteraja Next Day", "duration": "1 Day", "delivery_price": 15300.0, "status": "ACTIVE" },
      { "product_code": "SD", "product_name": "Anteraja Same Day", "duration": "8-10 Hours", "delivery_price": 22500.0, "status": "ACTIVE" }
    ]
  }
  ```

* **Root Cause Sebelumnya:**
  1. Parameter `origin` atau `destination` yang tidak menyertakan titik pemisah wilayah (misal string `317406` atau teks `Cilandak`) menyebabkan gateway Anteraja mengembalikan HTTP 500 (`Unable to get rates information`).
  2. Route handler sebelumnya selalu mengembalikan HTTP 200 bahkan ketika upstream mengalami error, menyembunyikan status kode asli.

* **Fix:**
  1. Sanitasi input `origin.trim()` dan `destination.trim()`.
  2. Master lookup terhubung ke Supabase `public.districts` untuk memastikan format `31.74.06` selalu canonical.
  3. Route handler mengembalikan HTTP status asli upstream dan raw error diagnostics.

---

### ====================================================
### ORDER CREATE DEBUG (`POST /api/order/create`)
### ====================================================

* **Frontend Request:**
  ```json
  {
    "senderName": "Agent Counter Kuningan",
    "senderPhone": "081299887766",
    "senderAddress": "Kuningan City Mall Lt. 2",
    "senderDistrict": "31.74.02",
    "senderPostalCode": "12940",
    "receiverName": "Budi Santoso",
    "receiverPhone": "081388776655",
    "receiverAddress": "Jl. Fatmawati Raya No. 45",
    "receiverDistrict": "31.74.06",
    "receiverPostalCode": "12430",
    "itemName": "Dokumen dan Pakaian",
    "weight": 1.0,
    "length": 10,
    "width": 10,
    "height": 10,
    "productCode": "REG"
  }
  ```

* **Upstream Request:**
  `POST https://api.anteraja.id/maa-task/task/dropoff`
  *Body:* `[ { "product_code": "REG", "delivery_price": 11500.0, "parcel_total_weight": 1.0, "agent_staff_id": "...", ... } ]`

* **Upstream HTTP Status:** `200 OK`
* **Upstream Business Code:** `0` (Success)
* **Upstream Response:**
  ```json
  {
    "status": 0,
    "info": "OK",
    "content": [
      {
        "task_code": "MAA-2026080035879521",
        "order_source": "MAA",
        "product_code": "REG",
        "delivery_price": 11500,
        "total_delivery_price": 11500,
        "parcel_total_weight": 1.0,
        "task_type": "DROPOFF",
        "payment_status": "NOT_PAID",
        "task_status": "NEW",
        "agent_staff_id": "513c556d-e0ac-47f6-8187-1cf983187ef8"
      }
    ]
  }
  ```

* **Root Cause Sebenarnya:**
  Pada fungsi `createDropoffOrder` di `src/lib/anteraja-api.ts`, kode sebelumnya membaca `json.content.task_code` secara langsung sebagai object. Karena Anteraja API mengembalikan `content` sebagai **Array** (`[ { task_code: "MAA-..." } ]`), `json.content.task_code` bernilai `undefined`.
  
  Akibatnya, logika `if (!dropData.success || !dropData.taskCode)` pada frontend menganggap proses gagal dan melempar pesan `"Gagal membuat task dropoff"`.

* **Fix:**
  Mengubah parser menjadi `taskObj = Array.isArray(json.content) ? json.content[0] : json.content;` dan mengekstrak `taskObj.task_code` secara akurat.

====================================================
