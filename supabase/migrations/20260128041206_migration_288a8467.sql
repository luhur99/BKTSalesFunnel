CREATE POLICY "Allow super admin and owners to insert brands" ON brands
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  OR auth.uid() IN (SELECT id FROM profiles WHERE email = 'luhur@budikaryateknologi.com')
);