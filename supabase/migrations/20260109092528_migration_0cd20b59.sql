-- ==============================================
-- Function 2: Get Lead Journey Analytics
-- ==============================================
DROP FUNCTION IF EXISTS get_lead_journey_analytics(UUID);

CREATE OR REPLACE FUNCTION get_lead_journey_analytics(
  p_lead_id UUID
)
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
      l.id AS lead_id,
      l.name AS lead_name,
      EXTRACT(DAY FROM (CURRENT_TIMESTAMP - l.created_at)) AS journey_days,
      l.status,
      l.current_funnel::TEXT AS funnel,
      s.stage_name
    FROM leads l
    LEFT JOIN stages s ON l.current_stage_id = s.id
    WHERE l.id = p_lead_id
  ),
  stage_windows AS (
    SELECT
      lsh.lead_id AS history_lead_id,
      s_from.stage_name,
      s_from.stage_number,
      lsh.from_funnel::TEXT AS funnel_type,
      lsh.moved_at AS entered_at,
      LEAD(lsh.moved_at) OVER (PARTITION BY lsh.lead_id ORDER BY lsh.moved_at) AS exited_at,
      lsh.reason,
      lsh.notes
    FROM lead_stage_history lsh
    JOIN stages s_from ON lsh.from_stage_id = s_from.id
    WHERE lsh.lead_id = p_lead_id
  ),
  history_data AS (
    SELECT
      sw.history_lead_id,
      jsonb_agg(
        jsonb_build_object(
          'stage_name', sw.stage_name,
          'stage_number', sw.stage_number,
          'funnel_type', sw.funnel_type,
          'entered_at', sw.entered_at,
          'exited_at', sw.exited_at,
          'days_in_stage', COALESCE(
            EXTRACT(DAY FROM (sw.exited_at - sw.entered_at))::NUMERIC, 
            EXTRACT(DAY FROM (CURRENT_TIMESTAMP - sw.entered_at))::NUMERIC
          ),
          'reason', sw.reason,
          'notes', sw.notes
        )
        ORDER BY sw.entered_at
      ) AS stages_history
    FROM stage_windows sw
    GROUP BY sw.history_lead_id
  )
  SELECT 
    li.lead_id,
    li.lead_name,
    li.journey_days,
    li.status,
    li.funnel,
    li.stage_name,
    COALESCE(hd.stages_history, '[]'::JSONB) AS stages_history
  FROM lead_info li
  LEFT JOIN history_data hd ON li.lead_id = hd.history_lead_id;
END;
$$;