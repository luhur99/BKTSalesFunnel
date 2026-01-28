CREATE POLICY "Allow super admin and brand owners to update funnels" ON funnels
FOR UPDATE
USING (
  brand_id IN (
    SELECT id FROM brands 
    WHERE user_id = auth.uid() 
    OR auth.uid() IN (SELECT id FROM profiles WHERE email = 'luhur@budikaryateknologi.com')
  )
);