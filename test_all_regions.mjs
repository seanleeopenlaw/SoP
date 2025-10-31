import pg from 'pg';
const { Client } = pg;

const regions = [
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-central-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'sa-east-1'
];

const projectRef = 'rcaitnenussgesnxlimp';
const password = 'PeopleProject2025!';

async function testConnection(region) {
  // Try session pooler for this region
  const url = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres`;

  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT version();');
    await client.end();
    return { success: true, region, url };
  } catch (err) {
    try {
      await client.end();
    } catch (e) {
      // Ignore
    }
    return { success: false, region, error: err.message };
  }
}

async function main() {
  console.log('Testing all AWS regions for Supabase project...');
  console.log(`Project Reference: ${projectRef}\n`);

  const results = [];

  for (const region of regions) {
    process.stdout.write(`Testing ${region}... `);
    const result = await testConnection(region);
    results.push(result);

    if (result.success) {
      console.log('✓ SUCCESS!');
      console.log('\n========================================');
      console.log('WORKING CONNECTION FOUND!');
      console.log('========================================');
      console.log(`Region: ${result.region}`);
      console.log(`\nAdd to .env file:`);
      console.log(`DATABASE_URL="${result.url}"`);
      console.log(`DIRECT_URL="${result.url.replace(':5432', ':6543')}"`);
      return;
    } else {
      console.log(`✗ ${result.error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n========================================');
  console.log('NO WORKING CONNECTIONS FOUND');
  console.log('========================================');
  console.log('\nPossible issues:');
  console.log('1. Project reference is incorrect');
  console.log('2. Database password is incorrect');
  console.log('3. Project is paused or deleted');
  console.log('\nPlease verify credentials in Supabase dashboard:');
  console.log(`https://supabase.com/dashboard/project/${projectRef}/settings/database`);
}

main().catch(console.error);
