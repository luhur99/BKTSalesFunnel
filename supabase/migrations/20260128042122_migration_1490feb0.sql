CREATE POLICY "Allow update leads of accessible brands" ON leads
FOR UPDATE
USING (
  brand_id IN (
    SELECT id FROM brands 
    WHERE user_id IS NULL OR user_id = auth.uid()
  )
);