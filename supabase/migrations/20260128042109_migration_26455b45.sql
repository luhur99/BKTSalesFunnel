CREATE POLICY "Allow insert leads for accessible brands" ON leads
FOR INSERT
WITH CHECK (
  brand_id IN (
    SELECT id FROM brands 
    WHERE user_id IS NULL OR user_id = auth.uid()
  )
);