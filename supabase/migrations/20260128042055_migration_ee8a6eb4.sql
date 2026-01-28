CREATE POLICY "Allow access to leads of public brands" ON leads
FOR SELECT
USING (
  brand_id IN (
    SELECT id FROM brands 
    WHERE user_id IS NULL OR user_id = auth.uid()
  )
);