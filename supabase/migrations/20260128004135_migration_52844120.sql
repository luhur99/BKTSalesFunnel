-- Step 5: Make brand_id and funnel_id NOT NULL
BEGIN;

-- Check if all leads have brand and funnel
DO $$
DECLARE
  null_count INT;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM leads
  WHERE brand_id IS NULL OR funnel_id IS NULL;
  
  IF null_count = 0 THEN
    -- Safe to add NOT NULL constraints
    ALTER TABLE leads ALTER COLUMN brand_id SET NOT NULL;
    ALTER TABLE leads ALTER COLUMN funnel_id SET NOT NULL;
    RAISE NOTICE '✅ Added NOT NULL constraints to leads.brand_id and leads.funnel_id';
  ELSE
    RAISE WARNING '⚠️ Cannot add NOT NULL constraint: % leads still have NULL values', null_count;
  END IF;
END $$;

COMMIT;