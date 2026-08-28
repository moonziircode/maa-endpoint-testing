# ANTERAJA MAA — MANUAL ORDER LIFECYCLE FLOW

Spesifikasi alur lengkap pembuatan order manual dari pemilihan distrik, kalkulasi tarif, voucher promo, hingga penerbitan task code.

---

```text
Input Pengirim & Penerima
           ↓
Pencarian Distrik Origin & Destination (/api/districts)
           ↓
Kalkulasi Ongkir Realtime (/api/order/rate)
           ↓
Input Voucher Promo (/api/order/promo)
           ↓
Penerbitan Dropoff Task (/api/order/create -> /maa-task/task/dropoff)
           ↓
Mendapatkan Task Code Unik (e.g. MAA-2026080035879528)
           ↓
Inisiasi Pembayaran Bayaraja QRIS (/api/order/payment/initiate)
```
