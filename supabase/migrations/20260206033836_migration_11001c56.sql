-- Step 1: Drop existing foreign key constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_current_stage_id_fkey;

-- Add new constraint with ON DELETE SET NULL
ALTER TABLE leads 
ADD CONSTRAINT leads_current_stage_id_fkey 
FOREIGN KEY (current_stage_id) 
REFERENCES stages(id) 
ON DELETE SET NULL;