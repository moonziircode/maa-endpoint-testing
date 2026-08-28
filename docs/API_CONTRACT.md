# API CONTRACT & ENDPOINT INVENTORY

Based on static reverse engineering of `id.anteraja.maa` and confirmed live endpoint probes:

| Category | Method | Endpoint Path | Host / Service | Auth Required | Request Model | Response Model | Confidence |
|---|:---:|---|---|:---:|---|---|:---:|
| **Auth** | `GET` | `/cas/login` | `cas.anteraja.id` | None | None (Extracts `execution` & `_eventId`) | `HTML` | `CONFIRMED` |
| **Auth** | `POST`| `/cas/login` | `cas.anteraja.id` | None | `username, password, execution, _eventId` | `Set-Cookie: TGC`, `302 Redirect` | `CONFIRMED` |
| **Auth** | `POST`| `/user/cas/login` | `api.anteraja.id` | None | `token: ST-xxxx-mt` | `MaaUser`, JWT `token` | `CONFIRMED` |
| **Master**| `GET` | `/rest/v1/districts` | `supabase.co` | Anon Key | Query params: `dist_name`, `postal_code` | Array of `District` | `CONFIRMED` |
| **Scan** | `GET` | `/maa-task/order/search/{awb}` | `api.anteraja.id` | Bearer Token | Query: `agent_staff_id={uuid}` | `OrderSearchResult` | `CONFIRMED` |
| **Scan** | `GET` | `/maa-task/order/v2/search/{awb}`| `api.anteraja.id` | Bearer Token | Query: `agent_staff_id={uuid}` | `ValidationStatus` | `CONFIRMED` |
| **Scan** | `GET` | `/maa-task/order/search/{awb}/bulky` | `api.anteraja.id` | Bearer Token | Path: `{awb}` | `BulkyOrderDetail` | `CONFIRMED` |
| **Tariff**| `GET` | `/maa-task/rates` | `api.anteraja.id` | Bearer Token | `origin, destination, weight, length, width, height` | List of `MaaTariff` | `CONFIRMED` |
| **Promo** | `GET` | `/maa-task/promo` | `api.anteraja.id` | Bearer Token | Optional: `search_key` | List of `MaaPromoCode` | `CONFIRMED` |
| **Promo** | `POST`| `/maa-task/promo/redeem` | `api.anteraja.id` | Bearer Token | `promo_code`, `task: [{task_code}]` | `MaaRedeemPromoDetail` | `CONFIRMED` |
| **Order** | `POST`| `/maa-task/task/dropoff` | `api.anteraja.id` | Bearer Token | `MaaCreateOrderReq` | `task_code`, `waybill_no` | `CONFIRMED` |
| **Payment**| `POST`| `/maa-task/task/dropoff/payment/initiateInApps` | `api.anteraja.id` | Bearer Token | `promo_code, task, cash_received, payment_code` | `MaaPaymentResponseBody` | `CONFIRMED` |
| **Payment**| `POST`| `/maa-task/order/payment/check` | `api.anteraja.id` | Bearer Token | `[{"bookingId": "..."}]` | `List<PaymentCheck>` | `CONFIRMED` |
| **Tracking**| `GET`| `/maa-task/order/tracking/{awb}` | `api.anteraja.id` | Bearer Token | Path: `{awb}` | `TrackingTimeline` | `CONFIRMED` |
