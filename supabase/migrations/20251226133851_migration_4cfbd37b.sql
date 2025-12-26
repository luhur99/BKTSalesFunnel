-- Create custom_labels table
CREATE TABLE IF NOT EXISTS custom_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE custom_labels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read, authenticated write)
CREATE POLICY "Anyone can view custom labels" 
    ON custom_labels FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can insert custom labels" 
    ON custom_labels FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update custom labels" 
    ON custom_labels FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete custom labels" 
    ON custom_labels FOR DELETE 
    USING (auth.uid() IS NOT NULL);

-- Add unique constraint on name
CREATE UNIQUE INDEX IF NOT EXISTS custom_labels_name_unique 
    ON custom_labels(LOWER(name));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS custom_labels_created_at_idx 
    ON custom_labels(created_at DESC);

-- Insert default labels
INSERT INTO custom_labels (name, color, icon) VALUES
    ('VIP', 'purple', 'star'),
    ('Hot Lead', 'red', 'zap'),
    ('Follow Up Urgent', 'orange', 'flag')
ON CONFLICT DO NOTHING;