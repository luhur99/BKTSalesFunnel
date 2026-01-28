CREATE POLICY "Allow insert brands for authenticated users" ON brands
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  OR user_id IS NULL
);