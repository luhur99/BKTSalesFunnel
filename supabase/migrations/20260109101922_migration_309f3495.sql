-- FIX: Change RETURN TABLE to use TEXT instead of VARCHAR
DROP FUNCTION IF EXISTS get_daily_stage_movements(DATE, DATE);

CREATE OR REPLACE FUNCTION get_daily_stage_movements(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  movement_date DATE,
  from_stage_name VARCHAR,
  to_stage_name VARCHAR,
  from_funnel TEXT,        -- Changed from VARCHAR to TEXT
  to_funnel TEXT,          -- Changed from VARCHAR to TEXT
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
      lsh.moved_at::DATE AS mv_date,
      s1.stage_name AS from_stage,
      s2.stage_name AS to_stage,
      s1.funnel_type::TEXT AS from_f,
      s2.funnel_type::TEXT AS to_f,
      (s1.funnel_type != s2.funnel_type) AS is_switch,
      lsh.reason
    FROM lead_stage_history lsh
    JOIN stages s1 ON lsh.from_stage_id = s1.id
    JOIN stages s2 ON lsh.to_stage_id = s2.id
    WHERE lsh.moved_at >= start_date 
      AND lsh.moved_at <= end_date
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
    SUM(rc.reason_count)::BIGINT AS total,
    JSONB_OBJECT_AGG(
      COALESCE(rc.reason, 'No reason'),
      rc.reason_count
    ) AS reasons
  FROM reason_counts rc
  GROUP BY rc.mv_date, rc.from_stage, rc.to_stage, rc.from_f, rc.to_f, rc.is_switch
  ORDER BY rc.mv_date DESC, total DESC;
END;
$$;