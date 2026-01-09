-- Fix: Proper funnel flow calculation with correct lead counting
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
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH follow_up_stages AS (
    -- Get all follow-up stages
    SELECT 
      s.id,
      s.stage_name::TEXT,
      s.stage_number,
      s.funnel_type::TEXT
    FROM stages s
    WHERE s.funnel_type = 'follow_up'
  ),
  stage_entries AS (
    -- Count unique leads that entered each stage
    SELECT 
      fs.id AS stage_id,
      fs.stage_name,
      fs.stage_number,
      fs.funnel_type,
      COUNT(DISTINCT h.lead_id) AS entered
    FROM follow_up_stages fs
    LEFT JOIN lead_stage_history h ON h.to_stage_id = fs.id
    GROUP BY fs.id, fs.stage_name, fs.stage_number, fs.funnel_type
  ),
  stage_progressions AS (
    -- Count unique leads that progressed beyond each stage (within follow-up)
    SELECT 
      fs.id AS stage_id,
      COUNT(DISTINCT h.lead_id) AS progressed
    FROM follow_up_stages fs
    LEFT JOIN lead_stage_history h ON h.from_stage_id = fs.id
    LEFT JOIN stages s_to ON s_to.id = h.to_stage_id
    WHERE s_to.funnel_type = 'follow_up' 
      AND s_to.stage_number > fs.stage_number
    GROUP BY fs.id
  )
  SELECT 
    se.stage_id,
    se.stage_name,
    se.stage_number,
    se.funnel_type,
    COALESCE(se.entered, 0) AS leads_entered,
    COALESCE(sp.progressed, 0) AS leads_progressed,
    COALESCE(se.entered, 0) - COALESCE(sp.progressed, 0) AS leads_dropped,
    CASE 
      WHEN COALESCE(se.entered, 0) > 0 
      THEN ROUND((COALESCE(se.entered, 0) - COALESCE(sp.progressed, 0))::NUMERIC / se.entered * 100, 2)
      ELSE 0
    END AS drop_rate,
    CASE 
      WHEN COALESCE(se.entered, 0) > 0 
      THEN ROUND(COALESCE(sp.progressed, 0)::NUMERIC / se.entered * 100, 2)
      ELSE 0
    END AS conversion_rate
  FROM stage_entries se
  LEFT JOIN stage_progressions sp ON sp.stage_id = se.stage_id
  ORDER BY se.stage_number;
END;
$$;

COMMENT ON FUNCTION public.get_follow_up_funnel_flow IS 'Returns Follow-Up funnel flow metrics: leads entered, progressed, dropped, and conversion rates at each stage';