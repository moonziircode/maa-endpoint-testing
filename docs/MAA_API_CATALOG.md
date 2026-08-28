# ANTERAJA MAA — MASTER API CATALOG

Catalog of all discovered Anteraja upstream API endpoints, query schemas, header contracts, and authentication protocols.

---

## 1. ENDPOINT SPECIFICATIONS

### 1.1 Authentication & Profile
* **CAS Login:** `POST https://cas.anteraja.id/cas/login`
  - Headers: `appKey: MAA`, `appSecret: santuy`, `deviceId: UUID`, `User-Agent: okhttp/4.9.0`
  - Body: `{ username, password, lt, execution, _eventId: "submit", submit: "LOGIN" }`
  - Response: `{ status: 0, content: { access_token, agent_staff_id, agent_id } }`
* **Agent Profile:** `GET https://api.anteraja.id/maa-agent/agent/profile`
  - Headers: `token: Bearer JWT`, `Authorization: Bearer JWT`
  - Response: `{ status: 0, content: { staff_name, agent_name, district_code, shop_name } }`

### 1.2 Logistics Operations & Tasklist
* **Dropoff Tasklist Query:** `GET https://api.anteraja.id/maa-task/task/dropoff`
  - Params: `status=WAITING_FOR_HANDOVER_SERAH`, `state=ACTIVE`, `page=0`, `size=20`, `key=`
  - Response: `{ status: 0, content: [ MaaTask ] }`
* **On-Hold Dropoffs:** `GET https://api.anteraja.id/maa-task/order/v2/task/dropoff/on-hold?back_day=30`
* **Scan / Claim AWB:** `POST https://api.anteraja.id/maa-task/order/claim/{awb}`
* **Rider Handover Validation:** `POST https://api.anteraja.id/maa-task/titip-pickup/validateRiderHandoverCode`
  - Body: `{ code: "SATRIA_QR_CODE" }`
* **Handover Execution:** `POST https://api.anteraja.id/maa-task/titip-pickup/doHandoverToRider`
  - Body: `{ code, list_dropoff_awb, list_titip_pickup_awb, ext_info }`

### 1.3 Order Creation & Pricing
* **Tariff / Rate Calculation:** `POST https://api.anteraja.id/maa-task/order/rate`
  - Body: `{ originDistrictCode, destinationDistrictCode, weight, length, width, height, isCod }`
  - Response: `{ status: 0, content: { rates: [ { productCode, deliveryPrice, totalDeliveryPrice } ] } }`
* **Promo Code Query:** `POST https://api.anteraja.id/maa-task/order/promo`
  - Body: `{ promoCode, originDistrictCode, destinationDistrictCode, productCode, deliveryPrice }`
* **Dropoff Creation:** `POST https://api.anteraja.id/maa-task/task/dropoff`
  - Body: `{ senderName, senderPhone, receiverName, receiverPhone, receiverAddress, receiverDistrict, productCode, parcelTotalWeight }`
  - Response: `{ status: 0, content: [ { task_code: "MAA-...", invoice_no: "..." } ] }`

### 1.4 Payment Gateway & Bayaraja
* **Initiate In-App Payment:** `POST https://api.anteraja.id/maa-payment/order/payment/in-apps`
  - Body: `{ bookingId, paymentMethod: "GOPAY/QRIS", totalPayment }`
  - Response: `{ status: 0, content: { paymentUrl: "https://payment.anteraja.id/qrCode?token=...", paymentCode: "..." } }`
* **Check Payment Status:** `POST https://api.anteraja.id/maa-task/order/payment/check`
  - Body: `[ { bookingId } ]`
  - Response: `{ status: 0, info: "PAID" }`

### 1.5 Tracking & Analytics
* **Shipment Tracking:** `GET https://api.anteraja.id/maa-task/tracking?waybill={awb}&agent_staff_id={staffId}`
* **Daily Commission Summary:** `POST https://api.anteraja.id/maa-commission/proxy-analytic/summary-and-daily`
