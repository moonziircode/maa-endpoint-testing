# ANTERAJA MAA — OPCODE OPERATION MATRIX

Daftar Operation Code (Opcode) resmi Anteraja logistics system yang teridentifikasi dari source code Android MAA dan pengujian API gateway.

---

| Opcode | Operation Name | Actor | Trigger API / Event | Precondition | Postcondition | State Machine Effect |
|:---:|---|---|---|---|---|---|
| **51** | **Mitra Dropoff Scan / Claim** | Mitra Staff | `POST /maa-task/order/claim/{awb}` | Paket belum diclaim di gerai | Status `WAITING_FOR_HANDOVER_SERAH` | Paket **MASUK** ke Tasklist Mitra |
| **54** | **Satria Pickup / Serah Terima** | Satria / Courier | `POST /maa-task/titip-pickup/doHandoverToRider` | Paket ada di Tasklist gerai | Status `SUDAH_SERAH` / `PICKED_UP` | Paket **KELUAR** dari Tasklist Mitra |
| **10** | **Hub Inbound Processing** | Hub Staging Team | `POST /maa-delivery/inbound` | Paket diangkut dari gerai | Paket tercatat di Staging Hub | Update Tracking Timeline |
| **01** | **Out for Delivery** | Satria Delivery | `POST /maa-delivery/delivery/claimOrder` | Paket tiba di destination hub | Status `WITH_COURIER` | Satria membawa paket ke penerima |
| **00** | **Delivered / POD** | Satria Delivery | `POST /maa-delivery/delivery/confirmDelivery` | Penerima menerima paket & foto POD | Status `DELIVERED` | Transaksi pengiriman selesai |
| **03** | **Delivery Exception / Problem** | Satria Delivery | `POST /maa-delivery/delivery/confirmException` | Penerima tidak di tempat / alamat salah | Status `EXCEPTION / ON_HOLD` | Retur / Penjadwalan ulang |
