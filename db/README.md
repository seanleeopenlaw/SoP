# People Profile Database Schema

## Overview

This directory contains the complete, production-ready database schema for the People Profile Web App. The schema is designed to align perfectly with the existing React component structure and supports scalable, multi-tenant operations.

## What's Included

### Core Files (Required)

1. **TypeScript Types** - `/src/types/profile.ts` (299 lines)
   - Complete type definitions for all profile data
   - Matches both database schema and component props
   - Includes input types, query types, and analytics types

2. **SQL Migration** - `/db/migrations/001_initial_schema.sql` (387 lines)
   - PostgreSQL schema with Row Level Security (RLS)
   - Optimized indexes (B-Tree, GIN)
   - Triggers, constraints, and utility functions
   - Ready for Supabase deployment

3. **Prisma Schema** - `/prisma/schema.prisma` (159 lines)
   - ORM schema matching SQL migration
   - Type-safe Prisma Client generation
   - Supports all PostgreSQL features (JSONB, arrays, ENUMs)

4. **Seed Script** - `/prisma/seed.ts` (199 lines)
   - Automated database population
   - Loads sample data with error handling
   - Useful for testing and development

5. **Sample Data** - `/db/seed-data.json` (355 lines)
   - 3 complete, realistic user profiles
   - Demonstrates all schema features
   - Ready for immediate testing

### Documentation Files (Recommended Reading)

6. **Quick Start Guide** - `/db/QUICK_START.md`
   - Get started in 5 minutes
   - Common tasks and code examples
   - Troubleshooting guide

7. **Full Documentation** - `/db/SCHEMA_DOCUMENTATION.md`
   - Complete setup instructions
   - Usage examples (Prisma, SQL)
   - Performance optimization tips
   - Security best practices

8. **Design Decisions** - `/db/SCHEMA_DESIGN_DECISIONS.md`
   - Architectural rationale
   - Trade-offs and alternatives considered
   - Performance benchmarks
   - Future enhancement roadmap

9. **Schema Diagram** - `/db/SCHEMA_DIAGRAM.md`
   - Visual entity relationship diagrams
   - Data flow illustrations
   - Query patterns by use case
   - JSONB structure visualization

10. **This File** - `/db/README.md`
    - You are here!

## Database Structure

### 5 Main Tables

```
user_profiles          → Core user information
  ├── core_values      → 5 core values (TEXT[])
  ├── character_strengths → 5 character strengths (TEXT[])
  ├── chronotypes      → Chronotype preferences (ENUM[])
  ├── big_five_profiles → Big Five personality data (JSONB)
  └── profile_versions → Version history (optional)
```

### Key Features

- **Type Safety**: ENUMs, constraints, and CHECK rules
- **Security**: Row Level Security (RLS) enabled on all tables
- **Performance**: Optimized indexes for common queries
- **Scalability**: Supports analytics and team comparisons
- **Flexibility**: JSONB for complex nested data
- **Versioning**: Optional history tracking

## Quick Start

### Option 1: Prisma (Recommended for Development)

```bash
# Install dependencies
npm install @prisma/client prisma tsx

# Generate Prisma client
npx prisma generate

# Create database and tables
npx prisma db push

# Load sample data
npx tsx prisma/seed.ts

# View data in browser
npx prisma studio
```

### Option 2: Supabase (Recommended for Production)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize and link project
supabase init
supabase link --project-ref your-project-ref

# Run migration
supabase db push

# Set environment variables
# See QUICK_START.md for details
```

## Data Model

### UserProfile
- Basic user info (name, team, birthday)
- Links to authentication via `user_id`
- Timestamps for audit trail

### CoreValues & CharacterStrengths
- Exactly 5 items each (enforced by CHECK constraint)
- PostgreSQL array storage
- Simple text values

### Chronotype
- Multiple selection: Lion, Bear, Wolf, Dolphin
- Optional primary chronotype
- ENUM type for validation

### BigFiveProfile
- 5 personality dimensions (JSONB):
  - Openness
  - Conscientiousness
  - Extraversion
  - Agreeableness
  - Neuroticism
- Each dimension has:
  - Overall level (High/Average/Low)
  - Overall score (0-100)
  - 6 subtraits (each with level and score)

## Component Integration

The schema is designed to work seamlessly with your existing components:

### TextListInput ↔ Core Values / Character Strengths
```typescript
<TextListInput
  label="Core Values"
  values={profile.coreValues?.values || []}
  onChange={(values) => updateCoreValues(profile.id, values)}
/>
```

### BigFiveGroupSelector ↔ Big Five Profile
```typescript
<BigFiveGroupSelector
  group="Extraversion"
  traits={bigFive.extraversion.subtraits}
  onChange={(traits) => updateBigFive(profile.id, 'extraversion', traits)}
/>
```

### ChronotypeAnimalModal ↔ Chronotype
```typescript
<ChronotypeAnimalModal
  type={chronotype.primaryType}
  description="..."
  imageUrl="..."
  onClose={() => {}}
/>
```

## Sample Profiles

The seed data includes 3 diverse profiles:

1. **Sarah Chen** - Product Designer
   - High Openness (82) & Agreeableness (78)
   - Bear/Dolphin chronotype
   - Creative, collaborative, empathetic

2. **Marcus Johnson** - Senior Engineer
   - High Conscientiousness (88)
   - Lion chronotype (early riser)
   - Disciplined, achievement-oriented, analytical

3. **Priya Patel** - UX Designer
   - Very High Openness (90) & Extraversion (72)
   - Wolf/Dolphin chronotype (night owl)
   - Imaginative, social, user-focused

## File Statistics

| File | Lines | Purpose |
|------|-------|---------|
| `profile.ts` | 299 | TypeScript type definitions |
| `001_initial_schema.sql` | 387 | PostgreSQL migration |
| `schema.prisma` | 159 | Prisma ORM schema |
| `seed.ts` | 199 | Database seed script |
| `seed-data.json` | 355 | Sample test data |
| **Total** | **1,399** | **Complete schema** |

Plus 4 comprehensive documentation files (~1,500 lines)

## Common Tasks

### Get Complete Profile
```typescript
const profile = await prisma.userProfile.findUnique({
  where: { userId: 'auth-user-123' },
  include: {
    coreValues: true,
    characterStrengths: true,
    chronotype: true,
    bigFiveProfile: true,
  },
});
```

### Update Big Five
```typescript
await prisma.bigFiveProfile.update({
  where: { profileId: profile.id },
  data: {
    extraversionData: {
      groupName: 'Extraversion',
      overallLevel: 'High',
      overallScore: 75,
      subtraits: [...],
    },
  },
});
```

### Team Analytics
```typescript
const teamProfiles = await prisma.userProfile.findMany({
  where: { team: 'Product Design' },
  include: { bigFiveProfile: true },
});

const avgOpenness = teamProfiles.reduce((sum, p) => {
  return sum + (p.bigFiveProfile?.opennessData.overallScore || 0);
}, 0) / teamProfiles.length;
```

## Security

### Row Level Security (RLS)
All tables have RLS policies that ensure:
- Users can only access their own profile data
- Queries automatically filter by `auth.uid() = user_id`
- Protection even against SQL injection

### Data Validation
Multiple layers of validation:
1. **TypeScript**: Compile-time type checking
2. **React**: Component-level validation
3. **Prisma**: Type-safe queries
4. **PostgreSQL**: Database constraints

## Performance

Expected performance (with proper indexing):

| Operation | Time | Notes |
|-----------|------|-------|
| Get single profile | <10ms | 4 JOINs, all indexed |
| Get team profiles (50) | <50ms | Indexed team column |
| Update Big Five | <5ms | Single JSONB update |
| Team analytics (1000) | <100ms | GIN indexes on JSONB |

## Validation Rules

Database enforces these rules:
- ✅ Core Values: Exactly 5 items
- ✅ Character Strengths: Exactly 5 items
- ✅ Chronotype: At least 1 type, primary must be in array
- ✅ Big Five: Each group has 6 subtraits
- ✅ User Profile: Name required, user_id unique

## Next Steps

1. **Read Quick Start**: `/db/QUICK_START.md` (5-minute setup)
2. **Choose Your Stack**:
   - Prisma: Run `npx prisma db push`
   - Supabase: Run `supabase db push`
3. **Load Sample Data**: `npx tsx prisma/seed.ts`
4. **Explore Types**: Check `/src/types/profile.ts`
5. **Build Features**: Connect UI components to database

## Support & Documentation

| Question | Document |
|----------|----------|
| How do I get started? | `QUICK_START.md` |
| What are the design choices? | `SCHEMA_DESIGN_DECISIONS.md` |
| How does it all fit together? | `SCHEMA_DIAGRAM.md` |
| Where's the full reference? | `SCHEMA_DOCUMENTATION.md` |
| Need help? | This file + inline comments |

## Technology Stack

- **Database**: PostgreSQL 14+ (Supabase compatible)
- **ORM**: Prisma (optional, recommended)
- **Types**: TypeScript 5.0+
- **Security**: Row Level Security (RLS)
- **Features**: JSONB, Arrays, ENUMs, Triggers, GIN indexes

## Production Readiness Checklist

- ✅ Row Level Security enabled
- ✅ Foreign key constraints
- ✅ CHECK constraints for data integrity
- ✅ Optimized indexes (B-Tree, GIN)
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Cascading deletes configured
- ✅ Type-safe TypeScript interfaces
- ✅ Comprehensive documentation
- ✅ Sample data for testing
- ✅ Seed script for automation

## License

Part of the People Profile Web App project.

## Questions?

1. Check the relevant documentation file above
2. Review inline comments in schema files
3. Examine seed data for examples
4. Test queries in Prisma Studio

---

**Created**: October 2025
**Status**: Production Ready
**Version**: 1.0
**Schema Files**: 5 core + 5 documentation
**Total Lines**: ~3,000 (code + docs)
