-- ============================================================================
-- People Profile Web App - Initial Database Schema
-- Migration: 001_initial_schema
-- Database: PostgreSQL (Supabase)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- User Profiles Table
-- ============================================================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,  -- Foreign key to auth.users
  name VARCHAR(255) NOT NULL,
  team VARCHAR(255),
  birthday DATE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  CONSTRAINT user_profiles_name_check CHECK (char_length(name) >= 1)
);

-- Index for faster lookups by user_id
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_team ON user_profiles(team);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- ============================================================================
-- Core Values Table
-- ============================================================================

CREATE TABLE core_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE,
  values TEXT[] NOT NULL,  -- Array of exactly 5 values
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraint
  CONSTRAINT fk_core_values_profile
    FOREIGN KEY (profile_id)
    REFERENCES user_profiles(id)
    ON DELETE CASCADE,

  -- Ensure exactly 5 values
  CONSTRAINT core_values_count_check CHECK (array_length(values, 1) = 5)
);

-- Index for faster profile lookups
CREATE INDEX idx_core_values_profile_id ON core_values(profile_id);

-- ============================================================================
-- Character Strengths Table
-- ============================================================================

CREATE TABLE character_strengths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE,
  strengths TEXT[] NOT NULL,  -- Array of exactly 5 strengths
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraint
  CONSTRAINT fk_character_strengths_profile
    FOREIGN KEY (profile_id)
    REFERENCES user_profiles(id)
    ON DELETE CASCADE,

  -- Ensure exactly 5 strengths
  CONSTRAINT character_strengths_count_check CHECK (array_length(strengths, 1) = 5)
);

-- Index for faster profile lookups
CREATE INDEX idx_character_strengths_profile_id ON character_strengths(profile_id);

-- ============================================================================
-- Chronotype Table
-- ============================================================================

-- Custom type for chronotype animals
CREATE TYPE chronotype_animal AS ENUM ('Lion', 'Bear', 'Wolf', 'Dolphin');

CREATE TABLE chronotypes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE,
  types chronotype_animal[] NOT NULL,  -- Multiple selection allowed
  primary_type chronotype_animal,  -- Optional primary chronotype
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraint
  CONSTRAINT fk_chronotypes_profile
    FOREIGN KEY (profile_id)
    REFERENCES user_profiles(id)
    ON DELETE CASCADE,

  -- Ensure at least one type is selected
  CONSTRAINT chronotypes_types_check CHECK (array_length(types, 1) >= 1),

  -- Ensure primary_type is in types array if set
  CONSTRAINT chronotypes_primary_in_types_check
    CHECK (primary_type IS NULL OR primary_type = ANY(types))
);

-- Index for faster profile lookups
CREATE INDEX idx_chronotypes_profile_id ON chronotypes(profile_id);
-- Index for analytics by type
CREATE INDEX idx_chronotypes_types ON chronotypes USING GIN(types);

-- ============================================================================
-- Big Five Personality Profiles Table
-- ============================================================================

CREATE TABLE big_five_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE,

  -- Each Big Five dimension stored as JSONB
  -- Structure: { groupName, overallLevel, overallScore, subtraits[] }
  openness_data JSONB NOT NULL,
  conscientiousness_data JSONB NOT NULL,
  extraversion_data JSONB NOT NULL,
  agreeableness_data JSONB NOT NULL,
  neuroticism_data JSONB NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraint
  CONSTRAINT fk_big_five_profiles_profile
    FOREIGN KEY (profile_id)
    REFERENCES user_profiles(id)
    ON DELETE CASCADE
);

-- Index for faster profile lookups
CREATE INDEX idx_big_five_profiles_profile_id ON big_five_profiles(profile_id);

-- GIN indexes for JSONB columns (for analytics queries)
CREATE INDEX idx_big_five_openness ON big_five_profiles USING GIN(openness_data);
CREATE INDEX idx_big_five_conscientiousness ON big_five_profiles USING GIN(conscientiousness_data);
CREATE INDEX idx_big_five_extraversion ON big_five_profiles USING GIN(extraversion_data);
CREATE INDEX idx_big_five_agreeableness ON big_five_profiles USING GIN(agreeableness_data);
CREATE INDEX idx_big_five_neuroticism ON big_five_profiles USING GIN(neuroticism_data);

-- ============================================================================
-- Profile Versions Table (Optional - for tracking changes)
-- ============================================================================

CREATE TABLE profile_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  changes JSONB NOT NULL,  -- Store what changed
  changed_by UUID,  -- User who made the change
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraint
  CONSTRAINT fk_profile_versions_profile
    FOREIGN KEY (profile_id)
    REFERENCES user_profiles(id)
    ON DELETE CASCADE,

  -- Unique version per profile
  CONSTRAINT unique_profile_version UNIQUE (profile_id, version_number)
);

-- Index for faster profile version lookups
CREATE INDEX idx_profile_versions_profile_id ON profile_versions(profile_id, version_number DESC);

-- ============================================================================
-- Functions & Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_core_values_updated_at
  BEFORE UPDATE ON core_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_strengths_updated_at
  BEFORE UPDATE ON character_strengths
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chronotypes_updated_at
  BEFORE UPDATE ON chronotypes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_big_five_profiles_updated_at
  BEFORE UPDATE ON big_five_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_strengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronotypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE big_five_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_versions ENABLE ROW LEVEL SECURITY;

-- User can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- User can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- User can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Core Values policies
CREATE POLICY "Users can view own core values"
  ON core_values FOR SELECT
  USING (profile_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own core values"
  ON core_values FOR ALL
  USING (profile_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Character Strengths policies
CREATE POLICY "Users can view own character strengths"
  ON character_strengths FOR SELECT
  USING (profile_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own character strengths"
  ON character_strengths FOR ALL
  USING (profile_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Chronotype policies
CREATE POLICY "Users can view own chronotype"
  ON chronotypes FOR SELECT
  USING (profile_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own chronotype"
  ON chronotypes FOR ALL
  USING (profile_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Big Five policies
CREATE POLICY "Users can view own big five"
  ON big_five_profiles FOR SELECT
  USING (profile_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own big five"
  ON big_five_profiles FOR ALL
  USING (profile_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Profile Versions policies
CREATE POLICY "Users can view own profile versions"
  ON profile_versions FOR SELECT
  USING (profile_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- ============================================================================
-- Utility Functions for Analytics
-- ============================================================================

-- Function to get team analytics
CREATE OR REPLACE FUNCTION get_team_analytics(team_name TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'teamName', team_name,
    'totalMembers', COUNT(*),
    'averageBigFive', json_build_object(
      'openness', AVG((bf.openness_data->>'overallScore')::numeric),
      'conscientiousness', AVG((bf.conscientiousness_data->>'overallScore')::numeric),
      'extraversion', AVG((bf.extraversion_data->>'overallScore')::numeric),
      'agreeableness', AVG((bf.agreeableness_data->>'overallScore')::numeric),
      'neuroticism', AVG((bf.neuroticism_data->>'overallScore')::numeric)
    )
  )
  INTO result
  FROM user_profiles up
  LEFT JOIN big_five_profiles bf ON up.id = bf.profile_id
  WHERE up.team = team_name;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get profile completeness
CREATE OR REPLACE FUNCTION get_profile_completeness(p_profile_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  completed_count INTEGER := 0;
  total_count INTEGER := 5;
BEGIN
  -- Count completed sections
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = p_profile_id) THEN
    completed_count := completed_count + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM core_values WHERE profile_id = p_profile_id) THEN
    completed_count := completed_count + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM character_strengths WHERE profile_id = p_profile_id) THEN
    completed_count := completed_count + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM chronotypes WHERE profile_id = p_profile_id) THEN
    completed_count := completed_count + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM big_five_profiles WHERE profile_id = p_profile_id) THEN
    completed_count := completed_count + 1;
  END IF;

  SELECT json_build_object(
    'profileId', p_profile_id,
    'completionPercentage', (completed_count::float / total_count * 100)::integer,
    'completedSections', completed_count,
    'totalSections', total_count
  )
  INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE user_profiles IS 'Core user profile information';
COMMENT ON TABLE core_values IS 'User core values (5 items)';
COMMENT ON TABLE character_strengths IS 'User character strengths (5 items)';
COMMENT ON TABLE chronotypes IS 'User chronotype preferences';
COMMENT ON TABLE big_five_profiles IS 'Big Five personality trait data stored as JSONB';
COMMENT ON TABLE profile_versions IS 'Version history for profile changes';

COMMENT ON COLUMN big_five_profiles.openness_data IS 'JSONB: {groupName, overallLevel, overallScore, subtraits[6]}';
COMMENT ON COLUMN big_five_profiles.conscientiousness_data IS 'JSONB: {groupName, overallLevel, overallScore, subtraits[6]}';
COMMENT ON COLUMN big_five_profiles.extraversion_data IS 'JSONB: {groupName, overallLevel, overallScore, subtraits[6]}';
COMMENT ON COLUMN big_five_profiles.agreeableness_data IS 'JSONB: {groupName, overallLevel, overallScore, subtraits[6]}';
COMMENT ON COLUMN big_five_profiles.neuroticism_data IS 'JSONB: {groupName, overallLevel, overallScore, subtraits[6]}';
