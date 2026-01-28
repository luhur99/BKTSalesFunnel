CREATE POLICY "Allow delete leads of accessible brands" ON leads
FOR DELETE
USING (
  brand_id IN (
    SELECT id FROM brands 
    WHERE user_id IS NULL OR user_id = auth.uid()
  )
);