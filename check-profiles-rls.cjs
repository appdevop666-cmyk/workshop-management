const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.lgaecppfdcrlcfugtqiq:H%238mhk7WXva5%2F%246@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres' });

async function run() {
  await client.connect();
  const { rows } = await client.query("SELECT tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'profiles'");
  console.log(rows);
  const { rows: profiles } = await client.query("SELECT email, full_name, role, current_session_token FROM profiles");
  console.log(profiles);
  await client.end();
}
run();
