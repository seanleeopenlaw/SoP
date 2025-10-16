# Database Schema Documentation

## Overview

This document explains the database schema design for the People Profile Web App, including architecture decisions, usage instructions, and integration guidelines.

## Files Created

1. **TypeScript Types**: `/src/types/profile.ts`
2. **SQL Migration**: `/db/migrations/001_initial_schema.sql`
3. **Prisma Schema**: `/prisma/schema.prisma`
4. **Seed Data**: `/db/seed-data.json`

## Architecture Decisions

### 1. Data Storage Strategy

**PostgreSQL with JSONB for Big Five Traits**
- **Why**: Big Five personality data has a complex nested structure (5 groups × 6 subtraits × 3 properties)
- **Benefit**: JSONB allows flexible querying while maintaining data integrity
- **Alternative Considered**: Fully normalized tables (30 subtrait records per profile)
- **Decision**: JSONB provides better performance for reading complete profiles and easier schema evolution

### 2. Separate Tables vs. Single Table

**Separate tables for each profile section**
- **Why**: Each section (Core Values, Chronotype, Big Five) has different update frequencies and access patterns
- **Benefit**:
  - Easier to implement partial profile updates
  - Better query performance when loading individual sections
  - Clearer data ownership and RLS policies
- **Trade-off**: Requires joins for complete profile retrieval (mitigated by indexed foreign keys)

### 3. Array Storage for Core Values & Character Strengths

**Using PostgreSQL Arrays**
- **Why**: Exactly 5 items, simple string values, no complex queries needed
- **Benefit**: Simpler than separate tables, enforced count constraint
- **Validation**: Database-level CHECK constraint ensures exactly 5 values

### 4. ENUM for Chronotype

**Custom PostgreSQL ENUM type**
- **Why**: Limited set of values (Lion, Bear, Wolf, Dolphin), type safety
- **Benefit**: Database-level validation, better query performance
- **Multiple Selection**: Array of ENUMs allows flexibility

### 5. Row Level Security (RLS)

**Comprehensive RLS policies**
- **Why**: Multi-tenant security, user data isolation
- **Implementation**: Users can only access/modify their own profiles
- **Benefit**: Security at database level, not just application level

### 6. Profile Versioning

**Optional version history table**
- **Why**: Track changes over time, useful for analytics
- **Implementation**: JSONB changes field stores what changed
- **Use Case**: "How has this person's profile evolved?"

## Database Schema

### Core Tables

#### 1. user_profiles
```sql
- id (UUID, PK)
- user_id (UUID, FK to auth.users, UNIQUE)
- name (VARCHAR, NOT NULL)
- team (VARCHAR, NULLABLE)
- birthday (DATE, NULLABLE)
- avatar_url (TEXT, NULLABLE)
- timestamps (created_at, updated_at)
```

#### 2. core_values
```sql
- id (UUID, PK)
- profile_id (UUID, FK, UNIQUE)
- values (TEXT[], exactly 5 items)
- timestamps
```

#### 3. character_strengths
```sql
- id (UUID, PK)
- profile_id (UUID, FK, UNIQUE)
- strengths (TEXT[], exactly 5 items)
- timestamps
```

#### 4. chronotypes
```sql
- id (UUID, PK)
- profile_id (UUID, FK, UNIQUE)
- types (chronotype_animal[], at least 1)
- primary_type (chronotype_animal, NULLABLE)
- timestamps
```

#### 5. big_five_profiles
```sql
- id (UUID, PK)
- profile_id (UUID, FK, UNIQUE)
- openness_data (JSONB)
- conscientiousness_data (JSONB)
- extraversion_data (JSONB)
- agreeableness_data (JSONB)
- neuroticism_data (JSONB)
- timestamps
```

### JSONB Structure for Big Five

Each Big Five dimension is stored as:
```json
{
  "groupName": "Openness",
  "overallLevel": "High",
  "overallScore": 82,
  "subtraits": [
    { "name": "Imagination", "level": "High", "score": 85 },
    { "name": "Artistic Interests", "level": "High", "score": 88 },
    // ... 4 more subtraits
  ]
}
```

## Setup Instructions

### Option 1: Using Supabase (Recommended)

1. **Create a Supabase project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Initialize project
   supabase init
   ```

2. **Run the migration**
   ```bash
   # Copy the migration file
   cp db/migrations/001_initial_schema.sql supabase/migrations/

   # Apply migration
   supabase db push
   ```

3. **Set up environment variables**
   ```bash
   # .env.local
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

### Option 2: Using Prisma

1. **Install Prisma**
   ```bash
   npm install prisma @prisma/client
   npm install -D prisma
   ```

2. **Set up environment**
   ```bash
   # .env
   DATABASE_URL="postgresql://user:password@localhost:5432/peopleproject"
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Push schema to database**
   ```bash
   npx prisma db push
   ```

5. **Seed the database** (optional)
   ```bash
   # Create prisma/seed.ts
   npx prisma db seed
   ```

## Usage Examples

### TypeScript Integration

```typescript
import {
  UserProfile,
  CoreValues,
  BigFiveProfile,
  CompleteProfile
} from '@/types/profile';

// Type-safe profile creation
const createProfile = async (data: CreateProfileInput) => {
  // Your implementation
};

// Type-safe queries
const getCompleteProfile = async (userId: string): Promise<CompleteProfile> => {
  // Fetch all profile sections
};
```

### Prisma Queries

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get complete profile
const profile = await prisma.userProfile.findUnique({
  where: { userId: 'auth-user-001' },
  include: {
    coreValues: true,
    characterStrengths: true,
    chronotype: true,
    bigFiveProfile: true,
  },
});

// Update Big Five data
await prisma.bigFiveProfile.update({
  where: { profileId: 'profile-id' },
  data: {
    opennessData: {
      groupName: 'Openness',
      overallLevel: 'High',
      overallScore: 85,
      subtraits: [/* ... */],
    },
  },
});
```

### Direct SQL Queries

```sql
-- Get complete profile with all sections
SELECT
  up.*,
  cv.values as core_values,
  cs.strengths as character_strengths,
  ch.types as chronotypes,
  bf.openness_data,
  bf.conscientiousness_data,
  bf.extraversion_data,
  bf.agreeableness_data,
  bf.neuroticism_data
FROM user_profiles up
LEFT JOIN core_values cv ON up.id = cv.profile_id
LEFT JOIN character_strengths cs ON up.id = cs.profile_id
LEFT JOIN chronotypes ch ON up.id = ch.profile_id
LEFT JOIN big_five_profiles bf ON up.id = bf.profile_id
WHERE up.user_id = 'auth-user-001';

-- Get team analytics
SELECT get_team_analytics('Product Design');

-- Get profile completeness
SELECT get_profile_completeness('550e8400-e29b-41d4-a716-446655440001');
```

## Indexing Strategy

### Primary Indexes
- All foreign keys are indexed for JOIN performance
- `user_id` has unique index for authentication lookups
- `team` indexed for team-based queries

### JSONB Indexes
- GIN indexes on all Big Five JSONB columns
- Enables fast queries like: `openness_data->>'overallScore' > 80`

### Array Indexes
- GIN index on `chronotypes.types` for analytics

## Security Considerations

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own profile data
- Policies enforce user_id matching via `auth.uid()`

### Data Validation
- CHECK constraints ensure data integrity
- Array length constraints for Core Values and Character Strengths
- ENUM types for Chronotype and Trait Levels

## Migration Strategy

### Adding New Fields
```sql
-- Example: Add new field to user_profiles
ALTER TABLE user_profiles
ADD COLUMN location VARCHAR(255);
```

### Modifying JSONB Structure
- JSONB is schema-less, but maintain TypeScript types
- Update both TypeScript types and validation logic
- Consider migration script for existing data

## Performance Optimization

### Querying Complete Profiles
```sql
-- Use this query pattern for best performance
WITH profile_data AS (
  SELECT id FROM user_profiles WHERE user_id = $1
)
SELECT
  (SELECT row_to_json(user_profiles.*) FROM user_profiles WHERE id = (SELECT id FROM profile_data)) as profile,
  (SELECT row_to_json(core_values.*) FROM core_values WHERE profile_id = (SELECT id FROM profile_data)) as core_values,
  -- ... etc
```

### Bulk Operations
- Use `COPY` for bulk inserts
- Batch updates with CTEs
- Disable triggers temporarily for large migrations

## Testing with Seed Data

The `seed-data.json` file contains 3 complete profiles:
1. **Sarah Chen** - Product Design, High Openness, Bear chronotype
2. **Marcus Johnson** - Engineering, High Conscientiousness, Lion chronotype
3. **Priya Patel** - Product Design, High Openness & Extraversion, Wolf chronotype

### Loading Seed Data

#### Option 1: Prisma Seed Script
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import seedData from '../db/seed-data.json';

const prisma = new PrismaClient();

async function main() {
  for (const profile of seedData.profiles) {
    await prisma.userProfile.create({
      data: {
        ...profile.userProfile,
        coreValues: profile.coreValues ? { create: profile.coreValues } : undefined,
        // ... etc
      },
    });
  }
}

main();
```

#### Option 2: Direct SQL
```sql
-- Insert from seed data
INSERT INTO user_profiles (id, user_id, name, team, birthday, avatar_url)
VALUES ('550e8400-e29b-41d4-a716-446655440001', 'auth-user-001', 'Sarah Chen', 'Product Design', '1992-03-15', 'https://...');
```

## Analytics Queries

### Team Distribution by Chronotype
```sql
SELECT
  up.team,
  ch.types[1] as primary_chronotype,
  COUNT(*) as count
FROM user_profiles up
JOIN chronotypes ch ON up.id = ch.profile_id
GROUP BY up.team, ch.types[1];
```

### Average Big Five Scores by Team
```sql
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

## Future Enhancements

1. **Full-text search** on Core Values and Character Strengths
2. **Materialized views** for team analytics
3. **Partitioning** by team for large organizations
4. **Soft deletes** with archived_at timestamp
5. **Profile comparison** table for saved comparisons

## Troubleshooting

### Common Issues

**Issue**: Prisma can't find database
```bash
# Solution: Check DATABASE_URL in .env
npx prisma db pull
```

**Issue**: RLS blocking queries
```bash
# Solution: Ensure auth.uid() is set in your queries
# Or disable RLS for testing:
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

**Issue**: JSONB validation errors
```typescript
// Solution: Use TypeScript types and validate before insert
import { BigFiveGroup } from '@/types/profile';

const validateBigFiveGroup = (data: any): data is BigFiveGroup => {
  return data.subtraits?.length === 6;
};
```

## Support

For questions or issues with the schema:
1. Check this documentation
2. Review the TypeScript types in `/src/types/profile.ts`
3. Examine seed data examples in `/db/seed-data.json`
4. Consult the SQL migration for exact constraints
