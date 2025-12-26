-- Drop and recreate fixed function
DROP FUNCTION IF EXISTS get_bottleneck_analytics();

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
            s.id,
            s.stage_name::TEXT,
            s.stage_number,
            s.funnel_type::TEXT,
            
            -- Leads entered: count unique leads that either:
            -- 1. Moved TO this stage (from history)
            -- 2. Currently AT this stage (never moved from it yet)
            (
                SELECT COUNT(DISTINCT lead_id)
                FROM (
                    -- Leads that moved TO this stage
                    SELECT DISTINCT lsh.lead_id
                    FROM lead_stage_history lsh
                    WHERE lsh.to_stage_id = s.id
                    
                    UNION
                    
                    -- Leads currently AT this stage (includes initial placement)
                    SELECT DISTINCT l.id
                    FROM leads l
                    WHERE l.current_stage_id = s.id
                ) all_entries
            ) as leads_entered,
            
            -- Leads progressed: count unique leads that moved FROM this stage
            (
                SELECT COUNT(DISTINCT lsh.lead_id)
                FROM lead_stage_history lsh
                WHERE lsh.from_stage_id = s.id
            ) as leads_progressed,
            
            -- Leads stuck: count leads currently IN this stage
            (
                SELECT COUNT(*)
                FROM leads l
                WHERE l.current_stage_id = s.id
                  AND l.status = 'active'
            ) as leads_stuck,
            
            -- Average time in stage (in days)
            (
                SELECT COALESCE(
                    AVG(
                        EXTRACT(EPOCH FROM (
                            COALESCE(
                                (SELECT MIN(lsh2.moved_at) 
                                 FROM lead_stage_history lsh2 
                                 WHERE lsh2.lead_id = lsh.lead_id 
                                   AND lsh2.from_stage_id = s.id),
                                NOW()
                            ) - lsh.moved_at
                        )) / 86400
                    ), 
                    0
                )
                FROM lead_stage_history lsh
                WHERE lsh.to_stage_id = s.id
            ) as avg_time
            
        FROM stages s
        WHERE s.funnel_type IN ('follow_up', 'broadcast')
    )
    SELECT 
        sm.id,
        sm.stage_name,
        sm.stage_number,
        sm.funnel_type,
        sm.leads_entered,
        sm.leads_progressed,
        sm.leads_stuck,
        CASE 
            WHEN sm.leads_entered > 0 THEN 
                ROUND((sm.leads_progressed::NUMERIC / sm.leads_entered::NUMERIC) * 100, 2)
            ELSE 0
        END as conversion_rate,
        ROUND(sm.avg_time, 2) as avg_time_in_stage
    FROM stage_metrics sm
    ORDER BY sm.funnel_type, sm.stage_number;
END;
$$ LANGUAGE plpgsql;