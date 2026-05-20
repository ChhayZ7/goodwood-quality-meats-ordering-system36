import { NextResponse } from 'next/server'
import { withHandler } from '@/lib/middleware/withHandler'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const feedbackSchema = {
  required: ['order_id', 'score'],
  types: {
    order_id:      'string',
    score:         'number',
    feedback_text: 'string',
  },
  validators: {
    score: (val) => {
      if (!Number.isInteger(val) || val < 1 || val > 5)
        return 'Score must be an integer between 1 and 5'
      return null
    },
  },
}

export const POST = withHandler(async (request) => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised — please log in' }, { status: 401 })
  }

  const { order_id, score, feedback_text } = request._body

  // Verify the order belongs to this customer
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, customer_id')
    .eq('id', order_id)
    .eq('customer_id', user.id)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Order not found or does not belong to you' }, { status: 404 })
  }

  // One feedback per order
  const { data: existing } = await supabaseAdmin
    .from('feedback')
    .select('id')
    .eq('order_id', order_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Feedback already submitted for this order' }, { status: 409 })
  }

  const { data, error } = await supabaseAdmin
    .from('feedback')
    .insert({ customer_id: user.id, order_id, score, feedback_text: feedback_text ?? null })
    .select()
    .single()

  if (error) throw error

  return NextResponse.json({ feedback: data }, { status: 201 })
}, { schema: feedbackSchema })