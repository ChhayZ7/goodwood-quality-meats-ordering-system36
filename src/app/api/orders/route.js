import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


// Get current user's orders
export async function GET() {
  // Get current user based on Supabase authentication
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
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