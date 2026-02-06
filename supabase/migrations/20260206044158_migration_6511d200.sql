-- Step 3: Add new foreign key constraints with CASCADE delete
ALTER TABLE lead_stage_history
ADD CONSTRAINT lead_stage_history_from_stage_id_fkey
  FOREIGN KEY (from_stage_id)
  REFERENCES stages(id)
  ON DELETE CASCADE,
ADD CONSTRAINT lead_stage_history_to_stage_id_fkey
  FOREIGN KEY (to_stage_id)
  REFERENCES stages(id)
  ON DELETE CASCADE;