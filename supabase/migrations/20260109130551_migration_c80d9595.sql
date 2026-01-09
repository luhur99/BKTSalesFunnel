-- Fix: Add funnel_type to function signature and query
DROP FUNCTION IF EXISTS public.get_follow_up_funnel_flow();

CREATE OR REPLACE FUNCTION public.get_follow_up_funnel_flow()
RETURNS TABLE(
  stage_id uuid,
  stage_name text,
  stage_number integer,
  funnel_type text,  -- ADDED funnel_type
  leads_entered bigint,
  leads_progressed bigint,
  leads_dropped bigint,
  drop_rate numeric,
  conversion_rate numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH follow_up_stages AS (
    SELECT 
      s.id,
      s.stage_name,
      s.stage_number,
      s.funnel_type  -- ADDED funnel_type
    FROM stages s
    WHERE s.funnel_type = 'follow_up'
    ORDER BY s.stage_number
  ),
  stage_entries AS (
    SELECT 
      h.to_stage_id AS stage_id,
      COUNT(DISTINCT h.lead_id) AS entered_count
    FROM lead_stage_history h
    INNER JOIN stages s ON h.to_stage_id = s.id
    WHERE s.funnel_type = 'follow_up'
    GROUP BY h.to_stage_id
  ),
  stage_progressions AS (
    SELECT 
      h.from_stage_id AS stage_id,
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
    fs.funnel_type,  -- ADDED funnel_type to output
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