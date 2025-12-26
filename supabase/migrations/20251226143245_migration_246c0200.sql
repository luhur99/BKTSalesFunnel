-- Drop existing function
DROP FUNCTION IF EXISTS get_bottleneck_analytics();

-- Create FIXED function with proper type casting
CREATE OR REPLACE FUNCTION get_bottleneck_analytics()
RETURNS TABLE (
    stage_id UUID,
    stage_name TEXT,
    stage_number INTEGER,
    funnel_type TEXT,
    leads_entered BIGINT,
    leads_progressed BIGINT,
    leads_stuck BIGINT,
    conversion_rate NUMERIC,
    avg_time_in_stage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH stage_metrics AS (
        SELECT 
            s.id as stage_id,
            s.stage_name::TEXT as stage_name,
            s.stage_number,
            s.funnel_type::TEXT as funnel_type,
            
            -- Leads entered: Count DISTINCT leads that entered this stage (from history OR currently here)
            COALESCE((
                SELECT COUNT(DISTINCT lsh.lead_id)
                FROM lead_stage_history lsh
                WHERE lsh.to_stage_id = s.id
            ), 0) + 
            COALESCE((
                SELECT COUNT(DISTINCT l.id)
                FROM leads l
                WHERE l.current_stage_id = s.id
                AND NOT EXISTS (
                    SELECT 1 FROM lead_stage_history lsh2
                    WHERE lsh2.lead_id = l.id AND lsh2.to_stage_id = s.id
                )
            ), 0) as total_entered,
            
            -- Leads progressed: Count DISTINCT leads that LEFT this stage (moved to another stage)
            COALESCE((
                SELECT COUNT(DISTINCT lsh.lead_id)
                FROM lead_stage_history lsh
                WHERE lsh.from_stage_id = s.id
            ), 0) as total_progressed,
            
            -- Leads stuck: Count leads CURRENTLY in this stage
            COALESCE((
                SELECT COUNT(*)
                FROM leads l
                WHERE l.current_stage_id = s.id
                AND l.status = 'active'
            ), 0) as total_stuck,
            
            -- Average time in stage (in hours)
            COALESCE((
                SELECT AVG(EXTRACT(EPOCH FROM (lsh_out.moved_at - lsh_in.moved_at)) / 3600)
                FROM lead_stage_history lsh_in
                LEFT JOIN lead_stage_history lsh_out 
                    ON lsh_out.lead_id = lsh_in.lead_id 
                    AND lsh_out.from_stage_id = s.id
                    AND lsh_out.moved_at > lsh_in.moved_at
                WHERE lsh_in.to_stage_id = s.id
                AND lsh_out.moved_at IS NOT NULL
            ), 24) as avg_hours
            
        FROM stages s
    )
    SELECT 
        sm.stage_id,
        sm.stage_name,
        sm.stage_number,
        sm.funnel_type,
        sm.total_entered as leads_entered,
        sm.total_progressed as leads_progressed,
        sm.total_stuck as leads_stuck,
        CASE 
            WHEN sm.total_entered > 0 THEN 
                ROUND((sm.total_progressed::NUMERIC / sm.total_entered::NUMERIC) * 100, 2)
            ELSE 0
        END as conversion_rate,
        ROUND(sm.avg_hours, 2) as avg_time_in_stage
    FROM stage_metrics sm
    ORDER BY sm.funnel_type, sm.stage_number;
END;
$$ LANGUAGE plpgsql;