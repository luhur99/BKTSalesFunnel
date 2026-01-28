CREATE POLICY "Allow update public and owned brands" ON brands
FOR UPDATE
USING (
  user_id IS NULL 
  OR user_id = auth.uid()
);