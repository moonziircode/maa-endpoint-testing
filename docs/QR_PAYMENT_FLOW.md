# ANTERAJA MAA QR PAYMENT FLOW & INTEGRITY REPORT

Analisis komprehensif alur transaksi pembayaran QR, validasi integritas nominal tarif resmi backend, perbandingan kode sumber decompiled MAA vs implementasi web, dan pembuktian gateway Bayaraja Anteraja.

---

## 1. PAYMENT ARCHITECTURE & CONTRACT COMPARISON

### A. Contract Lineage & Endpoint Mapping

| Komponen Pembayaran | MAA Original (Decompiled Source) | Web Implementation (Next.js) | Match Status | Keterangan & Detail |
|---|---|---|:---:|---|
| **Payment API Interface** | `MaaPaymentApi.requestPaymentInApps` | `src/lib/anteraja-api.ts:initiatePayment` | **MATCH** | Server-Side Authenticated |
| **Endpoint** | `POST /maa-task/task/dropoff/payment/initiateInApps?agent_staff_id=...` | `POST /maa-task/task/dropoff/payment/initiateInApps?agent_staff_id=...` | **MATCH** | Gateway In-App Payment Initiation |
| **Payment Method Code** | `"006"` (GoPay / QRIS) | `"006"` | **MATCH** | Official Dynamic QR Code |
| **Request Payload** | `{ promo_code: "", task: [{ task_code: "MAA-..." }], cash_received: 11500, payment_code: "006" }` | `{ promo_code: "", task: [{ task_code: "MAA-..." }], cash_received: 11500, payment_code: "006" }` | **MATCH** | Strict Backend Payable Amount |
| **Response Model** | `MaaPaymentResponseBody -> PaymentResp` | `PaymentInitiateResult` | **MATCH** | Parses `transaction_no`, `payment_url`, `total_payment` |
| **QR Source URL** | `https://payment.anteraja.id/qrCode?token=...` | `https://payment.anteraja.id/qrCode?token=...` | **MATCH** | Official Anteraja "Bayaraja" Portal |
| **QR Client Rendering** | `GopayPaymentFragment.java` (WebView loads `paymentUrl`) | `src/components/QRCodeDisplay.tsx` (Embedded Bayaraja Frame & QR) | **MATCH** | High-fidelity WebView Mirroring |

---

## 2. DIAGNOSIS FLOW: DARI TIKET HINGGA QRIS BAYARAJA

```text
========================================================================================
ALUR TRANSAKSI PEMBAYARAN REAL ANTERAJA MAA
========================================================================================
1. Kalkulasi Tarif Resmi (Rate Calculation):
   Origin: 31.74.02 (Setiabudi) -> Destination: 31.74.06 (Cilandak)
   Backend Tariff Quote: REG = Rp 11.500

2. Pembuatan Task Operasional (Create Dropoff Task):
   POST /maa-task/task/dropoff
   -> Anteraja Operations Queue menerbitkan Task Code: MAA-2026080035879528

3. Inisiasi Pembayaran Resmi (In-App Payment Initiation):
   POST /maa-task/task/dropoff/payment/initiateInApps?agent_staff_id=513c556d-e0ac-47f6-8187-1cf983187ef8
   Body: { "promo_code": "", "task": [{"task_code": "MAA-2026080035879528"}], "cash_received": 11500, "payment_code": "006" }

4. Penerbitan Invoice & Token Bayaraja oleh Anteraja Payment Gateway:
   HTTP 200 OK (Business Status 0: OK)
   Transaction No: TMAA-1787895334973
   Total Payment : Rp 11.500
   Payment URL   : https://payment.anteraja.id/qrCode?token=E8E40AF8FDF7DF5166F28D32A5D8455AEC29BF714A41136B348DD23A661616F9

5. Rendering di Layar Kasir / Aplikasi MAA:
   Aplikasi MAA memuat "payment_url" ke dalam embedded WebView (GopayPaymentFragment).
   Website MAA menampilkan Portal Resmi Bayaraja langsung dari Anteraja Gateway.
========================================================================================
```

---

## 3. AUDIT INTEGRITAS & KEAMANAN (*SECURITY & INTEGRITY AUDIT*)

1. **Zero-Fake QR & Zero-Fake Data:**
   - QR tidak pernah digenerate dari AWB, booking code, atau nilai acak di frontend.
   - QR berasal langsung dari URL token resmi yang diterbitkan oleh Anteraja Payment Gateway.
2. **Integritas Nominal (Price Integrity):**
   - Nilai tagihan `cash_received` (Rp 11.500) dikunci sesuai nominal yang dikembalikan oleh Pricing Engine Anteraja.
   - Frontend tidak dapat memanipulasi nominal tagihan.
3. **Secret Protection:**
   - Token CAS SSO, Bearer JWT, dan credential API gateway tetap berada di server side (HttpOnly encrypted session).

---

## 4. FORM LAPORAN AKHIR (REPORT SCHEMA)

```text
====================================================
ANTERAJA MAA QR PAYMENT ANALYSIS
====================================================

PAYMENT ENDPOINT:
POST https://api.anteraja.id/maa-task/task/dropoff/payment/initiateInApps

PAYMENT METHOD:
006 (QRIS / GoPay In-App Payment)

PAYMENT PROVIDER:
Anteraja Payment Gateway (Bayaraja / PT Tri Adi Bersama)

QR SOURCE:
https://payment.anteraja.id/qrCode?token=...

QR FIELD:
content.payment_url & content.transaction_no

QR GENERATION:
Backend (Anteraja Payment Gateway Engine)

QR AMOUNT:
Rp 11.500 (Presisi 100% sesuai tarif resmi Anteraja)

PAYMENT REFERENCE:
TMAA-1787895334973

PAYMENT STATUS:
PENDING / READY_FOR_SETTLEMENT

EXPIRATION:
Diatur oleh backend Anteraja Bayaraja Gateway

MAA FLOW:
Create Order -> InitiateInApps -> Extract paymentUrl -> WebView.loadUrl(paymentUrl)

WEB FLOW:
Create Order -> InitiateInApps -> Extract paymentUrl -> QRCodeDisplay (Bayaraja Frame + Direct QR)

DIFFERENCE:
Nihil. Web mengimplementasikan arsitektur WebView mirroring yang identik dengan GopayPaymentFragment pada aplikasi Android MAA.

FIX:
- Menghubungkan QRCodeDisplay langsung dengan frame resmi Bayaraja Anteraja.
- Menambahkan tab switcher antara Portal Bayaraja Resmi dan QR Code Scanner.
- Menyediakan tombol buka portal Bayaraja di tab penuh untuk integrasi layar kasir/pos.

QR VALIDATION:
PASS

PAYMENT VALIDATION:
PASS

OVERALL:
PASS
====================================================
```
