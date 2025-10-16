# Database Schema Design Decisions

## Executive Summary

This document explains the key architectural decisions made while designing the People Profile database schema, aligned with the existing component structure.

## Design Philosophy

### 1. Component-First Approach
- Schema designed to match existing UI components
- TypeScript types mirror both database and component props
- Zero impedance mismatch between frontend and backend

### 2. PostgreSQL Native Features
- Leverages JSONB for complex nested data
- Uses arrays for simple lists
- ENUMs for type safety
- Row Level Security (RLS) for multi-tenancy

### 3. Scalability & Performance
- Indexed for common query patterns
- Optimized for profile reads (most common operation)
- Supports analytics queries on Big Five data
- Version tracking for audit trails

## Key Design Decisions

### Decision 1: JSONB vs Normalized Tables for Big Five

**Context**: Big Five has 5 groups × 6 subtraits × 3 properties = 90+ data points per profile

**Options Considered**:

#### Option A: Fully Normalized (Rejected)
```sql
CREATE TABLE big_five_groups (id, profile_id, group_name, overall_score);
CREATE TABLE big_five_subtraits (id, group_id, name, level, score);
```

**Pros**:
- Purist relational design
- Individual subtrait updates are atomic

**Cons**:
- 30+ rows per profile (5 groups + 30 subtraits)
- Requires complex JOINs to reconstruct complete profile
- Slower reads (most common operation)
- More complex queries for analytics

#### Option B: JSONB (CHOSEN)
```sql
CREATE TABLE big_five_profiles (
  id UUID,
  profile_id UUID,
  openness_data JSONB,
  conscientiousness_data JSONB,
  ...
);
```

**Pros**:
- ✅ Fast profile reads (single row)
- ✅ Matches component structure exactly
- ✅ GIN indexes enable analytics queries
- ✅ Schema flexibility for future enhancements
- ✅ Atomic updates per dimension

**Cons**:
- Less normalized (acceptable trade-off)
- Requires JSONB query syntax

**Why JSONB Won**:
1. Profile reads >> profile writes (80/20 rule)
2. Big Five data is always consumed as a complete group
3. Components need full group data, not individual traits
4. JSONB indexing supports all required analytics

---

### Decision 2: Separate Tables vs Single Profile Table

**Context**: Should all profile data live in one table or separate tables?

**Option A: Single Monolithic Table (Rejected)**
```sql
CREATE TABLE profiles (
  id UUID,
  name TEXT,
  team TEXT,
  core_values TEXT[],
  character_strengths TEXT[],
  chronotype_types TEXT[],
  big_five_openness JSONB,
  big_five_conscientiousness JSONB,
  ...
);
```

**Pros**:
- Single table to manage
- No JOINs needed

**Cons**:
- Sparse columns (not all sections always filled)
- Harder to implement partial updates
- Row-level locking affects entire profile
- Unclear data ownership

**Option B: Separate Tables per Section (CHOSEN)**
```sql
CREATE TABLE user_profiles (...);
CREATE TABLE core_values (profile_id FK, ...);
CREATE TABLE character_strengths (profile_id FK, ...);
CREATE TABLE chronotypes (profile_id FK, ...);
CREATE TABLE big_five_profiles (profile_id FK, ...);
```

**Pros**:
- ✅ Clear separation of concerns
- ✅ Partial profile updates don't lock everything
- ✅ Easy to add/remove sections
- ✅ Supports progressive profile completion
- ✅ Better RLS policy granularity

**Cons**:
- Requires JOINs for complete profile
- More tables to manage

**Why Separate Tables Won**:
1. Matches component architecture (separate components per section)
2. Users complete profiles progressively, not all at once
3. Different sections have different update frequencies
4. Easier to add new sections in the future
5. Better cache invalidation strategies

---

### Decision 3: Array Storage for Core Values

**Context**: Core Values and Character Strengths are exactly 5 text items each

**Option A: Separate Items Table (Rejected)**
```sql
CREATE TABLE core_values (
  id UUID,
  profile_id UUID,
  value_text TEXT,
  position INT
);
```

**Pros**:
- Fully normalized
- Can query individual values

**Cons**:
- 5 rows per profile
- Over-engineering for simple data
- Requires GROUP BY to reconstruct

**Option B: JSONB Array (Rejected)**
```sql
CREATE TABLE core_values (
  id UUID,
  profile_id UUID,
  values JSONB
);
```

**Pros**:
- Flexible
- Can store metadata per value

**Cons**:
- Overkill for simple strings
- JSONB overhead for primitive types

**Option C: PostgreSQL Array (CHOSEN)**
```sql
CREATE TABLE core_values (
  id UUID,
  profile_id UUID,
  values TEXT[] CHECK (array_length(values, 1) = 5)
);
```

**Pros**:
- ✅ Native PostgreSQL array type
- ✅ Simple and efficient
- ✅ CHECK constraint enforces exactly 5 items
- ✅ Direct mapping to TypeScript string[]
- ✅ Easy to query and update

**Cons**:
- Requires knowledge of array syntax

**Why Arrays Won**:
1. Perfect match for component prop type (string[])
2. Database-level validation (exactly 5 items)
3. Most efficient storage for ordered lists
4. Simple to query and update

---

### Decision 4: ENUM for Chronotype

**Context**: Chronotype values are limited to 4 animals: Lion, Bear, Wolf, Dolphin

**Option A: Plain Text (Rejected)**
```sql
chronotype_types TEXT[]
```

**Pros**:
- Simple
- Flexible

**Cons**:
- No validation
- Typos possible
- No database-level type safety

**Option B: Reference Table (Rejected)**
```sql
CREATE TABLE chronotype_types (id, name);
CREATE TABLE user_chronotypes (profile_id, type_id);
```

**Pros**:
- Fully normalized
- Can add metadata per type

**Cons**:
- Over-engineering for 4 static values
- Requires JOINs

**Option C: PostgreSQL ENUM (CHOSEN)**
```sql
CREATE TYPE chronotype_animal AS ENUM ('Lion', 'Bear', 'Wolf', 'Dolphin');
CREATE TABLE chronotypes (
  id UUID,
  profile_id UUID,
  types chronotype_animal[]
);
```

**Pros**:
- ✅ Database-level validation
- ✅ Type safety
- ✅ Efficient storage (internally stored as integers)
- ✅ Self-documenting schema
- ✅ Supports multiple selection via array

**Cons**:
- Harder to add new values (requires ALTER TYPE)
- Not as flexible as reference table

**Why ENUM Won**:
1. Set of values is fixed and unlikely to change
2. Type safety prevents invalid data
3. Better performance than reference table
4. Clear schema documentation
5. Prisma and TypeScript generate matching types

---

### Decision 5: Row Level Security (RLS)

**Context**: Multi-tenant application where users should only access their own data

**Option A: Application-Level Security (Rejected)**
```typescript
// Check user_id in every query
const profile = await db.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
```

**Pros**:
- Application has full control
- Easier to debug

**Cons**:
- Security depends on application code
- Easy to forget checks
- No defense-in-depth
- Doesn't protect against SQL injection

**Option B: Row Level Security (CHOSEN)**
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);
```

**Pros**:
- ✅ Security at database level
- ✅ Impossible to bypass (even with SQL injection)
- ✅ Defense-in-depth
- ✅ Works with any client (Prisma, SQL, etc.)
- ✅ Supabase native feature

**Cons**:
- More complex initial setup
- Can be confusing to debug

**Why RLS Won**:
1. Production-ready security from day one
2. Supabase makes RLS easy
3. Prevents entire class of security bugs
4. Industry best practice for multi-tenant apps
5. No performance penalty with proper indexing

---

### Decision 6: Profile Versioning

**Context**: Should we track changes to profiles over time?

**Option A: No Versioning (Simple but limited)**
- Just update records in place
- No history tracking

**Option B: Full Audit Log (Too complex)**
- Log every field change
- Complex query to reconstruct history

**Option C: Snapshot Versioning (CHOSEN)**
```sql
CREATE TABLE profile_versions (
  id UUID,
  profile_id UUID,
  version_number INT,
  changes JSONB,
  changed_by UUID,
  created_at TIMESTAMP
);
```

**Pros**:
- ✅ Lightweight history tracking
- ✅ JSONB allows flexible change tracking
- ✅ Easy to query "what changed"
- ✅ Optional (not required for basic functionality)
- ✅ Supports rollback if needed

**Cons**:
- Requires application logic to create versions
- Storage overhead for high-change profiles

**Why Versioning Won**:
1. Valuable for analytics ("How do profiles evolve?")
2. Supports audit requirements
3. Enables "undo" functionality
4. Low implementation cost
5. Optional table (can be ignored initially)

---

## Data Type Choices

### TypeScript → PostgreSQL Mapping

| TypeScript Type | PostgreSQL Type | Reasoning |
|----------------|-----------------|-----------|
| `string` | `VARCHAR(255)` | Name, team fields |
| `string` | `TEXT` | Long text (avatar URLs) |
| `string[]` | `TEXT[]` | Core values, strengths |
| `Date` | `TIMESTAMPTZ` | All timestamps (timezone-aware) |
| `Date` | `DATE` | Birthday (no time component) |
| `ChronotypeType` | `chronotype_animal` ENUM | Type safety |
| `TraitLevel` | `trait_level` ENUM | Type safety |
| `BigFiveGroup` | `JSONB` | Complex nested object |
| `string` (UUID) | `UUID` | IDs (native UUID type) |

---

## Index Strategy

### Primary Indexes
```sql
-- Foreign keys (auto-indexed in many DBs, explicit for safety)
CREATE INDEX idx_core_values_profile_id ON core_values(profile_id);
CREATE INDEX idx_character_strengths_profile_id ON character_strengths(profile_id);
CREATE INDEX idx_chronotypes_profile_id ON chronotypes(profile_id);
CREATE INDEX idx_big_five_profiles_profile_id ON big_five_profiles(profile_id);

-- Authentication lookup
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Team-based queries
CREATE INDEX idx_user_profiles_team ON user_profiles(team);

-- Recent profiles
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at DESC);
```

### JSONB Indexes (GIN)
```sql
-- Enable fast queries on Big Five data
CREATE INDEX idx_big_five_openness ON big_five_profiles USING GIN(openness_data);
-- Supports queries like:
-- WHERE openness_data->>'overallScore' > '80'
-- WHERE openness_data @> '{"overallLevel": "High"}'
```

### Array Indexes (GIN)
```sql
-- Enable chronotype analytics
CREATE INDEX idx_chronotypes_types ON chronotypes USING GIN(types);
-- Supports queries like:
-- WHERE 'Lion' = ANY(types)
-- WHERE types @> ARRAY['Lion', 'Bear']::chronotype_animal[]
```

**Index Philosophy**:
1. Index foreign keys (JOIN performance)
2. Index filter columns (WHERE clauses)
3. Index sort columns (ORDER BY)
4. Don't over-index (write performance penalty)

---

## Query Patterns

### Most Common: Get Complete Profile
```sql
-- Optimized with foreign key indexes
SELECT
  up.*,
  cv.values as core_values,
  cs.strengths as character_strengths,
  ch.types as chronotypes,
  bf.*
FROM user_profiles up
LEFT JOIN core_values cv ON up.id = cv.profile_id
LEFT JOIN character_strengths cs ON up.id = cs.profile_id
LEFT JOIN chronotypes ch ON up.id = ch.profile_id
LEFT JOIN big_five_profiles bf ON up.id = bf.profile_id
WHERE up.user_id = $1;
```

### Analytics: Team Big Five Averages
```sql
-- Leverages JSONB GIN indexes
SELECT
  up.team,
  AVG((bf.openness_data->>'overallScore')::numeric) as avg_openness,
  AVG((bf.conscientiousness_data->>'overallScore')::numeric) as avg_conscientiousness,
  AVG((bf.extraversion_data->>'overallScore')::numeric) as avg_extraversion,
  AVG((bf.agreeableness_data->>'overallScore')::numeric) as avg_agreeableness,
  AVG((bf.neuroticism_data->>'overallScore')::numeric) as avg_neuroticism
FROM user_profiles up
JOIN big_five_profiles bf ON up.id = bf.profile_id
GROUP BY up.team;
```

### Search: Find Profiles by Core Value
```sql
-- Leverages GIN index on array
SELECT up.*
FROM user_profiles up
JOIN core_values cv ON up.id = cv.profile_id
WHERE 'Innovation' = ANY(cv.values);
```

---

## Future Enhancements

### 1. Full-Text Search
```sql
-- Add tsvector column for search
ALTER TABLE user_profiles ADD COLUMN search_vector tsvector;
CREATE INDEX idx_user_profiles_search ON user_profiles USING GIN(search_vector);

-- Update trigger to maintain search index
-- Search across name, team, core values, character strengths
```

### 2. Materialized Views for Analytics
```sql
-- Pre-computed team analytics
CREATE MATERIALIZED VIEW team_analytics AS
SELECT
  team,
  COUNT(*) as member_count,
  AVG((bf.openness_data->>'overallScore')::numeric) as avg_openness,
  ...
FROM user_profiles up
JOIN big_five_profiles bf ON up.id = bf.profile_id
GROUP BY team;

-- Refresh strategy: nightly or on-demand
```

### 3. Partitioning for Large Datasets
```sql
-- If you reach 100K+ profiles, consider partitioning by team
CREATE TABLE user_profiles (
  ...
) PARTITION BY LIST (team);

CREATE TABLE user_profiles_engineering PARTITION OF user_profiles
  FOR VALUES IN ('Engineering');
```

### 4. Soft Deletes
```sql
-- Add archived_at column
ALTER TABLE user_profiles ADD COLUMN archived_at TIMESTAMPTZ;

-- Update RLS policies to exclude archived
CREATE POLICY "Users can view own active profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id AND archived_at IS NULL);
```

---

## Schema Evolution Strategy

### Adding New Fields (Safe)
```sql
-- Add nullable columns
ALTER TABLE user_profiles ADD COLUMN location VARCHAR(255);

-- Update TypeScript types
export interface UserProfile {
  ...
  location?: string | null;
}
```

### Adding New Sections (Safe)
```sql
-- Create new table
CREATE TABLE work_preferences (
  id UUID PRIMARY KEY,
  profile_id UUID UNIQUE REFERENCES user_profiles(id),
  remote_preference TEXT,
  ...
);

-- Add to Prisma schema
model WorkPreferences {
  id UUID
  profileId UUID @unique
  profile UserProfile @relation(...)
}
```

### Modifying JSONB Structure (Careful)
```sql
-- Write migration to transform existing data
UPDATE big_five_profiles
SET openness_data = openness_data || '{"newField": "defaultValue"}'::jsonb;

-- Update TypeScript types FIRST
-- Deploy migration
-- Update application code
```

### Changing ENUMs (Breaking)
```sql
-- PostgreSQL ENUM limitations: can't remove values, can't rename
-- Strategy: Create new ENUM, migrate data, drop old

-- Step 1: Create new type
CREATE TYPE chronotype_animal_v2 AS ENUM ('Lion', 'Bear', 'Wolf', 'Dolphin', 'Owl');

-- Step 2: Add new column
ALTER TABLE chronotypes ADD COLUMN types_v2 chronotype_animal_v2[];

-- Step 3: Migrate data
UPDATE chronotypes SET types_v2 = types::text[]::chronotype_animal_v2[];

-- Step 4: Drop old, rename new
ALTER TABLE chronotypes DROP COLUMN types;
ALTER TABLE chronotypes RENAME COLUMN types_v2 TO types;
```

---

## Performance Benchmarks (Expected)

Based on the schema design, expected performance characteristics:

| Operation | Records | Expected Time | Notes |
|-----------|---------|---------------|-------|
| Get single complete profile | 1 | <10ms | 4 JOINs, all indexed |
| Get 50 profiles (team view) | 50 | <50ms | Indexed team column |
| Update Big Five group | 1 | <5ms | Single JSONB update |
| Team analytics query | 1000 | <100ms | GIN indexes on JSONB |
| Full-text search | 10000 | <200ms | With tsvector index |

**Assumptions**:
- PostgreSQL 14+
- SSD storage
- Proper indexes maintained
- Connection pooling enabled
- No table scans

---

## Comparison with Alternatives

### vs MongoDB

| PostgreSQL (Chosen) | MongoDB |
|---------------------|---------|
| ✅ ACID guarantees | ⚠️ Eventual consistency |
| ✅ Complex JOINs | ⚠️ Requires data duplication |
| ✅ Strong typing (ENUM) | ⚠️ Loose typing |
| ✅ RLS built-in | ⚠️ Application-level security |
| ✅ JSONB for flexibility | ✅ Native document storage |
| ⚠️ Schema migrations | ✅ Schemaless |

**Why PostgreSQL**: Strong typing + flexibility via JSONB = best of both worlds

### vs MySQL

| PostgreSQL (Chosen) | MySQL |
|---------------------|-------|
| ✅ JSONB with indexing | ⚠️ JSON (no GIN indexes) |
| ✅ Array types | ❌ No native arrays |
| ✅ ENUM types | ✅ ENUM types |
| ✅ Full-text search | ✅ Full-text search |
| ✅ Better concurrency | ⚠️ Table-level locking |

**Why PostgreSQL**: JSONB and array support critical for this schema

---

## Conclusion

This schema design prioritizes:
1. **Component alignment** - Schema matches UI components
2. **Type safety** - ENUMs, constraints, and RLS
3. **Performance** - Optimized for common queries
4. **Scalability** - Supports analytics and growth
5. **Flexibility** - JSONB for complex data

The result is a production-ready, scalable database schema that seamlessly integrates with the existing React component architecture.
