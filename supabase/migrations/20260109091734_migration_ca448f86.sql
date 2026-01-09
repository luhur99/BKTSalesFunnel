-- DROP and RECREATE: get_lead_journey_analytics (Fixed)
DROP FUNCTION IF EXISTS get_lead_journey_analytics(UUID);

CREATE OR REPLACE FUNCTION get_lead_journey_analytics(p_lead_id UUID)
RETURNS TABLE (
  lead_id UUID,
  lead_name TEXT,
  total_journey_days NUMERIC,
  current_status VARCHAR,
  current_funnel VARCHAR,
  current_stage_name VARCHAR,
  stages_history JSONB
) 
LANGUAGE plpgsql 
AS $$
BEGIN
  RETURN QUERY
  WITH lead_info AS (
    SELECT 
      l.id,
      COALESCE(l.name, l.phone, l.email, 'Unknown Lead') AS name,
      EXTRACT(EPOCH FROM (NOW() - l.created_at)) / 86400 AS journey_days,
      l.status,
      s.funnel_type,
      s.stage_name
    FROM leads l
    LEFT JOIN stages s ON l.current_stage_id = s.id
    WHERE l.id = p_lead_id
  ),
  history_with_windows AS (
    SELECT 
      lsh.lead_id,
      s.stage_name,
      s.stage_number,
      lsh.from_funnel AS funnel_type,
      lsh.moved_at AS entered_at,
      LEAD(lsh.moved_at) OVER (PARTITION BY lsh.lead_id ORDER BY lsh.moved_at) AS exited_at,
      COALESCE(
        EXTRACT(EPOCH FROM (LEAD(lsh.moved_at) OVER (PARTITION BY lsh.lead_id ORDER BY lsh.moved_at) - lsh.moved_at)) / 86400,
        EXTRACT(EPOCH FROM (NOW() - lsh.moved_at)) / 86400
      ) AS days_in_stage,
      lsh.reason,
      lsh.notes
    FROM lead_stage_history lsh
    LEFT JOIN stages s ON lsh.from_stage_id = s.id
    WHERE lsh.lead_id = p_lead_id
  ),
  history_data AS (
    SELECT 
      lead_id,
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'stage_name', stage_name,
          'stage_number', stage_number,
          'funnel_type', funnel_type,
          'entered_at', entered_at,
          'exited_at', exited_at,
          'days_in_stage', days_in_stage,
          'reason', reason,
          'notes', notes
        ) ORDER BY entered_at
      ) AS history
    FROM history_with_windows
    GROUP BY lead_id
  )
  SELECT 
    li.id::UUID,
    li.name::TEXT,
    ROUND(li.journey_days::NUMERIC, 2),
    li.status,
    li.funnel_type,
    li.stage_name,
    COALESCE(hd.history, '[]'::JSONB)
  FROM lead_info li
  LEFT JOIN history_data hd ON li.id = hd.lead_id;
END;
$$;