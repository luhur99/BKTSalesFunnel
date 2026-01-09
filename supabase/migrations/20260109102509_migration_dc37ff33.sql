-- Drop ALL versions of the function (by parameter types)
DROP FUNCTION IF EXISTS get_daily_stage_movements(DATE, DATE);
DROP FUNCTION IF EXISTS get_daily_stage_movements(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS get_daily_stage_movements(TEXT, TEXT);