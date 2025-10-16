-- Add email column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Update existing records with email from user_id (for testing)
-- You can manually update these later
