CREATE POLICY "Allow delete funnels of accessible brands" ON funnels
FOR DELETE
USING (
  brand_id IN (
    SELECT id FROM brands 
    WHERE user_id IS NULL OR user_id = auth.uid()
  )
);