-- Create INSERT policy for stage_scripts
CREATE POLICY "Allow authenticated users to create scripts"
ON stage_scripts
FOR INSERT
TO authenticated
WITH CHECK (true);