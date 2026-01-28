CREATE POLICY "Allow delete owned brands" ON brands
FOR DELETE
USING (
  user_id = auth.uid()
);