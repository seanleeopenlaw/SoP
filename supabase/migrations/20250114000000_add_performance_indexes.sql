-- Performance Optimization: Add indexes for common queries
-- Migration: 20250114000000_add_performance_indexes.sql

-- Index for user_profiles.name (used for alphabetical sorting in Team Directory)
CREATE INDEX IF NOT EXISTS idx_user_profiles_name ON user_profiles(name);

-- Index for user_profiles.email (used for lookups and filtering)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Index for user_profiles.created_at (used for chronological sorting)
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Composite index for filtering admin users and sorting by name
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_name ON user_profiles(email, name);

-- Indexes for foreign keys in related tables (improve join performance)
CREATE INDEX IF NOT EXISTS idx_core_values_profile_id ON core_values(profile_id);
CREATE INDEX IF NOT EXISTS idx_character_strengths_profile_id ON character_strengths(profile_id);
CREATE INDEX IF NOT EXISTS idx_chronotype_profile_id ON chronotypes(profile_id);
CREATE INDEX IF NOT EXISTS idx_big_five_profile_id ON big_five_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_goals_profile_id ON goals(profile_id);

-- Add comments for documentation
COMMENT ON INDEX idx_user_profiles_name IS 'Improves performance for alphabetical sorting in Team Directory';
COMMENT ON INDEX idx_user_profiles_email IS 'Improves performance for email lookups and admin filtering';
COMMENT ON INDEX idx_user_profiles_created_at IS 'Improves performance for chronological sorting';
COMMENT ON INDEX idx_user_profiles_email_name IS 'Composite index for admin filtering + name sorting';
