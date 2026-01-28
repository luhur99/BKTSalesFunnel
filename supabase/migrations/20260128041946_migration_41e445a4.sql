CREATE POLICY "Allow access to funnels of public brands" ON funnels
FOR SELECT
USING (
  brand_id IN (
    SELECT id FROM brands 
    WHERE user_id IS NULL OR user_id = auth.uid()
  )
);