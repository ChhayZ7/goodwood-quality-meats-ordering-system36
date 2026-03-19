import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req) {
  const formData = await req.formData()
  const file = formData.get('file')
  const arrayBuffer = await file.arrayBuffer()

  const { data, error } = await supabaseAdmin.storage
    .from('your-bucket')
    .upload(`uploads/${Date.now()}-${file.name}`, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) return Response.json({ error }, { status: 500 })
  return Response.json({ path: data.path })
}

const { data } = supabaseAdmin.storage
  .from('your-bucket')
  .getPublicUrl('uploads/your-file.png')

console.log(data.publicUrl)