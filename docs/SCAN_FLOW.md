# SCAN & CLAIM WORKFLOW

```text
[Input AWB: Barcode / Camera / Manual]
            │
            ▼
[Next.js Backend Proxy: POST /api/scan]
  1. Calls GET /maa-task/order/v2/search/{awb}?agent_staff_id={uuid}
     - If status 400 with "Order ini sudah pernah di klaim":
       -> Returns DUPLICATE / ALREADY_CLAIMED status.
  2. Calls GET /maa-task/order/search/{awb}?agent_staff_id={uuid} (v1 search fallback)
  3. Calls GET /maa-task/order/search/{awb}/bulky
  4. Formats and sanitizes shipment, sender, receiver, item name, and financial data
            │
            ▼
[UI Result Card Display]
```
