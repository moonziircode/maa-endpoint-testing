# ANTERAJA MAA — TASKLIST DEEP ANALYSIS REPORT

Laporan komprehensif struktur antrean Tasklist, hierarki tab, kriteria retensi, dan eliminasi serah terima kurir.

---

## 1. TAB HIERARKI & FILTER

1. **Tab Dropoff (Belum Serah):**
   - Query: `GET /maa-task/task/dropoff?status=WAITING_FOR_HANDOVER_SERAH&state=ACTIVE`
   - Berisi paket yang selesai di-create atau di-scan oleh Mitra dan menunggu kedatangan Satria.
2. **Tab Titip Pickup:**
   - Query: `GET /maa-task/task/titip?delay=false`
   - Berisi paket titipan pickup dari merchant mitra sekitar.
3. **Tab Tertunda (On-Hold):**
   - Query: `GET /maa-task/order/v2/task/dropoff/on-hold?back_day=30`
   - Berisi paket bermasalah, tertunda pembayaran, atau packaging rusak.
4. **Tab Sudah Serah (Riwayat):**
   - Query: `GET /maa-task/task/dropoff?status=SUDAH_SERAH`
   - Berisi riwayat paket yang telah sukses diserahterimakan ke Satria.
