-- Step 1: Drop existing functions to start fresh
DROP FUNCTION IF EXISTS get_daily_stage_movements(DATE, DATE);
DROP FUNCTION IF EXISTS get_lead_journey_analytics(UUID);