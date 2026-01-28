-- ============================================================================
-- MIGRATION: Add Multi-Brand & Multi-Funnel Support
-- Date: 2026-01-28
-- Create Powerdash brand for existing data
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Create brands table
-- ============================================================================

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#0055b6',
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON brands(is_active);

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brands
DROP POLICY IF EXISTS "Users can view their own brands" ON brands;
CREATE POLICY "Users can view their own brands" ON brands
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own brands" ON brands;
CREATE POLICY "Users can create their own brands" ON brands
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own brands" ON brands;
CREATE POLICY "Users can update their own brands" ON brands
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own brands" ON brands;
CREATE POLICY "Users can delete their own brands" ON brands
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 2: Create funnels table
-- ============================================================================

CREATE TABLE IF NOT EXISTS funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  total_leads_count INT DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funnels_brand_id ON funnels(brand_id);
CREATE INDEX IF NOT EXISTS idx_funnels_is_active ON funnels(is_active);
CREATE INDEX IF NOT EXISTS idx_funnels_is_default ON funnels(is_default);

-- Enable RLS
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for funnels
DROP POLICY IF EXISTS "Users can view funnels of their brands" ON funnels;
CREATE POLICY "Users can view funnels of their brands" ON funnels
  FOR SELECT USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create funnels for their brands" ON funnels;
CREATE POLICY "Users can create funnels for their brands" ON funnels
  FOR INSERT WITH CHECK (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update funnels of their brands" ON funnels;
CREATE POLICY "Users can update funnels of their brands" ON funnels
  FOR UPDATE USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete funnels of their brands" ON funnels;
CREATE POLICY "Users can delete funnels of their brands" ON funnels
  FOR DELETE USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

COMMIT;