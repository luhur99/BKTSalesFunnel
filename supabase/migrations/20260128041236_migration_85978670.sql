CREATE POLICY "Allow super admin and owners to delete brands" ON brands
FOR DELETE
USING (
  user_id = auth.uid() 
  OR auth.uid() IN (SELECT id FROM profiles WHERE email = 'luhur@budikaryateknologi.com')
);