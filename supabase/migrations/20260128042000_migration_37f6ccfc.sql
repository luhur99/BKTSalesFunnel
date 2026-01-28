CREATE POLICY "Allow insert funnels for accessible brands" ON funnels
FOR INSERT
WITH CHECK (
  brand_id IN (
    SELECT id FROM brands 
    WHERE user_id IS NULL OR user_id = auth.uid()
  )
);