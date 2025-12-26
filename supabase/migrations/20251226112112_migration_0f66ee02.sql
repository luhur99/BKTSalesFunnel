-- Add custom_labels column to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS custom_labels TEXT[] DEFAULT '{}';

COMMENT ON COLUMN leads.custom_labels IS 'Array of custom label tags for categorizing leads (e.g., VIP, Hot Lead, Follow Up Urgent)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'leads'
AND column_name = 'custom_labels';