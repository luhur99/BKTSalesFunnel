-- ============================================================================
-- STEP 7: Make brand_id and funnel_id NOT NULL (after all data migrated)
-- ============================================================================

BEGIN;

-- Check if any leads still missing brand or funnel
SELECT 
  COUNT(*) AS leads_without_brand
FROM leads
WHERE brand_id IS NULL;

SELECT 
  COUNT(*) AS leads_without_funnel
FROM leads
WHERE funnel_id IS NULL;

-- Only proceed if no orphaned leads
DO $$
DECLARE
  orphaned_count INT;
BEGIN
  SELECT COUNT(*) INTO orphaned_count 
  FROM leads 
  WHERE brand_id IS NULL OR funnel_id IS NULL;
  
  IF orphaned_count = 0 THEN
    -- Make columns NOT NULL
    ALTER TABLE leads ALTER COLUMN brand_id SET NOT NULL;
    ALTER TABLE leads ALTER COLUMN funnel_id SET NOT NULL;
    RAISE NOTICE 'Successfully set brand_id and funnel_id as NOT NULL';
  ELSE
    RAISE WARNING '% leads still without brand/funnel assignment. NOT NULL constraint not applied.', orphaned_count;
  END IF;
END $$;

COMMIT;