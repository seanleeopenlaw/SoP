const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function compareExcelWithDB() {
  try {
    // Read Excel file
    const workbook = XLSX.readFile('/Users/seanlee/Desktop/user_import_template_V3.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`\n📊 Excel File: ${excelData.length} rows\n`);

    // Get DB data
    const dbProfiles = await prisma.userProfile.findMany({
      where: {
        email: { not: 'admin@openlaw.com.au' }
      },
      select: {
        email: true,
        name: true,
        team: true,
        birthday: true,
      },
      orderBy: { name: 'asc' }
    });

    console.log(`💾 Database: ${dbProfiles.length} profiles\n`);

    // Create maps for comparison
    const excelEmails = new Set(excelData.map(row => row.Email?.toLowerCase().trim()));
    const dbEmails = new Set(dbProfiles.map(p => p.email));

    // Find differences
    const inExcelNotDB = Array.from(excelEmails).filter(email => !dbEmails.has(email));
    const inDBNotExcel = Array.from(dbEmails).filter(email => !excelEmails.has(email));

    // Print Excel data
    console.log('📄 EXCEL DATA:');
    console.log('─'.repeat(80));
    excelData.forEach((row, i) => {
      console.log(`${i + 1}. ${row.Name} (${row.Email}) - Team: ${row.Team || 'N/A'}`);
    });

    console.log('\n💾 DATABASE DATA:');
    console.log('─'.repeat(80));
    dbProfiles.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.email}) - Team: ${p.team || 'N/A'}`);
    });

    // Print comparison results
    console.log('\n\n🔍 COMPARISON RESULTS:');
    console.log('═'.repeat(80));

    if (excelEmails.size === dbEmails.size && inExcelNotDB.length === 0 && inDBNotExcel.length === 0) {
      console.log('✅ PERFECT MATCH! Excel and Database have identical users.');
    } else {
      console.log(`❌ MISMATCH DETECTED:`);
      console.log(`   Excel: ${excelEmails.size} users`);
      console.log(`   Database: ${dbEmails.size} users`);

      if (inExcelNotDB.length > 0) {
        console.log(`\n📄 In Excel but NOT in Database (${inExcelNotDB.length}):`);
        inExcelNotDB.forEach(email => {
          const row = excelData.find(r => r.Email?.toLowerCase().trim() === email);
          console.log(`   - ${row?.Name} (${email})`);
        });
      }

      if (inDBNotExcel.length > 0) {
        console.log(`\n💾 In Database but NOT in Excel (${inDBNotExcel.length}):`);
        inDBNotExcel.forEach(email => {
          const profile = dbProfiles.find(p => p.email === email);
          console.log(`   - ${profile?.name} (${email})`);
        });
      }
    }

    console.log('\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

compareExcelWithDB();
