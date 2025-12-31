-- Create RLS policy for stage_scripts if missing
ALTER TABLE stage_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to stage_scripts" 
ON stage_scripts
FOR SELECT
USING (true);