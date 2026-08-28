# ANTERAJA MAA — LOCAL & CLOUD DATABASE ARCHITECTURE

Analisis struktur database lokal Android (SQLite/Room/SharedPreferences) vs Cloud Database (Supabase PostgreSQL & Central Logistics Gateway).

---

## 1. STRUKTUR ARSITEKTUR

```text
+------------------------------------+      +------------------------------------+
| ANDROID LOCAL STORAGE (CLIENT)     |      | WEB APPLICATION ARCHITECTURE       |
|------------------------------------|      |------------------------------------|
| 1. SharedPreferences (SP)          |      | 1. Supabase PostgreSQL             |
|    - User Session, Token, Profile  | <--> |    - Master table: public.districts|
| 2. Room SQLite Database            |      | 2. Iron Session (HttpOnly Cookie)  |
|    - Cached districts, drafts      |      |    - Server-side encrypted JWT     |
| 3. SQLite Offline Waybill Queue    |      | 3. Anteraja Core Logistics Gateway |
+------------------------------------+      +------------------------------------+
```

## 2. SUPABASE MASTER DISTRICTS SCHEMA

```sql
CREATE TABLE public.districts (
    id SERIAL PRIMARY KEY,
    dist_code VARCHAR(32) NOT NULL,
    dist_name VARCHAR(255) NOT NULL,
    city_code VARCHAR(32) NOT NULL,
    city_name VARCHAR(255) NOT NULL,
    province_code VARCHAR(32) NOT NULL,
    province_name VARCHAR(255) NOT NULL,
    postal_code VARCHAR(16) NOT NULL,
    dist_all TEXT NOT NULL
);
CREATE INDEX idx_districts_dist_all ON public.districts USING gin (to_tsvector('indonesian', dist_all));
```
