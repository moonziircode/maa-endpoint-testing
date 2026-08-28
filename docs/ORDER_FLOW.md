# MANUAL ORDER CREATION FLOW

```text
1. SENDER: Reads Agent Shop District (e.g. 31.74.02) from profile.
2. RECIPIENT: Live search against Supabase `public.districts` (e.g. Cilandak -> 31.74.06).
3. ITEM: Input Weight (kg), Dimensions (L, W, H in cm).
4. RATE: Query GET /maa-task/rates -> displays REG, ND, SD with durations and prices.
5. PROMO: (Optional) Validate promo code via POST /maa-task/promo/redeem.
6. SUBMIT: POST /maa-task/task/dropoff -> creates Task Code (e.g. MAA-2026080035878244).
7. PAYMENT: Initiates QR payment -> renders live QR Code with exact invoice amount.
8. CONFIRMATION: Status confirmed -> issues final Booking Code & AWB.
```
