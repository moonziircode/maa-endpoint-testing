# SUPABASE DISTRICT MASTER FLOW

```text
1. Database: Supabase PostgreSQL `public.districts` (6,545 records).
2. Query Endpoint: GET /api/districts?q={keyword}&limit=10
3. Indexed columns: `dist_name`, `city_code`, `province_code`, `postal_code`.
4. Response mapping:
   - dist_code: 6-digit administrative code (e.g. 31.74.06)
   - dist_name: Kecamatan
   - city_name: Kota/Kabupaten
   - province_name: Provinsi
   - postal_code: List of postal codes
5. Directly binds into Anteraja Rate API parameter `destination=31.74.06`.
```
