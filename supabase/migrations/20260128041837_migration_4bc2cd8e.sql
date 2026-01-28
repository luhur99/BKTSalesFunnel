-- Create new RLS policies: Allow access to NULL user_id brands OR owned brands
CREATE POLICY "Allow access to public and owned brands" ON brands
FOR SELECT
USING (
  user_id IS NULL 
  OR user_id = auth.uid()
);