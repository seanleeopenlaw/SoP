# User Import Guide

## 📋 Quick Start

### 1. Generate Excel Template
```bash
npx tsx scripts/create-template.ts
```

This creates `data/user_import_template.xlsx` with sample data.

### 2. Fill in User Data

Open `data/user_import_template.xlsx` and fill in the data:

| Column | Required | Format | Example |
|--------|----------|--------|---------|
| Email | ✅ Yes | email@domain.com | john.doe@company.com |
| Name | ✅ Yes | Full name | John Doe |
| Team | No | Text | Engineering |
| Birthday | No | YYYY-MM-DD | 1990-01-15 |
| Chronotype | No | Lion/Bear/Wolf/Dolphin | Lion |
| CoreValue1-5 | No | Text | Innovation |
| Strength1-5 | No | Text | Leadership |
| BigFive_Openness | No | 0-100 | 75 |
| BigFive_Conscientiousness | No | 0-100 | 80 |
| BigFive_Extraversion | No | 0-100 | 65 |
| BigFive_Agreeableness | No | 0-100 | 70 |
| BigFive_Neuroticism | No | 0-100 | 40 |

### 3. Import Users
```bash
npx tsx scripts/import-users.ts data/user_import_template.xlsx
```

Or with your own file:
```bash
npx tsx scripts/import-users.ts data/my_users.xlsx
```

## 📝 Notes

- **Email is unique**: If a user with the same email exists, their data will be updated
- **Leave cells empty**: Optional fields can be left blank
- **Core Values & Strengths**: You can provide 0-5 values/strengths
- **Big Five Scores**: Values should be between 0-100 (defaults to 50 if missing)

## 🎯 Example Workflow

1. PDF를 보고 Excel에 데이터 입력
2. Import script 실행
3. `/users` 페이지에서 확인
4. 필요시 `/profile`에서 개별 편집

## ⚠️ Troubleshooting

**Error: File not found**
- Check the file path is correct
- Make sure you're running from the project root directory

**Error: Missing email or name**
- Every row must have both Email and Name filled in

**Database errors**
- Check Supabase connection in `.env`
- Verify database is running

## 🔧 Advanced

To modify the import logic, edit `scripts/import-users.ts`

To change template columns, edit `scripts/create-template.ts`
