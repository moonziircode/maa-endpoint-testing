-- =======================================================================
-- Migration: Create public.districts for Anteraja District Master Data
-- Project Reference: wqpomgyktrndktsmojqg
-- Created: 2026-08-28 10:36:00
-- Source Table: pd_tb_district_aca (6,545 rows)
-- =======================================================================

-- 1. Create districts table with schema matching source SQLite pd_tb_district_aca
CREATE TABLE IF NOT EXISTS public.districts (
    id BIGINT PRIMARY KEY,
    dist_code TEXT NOT NULL UNIQUE,
    dist_name TEXT NOT NULL,
    city_code TEXT,
    city_name TEXT,
    province_code TEXT,
    province_name TEXT,
    country_code TEXT DEFAULT 'ID',
    country_name TEXT DEFAULT 'Indonesia',
    dist_type TEXT DEFAULT 'DISTRICT',
    valid_flg TEXT DEFAULT 'Y',
    tokopedia_id TEXT,
    county_code TEXT,
    area_code TEXT,
    currency_code TEXT DEFAULT 'IDR',
    postal_code TEXT,
    dist_all TEXT,
    parent_dist_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create optimized performance indexes
CREATE INDEX IF NOT EXISTS idx_districts_dist_name ON public.districts USING btree (dist_name);
CREATE INDEX IF NOT EXISTS idx_districts_city_code ON public.districts USING btree (city_code);
CREATE INDEX IF NOT EXISTS idx_districts_province_code ON public.districts USING btree (province_code);
CREATE INDEX IF NOT EXISTS idx_districts_postal_code ON public.districts USING btree (postal_code);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Read-Only Access Policy (Anon & Authenticated)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'districts' AND policyname = 'Allow public read-only access to districts'
    ) THEN
        CREATE POLICY "Allow public read-only access to districts"
        ON public.districts
        FOR SELECT
        TO public
        USING (true);
    END IF;
END $$;
