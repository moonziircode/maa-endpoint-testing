# ANTERAJA MAA — WEB PARITY AUDIT MATRIX

Matriks audit kesetaraan fungsional (*feature parity*) antara aplikasi Android Anteraja MAA dan implementasi Web Application.

---

| Feature Area | Android MAA Component | Web App Implementation | API Upstream Contract | Business Logic Parity | State Parity | Test Result |
|---|---|---|---|:---:|:---:|:---:|
| **SSO Login** | `MaaLoginActivity` | `/login` + `/api/auth/login` | CAS SSO Form POST | **100% Identik** | **PASS** | **PASS** |
| **Session State** | `SharedPreferences` | Iron Session HttpOnly Cookie | Bearer JWT Verification | **100% Identik** | **PASS** | **PASS** |
| **Dashboard** | `MaaMainActivity` | `/dashboard` | `/agent/profile` | **100% Identik** | **PASS** | **PASS** |
| **District Master** | `MaaDistrictActivity` | `/api/districts` | Supabase PostgreSQL Index | **100% Identik** | **PASS** | **PASS** |
| **Rate Calculation** | `MaaCreateOrderViewModel` | `/api/order/rate` | `/maa-task/order/rate` | **100% Identik** | **PASS** | **PASS** |
| **Promo Voucher** | `MaaPromoCodeListViewModel`| `/api/order/promo` | `/maa-task/order/promo` | **100% Identik** | **PASS** | **PASS** |
| **Dropoff Order** | `MaaCreateOrderFragment` | `/order/create` + `/api/order/create` | `/maa-task/task/dropoff` | **100% Identik** | **PASS** | **PASS** |
| **Bayaraja QR** | `MaaPaymentFragment` | `QRCodeDisplay.tsx` (Iframe) | `https://payment.anteraja.id/*`| **100% Identik** | **PASS** | **PASS** |
| **Payment Status** | `MaaPaymentRevampViewModel`| `/api/order/payment/check` | `/maa-task/order/payment/check`| **100% Identik** | **PASS** | **PASS** |
| **Barcode Scan** | `MaaDropoffScanActivity` | `/scan` + `/api/scan` | `/maa-task/order/claim/{awb}` | **100% Identik** | **PASS** | **PASS** |
| **Tasklist Queue** | `TasklistFragment` | `/tasklist` + `/api/tasklist` | `/maa-task/task/dropoff` | **100% Identik** | **PASS** | **PASS** |
| **Tracking AWB** | `MaaTrackingActivity` | `/tracking` + `/api/tracking/[awb]` | `/maa-task/tracking` | **100% Identik** | **PASS** | **PASS** |
