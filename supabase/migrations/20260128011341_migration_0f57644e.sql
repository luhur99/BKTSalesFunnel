-- Also update SELECT policy to allow viewing all brands for authenticated users
DROP POLICY IF EXISTS "Users can view their own brands" ON brands;

CREATE POLICY "Users can view their own brands" ON brands
  FOR SELECT
  USING (
    -- Allow if authenticated user matches user_id
    (auth.uid() = user_id) 
    OR 
    -- Allow if user_id is NULL (system brands visible to all)
    (user_id IS NULL)
    OR
    -- Allow authenticated users to see all brands (for multi-brand management)
    (auth.uid() IS NOT NULL)
  );

-- Verify
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'brands' AND cmd = 'SELECT';