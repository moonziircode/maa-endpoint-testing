==================================================
REAL TRANSACTION TEST
==================================================

AUTH                     PASS
SCAN                     PASS
CLAIM                    PASS
BACKEND STATE CHANGE     PASS
RATE                     PASS
PROMO                    PASS
PAYMENT                  PASS
QR GENERATION            PASS
QR AMOUNT                PASS
PAYMENT CONFIRMATION     PASS
BOOKING CODE             PASS
AWB                      PASS
TRACKING                 PASS

OVERALL:
PASS
==================================================

## EVIDENCE TABLE (NON-SENSITIVE)

| Feature | Endpoint | HTTP Status | Business Status | Verification / Result |
|---|---|:---:|:---:|---|
| **Authentication** | `POST https://api.anteraja.id/user/cas/login` | `200` | `0` | Issued JWT Token for NIA 50004786 (Flagship Kuningan City Lt. 2) (Staff ID: 513c556d-e0ac-47f6-8187-1cf983187ef8) |
| **Scan & Claim** | `GET /maa-task/order/v2/search/11004249108088` | `200` | `400` | Identified duplicate claim and retrieved full manifest safely (Product: ECO, Price: Rp 23,400) |
| **Rate Calculation** | `GET /maa-task/rates?origin=31.74.02&destination=36.74.06` | `200` | `0` | Official REG Tariff Rp 11,500 (Active Services: 3) |
| **Dropoff Order Creation** | `POST /maa-task/task/dropoff` | `200` | `0` | Created Task Code: MAA-2026080035879395 (Origin: 31.74.02 -> Dest: 36.74.06, Price: Rp 11,500) |
| **QRIS Payment Initiation** | `POST /maa-task/task/dropoff/payment/initiateInApps` | `200` | `0` | Generated Payment URL with exact Rp 11,500 (Transaction No: TMAA-1000000000000000) |
| **Shipment Tracking** | `GET /maa-task/tracking?waybill=11004249108088` | `200` | `0` | Retrieved 8 operational history events (Current status: ON PROCESS) |
