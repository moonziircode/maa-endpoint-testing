# ANTERAJA MAA — PAYMENT GATEWAY INTEGRATION

Spesifikasi integrasi Payment Gateway Bayaraja Anteraja, kanal pembayaran QRIS, verifikasi nominal, dan konfirmasi transaksi otomatis.

---

## 1. METODE PEMBAYARAN TERVERIFIKASI
* **QRIS (GoPay / ShopeePay / BCA / Mandiri / Dana):** Menghasilkan dynamic payment token yang dimuat melalui iframe resmi `https://payment.anteraja.id/qrCode?token=...`.
* **Cash / Tunai:** Diproses melalui pembukuan Cash Opname gerai Mitra.
