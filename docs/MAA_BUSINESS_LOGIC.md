# ANTERAJA MAA — BUSINESS LOGIC & CUSTODY SPECIFICATION

Aturan bisnis inti yang mengatur alokasi tanggung jawab, hak retensi fisik paket, serta isolasi keamanan data antar gerai Mitra.

---

## 1. CUSTODY & RESPONSIBILITY ALLOCATION

1. **Fase Pra-Scan (Customer Custody):**
   - Paket berada di tangan customer / shipper.
   - Status di sistem: `UNCLAIMED` / `PENDING_DROPOFF`.
2. **Fase Gerai Mitra (Mitra Custody):**
   - Mitra melakukan scan/claim barcode (Opcode 51) atau membuat dropoff manual.
   - Pembayaran terkonfirmasi lunas (`payment_status = PAID`).
   - Status di sistem: `WAITING_FOR_HANDOVER_SERAH`.
   - **Tanggung Jawab:** Gerai Mitra bertanggung jawab penuh atas keamanan fisik paket di rak penyimpanan gerai.
3. **Fase Operasional Satria (Courier / Fleet Custody):**
   - Satria tiba di gerai, scan barcode serah terima (`validateRiderHandoverCode` & `doHandoverToRider`).
   - Status di sistem bertransisi ke: `SUDAH_SERAH` / `PICKED_UP`.
   - **Tanggung Jawab:** Berpindah 100% dari Mitra ke Satria dan Staging Hub Anteraja.
