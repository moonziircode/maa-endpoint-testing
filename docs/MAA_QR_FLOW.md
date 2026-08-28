# ANTERAJA MAA — REAL QR BAYARAJA SPECIFICATION

Spesifikasi arsitektur rendering QR Code pembayaran real Anteraja Bayaraja gateway (Bukan QR fiktif / fake frontend string).

---

## 1. ARSITEKTUR PORTAL EMBEDDED BAYARAJA

```text
Order Created (Task Code: MAA-...)
              ↓
Initiate Payment Request (/maa-payment/order/payment/in-apps)
              ↓
Payment Gateway Response:
{
  "paymentUrl": "https://payment.anteraja.id/qrCode?token=eyJhbGciOi...",
  "paymentCode": "TMAA-1787895334973",
  "totalPayment": 11500.0
}
              ↓
Frontend QRCodeDisplay.tsx renders official Bayaraja Frame:
<iframe src="https://payment.anteraja.id/qrCode?token=..." />
```
