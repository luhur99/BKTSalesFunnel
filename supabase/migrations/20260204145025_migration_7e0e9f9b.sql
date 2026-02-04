-- Phase 1: Add funnel_id column to custom_labels table
-- NULL = global label (shared across all funnels)
-- NOT NULL = funnel-specific label
ALTER TABLE custom_labels 
ADD COLUMN IF NOT EXISTS funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_custom_labels_funnel_id ON custom_labels(funnel_id);

-- Update RLS policies to support funnel_id
DROP POLICY IF EXISTS "Anyone can view custom labels" ON custom_labels;
DROP POLICY IF EXISTS "Authenticated users can insert custom labels" ON custom_labels;
DROP POLICY IF EXISTS "Authenticated users can update custom labels" ON custom_labels;
DROP POLICY IF EXISTS "Authenticated users can delete custom labels" ON custom_labels;

-- New RLS policies with funnel_id support
CREATE POLICY "Users can view all labels (global + their funnels)" ON custom_labels
  FOR SELECT
  USING (
    funnel_id IS NULL OR -- Global labels
    funnel_id IN (
      SELECT f.id FROM funnels f
      JOIN brands b ON f.brand_id = b.id
      WHERE b.user_id = auth.uid() OR b.user_id IS NULL
    )
  );

CREATE POLICY "Users can insert labels" ON custom_labels
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      funnel_id IS NULL OR -- Can create global labels
      funnel_id IN (
        SELECT f.id FROM funnels f
        JOIN brands b ON f.brand_id = b.id
        WHERE b.user_id = auth.uid() OR b.user_id IS NULL
      )
    )
  );

CREATE POLICY "Users can update labels" ON custom_labels
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      funnel_id IS NULL OR
      funnel_id IN (
        SELECT f.id FROM funnels f
        JOIN brands b ON f.brand_id = b.id
        WHERE b.user_id = auth.uid() OR b.user_id IS NULL
      )
    )
  );

CREATE POLICY "Users can delete labels" ON custom_labels
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND (
      funnel_id IS NULL OR
      funnel_id IN (
        SELECT f.id FROM funnels f
        JOIN brands b ON f.brand_id = b.id
        WHERE b.user_id = auth.uid() OR b.user_id IS NULL
      )
    )
  );