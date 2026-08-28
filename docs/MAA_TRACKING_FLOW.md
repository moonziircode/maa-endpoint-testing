# ANTERAJA MAA — REAL-TIME SHIPMENT TRACKING SPECIFICATION

Spesifikasi endpoint pelacakan resi AWB real-time, mapping checkpoint, identitas Satria, dan status operasional pengiriman.

---

## 1. CONTRACT SPECIFICATION
* **Endpoint:** `GET https://api.anteraja.id/maa-task/tracking?waybill={AWB}&agent_staff_id={STAFF_ID}`
* **Response Model:**
  - `waybill`: Nomor resi AWB (14 digit numeric, e.g. `11004249108088`)
  - `service_code`: Kode produk layanan (`REG`, `ND`, `SD`)
  - `status`: Status pengiriman terkini (`ON PROCESS`, `DELIVERED`, `PROBLEM`)
  - `history`: Array checkpoint log berisi timestamp, hub_name, tracking_code (opcode), dan message keterangan.
