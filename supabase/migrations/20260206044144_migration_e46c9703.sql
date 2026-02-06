-- Step 2: Drop old foreign key constraints
ALTER TABLE lead_stage_history
DROP CONSTRAINT IF EXISTS lead_stage_history_from_stage_id_fkey,
DROP CONSTRAINT IF EXISTS lead_stage_history_to_stage_id_fkey;