-- Fix: Cast VARCHAR columns to TEXT to match function signature
DROP FUNCTION IF EXISTS public.get_follow_up_funnel_flow();

CREATE OR REPLACE FUNCTION public.get_follow_up_funnel_flow()
RETURNS TABLE(
  stage_id TEXT,
  stage_name TEXT,
  stage_number INTEGER,
  funnel_type TEXT,
  leads_entered BIGINT,
  leads_progressed BIGINT,
  leads_dropped BIGINT,
  drop_rate NUMERIC(5,2),
  conversion_rate NUMERIC(5,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH follow_up_stages AS (
    SELECT 
      s.id::TEXT,  -- Cast UUID to TEXT
      s.stage_name::TEXT,  -- Cast VARCHAR to TEXT
      s.stage_number,
      s.funnel_type::TEXT  -- Cast VARCHAR to TEXT
    FROM stages s
    WHERE s.funnel_type = 'follow_up'
    ORDER BY s.stage_number
  ),
  stage_entries AS (
    SELECT 
      h.to_stage_id::TEXT AS stage_id,
      COUNT(DISTINCT h.lead_id) AS entered_count
    FROM lead_stage_history h
    INNER JOIN stages s ON h.to_stage_id = s.id
    WHERE s.funnel_type = 'follow_up'
    GROUP BY h.to_stage_id
  ),
  stage_progressions AS (
    SELECT 
      h.from_stage_id::TEXT AS stage_id,
      COUNT(DISTINCT h.lead_id) AS progressed_count
    FROM lead_stage_history h
    INNER JOIN stages s_from ON h.from_stage_id = s_from.id
    INNER JOIN stages s_to ON h.to_stage_id = s_to.id
    WHERE s_from.funnel_type = 'follow_up'
      AND s_to.stage_number > s_from.stage_number
    GROUP BY h.from_stage_id
  )
  SELECT 
    fs.id AS stage_id,
    fs.stage_name,
    fs.stage_number,
    fs.funnel_type,
    COALESCE(se.entered_count, 0) AS leads_entered,
    COALESCE(sp.progressed_count, 0) AS leads_progressed,
    COALESCE(se.entered_count, 0) - COALESCE(sp.progressed_count, 0) AS leads_dropped,
    CASE 
      WHEN COALESCE(se.entered_count, 0) > 0 
      THEN ROUND(((COALESCE(se.entered_count, 0) - COALESCE(sp.progressed_count, 0))::NUMERIC / se.entered_count::NUMERIC) * 100, 2)
      ELSE 0
    END AS drop_rate,
    CASE 
      WHEN COALESCE(se.entered_count, 0) > 0 
      THEN ROUND((COALESCE(sp.progressed_count, 0)::NUMERIC / se.entered_count::NUMERIC) * 100, 2)
      ELSE 0
    END AS conversion_rate
  FROM follow_up_stages fs
  LEFT JOIN stage_entries se ON fs.id = se.stage_id
  LEFT JOIN stage_progressions sp ON fs.id = sp.stage_id
  ORDER BY fs.stage_number;
END;
$$;

COMMENT ON FUNCTION public.get_follow_up_funnel_flow IS 'Returns Follow-Up funnel flow metrics: leads entered, progressed, dropped, and conversion rates at each stage';