-- ================================================================
-- SOLUTION: Update RLS Policies untuk Public Access (Internal CRM)
-- ================================================================
-- This allows the CRM to function without authentication
-- Suitable for internal tools where all sales team members
-- should have full access to all leads
-- ================================================================

-- DROP existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON leads;

DROP POLICY IF EXISTS "Authenticated users can insert lead_activities" ON lead_activities;
DROP POLICY IF EXISTS "Authenticated users can update lead_activities" ON lead_activities;
DROP POLICY IF EXISTS "Authenticated users can delete lead_activities" ON lead_activities;

DROP POLICY IF EXISTS "Authenticated users can insert lead_stage_history" ON lead_stage_history;
DROP POLICY IF EXISTS "Authenticated users can update lead_stage_history" ON lead_stage_history;
DROP POLICY IF EXISTS "Authenticated users can delete lead_stage_history" ON lead_stage_history;

DROP POLICY IF EXISTS "Authenticated users can insert stage_scripts" ON stage_scripts;
DROP POLICY IF EXISTS "Authenticated users can update stage_scripts" ON stage_scripts;
DROP POLICY IF EXISTS "Authenticated users can delete stage_scripts" ON stage_scripts;

DROP POLICY IF EXISTS "Authenticated users can insert stages" ON stages;
DROP POLICY IF EXISTS "Authenticated users can update stages" ON stages;
DROP POLICY IF EXISTS "Authenticated users can delete stages" ON stages;

DROP POLICY IF EXISTS "Authenticated users can insert lead_sources" ON lead_sources;
DROP POLICY IF EXISTS "Authenticated users can update lead_sources" ON lead_sources;
DROP POLICY IF EXISTS "Authenticated users can delete lead_sources" ON lead_sources;

-- CREATE new public access policies for leads table
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update leads" ON leads FOR UPDATE USING (true);
CREATE POLICY "Public can delete leads" ON leads FOR DELETE USING (true);

-- CREATE new public access policies for lead_activities table
CREATE POLICY "Public can insert lead activities" ON lead_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update lead activities" ON lead_activities FOR UPDATE USING (true);
CREATE POLICY "Public can delete lead activities" ON lead_activities FOR DELETE USING (true);

-- CREATE new public access policies for lead_stage_history table
CREATE POLICY "Public can insert lead stage history" ON lead_stage_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update lead stage history" ON lead_stage_history FOR UPDATE USING (true);
CREATE POLICY "Public can delete lead stage history" ON lead_stage_history FOR DELETE USING (true);

-- CREATE new public access policies for stage_scripts table
CREATE POLICY "Public can insert stage scripts" ON stage_scripts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update stage scripts" ON stage_scripts FOR UPDATE USING (true);
CREATE POLICY "Public can delete stage scripts" ON stage_scripts FOR DELETE USING (true);

-- CREATE new public access policies for stages table
CREATE POLICY "Public can insert stages" ON stages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update stages" ON stages FOR UPDATE USING (true);
CREATE POLICY "Public can delete stages" ON stages FOR DELETE USING (true);

-- CREATE new public access policies for lead_sources table
CREATE POLICY "Public can insert lead sources" ON lead_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update lead sources" ON lead_sources FOR UPDATE USING (true);
CREATE POLICY "Public can delete lead sources" ON lead_sources FOR DELETE USING (true);

-- Add comment
COMMENT ON TABLE leads IS 'Leads table with public access policies for internal CRM use';
COMMENT ON TABLE lead_activities IS 'Lead activities with public access for team collaboration';
COMMENT ON TABLE lead_stage_history IS 'Stage history with public access for full transparency';
COMMENT ON TABLE stage_scripts IS 'Script templates with public access for all sales team';
COMMENT ON TABLE stages IS 'Funnel stages with public access for configuration';
COMMENT ON TABLE lead_sources IS 'Lead sources with public access for configuration';