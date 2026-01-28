-- Make brand_id and funnel_id NOT NULL (now that all leads have values)
ALTER TABLE leads ALTER COLUMN brand_id SET NOT NULL;
ALTER TABLE leads ALTER COLUMN funnel_id SET NOT NULL;

-- Verify no orphaned leads
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ All leads have brand and funnel'
    ELSE '⚠️ ' || COUNT(*) || ' leads still missing brand/funnel'
  END AS status
FROM leads
WHERE brand_id IS NULL OR funnel_id IS NULL;