import { supabaseAdmin } from '@/lib/supabase-admin'

// POST /api/upload
// Accepts a multipart form with a 'file' field and uploads it to Supabase Storage.
// Returns the storage path of the uploaded file.
export async function POST(req) {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()

  const { data, error } = await supabaseAdmin.storage
    .from('product-images')
    .upload(`uploads/${Date.now()}-${file.name}`, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) return Response.json({ error }, { status: 500 })

  // Return the storage path
  return Response.json({ path: data.path })
}