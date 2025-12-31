-- Make name nullable (optional)
ALTER TABLE leads ALTER COLUMN name DROP NOT NULL;

-- Make phone mandatory (NOT NULL)
ALTER TABLE leads ALTER COLUMN phone SET NOT NULL;