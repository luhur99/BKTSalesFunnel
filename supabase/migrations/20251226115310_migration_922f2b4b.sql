-- Drop and recreate the function with proper type casting
DROP FUNCTION IF EXISTS get_bottleneck_analytics();

CREATE OR REPLACE FUNCTION get_bottleneck_analytics()
RETURNS TABLE(
    stage_id uuid,
    stage_name text,
    stage_number integer,
    funnel_type text,
    leads_entered bigint,
    leads_progressed bigint,
    leads_stuck bigint,
    conversion_rate numeric,
    avg_time_in_stage numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS stage_id,
        s.stage_name::TEXT,  -- CAST to TEXT explicitly
        s.stage_number,
        s.funnel_type::TEXT,
        COUNT(DISTINCT lsh_entered.lead_id) AS leads_entered,
        COUNT(DISTINCT lsh_progressed.lead_id) AS leads_progressed,
        COUNT(DISTINCT l.id) FILTER (WHERE l.current_stage_id = s.id) AS leads_stuck,
        CASE 
            WHEN COUNT(DISTINCT lsh_entered.lead_id) > 0 
            THEN ROUND((COUNT(DISTINCT lsh_progressed.lead_id)::NUMERIC / COUNT(DISTINCT lsh_entered.lead_id)::NUMERIC) * 100, 2)
            ELSE 0 
        END AS conversion_rate,
        COALESCE(
            ROUND(
                AVG(
                    EXTRACT(EPOCH FROM (
                        COALESCE(lsh_exit.moved_at, NOW()) - lsh_entered.moved_at
                    )) / 3600
                )::NUMERIC, 
                2
            ), 
            24
        ) AS avg_time_in_stage
    FROM 
        stages s
    LEFT JOIN 
        lead_stage_history lsh_entered ON lsh_entered.to_stage_id = s.id
    LEFT JOIN 
        lead_stage_history lsh_exit ON lsh_exit.from_stage_id = s.id AND lsh_exit.lead_id = lsh_entered.lead_id
    LEFT JOIN 
        lead_stage_history lsh_progressed ON lsh_progressed.from_stage_id = s.id
    LEFT JOIN 
        leads l ON l.current_stage_id = s.id AND l.status = 'active'
    GROUP BY 
        s.id, s.stage_name, s.stage_number, s.funnel_type
    ORDER BY 
        s.funnel_type, s.stage_number;
END;
$$;

COMMENT ON FUNCTION get_bottleneck_analytics() IS 'Calculate bottleneck analytics for all stages with proper type casting';