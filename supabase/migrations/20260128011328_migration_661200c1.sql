-- Fix RLS policy for brands INSERT to allow creation without strict auth check
-- This allows development/testing while maintaining security for user_id when provided

DROP POLICY IF EXISTS "Users can create their own brands" ON brands;

CREATE POLICY "Users can create their own brands" ON brands
  FOR INSERT
  WITH CHECK (
    -- Allow if authenticated user matches user_id
    (auth.uid() = user_id) 
    OR 
    -- Allow if user_id is NULL (for system/default brands)
    (user_id IS NULL)
    OR
    -- Allow if user is authenticated and user_id will be set to their uid
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- Verify the new policy
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'brands' AND cmd = 'INSERT';