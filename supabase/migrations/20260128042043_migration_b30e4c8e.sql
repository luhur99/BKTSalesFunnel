-- Update leads RLS policies
DROP POLICY IF EXISTS "Users can view leads of their brands" ON leads;
DROP POLICY IF EXISTS "Users can insert leads of their brands" ON leads;
DROP POLICY IF EXISTS "Users can update leads of their brands" ON leads;
DROP POLICY IF EXISTS "Users can delete leads of their brands" ON leads;