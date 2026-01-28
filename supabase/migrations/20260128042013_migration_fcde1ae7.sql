CREATE POLICY "Allow update funnels of accessible brands" ON funnels
FOR UPDATE
USING (
  brand_id IN (
    SELECT id FROM brands 
    WHERE user_id IS NULL OR user_id = auth.uid()
  )
);