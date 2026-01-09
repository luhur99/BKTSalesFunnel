-- Function 2: Get Lead Journey Analytics
DROP FUNCTION IF EXISTS get_lead_journey_analytics(UUID);

CREATE OR REPLACE FUNCTION get_lead_journey_analytics(p_lead_id UUID)
RETURNS TABLE (
  lead_id UUID,
  lead_name VARCHAR,
  total_journey_days NUMERIC,
  current_status VARCHAR,
  current_funnel TEXT,
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
      l.name,
      EXTRACT(DAY FROM (CURRENT_TIMESTAMP - l.created_at)) AS journey_days,
      l.status,
      l.current_funnel::TEXT,
      s.stage_name
    FROM leads l
    LEFT JOIN stages s ON l.current_stage_id = s.id
    WHERE l.id = p_lead_id
  ),
  stage_windows AS (
    SELECT
      lsh.lead_id,
      s_from.stage_name,
      s_from.stage_number,
      lsh.from_funnel::TEXT,
      lsh.moved_at,
      LEAD(lsh.moved_at) OVER (PARTITION BY lsh.lead_id ORDER BY lsh.moved_at) AS next_moved,
      lsh.reason,
      lsh.notes
    FROM lead_stage_history lsh
    JOIN stages s_from ON lsh.from_stage_id = s_from.id
    WHERE lsh.lead_id = p_lead_id
  ),
  history_data AS (
    SELECT
      sw.lead_id,
      jsonb_agg(
        jsonb_build_object(
          'stage_name', sw.stage_name,
          'stage_number', sw.stage_number,
          'funnel_type', sw.from_funnel,
          'entered_at', sw.moved_at,
          'exited_at', sw.next_moved,
          'days_in_stage', COALESCE(
            EXTRACT(DAY FROM (sw.next_moved - sw.moved_at)), 
            EXTRACT(DAY FROM (CURRENT_TIMESTAMP - sw.moved_at))
          ),
          'reason', sw.reason,
          'notes', sw.notes
        )
        ORDER BY sw.moved_at
      ) AS history
    FROM stage_windows sw
    GROUP BY sw.lead_id
  )
  SELECT 
    li.id,
    li.name,
    li.journey_days,
    li.status,
    li.current_funnel,
    li.stage_name,
    COALESCE(hd.history, '[]'::JSONB)
  FROM lead_info li
  LEFT JOIN history_data hd ON li.id = hd.lead_id;
END;
$$;