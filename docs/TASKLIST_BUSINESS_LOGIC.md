# TASKLIST BUSINESS LOGIC & RESPONSIBILITY RULES

Analisis aturan bisnis, alokasi tanggung jawab hukum/operasional, serta kriteria retensi dan eliminasi paket pada Tasklist Anteraja MAA.

---

## 1. HIERARKI STATUS & SIKLUS HIDUP RESI (LIFECYCLE)

```text
+-----------------------------------------------------------------------------+
| FASE 1: PENERIMAAN / SCAN MASUK DI MITRA                                   |
| - Pengirim membawa paket ke gerai Mitra                                     |
| - Mitra melakukan Scan Claim (Opcode 51) atau Input Manual                  |
| - Pembayaran diselesaikan (QRIS/Cash) -> payment_status = PAID              |
| - Task Status = WAITING_FOR_HANDOVER_SERAH                                  |
| - Tanggung Jawab: MITRA COUNTER                                            |
| - Efek Tasklist: PAKET MASUK KE TASKLIST                                    |
+-----------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------+
| FASE 2: RETENSI DALAM TASKLIST                                              |
| - Paket tersimpan rapi di rak/gerai Mitra                                   |
| - Query Tasklist selalu menampilkan paket selama belum dipickup Satria     |
| - Refresh berulang kali tidak menghilangkan paket                           |
| - Tanggung Jawab: MITRA COUNTER (Kehilangan/kerusakan ditanggung Mitra)    |
| - Efek Tasklist: PAKET TETAP BERADA DI TASKLIST                             |
+-----------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------+
| FASE 3: SERAH TERIMA / PICKUP SCAN OLEH SATRIA                              |
| - Satria tiba di gerai Mitra                                                |
| - Satria memperlihatkan Rider Code / Scan QR Handover (Opcode 54/10)        |
| - Mitra memvalidasi via validateRiderHandoverCode                           |
| - Eksekusi Handover via doHandoverToRider                                   |
| - Task Status berubah menjadi: SUDAH_SERAH / PICKED_UP                      |
| - Tanggung Jawab: SATRIA / OPERASIONAL ANTERAJA                             |
| - Efek Tasklist: PAKET OTOMATIS KELUAR DARI TASKLIST                        |
+-----------------------------------------------------------------------------+
```

---

## 2. ATURAN BISNIS (BUSINESS RULES)

1. **Aturan Kepemilikan & Tanggung Jawab (Custody Rule):**
   - Selama paket berstatus `WAITING_FOR_HANDOVER_SERAH`, Mitra bertanggung jawab penuh terhadap fisik paket.
   - Setelah Satria melakukan pickup scan, tanggung jawab berpindah 100% ke operasional Anteraja.
2. **Aturan Isolasi Akun (Account Isolation Rule):**
   - Mitra A tidak dapat melihat Tasklist milik Mitra B karena filter token mengikat `agent_staff_id`.
3. **Aturan Anti-Duplikasi (Deduplication Rule):**
   - Jika AWB yang sama di-scan kembali saat masih di Tasklist, sistem mengembalikan status `ALREADY_CLAIMED` dan tidak membuat duplikat di Tasklist.
