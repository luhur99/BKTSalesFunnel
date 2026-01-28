CREATE POLICY "Allow super admin and owners to update brands" ON brands
FOR UPDATE
USING (
  user_id = auth.uid() 
  OR auth.uid() IN (SELECT id FROM profiles WHERE email = 'luhur@budikaryateknologi.com')
);