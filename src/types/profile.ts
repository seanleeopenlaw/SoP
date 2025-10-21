/**
 * Type Definitions for People Profile Web App
 *
 * This file contains all TypeScript interfaces and types for the profile system.
 * Aligned with component structure and database schema.
 */

// ============================================================================
// Base Types
// ============================================================================

export type TraitLevel = 'High' | 'Average' | 'Low';
export type ChronotypeType = 'Lion' | 'Bear' | 'Wolf' | 'Dolphin';

// ============================================================================
// User Profile
// ============================================================================

export interface UserProfile {
  id: string;
  userId: string;  // Foreign key to authentication user
  email?: string | null;
  name: string;
  team?: string | null;
  jobTitle?: string | null;
  birthday?: Date | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileInput {
  name: string;
  team?: string;
  birthday?: Date;
  avatarUrl?: string;
}

// ============================================================================
// Core Values & Character Strengths
// ============================================================================

export interface CoreValues {
  id: string;
  profileId: string;
  values: string[];  // Array of exactly 5 values
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterStrengths {
  id: string;
  profileId: string;
  strengths: string[];  // Array of exactly 5 strengths
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Chronotype
// ============================================================================

export interface Chronotype {
  id: string;
  profileId: string;
  types: ChronotypeType[];  // Multiple selection allowed
  primaryType?: ChronotypeType | null;  // Optional primary chronotype
  createdAt: Date;
  updatedAt: Date;
}

export interface ChronotypeDetail {
  type: ChronotypeType;
  description: string;
  imageUrl: string;
}

// ============================================================================
// Big Five Personality Traits
// ============================================================================

export interface Subtrait {
  name: string;
  level: TraitLevel;
  score?: number; // Optional 0-999 score
}

export interface BigFiveGroup {
  name: string;
  color: string;
  level: TraitLevel;
  score?: number; // Optional 0-999 score
  subtraits: Subtrait[];
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  team: string;
  jobTitle?: string | null;
  birthday: string | null;
  coreValues?: { values: string[] };
  characterStrengths?: { strengths: string[] };
  chronotype?: {
    types: string[];
    primaryType: string;
  };
  bigFiveData?: BigFiveGroup[];
  goals?: {
    period: string;
    professionalGoals?: string | null;
    personalGoals?: string | null;
  };
}

// Database storage format (using JSONB)
export interface BigFiveProfileData {
  id: string;
  profileId: string;

  // Stored as JSONB in database
  opennessData: BigFiveGroup;
  conscientiousnessData: BigFiveGroup;
  extraversionData: BigFiveGroup;
  agreeablenessData: BigFiveGroup;
  neuroticismData: BigFiveGroup;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Goals
// ============================================================================

export interface Goals {
  id: string;
  profileId: string;
  period: string;
  professionalGoals?: string | null;
  personalGoals?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Complete Profile (Aggregated)
// ============================================================================

export interface CompleteProfile {
  userProfile: UserProfile;
  coreValues?: CoreValues;
  characterStrengths?: CharacterStrengths;
  chronotype?: Chronotype;
  bigFive?: BigFiveProfileData;
  goals?: Goals;
}

// ============================================================================
// Input Types for Creating/Updating
// ============================================================================

export interface CreateProfileInput {
  userId: string;
  name: string;
  team?: string;
  birthday?: Date;
  avatarUrl?: string;
}

export interface UpdateProfileInput {
  name?: string;
  team?: string;
  birthday?: Date;
  avatarUrl?: string;
}

export interface CoreValuesInput {
  profileId: string;
  values: string[];  // Must be exactly 5 items
}

export interface CharacterStrengthsInput {
  profileId: string;
  strengths: string[];  // Must be exactly 5 items
}

export interface ChronotypeInput {
  profileId: string;
  types: ChronotypeType[];
  primaryType?: ChronotypeType;
}

export interface BigFiveInput {
  profileId: string;
  openness: BigFiveGroup;
  conscientiousness: BigFiveGroup;
  extraversion: BigFiveGroup;
  agreeableness: BigFiveGroup;
  neuroticism: BigFiveGroup;
}

export interface GoalsInput {
  profileId: string;
  period: string;
  professionalGoals?: string;
  personalGoals?: string;
}

// ============================================================================
// Query Types & Filters
// ============================================================================

export interface ProfileFilter {
  userId?: string;
  team?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface ComparisonQuery {
  profileIds: string[];
  compareBy: 'coreValues' | 'bigFive' | 'chronotype' | 'all';
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface TeamAnalytics {
  teamName: string;
  totalMembers: number;
  commonValues: string[];
  averageBigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  chronotypeDistribution: {
    [key in ChronotypeType]: number;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export type ProfileSection = 'userProfile' | 'coreValues' | 'characterStrengths' | 'chronotype' | 'bigFive';

export interface ProfileCompleteness {
  profileId: string;
  completedSections: ProfileSection[];
  completionPercentage: number;
  missingSections: ProfileSection[];
}

// ============================================================================
// Component Props Types (aligned with existing components)
// ============================================================================

export interface TextListInputProps {
  label: string;
  values: string[];
  onChange: (updated: string[]) => void;
}

export interface BigFiveSelectorProps {
  data: BigFiveGroup[];
  onChange: (data: BigFiveGroup[]) => void;
  isReadOnly?: boolean;
}

export interface ChronotypeAnimalModalProps {
  type: ChronotypeType;
  description: string;
  imageUrl: string;
  onClose: () => void;
}

export interface ResizableTraitModalProps {
  title: string;
  description: string;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
}
