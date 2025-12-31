-- Create DELETE policy for stage_scripts
CREATE POLICY "Allow authenticated users to delete scripts"
ON stage_scripts
FOR DELETE
TO authenticated
USING (true);