import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Big Five facets structure (matching UI order from BIG_FIVE_TEMPLATE)
const bigFiveFacets = {
  Neuroticism: ['Anxiety', 'Anger', 'Depression', 'SelfConsciousness', 'Immoderation', 'Vulnerability'],
  Extraversion: ['Friendliness', 'Gregariousness', 'Assertiveness', 'ActivityLevel', 'ExcitementSeeking', 'Cheerfulness'],
  OpennessToExperience: ['Imagination', 'ArtisticInterests', 'Emotionality', 'Adventurousness', 'Intellect', 'Liberalism'],
  Agreeableness: ['Trust', 'Morality', 'Altruism', 'Cooperation', 'Modesty', 'Sympathy'],
  Conscientiousness: ['SelfEfficacy', 'Orderliness', 'Dutifulness', 'Achievement', 'SelfDiscipline', 'Cautiousness']
};

// Create Excel template for bulk user import
function createTemplate() {
  // Build Big Five headers (matching UI display order: left to right, top to bottom)
  const bigFiveHeaders: string[] = [];

  // Order matching UI: Neuroticism, Extraversion, Openness to Experience, Agreeableness, Conscientiousness
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

  // Sample data row - Build Big Five sample data dynamically
  const bigFiveSampleData: (string | number)[] = [];

  // Sample data for each trait with facets (matching UI order)
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
      const facetData = traitData.facets[facet as keyof typeof traitData.facets];
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

  // Create data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  const filePath = path.join(dataDir, 'user_import_template.xlsx');
  XLSX.writeFile(workbook, filePath);

  console.log(`✅ Template created: ${filePath}`);
  console.log(`\nTotal columns: ${headers.length}`);
  console.log('\nColumn descriptions:');
  console.log('- Email: Required, unique identifier');
  console.log('- Name: Required');
  console.log('- Team: Optional');
  console.log('- Birthday: Optional (format: YYYY-MM-DD)');
  console.log('- Chronotype: Lion, Bear, Wolf, or Dolphin');
  console.log('- CoreValue1-5: Up to 5 core values');
  console.log('- Strength1-5: Up to 5 character strengths');
  console.log('- BigFive_[Trait]_Level: High, Average, or Low');
  console.log('- BigFive_[Trait]_Score: Optional 0-999 score');
  console.log('- BigFive_[Trait]_[Facet]_Level: High, Average, or Low (optional, 6 facets per trait)');
  console.log('- BigFive_[Trait]_[Facet]_Score: Optional 0-999 score for each facet');
  console.log('- Goals_Period: Goal period (e.g., "Q1 2025", "2025")');
  console.log('- Goals_Professional: Professional goals (optional)');
  console.log('- Goals_Personal: Personal goals (optional)');
  console.log('\nBig Five Traits (in column order - matching UI display):');
  console.log('  1. Neuroticism (6 facets: Anxiety, Anger, Depression, SelfConsciousness, Immoderation, Vulnerability)');
  console.log('  2. Extraversion (6 facets: Friendliness, Gregariousness, Assertiveness, ActivityLevel, ExcitementSeeking, Cheerfulness)');
  console.log('  3. OpennessToExperience (6 facets: Imagination, ArtisticInterests, Emotionality, Adventurousness, Intellect, Liberalism)');
  console.log('  4. Agreeableness (6 facets: Trust, Morality, Altruism, Cooperation, Modesty, Sympathy)');
  console.log('  5. Conscientiousness (6 facets: SelfEfficacy, Orderliness, Dutifulness, Achievement, SelfDiscipline, Cautiousness)');
}

createTemplate();
