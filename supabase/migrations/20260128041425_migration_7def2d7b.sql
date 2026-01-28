CREATE POLICY "Allow super admin and brand owners to view leads" ON leads
FOR SELECT
USING (
  brand_id IN (
    SELECT id FROM brands 
    WHERE user_id = auth.uid() 
    OR auth.uid() IN (SELECT id FROM profiles WHERE email = 'luhur@budikaryateknologi.com')
    OR user_id IS NULL
  )
);