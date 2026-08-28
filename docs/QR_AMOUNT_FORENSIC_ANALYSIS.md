# ANTERAJA MAA — QR AMOUNT FORENSIC DEBUGGING REPORT

Laporan analisis forensik mendalam terkait investigasi penyebab perbedaan nominal antara tarif ongkir yang ditampilkan di frontend dengan tagihan QR Code pada Payment Gateway Bayaraja Anteraja.

---

## 1. EXECUTIVE SUMMARY

```text
====================================================
QR AMOUNT FORENSIC ANALYSIS
====================================================

EXPECTED RATE:
Rp 11.500 (Jabodetabek REG) / Rp 22.500 (SD) / Rp 33.000 (Out-of-Region)

ACTUAL QR:
Rp 11.500 (Jabodetabek REG) / Rp 22.500 (SD) / Rp 33.000 (Out-of-Region)

DIFFERENCE:
Rp 0 (100% Synchronized & Verified)

ROOT CAUSE:
1. Hardcoded default "delivery_price: 11500.0" in createDropoffOrder instead of passing the dynamically selected service tariff.
2. Unsynchronized frontend rate state: User creates a dropoff task to a destination without triggering the rate recalculation hook, causing the frontend summary to display default/stale tariff (e.g. Rp 10.000/11.500) while Anteraja Core Gateway computes the true destination tariff on the task (e.g. Rp 29.000/33.000).
3. Payment initiation did not bind to the true returned task delivery price ("dropData.deliveryPrice").

SOURCE OF EXPECTED AMOUNT:
POST /maa-task/order/rate & /api/order/rate (Tariff calculated by Anteraja Origin/Destination Engine).

SOURCE OF QR AMOUNT:
Anteraja Bayaraja Gateway (payment.anteraja.id) loaded via dynamic JWT token issued by POST /maa-task/task/dropoff/payment/initiateInApps.

PAYMENT REQUEST AMOUNT:
Passed dynamically matching the exact task delivery price ("cash_received = actualPayableAmount").

PAYMENT RESPONSE AMOUNT:
"total_payment" returned by PaymentResp in Anteraja Gateway.

QR PAYLOAD AMOUNT:
Embedded inside Bayaraja payment URL token: "https://payment.anteraja.id/qrCode?token=...".

TRANSACTION ID:
TMAA-[TIMESTAMP] (e.g. TMAA-1787896923270)

RATE -> PAYMENT MAPPING:
Origin + Destination + Weight -> Rate API -> Selected Service Tariff -> createDropoffOrder(deliveryPrice) -> Task Created (task.delivery_price) -> initiateInApps(cash_received) -> Bayaraja Payment Token -> QRIS Display

ROOT CAUSE EVIDENCE:
- Decompiled "MaaPaymentRequestBody.java" & "PaymentResp.java" confirmed total_payment is derived from the backend task code.
- Live probe confirmed:
  * Setiabudi -> Cilandak (REG): Quoted Rp 11.500 == Task Price Rp 11.500 == Payment Amount Rp 11.500 (PASS)
  * Setiabudi -> Cilandak (SD): Quoted Rp 22.500 == Task Price Rp 22.500 == Payment Amount Rp 22.500 (PASS)
  * Setiabudi -> Pangkal Pinang (REG): Quoted Rp 33.000 == Task Price Rp 33.000 == Payment Amount Rp 33.000 (PASS)

FIX:
1. Updated "CreateOrderPayload" interface in "src/lib/types.ts" to include "deliveryPrice".
2. Updated "createDropoffOrder" in "src/lib/anteraja-api.ts" to dynamically forward "payload.deliveryPrice".
3. Added automatic rate calculation hook "useEffect" in "src/app/order/create/page.tsx" across senderDistrict, receiverDistrict, weight, and dimension changes.
4. Bound payment initiation amount strictly to "dropData.deliveryPrice" returned by the created task.

TEST RESULT:
PASS (100% Verified on Localhost & Vercel Production)
====================================================
```

---

## 2. DETAILED TRACE: RATE VS ORDER VS PAYMENT VS QR

| Parameter | Rate API (`POST /api/order/rate`) | Order Creation (`POST /api/order/create`) | Payment Initiate (`POST /api/order/payment/initiate`) | Bayaraja Gateway (`payment.anteraja.id`) |
|---|:---:|:---:|:---:|:---:|
| **Origin District** | `31.74.02` (Setiabudi) | `31.74.02` | - | `31.74.02` |
| **Destination District** | `31.74.06` (Cilandak) | `31.74.06` | - | `31.74.06` |
| **Product Service** | `REG` | `REG` | - | `REG` |
| **Parcel Weight** | `1.0 KG` | `1.0 KG` | - | `1.0 KG` |
| **Base Delivery Price** | **Rp 11.500** | **Rp 11.500** | **Rp 11.500** | **Rp 11.500** |
| **Discount / Promo** | Rp 0 | Rp 0 | Rp 0 | Rp 0 |
| **Final Payable Amount** | **Rp 11.500** | **Rp 11.500** | **Rp 11.500** | **Rp 11.500** |
| **Transaction Status** | `ACTIVE` | `NEW / NOT_PAID` | `INITIATED` | `READY_FOR_SCAN` |
