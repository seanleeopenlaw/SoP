-- ============================================================================
-- Remove strict array count constraints
-- Migration: 20250106000000_remove_array_count_constraints
-- Allow 0-5 values/strengths instead of exactly 5
-- ============================================================================

-- Remove the constraint that requires exactly 5 core values
ALTER TABLE core_values DROP CONSTRAINT IF EXISTS core_values_count_check;

-- Remove the constraint that requires exactly 5 character strengths
ALTER TABLE character_strengths DROP CONSTRAINT IF EXISTS character_strengths_count_check;

-- Add new constraints that allow 0 to 5 items
ALTER TABLE core_values
  ADD CONSTRAINT core_values_count_check
  CHECK (array_length(values, 1) IS NULL OR (array_length(values, 1) >= 0 AND array_length(values, 1) <= 5));

ALTER TABLE character_strengths
  ADD CONSTRAINT character_strengths_count_check
  CHECK (array_length(strengths, 1) IS NULL OR (array_length(strengths, 1) >= 0 AND array_length(strengths, 1) <= 5));
