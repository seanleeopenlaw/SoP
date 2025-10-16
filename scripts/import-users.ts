import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { parseExcelFile, importUsersFromExcel } from '../src/lib/excel-import';

const prisma = new PrismaClient();

async function importUsers(filePath: string) {
  console.log(`📂 Reading file: ${filePath}`);

  // Read file into buffer
  const fileBuffer = fs.readFileSync(filePath);

  // Parse Excel file
  const data = await parseExcelFile(fileBuffer);
  console.log(`📊 Found ${data.length} rows to import\n`);

  // Import users
  const result = await importUsersFromExcel(data, prisma);

  // Display detailed results
  for (const detail of result.details) {
    const action = detail.action === 'created' ? '✅ Created' : '✏️  Updated';
    console.log(`Row ${detail.row}: ${action} - ${detail.name} (${detail.email})`);
  }

  // Display errors
  if (result.errors.length > 0) {
    console.log('\n=== Errors ===');
    for (const error of result.errors) {
      console.log(`❌ Row ${error.row}: ${error.name} (${error.email}) - ${error.error}`);
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`✅ Success: ${result.successCount}`);
  console.log(`❌ Errors: ${result.errorCount}`);
  console.log(`📊 Total: ${data.length}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];

  if (!filePath) {
    console.error('Usage: npx tsx scripts/import-users.ts <path-to-excel-file>');
    console.error('Example: npx tsx scripts/import-users.ts data/users.xlsx');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    await importUsers(filePath);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
