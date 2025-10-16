# Quick Start Guide - Database Schema

## TL;DR - Get Started in 5 Minutes

### Option A: Using Prisma (Recommended for Development)

```bash
# 1. Install dependencies
npm install @prisma/client
npm install -D prisma tsx

# 2. Set up environment
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/peopleproject"' > .env

# 3. Generate Prisma client
npx prisma generate

# 4. Create database and tables
npx prisma db push

# 5. Load sample data
npx tsx prisma/seed.ts

# 6. View database in browser
npx prisma studio
```

### Option B: Using Supabase (Recommended for Production)

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login and create project
supabase login
supabase init

# 3. Link to your project
supabase link --project-ref your-project-ref

# 4. Run migration
supabase db push

# 5. Set up environment
echo 'DATABASE_URL="your-supabase-connection-string"' > .env.local
echo 'NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"' >> .env.local
echo 'NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"' >> .env.local
```

## File Locations

```
PeopleProject/
├── src/types/profile.ts              # TypeScript type definitions
├── db/
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # SQL migration file
│   ├── seed-data.json                # Sample test data
│   ├── SCHEMA_DOCUMENTATION.md       # Full documentation
│   └── QUICK_START.md                # This file
└── prisma/
    ├── schema.prisma                 # Prisma ORM schema
    └── seed.ts                       # Seed script
```

## What's in the Schema?

### 5 Main Tables

1. **user_profiles** - Basic user info (name, team, birthday)
2. **core_values** - 5 core values per user
3. **character_strengths** - 5 character strengths per user
4. **chronotypes** - Chronotype preferences (Lion/Bear/Wolf/Dolphin)
5. **big_five_profiles** - Big Five personality data (JSONB)

### Key Features

- ✅ Row Level Security (RLS) enabled
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Foreign key cascading deletes
- ✅ CHECK constraints for data validation
- ✅ Optimized indexes for common queries
- ✅ Profile versioning support (optional)

## Common Tasks

### Create a Complete Profile

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const profile = await prisma.userProfile.create({
  data: {
    userId: 'auth-user-123',
    name: 'John Doe',
    team: 'Engineering',
    coreValues: {
      create: {
        values: ['Innovation', 'Teamwork', 'Quality', 'Growth', 'Impact'],
      },
    },
    characterStrengths: {
      create: {
        strengths: ['Leadership', 'Problem-solving', 'Communication', 'Adaptability', 'Technical'],
      },
    },
    chronotype: {
      create: {
        types: ['Lion', 'Bear'],
        primaryType: 'Lion',
      },
    },
    bigFiveProfile: {
      create: {
        opennessData: {
          groupName: 'Openness',
          overallLevel: 'High',
          overallScore: 80,
          subtraits: [
            { name: 'Imagination', level: 'High', score: 85 },
            // ... 5 more subtraits
          ],
        },
        // ... other Big Five dimensions
      },
    },
  },
  include: {
    coreValues: true,
    characterStrengths: true,
    chronotype: true,
    bigFiveProfile: true,
  },
});
```

### Get a Complete Profile

```typescript
const completeProfile = await prisma.userProfile.findUnique({
  where: { userId: 'auth-user-123' },
  include: {
    coreValues: true,
    characterStrengths: true,
    chronotype: true,
    bigFiveProfile: true,
  },
});
```

### Update Big Five Data

```typescript
await prisma.bigFiveProfile.update({
  where: { profileId: 'profile-id' },
  data: {
    extraversionData: {
      groupName: 'Extraversion',
      overallLevel: 'High',
      overallScore: 75,
      subtraits: [
        { name: 'Friendliness', level: 'High', score: 80 },
        { name: 'Gregariousness', level: 'Average', score: 65 },
        { name: 'Assertiveness', level: 'High', score: 78 },
        { name: 'Activity Level', level: 'High', score: 82 },
        { name: 'Excitement-Seeking', level: 'Average', score: 60 },
        { name: 'Cheerfulness', level: 'High', score: 75 },
      ],
    },
  },
});
```

### Query Team Analytics

```typescript
// Get all profiles in a team
const teamProfiles = await prisma.userProfile.findMany({
  where: { team: 'Product Design' },
  include: {
    coreValues: true,
    bigFiveProfile: true,
  },
});

// Calculate team averages
const teamAvgOpenness = teamProfiles.reduce((sum, p) => {
  const data = p.bigFiveProfile?.opennessData as any;
  return sum + (data?.overallScore || 0);
}, 0) / teamProfiles.length;
```

## Integration with Components

### TextListInput Component

```typescript
import { TextListInput } from '@/components/profile/TextListInput';

// Component usage matches database structure
<TextListInput
  label="Core Values"
  values={profile.coreValues?.values || []}
  onChange={async (values) => {
    await prisma.coreValues.upsert({
      where: { profileId: profile.id },
      create: { profileId: profile.id, values },
      update: { values },
    });
  }}
/>
```

### BigFiveGroupSelector Component

```typescript
import { BigFiveGroupSelector } from '@/components/profile/BigFiveGroupSelector';

// Component props match BigFiveGroup type
<BigFiveGroupSelector
  group="Extraversion"
  traits={bigFiveData.extraversion.subtraits}
  onChange={async (updated) => {
    await prisma.bigFiveProfile.update({
      where: { profileId: profile.id },
      data: {
        extraversionData: {
          ...bigFiveData.extraversion,
          subtraits: updated,
        },
      },
    });
  }}
/>
```

## Sample Data

Three profiles included in `seed-data.json`:

1. **Sarah Chen** (Product Design)
   - High Openness (82), High Agreeableness (78)
   - Bear/Dolphin chronotype
   - Values: Creativity, Collaboration, Integrity, Innovation, Empathy

2. **Marcus Johnson** (Engineering)
   - High Conscientiousness (88), Low Neuroticism (28)
   - Lion chronotype
   - Values: Excellence, Continuous Learning, Transparency, Teamwork, Impact

3. **Priya Patel** (Product Design)
   - Very High Openness (90), High Extraversion (72)
   - Wolf/Dolphin chronotype
   - Values: User-centricity, Creativity, Growth mindset, Diversity, Sustainability

## Validation Rules

The schema enforces these rules at the database level:

- ✅ Core Values: Exactly 5 items
- ✅ Character Strengths: Exactly 5 items
- ✅ Chronotype: At least 1 type selected
- ✅ Chronotype: Primary type must be in types array
- ✅ Big Five: Each group has 6 subtraits
- ✅ Trait Scores: 0-100 range (enforced in application)
- ✅ Trait Levels: High, Average, or Low

## Troubleshooting

### "Relation does not exist"
```bash
# Make sure you've pushed the schema
npx prisma db push
```

### "Can't reach database"
```bash
# Check your DATABASE_URL
npx prisma db pull
```

### "Seed script fails"
```bash
# Install tsx for TypeScript execution
npm install -D tsx

# Run with verbose logging
npx tsx prisma/seed.ts
```

### "RLS blocking my queries"
```sql
-- Disable RLS for testing (don't do in production!)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

## Next Steps

1. **Read Full Documentation**: See `db/SCHEMA_DOCUMENTATION.md`
2. **Explore Types**: Check `src/types/profile.ts` for all TypeScript interfaces
3. **View Database**: Run `npx prisma studio` to browse data
4. **Write Queries**: Use Prisma Client for type-safe database access
5. **Build Components**: Connect UI components to database

## Package.json Scripts (Add These)

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma db push --force-reset && npm run db:seed"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

## Support

- Full docs: `/db/SCHEMA_DOCUMENTATION.md`
- Prisma docs: https://www.prisma.io/docs
- Supabase docs: https://supabase.com/docs
