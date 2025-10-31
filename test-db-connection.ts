import { Client } from 'pg';

async function testConnection(config: any) {
  const client = new Client(config);

  try {
    console.log(`\n=== Testing: ${config.description} ===`);
    console.log(`Host: ${config.host}:${config.port}`);
    console.log(`Database: ${config.database}`);
    console.log(`Connecting...`);

    await client.connect();
    console.log('✓ Connection successful!');

    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('✓ Query successful!');
    console.log(`Database: ${result.rows[0].current_database}`);
    console.log(`User: ${result.rows[0].current_user}`);
    console.log(`Version: ${result.rows[0].version.substring(0, 50)}...`);

    // Test table access
    const tableTest = await client.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log(`✓ Found ${tableTest.rows[0].count} tables in public schema`);

    await client.end();
    console.log('✓ Connection closed cleanly');
    return true;
  } catch (error: any) {
    console.error(`✗ Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    if (error.code === 'ECONNREFUSED') {
      console.error('→ Connection refused - server not accepting connections');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('→ Connection timed out - network issue or firewall');
    } else if (error.code === '28P01') {
      console.error('→ Authentication failed - check credentials');
    } else if (error.code === '3D000') {
      console.error('→ Database does not exist');
    }
    try {
      await client.end();
    } catch {}
    return false;
  }
}

async function runTests() {
  const password = 'PeopleProject2025!';
  const user = 'postgres.rcaitnenussgesnxlimp';
  const host = 'aws-1-us-east-1.pooler.supabase.com';

  const tests = [
    {
      description: 'Direct Connection (Port 5432)',
      host,
      port: 5432,
      database: 'postgres',
      user,
      password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    },
    {
      description: 'Session Pooler (Port 6543, no pgbouncer)',
      host,
      port: 6543,
      database: 'postgres',
      user,
      password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    },
    {
      description: 'Transaction Pooler (Port 6543, pgbouncer mode)',
      host,
      port: 6543,
      database: 'postgres',
      user,
      password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    }
  ];

  let successCount = 0;
  let workingConfig: any = null;

  for (const test of tests) {
    const success = await testConnection(test);
    if (success) {
      successCount++;
      if (!workingConfig) workingConfig = test;
    }
  }

  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Tests passed: ${successCount}/${tests.length}`);

  if (workingConfig) {
    console.log(`\n✓ Working connection found:`);
    console.log(`  Host: ${workingConfig.host}`);
    console.log(`  Port: ${workingConfig.port}`);
    console.log(`  Database: ${workingConfig.database}`);

    const connectionString = `postgresql://${workingConfig.user}:${encodeURIComponent(password)}@${workingConfig.host}:${workingConfig.port}/${workingConfig.database}`;
    console.log(`\nConnection string:`);
    console.log(connectionString);

    if (workingConfig.port === 6543) {
      console.log(`\nFor Prisma with pgbouncer:`);
      console.log(`${connectionString}?pgbouncer=true`);
    }
  } else {
    console.log('\n✗ No working connections found');
    console.log('Possible causes:');
    console.log('  1. Supabase project is paused');
    console.log('  2. IP address is blocked');
    console.log('  3. Credentials are incorrect');
    console.log('  4. Database server is down');
  }
}

runTests().catch(console.error);
