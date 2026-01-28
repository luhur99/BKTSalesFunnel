CREATE POLICY "Allow super admin and brand owners to insert funnels" ON funnels
FOR INSERT
WITH CHECK (
  brand_id IN (
    SELECT id FROM brands 
    WHERE user_id = auth.uid() 
    OR auth.uid() IN (SELECT id FROM profiles WHERE email = 'luhur@budikaryateknologi.com')
  )
);