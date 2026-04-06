import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


// GET current user's orders
export async function getOrders() {
  // Get current user based on Supabase authentication
  let user;
  const { data: authData } = await supabase.auth.getUser();
  if (authData.user) {
    user = authData.user;
  }
  else { //FAKE USER JUST FOR TESTING
    user = {
        id: 'db7cd94b-1fad-4e1e-aac6-073c4e894351',
        email: 'johndoe69@yahoo.com',
        first_name: 'John',
        last_name: 'Doe'
      };
  }

  if (!user) {
    return Response.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // Fetch orders for current user
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('customer_id', user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 200 });
}

