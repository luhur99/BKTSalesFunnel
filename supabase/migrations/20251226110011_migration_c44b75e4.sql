-- ================================================================
-- FIX #1: Enable RLS and Create Comprehensive Policies
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Lead Sources Policies (Public Read, Authenticated Write)
CREATE POLICY "Anyone can view lead sources" ON lead_sources FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert lead sources" ON lead_sources FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update lead sources" ON lead_sources FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete lead sources" ON lead_sources FOR DELETE USING (auth.uid() IS NOT NULL);

-- Stages Policies (Public Read, Authenticated Write)
CREATE POLICY "Anyone can view stages" ON stages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert stages" ON stages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update stages" ON stages FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete stages" ON stages FOR DELETE USING (auth.uid() IS NOT NULL);

-- Stage Scripts Policies (Public Read, Authenticated Write)
CREATE POLICY "Anyone can view stage scripts" ON stage_scripts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert stage scripts" ON stage_scripts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update stage scripts" ON stage_scripts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete stage scripts" ON stage_scripts FOR DELETE USING (auth.uid() IS NOT NULL);

-- Leads Policies (Public Read, Authenticated Write)
CREATE POLICY "Anyone can view leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert leads" ON leads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update leads" ON leads FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete leads" ON leads FOR DELETE USING (auth.uid() IS NOT NULL);

-- Lead Stage History Policies (Public Read, Authenticated Write)
CREATE POLICY "Anyone can view lead stage history" ON lead_stage_history FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert lead stage history" ON lead_stage_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update lead stage history" ON lead_stage_history FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete lead stage history" ON lead_stage_history FOR DELETE USING (auth.uid() IS NOT NULL);

-- Lead Activities Policies (Public Read, Authenticated Write)
CREATE POLICY "Anyone can view lead activities" ON lead_activities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert lead activities" ON lead_activities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update lead activities" ON lead_activities FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete lead activities" ON lead_activities FOR DELETE USING (auth.uid() IS NOT NULL);

-- ================================================================
-- FIX #2: Auto-Update Lead Status to LOST at Stage 10 Broadcast
-- ================================================================

CREATE OR REPLACE FUNCTION auto_mark_lead_lost()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if lead moved to stage 10 of broadcast funnel
    IF NEW.current_funnel = 'broadcast' AND EXISTS (
        SELECT 1 FROM stages 
        WHERE id = NEW.current_stage_id 
        AND funnel_type = 'broadcast' 
        AND stage_number = 10
    ) THEN
        NEW.status = 'lost';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_mark_lead_lost
    BEFORE UPDATE OF current_stage_id ON leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_mark_lead_lost();

-- ================================================================
-- FIX #3: Update Analytics Function with avg_time_in_stage
-- ================================================================

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
    SELECT 
        s.id AS stage_id,
        s.stage_name,
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
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_bottleneck_analytics() IS 'Calculate conversion rates, bottleneck metrics, and average time in stage for each stage in both funnels';