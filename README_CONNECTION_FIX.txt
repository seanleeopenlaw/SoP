================================================================================
SUPABASE DATABASE CONNECTION ISSUE - QUICK START
================================================================================

PROBLEM: Cannot connect to Supabase database
ERROR: "Tenant or user not found" / "Can't reach database server"

STATUS: ⚠️  CREDENTIALS INVALID - Manual fix required

================================================================================
QUICK FIX (30 seconds)
================================================================================

1. Go to: https://supabase.com/dashboard
2. Log in and find your project
3. Click: Settings > Database > Connection string
4. Copy the "Session pooler" string
5. Copy the "Transaction pooler" string
6. Replace [YOUR-PASSWORD] with your database password
   (If you don't know it, click "Reset password" on the same page)

7. Update .env file with the copied strings:

   DATABASE_URL="[paste session pooler here]"
   DIRECT_URL="[paste transaction pooler here]"

8. Test: npx prisma db pull

9. If it works, restart your dev server: npm run dev

================================================================================
IMPORTANT NOTES
================================================================================

- URL-encode special characters in password:
  ! → %21
  @ → %40
  # → %23

- The project reference "rcaitnenussgesnxlimp" appears to be incorrect
- The password "PeopleProject2025!" may also be incorrect
- Or the project may be paused/deleted

================================================================================
DETAILED GUIDES
================================================================================

For complete instructions, see:
- CONNECTION_ISSUE_RESOLUTION.md  (Main guide - START HERE)
- SUPABASE_CONNECTION_FIX.md      (Technical details)
- diagnose_connection.md          (Full diagnostic report)

================================================================================
TESTING PERFORMED
================================================================================

✗ Tested all 10 AWS regions - all failed
✗ Tested direct connection - DNS not found
✗ Tested pooler connections - authentication failed
✗ Tested various username formats - all failed

CONCLUSION: The provided credentials are incorrect or the project doesn't exist

================================================================================
WHAT TO DO IF PROJECT DOESN'T EXIST
================================================================================

1. Create new project at: https://supabase.com/dashboard
2. Get connection strings from new project
3. Update .env file
4. Run: npx prisma db push
5. Run: npm run dev

================================================================================

Questions? Check CONNECTION_ISSUE_RESOLUTION.md for complete guide.

Last updated: 2025-10-21
