const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.lgaecppfdcrlcfugtqiq:H%238mhk7WXva5%2F%246@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });

async function run() {
  await client.connect();
  const { rows } = await client.query('SELECT id, email FROM auth.users');
  console.log("AUTH USERS:", rows);
  
  const { rows: profiles } = await client.query('SELECT id, full_name, role FROM profiles');
  console.log("PROFILES:", profiles);
  await client.end();
}
run();
