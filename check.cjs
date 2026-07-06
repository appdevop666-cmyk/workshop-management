const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lgaecppfdcrlcfugtqiq.supabase.co',
  'sb_publishable_L-ce1QYTZRoMocmCF7EfUA_ZM7xUm7V'
);

async function check() {
  const { data: tickets } = await supabase.from('tickets').select('*');
  console.log('Tickets:', tickets);

  const { data: items, error } = await supabase.from('ticket_items').select('*, spareparts(name)');
  console.log('Items:', items);
  if (error) console.error('Error:', error);
}

check();
