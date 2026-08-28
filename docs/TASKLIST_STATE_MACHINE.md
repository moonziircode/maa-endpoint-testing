# TASKLIST STATE MACHINE SPECIFICATION

Spesifikasi transisi state, opcode pemicu, aktor, dan efek terhadap Tasklist Mitra Anteraja MAA.

---

## 1. TABEL STATE MACHINE

| State Awal | Event / Action | Aktor | Opcode / API | State Akhir | Efek Tasklist | Penanggung Jawab |
|---|---|---|:---:|---|:---:|---|
| `UNCLAIMED` | Scan / Claim Paket | Mitra Staff | `Opcode 51` / `order/claim` | `CLAIMED` | Masuk Tasklist | Mitra Gerai |
| `ORDER_CREATED` | Inisiasi Pembayaran | Mitra Staff | `initiateInApps` | `PENDING_PAYMENT` | Tertunda (On-Hold) | Mitra Gerai |
| `PENDING_PAYMENT` | Pembayaran QRIS Lunas | Customer / Gateway | `payment/check` | `WAITING_FOR_HANDOVER_SERAH` | Masuk Tasklist | Mitra Gerai |
| `WAITING_FOR_HANDOVER_SERAH` | Paket Menunggu di Rak | Sistem / Idle | Query `task/dropoff` | `WAITING_FOR_HANDOVER_SERAH` | **TETAP DI TASKLIST** | Mitra Gerai |
| `WAITING_FOR_HANDOVER_SERAH` | Satria Validasi Handover | Mitra & Satria | `validateRiderHandoverCode` | `HANDOVER_PENDING` | Siap Serah | Mitra Gerai |
| `HANDOVER_PENDING` | Konfirmasi Handover | Satria / Mitra | `Opcode 54` / `doHandoverToRider` | `SUDAH_SERAH` | **KELUAR DARI TASKLIST** | Satria / Hub |
| `SUDAH_SERAH` | Hub Sorting Scan | Hub Staging Team | `Opcode 10` (Inbound Hub) | `IN_TRANSIT` | Tidak di Tasklist | Operasional Hub |
