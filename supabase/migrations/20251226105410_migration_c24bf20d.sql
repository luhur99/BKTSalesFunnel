-- Drop existing function
DROP FUNCTION IF EXISTS get_bottleneck_analytics();

-- Create Bottleneck Analytics Function with correct return structure
CREATE OR REPLACE FUNCTION get_bottleneck_analytics()
RETURNS TABLE (
    stage_id UUID,
    stage_name TEXT,
    stage_number INTEGER,
    funnel_type TEXT,
    leads_entered BIGINT,
    leads_progressed BIGINT,
    leads_stuck BIGINT,
    conversion_rate NUMERIC
)
AS $$
BEGIN
    RETURN QUERY
    WITH stage_metrics AS (
        SELECT 
            s.id as stage_id,
            s.stage_name,
            s.stage_number,
            s.funnel_type::TEXT as funnel_type,
            COUNT(DISTINCT lsh.lead_id) as leads_entered,
            COUNT(DISTINCT CASE 
                WHEN EXISTS (
                    SELECT 1 FROM lead_stage_history lsh2 
                    WHERE lsh2.lead_id = lsh.lead_id 
                    AND lsh2.stage_id != s.id 
                    AND lsh2.created_at > lsh.created_at
                )
                THEN lsh.lead_id 
            END) as leads_progressed
        FROM stages s
        LEFT JOIN lead_stage_history lsh ON s.id = lsh.stage_id
        GROUP BY s.id, s.stage_name, s.stage_number, s.funnel_type
    )
    SELECT 
        sm.stage_id,
        sm.stage_name,
        sm.stage_number,
        sm.funnel_type,
        sm.leads_entered,
        sm.leads_progressed,
        (sm.leads_entered - sm.leads_progressed) as leads_stuck,
        CASE 
            WHEN sm.leads_entered > 0 
            THEN ROUND((sm.leads_progressed::NUMERIC / sm.leads_entered::NUMERIC) * 100, 2)
            ELSE 0
        END as conversion_rate
    FROM stage_metrics sm
    ORDER BY sm.funnel_type, sm.stage_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_bottleneck_analytics() IS 'Calculate conversion rates and bottleneck metrics for each stage in both funnels';