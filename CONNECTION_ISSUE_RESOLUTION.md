# Supabase Database Connection Issue - Resolution Guide

**Project**: PeopleProject
**Date**: 2025-10-21
**Status**: ⚠️ CONNECTION FAILED - Manual verification required

---

## Executive Summary

All automated connection attempts to the Supabase database have failed. The issue is caused by **incorrect credentials** (project reference and/or password). Manual verification via the Supabase dashboard is required to obtain the correct connection strings.

## What We Tested

### Connection Formats Tested:
- ✗ Session pooler (port 5432) with `postgres.PROJECT_REF` username
- ✗ Transaction pooler (port 6543) with `postgres.PROJECT_REF` username
- ✗ Direct connection to `db.rcaitnenussgesnxlimp.supabase.co`
- ✗ All 10 AWS regions (us-east-1, us-west-1, eu-west-1, etc.)
- ✗ Various username formats (with/without project reference suffix)

### Errors Received:
1. **Pooler connections**: `FATAL: Tenant or user not found`
2. **Direct connection**: `DNS resolution failed` (ENOTFOUND)

### What This Means:
The project reference `rcaitnenussgesnxlimp` and/or password `PeopleProject2025!` are incorrect, or the Supabase project doesn't exist/is paused.

---

## IMMEDIATE ACTION REQUIRED

### Option A: Verify and Fix Current Project (Recommended)

**Step 1: Check Supabase Dashboard**
```
1. Go to: https://supabase.com/dashboard
2. Log in with your Supabase account
3. Look for your project in the projects list
```

**Step 2: If Project Exists**
```
1. Click on the project
2. Check if it shows "Paused" - if yes, click "Restore"
3. Go to: Settings > Database > Connection string
4. Copy the EXACT connection strings shown:
   - Session pooler → for DATABASE_URL
   - Transaction pooler → for DIRECT_URL
5. Replace [YOUR-PASSWORD] with your database password
   (If unsure, reset the password in the same page)
```

**Step 3: Update .env File**
```bash
# Use the EXACT strings from Supabase dashboard
DATABASE_URL="[paste session pooler string here]"
DIRECT_URL="[paste transaction pooler string here]"
ADMIN_EMAILS="admin@openlaw.com.au"
```

**Important**: URL-encode special characters in password:
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`

**Step 4: Test Connection**
```bash
npx prisma db pull
```

**Step 5: If successful, restart dev server**
```bash
npm run dev
```

### Option B: Create New Supabase Project

If the project doesn't exist or you can't recover it:

**Step 1: Create New Project**
```
1. Go to: https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - Name: PeopleProject
   - Database Password: [set a strong password]
   - Region: [choose closest to you]
4. Wait for project to initialize (~2 minutes)
```

**Step 2: Get Connection Strings**
```
1. Go to: Settings > Database > Connection string
2. Copy Session pooler and Transaction pooler strings
3. Replace [YOUR-PASSWORD] with your new password
```

**Step 3: Update .env**
```bash
DATABASE_URL="[new session pooler string]"
DIRECT_URL="[new transaction pooler string]"
ADMIN_EMAILS="admin@openlaw.com.au"
```

**Step 4: Push Existing Schema**
```bash
# This will create all tables in the new database
npx prisma db push
```

**Step 5: Verify and Start**
```bash
# Test connection
npx prisma db pull

# Start dev server
npm run dev
```

---

## Current Configuration

### .env File Location:
`/Users/seanlee/Desktop/PeopleProject/.env`

### Current Contents (NOT WORKING):
```bash
DATABASE_URL="postgresql://postgres.rcaitnenussgesnxlimp:PeopleProject2025%21@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.rcaitnenussgesnxlimp:PeopleProject2025%21@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
ADMIN_EMAILS="admin@openlaw.com.au"
```

**Status**: These strings are formatted correctly BUT the credentials are invalid.

---

## Technical Details

### Why Previous Connection Strings Failed:

**1. DNS Failure on Direct Connection**
```
Host: db.rcaitnenussgesnxlimp.supabase.co
Error: getaddrinfo ENOTFOUND
Meaning: This hostname doesn't exist in DNS
Conclusion: Project reference is likely incorrect
```

**2. "Tenant or user not found" on Pooler**
```
Username format tested: postgres.rcaitnenussgesnxlimp
Error: FATAL: Tenant or user not found
Regions tested: All 10 AWS regions
Conclusion: The project reference or password is incorrect
```

**3. Why Region Doesn't Matter**
```
The pooler endpoints (aws-0-[region].pooler.supabase.com) all
resolve correctly, but authentication fails universally.
This confirms the issue is with credentials, not connectivity.
```

### Connection String Format (Reference)

When you get the correct strings from Supabase, they should look like:

```bash
# Session pooler (port 5432)
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# Transaction pooler (port 6543)
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Direct connection (IPv6 only)
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Key Points**:
- Pooler username: `postgres.PROJECT_REF` (note the dot!)
- Direct username: `postgres` (no suffix)
- Password must be URL-encoded
- Region varies by project (not always us-east-1)

---

## Diagnostic Files Created

For your reference, the following files were created during diagnosis:

1. **CONNECTION_ISSUE_RESOLUTION.md** (this file) - Main resolution guide
2. **SUPABASE_CONNECTION_FIX.md** - Detailed technical guide
3. **diagnose_connection.md** - Full diagnostic report
4. **test_db_connection.mjs** - Connection testing script
5. **test_all_regions.mjs** - Multi-region testing script

You can delete the test scripts after resolving the issue:
```bash
rm test_db_connection.mjs test_all_regions.mjs
```

---

## Troubleshooting Common Issues

### "Project is paused"
**Solution**: In dashboard, click "Restore" on the paused project. Wait 1-2 minutes for it to resume.

### "Can't find my project"
**Solution**: Check you're logged into the correct Supabase account. If you created the project under a different email, switch accounts.

### "Connection string doesn't have password filled in"
**Solution**: Supabase shows `[YOUR-PASSWORD]` as placeholder. You must replace it with your actual database password.

### "Still getting connection errors"
**Solution**:
1. Verify you copied the complete string (no truncation)
2. Check for extra spaces or quotes
3. Ensure password is URL-encoded
4. Try resetting database password

### "Forgot database password"
**Solution**:
1. Go to: Settings > Database > Database password
2. Click "Reset password"
3. Set new password and save it securely
4. Update .env with new password

---

## Quick Reference Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Database Settings**: https://supabase.com/dashboard/project/[YOUR_PROJECT_REF]/settings/database
- **Supabase Connection Docs**: https://supabase.com/docs/guides/database/connecting-to-postgres
- **Prisma + Supabase Guide**: https://www.prisma.io/docs/orm/overview/databases/supabase

---

## What Works vs What Doesn't

### ✅ What's Working:
- Prisma schema is correctly configured
- Project structure is intact
- Network connectivity to Supabase poolers exists
- Connection string format is correct

### ❌ What's NOT Working:
- The specific project reference `rcaitnenussgesnxlimp` cannot be found
- Authentication fails with provided password
- DNS resolution fails for direct connection

### ✅ What Will Fix It:
- Getting the correct project reference from Supabase dashboard
- Using the correct database password
- Or creating a new project with fresh credentials

---

## Next Steps

**Choose one path**:

**Path A (If you have access to original Supabase project)**:
1. ✅ Log into Supabase dashboard
2. ✅ Find your project
3. ✅ Copy exact connection strings
4. ✅ Update .env file
5. ✅ Test with `npx prisma db pull`
6. ✅ Start dev server

**Path B (If project doesn't exist or is inaccessible)**:
1. ✅ Create new Supabase project
2. ✅ Copy connection strings from new project
3. ✅ Update .env file
4. ✅ Run `npx prisma db push` to create schema
5. ✅ Start dev server

---

**Need Help?**
- Supabase Support: https://supabase.com/support
- Supabase Discord: https://discord.supabase.com

**Generated**: 2025-10-21 21:11 UTC
**Status**: Awaiting manual verification
