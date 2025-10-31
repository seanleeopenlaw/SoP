import { Client } from 'pg';

async function testDirectConnections() {
  const password = 'PeopleProject2025!';
  const user = 'postgres.rcaitnenussgesnxlimp';
  const projectRef = 'rcaitnenussgesnxlimp';

  const hosts = [
    { host: 'aws-1-us-east-1.pooler.supabase.com', port: 5432, desc: 'Pooler hostname on 5432' },
    { host: `${projectRef}.supabase.co`, port: 5432, desc: 'Direct hostname on 5432' },
    { host: `db.${projectRef}.supabase.co`, port: 5432, desc: 'Database hostname on 5432' },
    { host: 'aws-1-us-east-1.pooler.supabase.com', port: 6543, desc: 'Pooler on 6543 (working)' },
  ];

  for (const { host, port, desc } of hosts) {
    const client = new Client({
      host,
      port,
      database: 'postgres',
      user,
      password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      console.log(`\nTesting: ${desc}`);
      console.log(`  ${host}:${port}`);
      await client.connect();
      const result = await client.query('SELECT version()');
      console.log(`  ✓ SUCCESS`);
      await client.end();
    } catch (err: any) {
      console.log(`  ✗ FAILED: ${err.message}`);
    }
  }
}

testDirectConnections();
