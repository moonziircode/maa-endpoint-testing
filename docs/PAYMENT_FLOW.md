# PAYMENT & QRIS FLOW

```text
1. User selects Payment Method: QRIS / GoPay QR (payment_code: "006").
2. Backend requests: POST /maa-task/task/dropoff/payment/initiateInApps?agent_staff_id={uuid}
   Payload: {
     "promo_code": "",
     "task": [{"task_code": "MAA-..."}],
     "cash_received": 11500,
     "payment_code": "006"
   }
3. Backend receives:
   - transaction_no: TMAA-2026080000180918
   - total_payment: 11500.0
   - payment_url: https://payment.anteraja.id/qrCode?token=...
   - qr_string / qr_image
4. UI renders live QR Code with countdown timer and refresh/check status button.
5. Polls POST /maa-task/order/payment/check until marked PAID.
```
