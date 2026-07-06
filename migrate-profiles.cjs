const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lgaecppfdcrlcfugtqiq:H%238mhk7WXva5%2F%246@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    // 1. Add current_session_token column to profiles
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS current_session_token TEXT;
    `);
    console.log("Added current_session_token column to profiles table.");

    // 2. Enable Realtime on profiles table
    const { rows } = await client.query(`
      SELECT * FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'profiles';
    `);

    if (rows.length === 0) {
      await client.query(`
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
      `);
      console.log("Realtime enabled for profiles table.");
    } else {
      console.log("Realtime is already enabled for profiles table.");
    }

  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

run();
