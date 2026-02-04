-- Step 1: Add funnel_id column to stages table (nullable for global templates)
ALTER TABLE stages ADD COLUMN funnel_id uuid NULL;

-- Step 2: Add foreign key constraint
ALTER TABLE stages 
ADD CONSTRAINT stages_funnel_id_fkey 
FOREIGN KEY (funnel_id) REFERENCES funnels(id) ON DELETE CASCADE;

-- Step 3: Drop old unique constraint
ALTER TABLE stages DROP CONSTRAINT IF EXISTS stages_funnel_type_stage_number_key;

-- Step 4: Add new unique constraint (allows same stage_number for different funnels)
ALTER TABLE stages 
ADD CONSTRAINT stages_funnel_funnel_type_stage_number_unique 
UNIQUE (funnel_id, funnel_type, stage_number);

-- Step 5: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stages_funnel_id ON stages(funnel_id);

-- Step 6: Add comment to explain the column
COMMENT ON COLUMN stages.funnel_id IS 'NULL = global template stage (shared), NOT NULL = funnel-specific stage';