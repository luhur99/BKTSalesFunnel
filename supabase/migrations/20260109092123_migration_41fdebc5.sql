-- Execute the migration file content
-- Function 1: Get Daily Stage Movements
DROP FUNCTION IF EXISTS get_daily_stage_movements(DATE, DATE);

CREATE OR REPLACE FUNCTION get_daily_stage_movements(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  movement_date DATE,
  from_stage_name VARCHAR,
  to_stage_name VARCHAR,
  from_funnel TEXT,
  to_funnel TEXT,
  is_funnel_switch BOOLEAN,
  total_movements BIGINT,
  movement_reasons JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH movement_data AS (
    SELECT 
      DATE(lsh.moved_at) AS mv_date,
      s_from.stage_name AS from_stage,
      s_to.stage_name AS to_stage,
      lsh.from_funnel::TEXT AS from_f,
      lsh.to_funnel::TEXT AS to_f,
      (lsh.from_funnel != lsh.to_funnel) AS is_switch,
      lsh.reason
    FROM lead_stage_history lsh
    JOIN stages s_from ON lsh.from_stage_id = s_from.id
    JOIN stages s_to ON lsh.to_stage_id = s_to.id
    WHERE DATE(lsh.moved_at) BETWEEN start_date AND end_date
  ),
  reason_counts AS (
    SELECT 
      mv_date,
      from_stage,
      to_stage,
      from_f,
      to_f,
      is_switch,
      reason,
      COUNT(*) AS reason_count
    FROM movement_data
    GROUP BY mv_date, from_stage, to_stage, from_f, to_f, is_switch, reason
  )
  SELECT 
    rc.mv_date,
    rc.from_stage,
    rc.to_stage,
    rc.from_f,
    rc.to_f,
    rc.is_switch,
    SUM(rc.reason_count),
    jsonb_object_agg(COALESCE(rc.reason, 'unknown'), rc.reason_count)
  FROM reason_counts rc
  GROUP BY rc.mv_date, rc.from_stage, rc.to_stage, rc.from_f, rc.to_f, rc.is_switch
  ORDER BY rc.mv_date DESC;
END;
$$;