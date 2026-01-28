-- ============================================================================
-- STEP 3: Add brand_id and funnel_id columns to leads table
-- ============================================================================

BEGIN;

-- Add brand_id column to leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE CASCADE;

-- Add funnel_id column to leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_brand_id ON leads(brand_id);
CREATE INDEX IF NOT EXISTS idx_leads_funnel_id ON leads(funnel_id);

COMMIT;