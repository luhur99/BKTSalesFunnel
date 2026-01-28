-- Update funnels RLS policies
DROP POLICY IF EXISTS "Users can view funnels of their brands" ON funnels;
DROP POLICY IF EXISTS "Users can insert funnels to their brands" ON funnels;
DROP POLICY IF EXISTS "Users can update funnels of their brands" ON funnels;
DROP POLICY IF EXISTS "Users can delete funnels of their brands" ON funnels;