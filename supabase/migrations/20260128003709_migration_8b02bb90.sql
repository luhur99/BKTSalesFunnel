-- ============================================================================
-- STEP 5: Make brand_id and funnel_id NOT NULL (after data migration)
-- ============================================================================

BEGIN;

-- Check if there are any NULL values before making NOT NULL
SELECT 
  'Leads without brand' AS issue,
  COUNT(*) AS count
FROM leads
WHERE brand_id IS NULL
UNION ALL
SELECT 
  'Leads without funnel' AS issue,
  COUNT(*) AS count
FROM leads
WHERE funnel_id IS NULL;

-- Only proceed if no NULL values
DO $$
DECLARE
  null_count INT;
BEGIN
  SELECT COUNT(*) INTO null_count FROM leads WHERE brand_id IS NULL OR funnel_id IS NULL;
  
  IF null_count = 0 THEN
    -- Make columns NOT NULL
    ALTER TABLE leads ALTER COLUMN brand_id SET NOT NULL;
    ALTER TABLE leads ALTER COLUMN funnel_id SET NOT NULL;
    RAISE NOTICE 'Successfully set brand_id and funnel_id as NOT NULL';
  ELSE
    RAISE WARNING 'Cannot set NOT NULL constraint: % leads still have NULL brand_id or funnel_id', null_count;
  END IF;
END $$;

COMMIT;