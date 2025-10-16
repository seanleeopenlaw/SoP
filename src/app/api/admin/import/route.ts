import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseExcelFile, importUsersFromExcel } from '@/lib/excel-import';
import { TEMPLATE_VERSION, TEMPLATE_UPDATED_DATE } from '@/lib/template-version';

export async function POST(request: Request) {
  try {
    // Note: Admin-only access is enforced by AdminRoute component on client-side
    // In production, add server-side session validation here
    console.log('[Import] Starting import process...');

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const resetDatabase = formData.get('resetDatabase') === 'true';

    if (!file) {
      console.error('[Import] No file uploaded');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (resetDatabase) {
      console.log('[Import] WARNING: Database reset mode enabled - will delete profiles not in import file');
    }

    console.log('[Import] File received:', file.name, 'Size:', file.size);

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      console.error('[Import] Invalid file type:', file.name);
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('[Import] File converted to buffer, size:', buffer.length);

    // Parse Excel file
    console.log('[Import] Parsing Excel file...');
    const data = await parseExcelFile(buffer);
    console.log('[Import] Parsed', data.length, 'rows from Excel');

    if (data.length === 0) {
      console.error('[Import] Excel file is empty');
      return NextResponse.json(
        { error: 'Excel file is empty or has no valid data' },
        { status: 400 }
      );
    }

    // Log first row headers for debugging
    if (data.length > 0) {
      const firstRow = data[0] as any;
      const headers = Object.keys(firstRow);
      console.log('[Import] First 10 column headers:', headers.slice(0, 10));
      console.log('[Import] Total columns:', headers.length);
    }

    // Import users
    console.log('[Import] Starting user import...');
    const result = await importUsersFromExcel(data, prisma, resetDatabase);
    console.log('[Import] Import completed:', {
      success: result.success,
      successCount: result.successCount,
      errorCount: result.errorCount,
      resetMode: resetDatabase
    });

    // Return results
    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Successfully imported ${result.successCount} users`
        : `Import completed with ${result.errorCount} errors`,
      successCount: result.successCount,
      errorCount: result.errorCount,
      totalRows: data.length,
      details: result.details,
      errors: result.errors,
    });
  } catch (error) {
    console.error('[Import] Error processing import:', error);
    console.error('[Import] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Failed to process import',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Endpoint to download the template
export async function GET() {
  try {
    // Generate template dynamically
    const XLSX = await import('xlsx');

    // Big Five facets structure (matching UI order from BIG_FIVE_TEMPLATE)
    const bigFiveFacets = {
      Neuroticism: ['Anxiety', 'Anger', 'Depression', 'SelfConsciousness', 'Immoderation', 'Vulnerability'],
      Extraversion: ['Friendliness', 'Gregariousness', 'Assertiveness', 'ActivityLevel', 'ExcitementSeeking', 'Cheerfulness'],
      OpennessToExperience: ['Imagination', 'ArtisticInterests', 'Emotionality', 'Adventurousness', 'Intellect', 'Liberalism'],
      Agreeableness: ['Trust', 'Morality', 'Altruism', 'Cooperation', 'Modesty', 'Sympathy'],
      Conscientiousness: ['SelfEfficacy', 'Orderliness', 'Dutifulness', 'Achievement', 'SelfDiscipline', 'Cautiousness']
    };

    // Build Big Five headers (matching UI display order: left to right, top to bottom)
    const bigFiveHeaders: string[] = [];
    const traitOrder = ['Neuroticism', 'Extraversion', 'OpennessToExperience', 'Agreeableness', 'Conscientiousness'];

    traitOrder.forEach(trait => {
      // Main trait level and score
      bigFiveHeaders.push(`BigFive_${trait}_Level`);
      bigFiveHeaders.push(`BigFive_${trait}_Score`);

      // Facet levels and scores
      bigFiveFacets[trait as keyof typeof bigFiveFacets].forEach(facet => {
        bigFiveHeaders.push(`BigFive_${trait}_${facet}_Level`);
        bigFiveHeaders.push(`BigFive_${trait}_${facet}_Score`);
      });
    });

    const headers = [
      'Email',
      'Name',
      'Team',
      'Birthday',
      'Chronotype',
      'CoreValue1',
      'CoreValue2',
      'CoreValue3',
      'CoreValue4',
      'CoreValue5',
      'Strength1',
      'Strength2',
      'Strength3',
      'Strength4',
      'Strength5',
      ...bigFiveHeaders,
      'Goals_Period',
      'Goals_Professional',
      'Goals_Personal'
    ];

    // Build sample data with Big Five facets
    const bigFiveSampleData: (string | number)[] = [];

    const sampleTraitData = {
      Neuroticism: {
        level: 'Low',
        score: 450,
        facets: {
          Anxiety: { level: 'Low', score: 420 },
          Anger: { level: 'Low', score: 400 },
          Depression: { level: 'Low', score: 380 },
          SelfConsciousness: { level: 'Average', score: 550 },
          Immoderation: { level: 'Low', score: 430 },
          Vulnerability: { level: 'Low', score: 470 }
        }
      },
      Extraversion: {
        level: 'Average',
        score: 750,
        facets: {
          Friendliness: { level: 'High', score: 800 },
          Gregariousness: { level: 'Average', score: 720 },
          Assertiveness: { level: 'High', score: 810 },
          ActivityLevel: { level: 'Average', score: 740 },
          ExcitementSeeking: { level: 'Low', score: 650 },
          Cheerfulness: { level: 'Average', score: 780 }
        }
      },
      OpennessToExperience: {
        level: 'High',
        score: 850,
        facets: {
          Imagination: { level: 'High', score: 880 },
          ArtisticInterests: { level: 'High', score: 820 },
          Emotionality: { level: 'Average', score: 750 },
          Adventurousness: { level: 'High', score: 900 },
          Intellect: { level: 'High', score: 870 },
          Liberalism: { level: 'Average', score: 780 }
        }
      },
      Agreeableness: {
        level: 'High',
        score: 800,
        facets: {
          Trust: { level: 'Average', score: 750 },
          Morality: { level: 'High', score: 850 },
          Altruism: { level: 'High', score: 820 },
          Cooperation: { level: 'High', score: 810 },
          Modesty: { level: 'Average', score: 770 },
          Sympathy: { level: 'High', score: 830 }
        }
      },
      Conscientiousness: {
        level: 'High',
        score: 920,
        facets: {
          SelfEfficacy: { level: 'High', score: 910 },
          Orderliness: { level: 'High', score: 880 },
          Dutifulness: { level: 'High', score: 950 },
          Achievement: { level: 'High', score: 930 },
          SelfDiscipline: { level: 'High', score: 900 },
          Cautiousness: { level: 'Average', score: 820 }
        }
      }
    };

    traitOrder.forEach(trait => {
      const traitData = sampleTraitData[trait as keyof typeof sampleTraitData];
      // Main trait level and score
      bigFiveSampleData.push(traitData.level);
      bigFiveSampleData.push(traitData.score);

      // Facet levels and scores
      bigFiveFacets[trait as keyof typeof bigFiveFacets].forEach(facet => {
        const facetData = traitData.facets[facet as keyof typeof traitData.facets] as { level: string; score: number };
        bigFiveSampleData.push(facetData.level);
        bigFiveSampleData.push(facetData.score);
      });
    });

    const sampleData = [
      'john.doe@example.com',
      'John Doe',
      'Engineering',
      '1990-01-15',
      'Lion',
      'Innovation',
      'Integrity',
      'Collaboration',
      '',
      '',
      'Creativity',
      'Leadership',
      'Persistence',
      '',
      '',
      ...bigFiveSampleData,
      'Q1 2025',
      'Lead three major projects and mentor two junior developers',
      'Complete a marathon and learn Spanish'
    ];

    const worksheetData = [headers, sampleData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 25 }, // Email
      { wch: 20 }, // Name
      { wch: 15 }, // Team
      { wch: 12 }, // Birthday
      { wch: 12 }, // Chronotype
    ];

    // Core Values (5 columns)
    for (let i = 0; i < 5; i++) {
      columnWidths.push({ wch: 15 });
    }

    // Strengths (5 columns)
    for (let i = 0; i < 5; i++) {
      columnWidths.push({ wch: 15 });
    }

    // Big Five (each trait has 1 level + 1 score + 6 facets * 2 = 14 columns per trait, 5 traits = 70 columns)
    for (let i = 0; i < bigFiveHeaders.length; i++) {
      columnWidths.push({ wch: 10 });
    }

    // Goals
    columnWidths.push({ wch: 15 }); // Goals_Period
    columnWidths.push({ wch: 50 }); // Goals_Professional
    columnWidths.push({ wch: 50 }); // Goals_Personal

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Write to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file with version metadata in headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="user_import_template.xlsx"',
        'X-Template-Version': TEMPLATE_VERSION,
        'X-Template-Updated': TEMPLATE_UPDATED_DATE,
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
