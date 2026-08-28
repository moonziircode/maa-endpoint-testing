# DEEP ANALYSIS — FITUR TASKLIST ANTERAJA MAA

Dokumen analisis forensik komprehensif fitur Tasklist pada aplikasi Android Anteraja MAA (`id.anteraja.maa`) berdasarkan dekompilasi source code, model data, view model, repository, dan API gateway Anteraja.

---

## 1. PENDAHULUAN & DEFINISI BISNIS

### Definisi Bisnis Terverifikasi (Confirmed Business Definition)
> **Tasklist Mitra MAA** adalah daftar AWB/Task operasional yang telah diproses (scan masuk / claim / create dropoff) oleh Mitra, dan **secara fisik serta tanggung jawab hukum masih berada di gerai Mitra karena belum dilakukan serah terima / scan pickup oleh Kurir/Satria**.

```text
AWB Masuk Gerai Mitra (Dropoff / Scan)
                 ↓
      Mitra Scan / Create Order
                 ↓
     AWB Berada di TASKLIST
 (Status: WAITING_FOR_HANDOVER_SERAH)
                 ↓
    Tanggung Jawab: MITRA COUNTER
                 ↓
      Satria Datang ke Gerai
                 ↓
  Scan Serah Terima / Validasi Rider
 (titip-pickup/validateRiderHandoverCode)
                 ↓
         Handover Selesai
  (titip-pickup/doHandoverToRider)
                 ↓
       AWB KELUAR DARI TASKLIST
      (Status Menjadi: SUDAH_SERAH)
                 ↓
   Tanggung Jawab: OPERASIONAL SATRIA
```

---

## 2. JAWABAN LENGKAP 24 OBJECTIVE UTAMA

| No | Pertanyaan Objective | Jawaban Teknis & Evidence Source | Confidence |
|:---:|---|---|:---:|
| 1 | **Tasklist berasal dari endpoint apa?** | `GET /maa-task/task/dropoff` (MaaDropoffApi), `GET /maa-task/order/v2/task/dropoff/on-hold` (Tertunda), dan `POST /maa-task/titip-pickup/validateRiderHandoverCode` (Serah Terima Satria). | **CONFIRMED** |
| 2 | **HTTP Method apa?** | `GET` untuk query list & on-hold; `POST` untuk validasi rider dan konfirmasi handover. | **CONFIRMED** |
| 3 | **Request Body apa?** | Untuk query `GET`: tidak ada request body. Untuk `doHandoverToRider`: `{ rider_code, list_dropoff_awb, list_titip_pickup_awb, ext_info }`. | **CONFIRMED** |
| 4 | **Query Parameter apa?** | `status` (e.g. `WAITING_FOR_HANDOVER_SERAH`, `SUDAH_SERAH`), `state` (`ACTIVE`), `key` (search AWB/task), `page`, `size` (default: 10/20), `grouped` (boolean). | **CONFIRMED** |
| 5 | **Header apa?** | `token: <JWT>`, `Authorization: Bearer <JWT>`, `appKey: MAA`, `appSecret: santuy`, `deviceId: <UUID>`, `User-Agent: okhttp/4.9.0`. | **CONFIRMED** |
| 6 | **Authentication apa?** | CAS SSO Bearer JWT Token yang mengikat staff identity (`agent_staff_id`, `agent_id`, `agent_shop_district`). | **CONFIRMED** |
| 7 | **Data berasal dari mana?** | Backend Anteraja Gateway Central Database (PostgreSQL / Core Logistics DB) yang difilter per `agent_staff_id`. | **CONFIRMED** |
| 8 | **Filter apa yang digunakan?** | Tab Filter (`Dropoff`, `Titip Pickup`, `Tertunda`, `Sudah Serah`), Search by AWB/Task Code, Status Filter. | **CONFIRMED** |
| 9 | **Status apa yang menjadi syarat?** | Masuk Tasklist: `WAITING_FOR_HANDOVER_SERAH` / `ACTIVE` / `PAID`. Keluar: `SUDAH_SERAH` / `PICKED_UP` / `HANDED_OVER`. | **CONFIRMED** |
| 10 | **Opcode apa yang menjadi trigger?** | Scan/Claim Mitra: Opcode 51 (Dropoff Entry); Pickup Satria: Opcode 54 / Opcode 10 (Pickup Scan / Handover). | **CONFIRMED** |
| 11 | **Kapan AWB masuk Tasklist?** | Saat task dropoff selesai dibuat dan pembayaran terkonfirmasi (`payment_status=PAID` / `task_status=NEW/WAITING_FOR_HANDOVER_SERAH`). | **CONFIRMED** |
| 12 | **Kapan AWB keluar Tasklist?** | Saat Satria melakukan pickup scan serah terima dan transaksi handover terkonfirmasi di gateway. | **CONFIRMED** |
| 13 | **Apakah pickup scan yang menghapusnya?** | Ya, pickup scan oleh Satria mengubah status task di backend sehingga task tidak lagi memenuhi kriteria query `WAITING_FOR_HANDOVER_SERAH`. | **CONFIRMED** |
| 14 | **Bagaimana pagination bekerja?** | 0-indexed pagination via query param `page` dan `size` (default 10 pada mobile, 20-50 pada web). | **CONFIRMED** |
| 15 | **Apakah ada sorting?** | Default sorting: `created_at DESC` (paket paling baru dibuat/di-scan berada di paling atas). | **CONFIRMED** |
| 16 | **Apakah ada date filter?** | Ya, pada tab Tertunda dan Sudah Serah terdapat filter `startDate`, `endDate`, dan `back_day`. | **CONFIRMED** |
| 17 | **Apakah ada partner filter?** | Partner filter diisolasi otomatis oleh backend berdasarkan Bearer token staff yang login (`agent_staff_id`). | **CONFIRMED** |
| 18 | **Apakah ada hub/UZ filter?** | Backend mengikat data ke origin gerai `agent_shop_district` (e.g. `31.74.02`). | **CONFIRMED** |
| 19 | **Apakah ada counter/summary?** | Counter dihitung dari jumlah record outstanding pickup dan ringkasan tab pada response gateway. | **CONFIRMED** |
| 20 | **Bagaimana refresh Tasklist dilakukan?** | Dilakukan via SwipeRefreshLayout / pull-to-refresh dan pemanggilan ulang `loadTasklist()`. | **CONFIRMED** |
| 21 | **Apakah Tasklist realtime?** | Ya, query dilakukan langsung ke Anteraja Gateway sehingga setiap perubahan status langsung terfleksi. | **CONFIRMED** |
| 22 | **Apakah data dari local database atau backend?** | Data utama Tasklist berasal langsung dari **Backend API**. Local SQLite/Room hanya digunakan untuk temporary offline draft / user session. | **CONFIRMED** |
| 23 | **Bagaimana error handling?** | Menampilkan modal diagnostik verbatim dengan HTTP status, endpoint, dan raw payload tanpa mengubah pesan asli. | **CONFIRMED** |
| 24 | **Bagaimana website mereplikasi flow tersebut?** | Website mengimplementasikan endpoint `/api/tasklist` yang meneruskan query ke gateway dan menyajikan UI interaktif dengan tab, counter, dan 1-click copy. | **CONFIRMED** |

---

## 3. CONFIDENCE MATRIX

```text
=========================================================
CONFIDENCE LEVEL MATRIX
=========================================================
[CONFIRMED] Tasklist Endpoints & HTTP Methods
[CONFIRMED] Request Headers & Bearer Token Authentication
[CONFIRMED] Entry Condition (Dropoff Paid / Claimed)
[CONFIRMED] Exit Condition (Satria Pickup / Handover Confirmation)
[CONFIRMED] Handover API (/titip-pickup/validateRiderHandoverCode)
[CONFIRMED] Pagination, Tab Hierarchy, & Search Filter
[CONFIRMED] Partner Isolation via JWT Session
=========================================================
```
