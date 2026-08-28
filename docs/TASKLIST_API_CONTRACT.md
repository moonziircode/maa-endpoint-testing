# TASKLIST API CONTRACT SPECIFICATION

Dokumentasi spesifikasi lengkap API Contract untuk seluruh endpoint yang terlibat dalam lifecycle Tasklist Anteraja MAA.

---

## 1. ENDPOINT INVENTORY

### A. Query Tasklist Dropoff (`GET /maa-task/task/dropoff`)
* **Purpose:** Mengambil daftar paket dropoff aktif yang menunggu serah terima pickup.
* **HTTP Method:** `GET`
* **Path:** `/maa-task/task/dropoff`
* **Query Parameters:**
  - `status` (string, required): `WAITING_FOR_HANDOVER_SERAH` (atau `SUDAH_SERAH` untuk riwayat)
  - `state` (string, required): `ACTIVE`
  - `key` (string, optional): Search keyword (No AWB / No Resi / Task Code)
  - `page` (integer, required): 0-indexed page number (default: 0)
  - `size` (integer, required): Jumlah item per halaman (default: 10 atau 20)
* **Headers:**
  - `token`: Bearer JWT token
  - `Authorization`: `Bearer <token>`
  - `appKey`: `MAA`
  - `appSecret`: `santuy`
  - `deviceId`: UUID device
  - `User-Agent`: `okhttp/4.9.0`
* **Response Payload Structure:**
  ```json
  {
    "status": 0,
    "info": "OK",
    "content": [
      {
        "task_code": "MAA-2026080035879528",
        "waybill_no": "11004249108088",
        "booking_id": "",
        "order_source": "MAA",
        "product_code": "REG",
        "product_name": "Anteraja Regular",
        "delivery_price": 11500.0,
        "total_delivery_price": 11500.0,
        "parcel_total_weight": 1.0,
        "task_type": "DROPOFF",
        "payment_status": "PAID",
        "task_status": "WAITING_FOR_HANDOVER_SERAH",
        "agent_staff_id": "513c556d-e0ac-47f6-8187-1cf983187ef8",
        "shipper_info": {
          "name": "Agent Counter Kuningan",
          "phone": "081299887766",
          "district_code": "31.74.02",
          "postcode": "12940"
        },
        "receiver_info": {
          "name": "Budi Santoso",
          "phone": "081388776655",
          "address": "Jl. Fatmawati Raya No. 45",
          "district_code": "31.74.06",
          "postcode": "12430"
        },
        "created_at": "2026-08-28 12:35:10",
        "updated_at": "2026-08-28 12:35:15"
      }
    ]
  }
  ```

---

### B. Validasi Kode Satria / Rider Pickup (`POST /maa-task/titip-pickup/validateRiderHandoverCode`)
* **Purpose:** Memvalidasi kode kurir/Satria yang datang ke gerai dan menghitung total paket yang siap diserahterimakan.
* **HTTP Method:** `POST`
* **Path:** `/maa-task/titip-pickup/validateRiderHandoverCode`
* **Request Body:**
  ```json
  {
    "code": "SATRIA_QR_CODE"
  }
  ```
* **Response Payload:**
  ```json
  {
    "status": 200,
    "info": "OK",
    "content": {
      "totalDropOffAwb": 5,
      "totalTitipPickupAwb": 2,
      "listDropOffAwb": ["11004249108088", "11004249108089"],
      "listTitipPickupAwb": ["11004249108090"],
      "extInfo": {}
    }
  }
  ```

---

### C. Eksekusi Handover Serah Terima (`POST /maa-task/titip-pickup/doHandoverToRider`)
* **Purpose:** Mengonfirmasi penyerahan fisik paket dari Mitra ke Satria.
* **HTTP Method:** `POST`
* **Path:** `/maa-task/titip-pickup/doHandoverToRider`
* **Request Body:**
  ```json
  {
    "code": "SATRIA_QR_CODE",
    "list_dropoff_awb": ["11004249108088"],
    "list_titip_pickup_awb": [],
    "ext_info": {}
  }
  ```
* **Response Payload:**
  ```json
  {
    "status": 0,
    "info": "Handover Berhasil",
    "content": {
      "success": true,
      "total_handed_over": 1
    }
  }
  ```
