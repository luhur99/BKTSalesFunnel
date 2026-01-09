-- Fix Function 2: Get Average Time Per Stage (resolve ambiguity)
DROP FUNCTION IF EXISTS get_avg_time_per_stage();

CREATE OR REPLACE FUNCTION get_avg_time_per_stage()
RETURNS TABLE (
  stage_name_out VARCHAR,
  avg_hours NUMERIC,
  total_leads_passed BIGINT
) 
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH duration_calc AS (
    SELECT 
      s.stage_name AS calc_stage_name,
      lsh.lead_id,
      EXTRACT(EPOCH FROM (
        LEAD(lsh.moved_at) OVER (PARTITION BY lsh.lead_id ORDER BY lsh.moved_at) - lsh.moved_at
      )) / 3600 AS hours_spent
    FROM lead_stage_history lsh
    JOIN stages s ON lsh.from_stage_id = s.id
  )
  SELECT 
    dc.calc_stage_name::VARCHAR,
    ROUND(AVG(dc.hours_spent)::NUMERIC, 2),
    COUNT(*)::BIGINT
  FROM duration_calc dc
  WHERE dc.hours_spent IS NOT NULL 
  GROUP BY dc.calc_stage_name 
  ORDER BY AVG(dc.hours_spent) DESC;
END;
$$;