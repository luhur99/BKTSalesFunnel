-- Completely rewrite function with proper lead journey tracking
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
    -- Get all follow-up stages
    SELECT 
      s.id,
      s.stage_name::TEXT,
      s.stage_number,
      s.funnel_type::TEXT
    FROM stages s
    WHERE s.funnel_type = 'follow_up'
  ),
  lead_journeys AS (
    -- Track each lead's journey through follow-up stages
    SELECT DISTINCT
      h.lead_id,
      h.to_stage_id,
      s.stage_number,
      -- Check if lead ever moved to a higher stage
      EXISTS (
        SELECT 1 
        FROM lead_stage_history h2
        JOIN stages s2 ON s2.id = h2.to_stage_id
        WHERE h2.lead_id = h.lead_id
          AND s2.funnel_type = 'follow_up'
          AND s2.stage_number > s.stage_number
          AND h2.moved_at > h.moved_at
      ) AS progressed_further
    FROM lead_stage_history h
    JOIN stages s ON s.id = h.to_stage_id
    WHERE h.to_funnel = 'follow_up'
  )
  SELECT 
    fs.id::TEXT AS stage_id,
    fs.stage_name,
    fs.stage_number,
    fs.funnel_type,
    -- Count unique leads that reached this stage
    COALESCE(COUNT(DISTINCT lj.lead_id), 0)::BIGINT AS leads_entered,
    -- Count unique leads that progressed to higher stages
    COALESCE(COUNT(DISTINCT CASE WHEN lj.progressed_further THEN lj.lead_id END), 0)::BIGINT AS leads_progressed,
    -- Calculate dropped (stayed at this stage or moved to broadcast)
    COALESCE(COUNT(DISTINCT CASE WHEN NOT lj.progressed_further THEN lj.lead_id END), 0)::BIGINT AS leads_dropped,
    -- Calculate drop rate
    CASE 
      WHEN COUNT(DISTINCT lj.lead_id) > 0 THEN
        ROUND(
          (COUNT(DISTINCT CASE WHEN NOT lj.progressed_further THEN lj.lead_id END)::NUMERIC / 
           COUNT(DISTINCT lj.lead_id)::NUMERIC * 100)
        , 2)
      ELSE 0
    END AS drop_rate,
    -- Calculate conversion rate
    CASE 
      WHEN COUNT(DISTINCT lj.lead_id) > 0 THEN
        ROUND(
          (COUNT(DISTINCT CASE WHEN lj.progressed_further THEN lj.lead_id END)::NUMERIC / 
           COUNT(DISTINCT lj.lead_id)::NUMERIC * 100)
        , 2)
      ELSE 0
    END AS conversion_rate
  FROM follow_up_stages fs
  LEFT JOIN lead_journeys lj ON lj.to_stage_id = fs.id
  GROUP BY fs.id, fs.stage_name, fs.stage_number, fs.funnel_type
  ORDER BY fs.stage_number;
END;
$$;

COMMENT ON FUNCTION public.get_follow_up_funnel_flow() IS 'Accurate Follow-Up funnel flow metrics using lead journey analysis: tracks unique leads through stages';