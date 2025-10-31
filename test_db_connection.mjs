import pg from 'pg';
const { Client } = pg;

const connectionStrings = [
  {
    name: "Session Pooler (5432) with postgres.PROJECT_REF",
    url: "postgresql://postgres.rcaitnenussgesnxlimp:PeopleProject2025!@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
  },
  {
    name: "Transaction Pooler (6543) with postgres.PROJECT_REF",
    url: "postgresql://postgres.rcaitnenussgesnxlimp:PeopleProject2025!@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
  },
  {
    name: "Direct Connection (IPv6)",
    url: "postgresql://postgres:PeopleProject2025!@db.rcaitnenussgesnxlimp.supabase.co:5432/postgres"
  },
  {
    name: "Session Pooler without project ref suffix",
    url: "postgresql://postgres:PeopleProject2025!@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
  }
];

async function testConnection(connString) {
  const client = new Client({
    connectionString: connString.url,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log(`\n--- Testing: ${connString.name} ---`);
    await client.connect();
    const result = await client.query('SELECT version();');
    console.log('✓ SUCCESS! Connected successfully');
    console.log('PostgreSQL version:', result.rows[0].version.substring(0, 50) + '...');
    await client.end();
    return true;
  } catch (err) {
    console.log('✗ FAILED:', err.message);
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    return false;
  }
}

async function main() {
  console.log('Testing Supabase Database Connections...\n');
  console.log('Project Reference: rcaitnenussgesnxlimp');
  console.log('Region: us-east-1\n');

  for (const connString of connectionStrings) {
    const success = await testConnection(connString);
    if (success) {
      console.log('\n========================================');
      console.log('WORKING CONNECTION STRING FOUND!');
      console.log('========================================');
      console.log('Use this for your .env file:');
      console.log(`\nDATABASE_URL="${connString.url}"`);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

main().catch(console.error);
