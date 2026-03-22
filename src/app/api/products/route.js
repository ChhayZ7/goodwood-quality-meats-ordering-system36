import { supabase } from '@/lib/supabase'

// GET all products from Supabase (to be adjusted)
export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json(data)
}