# Admin Excel Import Guide

This guide explains how to use the Admin Excel Import system to bulk import or update user profiles in the People Project app.

## Overview

The Admin Excel Import system allows administrators to:
- Bulk create new user profiles
- Update existing user profiles
- Import all profile data including Goals
- Download a pre-formatted Excel template
- View detailed import results

## Accessing the Admin Import Page

Navigate to: `/admin/import`

Example: `http://localhost:3000/admin/import`

## Step-by-Step Import Process

### 1. Download the Template

1. Click the **"Download Template"** button on the Admin Import page
2. The template file `user_import_template.xlsx` will be downloaded
3. Open the file in Excel, Google Sheets, or any spreadsheet application

### 2. Fill in the Template

The template includes these columns:

#### Required Fields
- **Email**: User's email address (unique identifier)
- **Name**: User's full name

#### Optional Fields
- **Team**: Team name (e.g., "Engineering", "Marketing")
- **Birthday**: Date in YYYY-MM-DD format (e.g., "1990-01-15")
- **Chronotype**: One of: Lion, Bear, Wolf, or Dolphin

#### Core Values (Up to 5)
- **CoreValue1** through **CoreValue5**: Individual core values

#### Character Strengths (Up to 5)
- **Strength1** through **Strength5**: Individual character strengths

#### Big Five Personality Traits
For each trait (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism):
- **BigFive_[Trait]_Level**: High, Average, or Low
- **BigFive_[Trait]_Score**: Optional numeric score (0-999)

Example columns:
- `BigFive_Openness_Level`: "High"
- `BigFive_Openness_Score`: 850

#### Goals
- **Goals_Period**: Goal period (e.g., "Q1 2025", "2025", "Annual")
- **Goals_Professional**: Professional goals (optional, can be long text)
- **Goals_Personal**: Personal goals (optional, can be long text)

### 3. Upload the File

1. Drag and drop your completed Excel file onto the upload area, or
2. Click the upload area to browse and select your file
3. Click **"Import Users"** to start the import process

### 4. Review Results

After import, you'll see:
- **Summary**: Total successful imports, errors, and total rows
- **Successful Imports**: List of created/updated profiles
- **Errors**: Detailed error messages for any failed rows

## Import Behavior

### Creating New Users
- If an email doesn't exist in the database, a new profile is created
- All provided data is imported

### Updating Existing Users
- If an email already exists, the profile is updated
- All provided data overwrites existing data
- Empty fields in the Excel file will be set to null/empty

### Data Validation
- Email format is validated
- Required fields (Email, Name) must be provided
- Invalid data types will cause row-level errors
- Errors don't stop the import process for other rows

## Template Generation (CLI)

You can also generate the template via command line:

```bash
npx tsx scripts/create-template.ts
```

This creates: `data/user_import_template.xlsx`

## Bulk Import via CLI

For command-line imports:

```bash
npx tsx scripts/import-users.ts path/to/your/file.xlsx
```

## API Endpoints

### Download Template
```
GET /api/admin/import
```

Response: Excel file download

### Upload and Import
```
POST /api/admin/import
Content-Type: multipart/form-data
Body: file (Excel file)
```

Response:
```json
{
  "success": true,
  "message": "Successfully imported 10 users",
  "successCount": 10,
  "errorCount": 0,
  "totalRows": 10,
  "details": [
    {
      "row": 2,
      "email": "john@example.com",
      "name": "John Doe",
      "action": "created"
    }
  ],
  "errors": []
}
```

## Example Data

### Minimal Example
```
Email               | Name      | Team
john@example.com    | John Doe  | Engineering
```

### Complete Example
```
Email               | Name      | Team        | Birthday   | Chronotype | CoreValue1  | Goals_Period | Goals_Professional
john@example.com    | John Doe  | Engineering | 1990-01-15 | Lion       | Innovation  | Q1 2025      | Lead 3 major projects
```

## Tips and Best Practices

1. **Start Small**: Test with a few rows first before importing large datasets
2. **Email Format**: Use lowercase emails for consistency
3. **Date Format**: Always use YYYY-MM-DD format for birthdays
4. **Empty Cells**: Leave cells empty if data is not available (don't use "N/A" or "-")
5. **Backup**: Keep a backup of your Excel file before importing
6. **Review Results**: Always review the import results to catch any errors

## Common Errors

### "Missing required fields: email or name"
- Solution: Ensure every row has both Email and Name columns filled

### "Invalid email format"
- Solution: Check email follows format: user@domain.com

### "Invalid date format"
- Solution: Use YYYY-MM-DD format (e.g., 1990-01-15)

### "Invalid Chronotype"
- Solution: Use only: Lion, Bear, Wolf, or Dolphin (case-sensitive)

### "Invalid BigFive Level"
- Solution: Use only: High, Average, or Low (case-sensitive)

## Troubleshooting

If the import fails completely:
1. Check the Excel file is not corrupted
2. Verify the file has the correct format (.xlsx or .xls)
3. Ensure column headers match the template exactly
4. Check for special characters or hidden formatting

## Security Notes

- No authentication is currently implemented for the admin import page
- Anyone with access to `/admin/import` can import users
- Consider implementing authentication before deploying to production

## Support

For issues or questions:
1. Check the import results for specific error messages
2. Review this guide for common solutions
3. Check the console logs in the browser developer tools
4. Verify the Excel template matches the latest format
