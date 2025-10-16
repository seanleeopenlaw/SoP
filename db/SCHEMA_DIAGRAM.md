# Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         auth.users                              │
│                     (Supabase Auth)                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ user_id (FK)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      user_profiles                              │
├─────────────────────────────────────────────────────────────────┤
│ • id (PK, UUID)                                                 │
│ • user_id (FK, UUID, UNIQUE) ────> auth.users                  │
│ • name (VARCHAR, NOT NULL)                                      │
│ • team (VARCHAR, NULLABLE)                                      │
│ • birthday (DATE, NULLABLE)                                     │
│ • avatar_url (TEXT, NULLABLE)                                   │
│ • created_at (TIMESTAMPTZ)                                      │
│ • updated_at (TIMESTAMPTZ)                                      │
└───────┬──────────┬──────────┬──────────┬──────────┬─────────────┘
        │          │          │          │          │
        │          │          │          │          │
        ▼          ▼          ▼          ▼          ▼
┌───────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────────┐
│core_values│ │character │ │chronotype│ │big_five_    │ │profile_      │
│           │ │_strengths│ │s         │ │profiles     │ │versions      │
├───────────┤ ├──────────┤ ├──────────┤ ├─────────────┤ ├──────────────┤
│id (PK)    │ │id (PK)   │ │id (PK)   │ │id (PK)      │ │id (PK)       │
│profile_id │ │profile_id│ │profile_id│ │profile_id   │ │profile_id    │
│(FK,UNIQUE)│ │(FK,UNIQ) │ │(FK,UNIQ) │ │(FK, UNIQUE) │ │(FK)          │
│           │ │          │ │          │ │             │ │version_num   │
│values     │ │strengths │ │types[]   │ │openness_data│ │changes       │
│TEXT[5]    │ │TEXT[5]   │ │ENUM[]    │ │JSONB        │ │JSONB         │
│           │ │          │ │primary_  │ │conscious_   │ │changed_by    │
│created_at │ │created_at│ │type ENUM │ │data JSONB   │ │created_at    │
│updated_at │ │updated_at│ │created_at│ │extraversion │ │              │
└───────────┘ └──────────┘ │updated_at│ │data JSONB   │ └──────────────┘
                           └──────────┘ │agreeable_   │
                                        │data JSONB   │
                                        │neuroticism_ │
                                        │data JSONB   │
                                        │created_at   │
                                        │updated_at   │
                                        └─────────────┘
```

## Relationship Cardinality

```
auth.users (1) ──────────────── (1) user_profiles
                                     │
                                     ├── (1:0..1) core_values
                                     ├── (1:0..1) character_strengths
                                     ├── (1:0..1) chronotypes
                                     ├── (1:0..1) big_five_profiles
                                     └── (1:many) profile_versions
```

**Key**:
- `(1)` = Exactly one
- `(0..1)` = Zero or one (optional)
- `(many)` = Zero or more

## Data Flow Diagram

```
┌──────────────┐
│     User     │
│  (Frontend)  │
└──────┬───────┘
       │
       │ HTTP Request
       │
       ▼
┌──────────────┐
│  Next.js API │
│   Routes     │
└──────┬───────┘
       │
       │ Prisma Client / Supabase Client
       │
       ▼
┌─────────────────────────────────────┐
│         Database Layer              │
│  (Row Level Security Enforced)      │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │RLS Policies │  │ Constraints │  │
│  │auth.uid() = │  │ CHECK       │  │
│  │user_id      │  │ UNIQUE      │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │  Triggers   │  │  Indexes    │  │
│  │updated_at   │  │ B-Tree      │  │
│  │             │  │ GIN (JSONB) │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
└─────────────────────────────────────┘
       │
       │ Query Results
       │
       ▼
┌──────────────┐
│  TypeScript  │
│    Types     │
│  (src/types/ │
│  profile.ts) │
└──────────────┘
```

## JSONB Structure (Big Five)

```
big_five_profiles
├── id
├── profile_id
├── openness_data ──────┐
├── conscientiousness_data  } Same structure
├── extraversion_data       } for each
├── agreeableness_data      } of the
├── neuroticism_data ────┘  } Big Five
├── created_at
└── updated_at

Structure of each *_data JSONB field:
{
  "groupName": "Openness",           ← Trait level enum
  "overallLevel": "High",            ← High/Average/Low
  "overallScore": 82,                ← 0-100
  "subtraits": [                     ← Array of 6 subtraits
    {
      "name": "Imagination",
      "level": "High",               ← High/Average/Low
      "score": 85                    ← 0-100
    },
    {
      "name": "Artistic Interests",
      "level": "High",
      "score": 88
    },
    // ... 4 more subtraits (total 6)
  ]
}
```

## Index Strategy Visualization

```
┌────────────────────────────────────────────────────────────┐
│                    Query Performance                       │
└────────────────────────────────────────────────────────────┘

Most Common Query: Get Complete Profile by user_id
┌─────────────────────────────────────────────────────────┐
│ SELECT * FROM user_profiles                             │
│ WHERE user_id = 'xxx'  ◄─── B-Tree Index (FAST: 5ms)   │
└─────────────────────────────────────────────────────────┘
         │
         │ JOIN (indexed FK)
         ▼
┌─────────────────────────────────────────────────────────┐
│ LEFT JOIN core_values cv                                │
│ ON up.id = cv.profile_id  ◄─── B-Tree Index (FAST)     │
└─────────────────────────────────────────────────────────┘

Analytics Query: Team Average Openness
┌─────────────────────────────────────────────────────────┐
│ SELECT AVG(                                             │
│   (openness_data->>'overallScore')::numeric             │
│ )                                                       │
│ FROM big_five_profiles                                  │
│ WHERE openness_data->>'overallLevel' = 'High'           │
│       ▲                                                 │
│       └─── GIN Index on JSONB (FAST: 50ms)             │
└─────────────────────────────────────────────────────────┘

Search Query: Find by Chronotype
┌─────────────────────────────────────────────────────────┐
│ SELECT * FROM chronotypes                               │
│ WHERE 'Lion' = ANY(types)  ◄─── GIN Index (FAST: 20ms) │
└─────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Security Onion                       │
└─────────────────────────────────────────────────────────┘

Layer 1: Application (Next.js)
┌────────────────────────────────────┐
│ • User authentication              │
│ • Session management               │
│ • API route protection             │
└────────────────┬───────────────────┘
                 │
Layer 2: ORM (Prisma)
┌────────────────▼───────────────────┐
│ • Type-safe queries                │
│ • SQL injection prevention         │
│ • Input validation                 │
└────────────────┬───────────────────┘
                 │
Layer 3: Database (PostgreSQL)
┌────────────────▼───────────────────┐
│ • Row Level Security (RLS)         │
│ • auth.uid() = user_id check       │
│ • Cannot be bypassed               │
└────────────────┬───────────────────┘
                 │
Layer 4: Constraints
┌────────────────▼───────────────────┐
│ • CHECK constraints                │
│ • UNIQUE constraints               │
│ • ENUM type validation             │
│ • Foreign key enforcement          │
└────────────────────────────────────┘
```

## Data Validation Flow

```
User Input (Frontend)
         │
         │ TypeScript Type Checking
         ▼
┌────────────────────┐
│ TextListInput      │
│ values: string[]   │ ◄── Ensures array of strings
└────────┬───────────┘
         │
         │ Component Validation
         ▼
┌────────────────────┐
│ onChange handler   │
│ checks length = 5  │ ◄── Application-level validation
└────────┬───────────┘
         │
         │ API Request
         ▼
┌────────────────────┐
│ Prisma Client      │
│ CoreValues.create  │ ◄── Type-safe insert
└────────┬───────────┘
         │
         │ SQL Query
         ▼
┌────────────────────────────────────┐
│ PostgreSQL                         │
│ CHECK (array_length(values,1) = 5) │ ◄── Database-level validation
└────────────────────────────────────┘
         │
         │ Success/Error
         ▼
   Return to User
```

## Profile Completion States

```
┌──────────────────────────────────────────────────────┐
│           Profile Completion Journey                 │
└──────────────────────────────────────────────────────┘

State 1: New User (0% complete)
┌────────────────┐
│ user_profiles  │ ✓ Created (required)
└────────────────┘
│ core_values    │ ✗ Missing
│ char_strengths │ ✗ Missing
│ chronotypes    │ ✗ Missing
│ big_five       │ ✗ Missing
└────────────────┘

State 2: Partial Profile (40% complete)
┌────────────────┐
│ user_profiles  │ ✓ Created
└────────────────┘
│ core_values    │ ✓ Created
│ char_strengths │ ✓ Created
│ chronotypes    │ ✗ Missing
│ big_five       │ ✗ Missing
└────────────────┘

State 3: Complete Profile (100% complete)
┌────────────────┐
│ user_profiles  │ ✓ Created
└────────────────┘
│ core_values    │ ✓ Created
│ char_strengths │ ✓ Created
│ chronotypes    │ ✓ Created
│ big_five       │ ✓ Created
└────────────────┘

Query: get_profile_completeness(profile_id)
Returns:
{
  "profileId": "xxx",
  "completionPercentage": 100,
  "completedSections": 5,
  "totalSections": 5
}
```

## Sample Queries by Use Case

### Use Case 1: User Profile Page
```sql
-- Single query to load entire profile
SELECT
  up.id,
  up.name,
  up.team,
  up.birthday,
  up.avatar_url,
  cv.values as core_values,
  cs.strengths as character_strengths,
  ch.types as chronotypes,
  ch.primary_type,
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
WHERE up.user_id = auth.uid();  -- RLS enforced

Performance: ~10ms
Indexes used: idx_user_profiles_user_id, FKs
```

### Use Case 2: Team Directory
```sql
-- List all team members with basic info
SELECT
  up.id,
  up.name,
  up.avatar_url,
  cv.values[1] as primary_value,  -- First core value
  ch.primary_type as chronotype
FROM user_profiles up
LEFT JOIN core_values cv ON up.id = cv.profile_id
LEFT JOIN chronotypes ch ON up.id = ch.profile_id
WHERE up.team = 'Product Design'
ORDER BY up.name;

Performance: ~30ms for 50 members
Indexes used: idx_user_profiles_team
```

### Use Case 3: Compatibility Check
```sql
-- Find users with similar Big Five scores
WITH my_profile AS (
  SELECT
    (openness_data->>'overallScore')::int as openness,
    (conscientiousness_data->>'overallScore')::int as conscientiousness,
    (extraversion_data->>'overallScore')::int as extraversion,
    (agreeableness_data->>'overallScore')::int as agreeableness,
    (neuroticism_data->>'overallScore')::int as neuroticism
  FROM big_five_profiles
  WHERE profile_id = (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  )
)
SELECT
  up.name,
  ABS((bf.openness_data->>'overallScore')::int - my_profile.openness) as openness_diff,
  ABS((bf.conscientiousness_data->>'overallScore')::int - my_profile.conscientiousness) as conscientiousness_diff,
  -- ... other traits
  (
    ABS((bf.openness_data->>'overallScore')::int - my_profile.openness) +
    ABS((bf.conscientiousness_data->>'overallScore')::int - my_profile.conscientiousness) +
    ABS((bf.extraversion_data->>'overallScore')::int - my_profile.extraversion) +
    ABS((bf.agreeableness_data->>'overallScore')::int - my_profile.agreeableness) +
    ABS((bf.neuroticism_data->>'overallScore')::int - my_profile.neuroticism)
  ) / 5 as avg_difference
FROM big_five_profiles bf
JOIN user_profiles up ON bf.profile_id = up.id
CROSS JOIN my_profile
ORDER BY avg_difference ASC
LIMIT 10;

Performance: ~100ms for 1000 profiles
Indexes used: GIN indexes on JSONB fields
```

### Use Case 4: Analytics Dashboard
```sql
-- Team personality distribution
SELECT
  up.team,
  COUNT(*) as member_count,

  -- Average Big Five scores
  ROUND(AVG((bf.openness_data->>'overallScore')::numeric), 1) as avg_openness,
  ROUND(AVG((bf.conscientiousness_data->>'overallScore')::numeric), 1) as avg_conscientiousness,
  ROUND(AVG((bf.extraversion_data->>'overallScore')::numeric), 1) as avg_extraversion,
  ROUND(AVG((bf.agreeableness_data->>'overallScore')::numeric), 1) as avg_agreeableness,
  ROUND(AVG((bf.neuroticism_data->>'overallScore')::numeric), 1) as avg_neuroticism,

  -- Chronotype distribution
  COUNT(*) FILTER (WHERE 'Lion' = ANY(ch.types)) as lions,
  COUNT(*) FILTER (WHERE 'Bear' = ANY(ch.types)) as bears,
  COUNT(*) FILTER (WHERE 'Wolf' = ANY(ch.types)) as wolves,
  COUNT(*) FILTER (WHERE 'Dolphin' = ANY(ch.types)) as dolphins

FROM user_profiles up
LEFT JOIN big_five_profiles bf ON up.id = bf.profile_id
LEFT JOIN chronotypes ch ON up.id = ch.profile_id
GROUP BY up.team
ORDER BY member_count DESC;

Performance: ~150ms for 10 teams, 1000 members
Indexes used: idx_user_profiles_team, GIN indexes
```

## Schema File Dependencies

```
┌─────────────────────────────────────────────────────┐
│                 File Structure                      │
└─────────────────────────────────────────────────────┘

src/types/profile.ts
    │
    ├── Defines TypeScript interfaces
    │   Used by: React components, API routes
    │
    └── Exported types:
        • UserProfile, CoreValues, CharacterStrengths
        • Chronotype, BigFiveProfile
        • Input types, Query types

db/migrations/001_initial_schema.sql
    │
    ├── PostgreSQL DDL statements
    │   Used by: Direct SQL execution, Supabase
    │
    └── Creates:
        • Tables with constraints
        • Indexes (B-Tree, GIN)
        • RLS policies
        • Triggers and functions

prisma/schema.prisma
    │
    ├── Prisma ORM schema definition
    │   Used by: Prisma Client generation
    │
    └── Generates:
        • @prisma/client
        • Type-safe query builders
        • Database introspection

prisma/seed.ts
    │
    ├── Seed script using Prisma Client
    │   Uses: db/seed-data.json
    │
    └── Populates:
        • Sample profiles
        • All related tables

db/seed-data.json
    │
    └── Sample data (3 complete profiles)
        Used by: seed.ts, manual testing
```

## Legend

```
Symbols:
  ─── : Relationship
  ──> : Foreign Key
  [ ] : Array type
  { } : JSONB object
  PK  : Primary Key
  FK  : Foreign Key
  UNIQUE : Unique constraint

Cardinality:
  (1)     : Exactly one
  (0..1)  : Zero or one
  (many)  : Zero or more

Index Types:
  B-Tree  : Default index (equality, range)
  GIN     : Generalized Inverted Index (JSONB, arrays)

Data Types:
  UUID        : Universally Unique Identifier
  VARCHAR(n)  : Variable character with max length
  TEXT        : Unlimited text
  DATE        : Date without time
  TIMESTAMPTZ : Timestamp with timezone
  JSONB       : Binary JSON (indexed, queryable)
  ENUM        : Custom enumerated type
  TEXT[]      : Array of text
```
