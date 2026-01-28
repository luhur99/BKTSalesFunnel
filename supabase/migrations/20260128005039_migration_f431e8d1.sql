-- Fix brands.user_id constraint (make it nullable)
ALTER TABLE brands ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policy to allow NULL user_id
DROP POLICY IF EXISTS "Users can view their own brands" ON brands;
CREATE POLICY "Users can view their own brands" ON brands
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own brands" ON brands;
CREATE POLICY "Users can update their own brands" ON brands
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own brands" ON brands;
CREATE POLICY "Users can delete their own brands" ON brands
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);