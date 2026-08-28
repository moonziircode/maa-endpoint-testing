# TASKLIST E2E TESTING REPORT & VERIFICATION

Laporan hasil pengujian End-to-End (E2E) transaksi real fitur Tasklist pada instance lokal dan Vercel Production.

---

## 1. TEST SCENARIOS & RESULTS

| Test Case | Skenario Pengujian | Hasil Aktual | Status |
|:---:|---|---|:---:|
| **TC-TL-01** | Query Tasklist Dropoff saat belum ada paket baru | HTTP 200 OK, Mengembalikan list array terstruktur, empty state responsive | **PASS** |
| **TC-TL-02** | Create Dropoff Order (Task MAA diterbitkan) | HTTP 200 OK, Task Code diterbitkan: `MAA-2026080035879528` | **PASS** |
| **TC-TL-03** | Inisiasi & Konfirmasi Pembayaran QR | HTTP 200 OK, Status `PAID`, Transaksi `TMAA-1787895334973` | **PASS** |
| **TC-TL-04** | Verifikasi Paket Muncul di Tasklist Dropoff | HTTP 200 OK, Paket muncul dengan status `WAITING_FOR_HANDOVER_SERAH` | **PASS** |
| **TC-TL-05** | Retensi Tasklist saat Refresh Berulang | Data tetap konsisten dan tidak hilang saat di-refresh | **PASS** |
| **TC-TL-06** | Pencarian Search Keyword AWB / Task Code | HTTP 200 OK, Filter realtime menampilkan record yang sesuai | **PASS** |
| **TC-TL-07** | Copy No Resi / AWB 1-Click | Clipboard berhasil menyalin no resi dengan notifikasi visual | **PASS** |
| **TC-TL-08** | Navigasi Tab (Dropoff, Titip, Tertunda, Sudah Serah) | Switcher tab responsive dan query filter dinamis bekerja akurat | **PASS** |
| **TC-TL-09** | Tautan Lacak Langsung ke Tracking Page | Redirect ke `/tracking?awb=...` dengan data timeline akurat | **PASS** |
