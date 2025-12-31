-- Create UPDATE policy for stage_scripts
CREATE POLICY "Allow authenticated users to update scripts"
ON stage_scripts
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);