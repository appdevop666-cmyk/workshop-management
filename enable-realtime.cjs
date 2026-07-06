const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lgaecppfdcrlcfugtqiq:H%238mhk7WXva5%2F%246@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    // Check if tickets is already in supabase_realtime publication
    const { rows } = await client.query(`
      SELECT * FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'tickets';
    `);

    if (rows.length === 0) {
      await client.query(`
        ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
      `);
      console.log("Realtime enabled for tickets table.");
    } else {
      console.log("Realtime is already enabled for tickets table.");
    }

  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

run();
