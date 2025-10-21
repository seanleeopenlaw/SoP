-- Add job_title column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
