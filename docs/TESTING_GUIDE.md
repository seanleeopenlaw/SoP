# Admin Excel Import - Testing Guide

## Quick Start Testing

### 1. Generate Test Template
```bash
npx tsx scripts/create-template.ts
```

This creates: `data/user_import_template.xlsx`

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access Admin Import Page
Navigate to: http://localhost:3000/admin/import

### 4. Test Template Download (Web)
1. Click "Download Template" button
2. Verify file downloads: `user_import_template.xlsx`
3. Open in Excel/Google Sheets
4. Verify all 28 columns are present
5. Verify Goals columns exist: Goals_Period, Goals_Professional, Goals_Personal

### 5. Test Import Flow

#### Option A: Use Generated Template
1. Open `data/user_import_template.xlsx`
2. Add a few more rows with sample data
3. Upload via admin page
4. Verify results

#### Option B: Create Custom Test Data
Create a test Excel file with:

**Minimal Test (2 rows)**:
```
Email               | Name         | Team
test1@example.com   | Test User 1  | Engineering
test2@example.com   | Test User 2  | Marketing
```

**Complete Test (1 row with all fields)**:
```
Email               | Name      | Team        | Birthday   | Chronotype | CoreValue1  | CoreValue2  | Goals_Period | Goals_Professional
test3@example.com   | Test User | Engineering | 1990-01-15 | Lion       | Innovation  | Integrity   | Q1 2025      | Lead 3 projects
```

### 6. Verify Import Results

#### Check Web UI
- Verify success count matches expected
- Check detailed results show correct actions (created/updated)
- Verify no errors for valid data

#### Check Database
```bash
# Connect to your database and verify
npx prisma studio
```

Navigate to UserProfile table and verify:
- New profiles were created
- Email, Name, Team are correct
- Check related tables: Goals, CoreValues, etc.

#### Check Profile Page
1. Go to home page: http://localhost:3000
2. Enter imported user email
3. Verify all imported data appears correctly
4. Check Goals section shows imported goals

## Test Cases

### Test Case 1: Create New Users
**File**: test_create_users.xlsx
```
Email               | Name         | Team
new1@example.com    | New User 1   | Engineering
new2@example.com    | New User 2   | Marketing
new3@example.com    | New User 3   | Design
```

**Expected**:
- 3 successful creates
- 0 errors
- All users visible in Team Directory

### Test Case 2: Update Existing Users
**Prerequisites**: Run Test Case 1 first

**File**: test_update_users.xlsx
```
Email               | Name                | Team
new1@example.com    | Updated User 1      | Product
new2@example.com    | Updated User 2      | Sales
```

**Expected**:
- 2 successful updates
- 0 errors
- Team changes reflected in database

### Test Case 3: Import with Goals
**File**: test_goals.xlsx
```
Email               | Name          | Goals_Period | Goals_Professional           | Goals_Personal
goals1@example.com  | Goals User 1  | Q1 2025      | Complete 3 projects          | Learn piano
goals2@example.com  | Goals User 2  | 2025         | Get promoted to senior level | Travel to Japan
```

**Expected**:
- 2 successful creates
- Goals data saved to database
- Goals visible on profile page

### Test Case 4: Complete Profile Import
**File**: test_complete_profile.xlsx
```
All columns including:
- Basic info
- Core values (3-5 values)
- Character strengths (3-5)
- Chronotype
- Big Five (all 5 traits)
- Goals
```

**Expected**:
- All data imported correctly
- Profile page shows complete information

### Test Case 5: Error Handling
**File**: test_errors.xlsx
```
Email               | Name         | Team
                    | No Email     | Engineering    (Missing email)
invalid-email       | Bad Email    | Marketing      (Invalid format)
test1@example.com   |              | Design         (Missing name)
valid@example.com   | Valid User   | Sales          (Should succeed)
```

**Expected**:
- 1 successful create (last row)
- 3 errors with descriptive messages
- Valid row still imported despite other errors

### Test Case 6: Big Five Import
**File**: test_bigfive.xlsx
```
Email               | Name          | BigFive_Openness_Level | BigFive_Openness_Score
bigfive@example.com | Big Five User | High                   | 850
```

**Expected**:
- Big Five data imported
- Visible on profile page
- Level and score both saved

### Test Case 7: Large Batch Import
**File**: test_large_batch.xlsx (50-100 rows)

**Expected**:
- All rows processed
- Results show correct counts
- No performance issues
- Page remains responsive

## Manual Testing Checklist

### UI/UX
- [ ] Drag and drop works
- [ ] Click to browse works
- [ ] File validation works (rejects non-Excel files)
- [ ] Upload button disabled when no file
- [ ] Loading state shows during upload
- [ ] Success toast appears
- [ ] Error toast appears for failures
- [ ] Results display correctly
- [ ] Can import another file after completion
- [ ] Clear button works
- [ ] Home button navigates correctly

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] All buttons accessible
- [ ] Text readable on all sizes

### Data Validation
- [ ] Required fields validated (Email, Name)
- [ ] Email format validated
- [ ] Date format validated
- [ ] Enum values validated (Chronotype, Big Five levels)
- [ ] Empty values handled correctly

### Import Behavior
- [ ] New users created with correct data
- [ ] Existing users updated correctly
- [ ] Goals data imported
- [ ] Core values imported (array)
- [ ] Character strengths imported (array)
- [ ] Chronotype imported
- [ ] Big Five data imported
- [ ] Row-level errors don't stop other rows

### Error Messages
- [ ] Clear error messages for missing fields
- [ ] Row numbers shown in errors
- [ ] Invalid format errors are descriptive
- [ ] Server errors handled gracefully

## CLI Testing

### Test CLI Import
```bash
# Create test file
npx tsx scripts/create-template.ts

# Import using CLI
npx tsx scripts/import-users.ts data/user_import_template.xlsx
```

**Expected**:
- Console shows progress
- Summary shows 1 success (sample row)
- Database updated

## API Testing

### Test Template Download API
```bash
curl -X GET http://localhost:3000/api/admin/import -o template.xlsx
```

**Expected**:
- File downloads
- File is valid Excel format
- Template opens in Excel

### Test Import API
```bash
curl -X POST http://localhost:3000/api/admin/import \
  -F "file=@data/user_import_template.xlsx"
```

**Expected**:
- JSON response with results
- success: true
- successCount: 1
- details array with imported user

## Performance Testing

### Test Large File Import
1. Create Excel file with 500 rows
2. Upload via admin page
3. Monitor:
   - Upload time
   - Processing time
   - Memory usage
   - Response time

**Acceptable**:
- Upload completes within 30 seconds
- No memory leaks
- UI remains responsive

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Regression Testing

After any code changes, verify:
- [ ] Existing profile page still works
- [ ] Team directory still works
- [ ] Email-based access still works
- [ ] CLI scripts still work
- [ ] Database schema unchanged

## Common Issues & Solutions

### Issue: Template won't download
**Solution**: Check browser console, verify API endpoint responds

### Issue: Upload fails with "Invalid file type"
**Solution**: Ensure file is .xlsx or .xls format

### Issue: Import succeeds but data missing
**Solution**: Check column headers match exactly (case-sensitive)

### Issue: Row-level errors
**Solution**: Review error messages, fix data in Excel, re-import

### Issue: Database connection errors
**Solution**: Verify DATABASE_URL in .env, ensure database is running

## Success Criteria

All tests pass when:
- ✅ Template downloads correctly
- ✅ File upload works (both drag-drop and browse)
- ✅ Import creates new users
- ✅ Import updates existing users
- ✅ Goals data imports correctly
- ✅ Error handling works properly
- ✅ Results display accurately
- ✅ UI is responsive on all devices
- ✅ CLI scripts work correctly
- ✅ No TypeScript errors
- ✅ No runtime errors in console

## Automated Testing (Future)

Consider adding:
- Unit tests for import logic
- Integration tests for API endpoints
- E2E tests for UI flow
- Performance benchmarks

Example test structure:
```typescript
// tests/excel-import.test.ts
describe('Excel Import', () => {
  it('should parse Excel file', async () => {
    // Test parseExcelFile()
  });

  it('should import users', async () => {
    // Test importUsersFromExcel()
  });

  it('should handle errors', async () => {
    // Test error handling
  });
});
```
