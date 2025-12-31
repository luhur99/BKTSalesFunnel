-- Create SELECT policy for stage_scripts (allow all authenticated users to read)
CREATE POLICY "Allow authenticated users to read scripts"
ON stage_scripts
FOR SELECT
TO authenticated
USING (true);