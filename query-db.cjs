const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lgaecppfdcrlcfugtqiq:H%238mhk7WXva5%2F%246@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  
  const tickets = await client.query('SELECT id, client_name FROM tickets');
  console.log('Tickets:', tickets.rows);

  const items = await client.query('SELECT * FROM ticket_items');
  console.log('Ticket Items:', items.rows);
  
  await client.end();
}

run().catch(console.error);
