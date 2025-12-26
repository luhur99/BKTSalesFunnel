-- Drop existing function first
DROP FUNCTION IF EXISTS get_bottleneck_analytics();

-- Recreate with fixed column references
CREATE OR REPLACE FUNCTION get_bottleneck_analytics()
RETURNS TABLE (
    funnel_type text,
    stage_number integer,
    stage_name text,
    leads_entered bigint,
    leads_progressed bigint,
    leads_stuck bigint,
    conversion_rate numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.funnel_type::text,
        s.stage_number,
        s.stage_name,
        COUNT(DISTINCT lsh.lead_id) as leads_entered,
        COUNT(DISTINCT CASE 
            WHEN lsh.to_stage_id IN (
                SELECT id FROM stages 
                WHERE stages.funnel_type = s.funnel_type 
                AND stages.stage_number > s.stage_number
            ) 
            THEN lsh.lead_id 
        END) as leads_progressed,
        COUNT(DISTINCT lsh.lead_id) - COUNT(DISTINCT CASE 
            WHEN lsh.to_stage_id IN (
                SELECT id FROM stages 
                WHERE stages.funnel_type = s.funnel_type 
                AND stages.stage_number > s.stage_number
            ) 
            THEN lsh.lead_id 
        END) as leads_stuck,
        CASE 
            WHEN COUNT(DISTINCT lsh.lead_id) > 0 
            THEN ROUND(
                (COUNT(DISTINCT CASE 
                    WHEN lsh.to_stage_id IN (
                        SELECT id FROM stages 
                        WHERE stages.funnel_type = s.funnel_type 
                        AND stages.stage_number > s.stage_number
                    ) 
                    THEN lsh.lead_id 
                END)::numeric / COUNT(DISTINCT lsh.lead_id)::numeric) * 100, 
                2
            )
            ELSE 0 
        END as conversion_rate
    FROM stages s
    LEFT JOIN lead_stage_history lsh ON lsh.to_stage_id = s.id
    GROUP BY s.funnel_type, s.stage_number, s.stage_name
    ORDER BY s.funnel_type, s.stage_number;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment
COMMENT ON FUNCTION get_bottleneck_analytics() IS 'Calculate conversion rates and bottleneck metrics for each stage in both funnels';