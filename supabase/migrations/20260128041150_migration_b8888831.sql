-- Create new RLS policies with super admin support
CREATE POLICY "Allow super admin and owners to view brands" ON brands
FOR SELECT
USING (
  user_id = auth.uid() 
  OR auth.uid() IN (SELECT id FROM profiles WHERE email = 'luhur@budikaryateknologi.com')
  OR user_id IS NULL
);