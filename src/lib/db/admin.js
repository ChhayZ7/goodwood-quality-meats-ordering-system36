// Database operations for the admin orders API.
// Includes audit trail logging

import { supabaseAdmin } from '@/lib/supabase-admin'

// Queries

export async function getAllOrders({
  status,
  dateFrom,
  dateTo,
  search,
  limit = 50,
  offset = 0,
} = {}) {
  let query = supabaseAdmin
    .from('orders')
    .select(`
      id,
      status,
      pickup_date,
      notes,
      total_cents,
      deposit_required_cents,
      deposit_paid_cents,
      created_at,
      updated_at,
      customer:users (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      order_items (
        id,
        quantity,
        weight_preference,
        unit_price_cents,
        subtotal_cents,
        product:products ( id, name, product_type )
      ),
      payments (
        id,
        amount_cents,
        type,
        status,
        created_at
      ),
      last_audit:order_audit_logs (
        id,
        field,
        old_value,
        new_value,
        reason,
        created_at,
        changed_by_user:users!changed_by (
          id,
          first_name,
          last_name,
          role
        )
      )
    `)
    .neq('status', 'PENDING')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (dateFrom) query = query.gte('pickup_date', dateFrom)
  if (dateTo) query = query.lte('pickup_date', dateTo)

  const { data, error } = await query

  if (error) throw error

  const filtered = search
    ? data.filter(order => {
      const name = `${order.customer?.first_name ?? ''} ${order.customer?.last_name ?? ''}`.toLowerCase()
      return name.includes(search.toLowerCase())
    })
    : data

  return { data: filtered, error: null }
}

// Fetch a single order with its full audit log.
// NOW includes actual_weight_kg on order_items so the weight inputs
// are pre-populated when staff re-open an order they've already weighed.
export async function getAdminOrderById(orderId) {
  const [orderResult, auditResult] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select(`
        id,
        status,
        pickup_date,
        notes,
        total_cents,
        deposit_required_cents,
        deposit_paid_cents,
        created_at,
        updated_at,
        customer:users (
          id,
          first_name,
          last_name,
          email,
          phone,
          role
        ),
        order_items (
          id,
          quantity,
          weight_preference,
          unit_price_cents,
          subtotal_cents,
          actual_weight_kg,
          notes,
          product:products (
            id,
            name,
            product_type,
            price_cents,
            price_per_kg_cents,
            is_price_estimate
          ),
          weight_option:product_weight_options (
            id,
            label,
            min_weight_kg,
            max_weight_kg
          )
        ),
        payments (
          id,
          amount_cents,
          type,
          status,
          provider,
          stripe_payment_intent_id,
          created_at
        )
      `)
      .eq('id', orderId)
      .single(),

    supabaseAdmin
      .from('order_audit_logs')
      .select(`
        id,
        field,
        old_value,
        new_value,
        reason,
        created_at,
        changed_by_user:users!changed_by (
          id,
          first_name,
          last_name,
          role
        )
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: false }),
  ])

  if (orderResult.error) throw orderResult.error

  return {
    data: {
      ...orderResult.data,
      audit_log: auditResult.data ?? [],
    },
    error: null,
  }
}

// ─── Changes ──────────────────────────────────────────────────────────────────

export async function adminUpdateOrder(orderId, fields, adminId, reason = null) {
  const allowed = ['status', 'notes', 'pickup_date', 'deposit_paid_cents']
  const updates = Object.fromEntries(
    Object.entries(fields).filter(([k]) => allowed.includes(k))
  )

  if (!Object.keys(updates).length) {
    return { data: null, error: { message: 'No valid fields to update' } }
  }

  const { data: current, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('status, notes, pickup_date, deposit_paid_cents')
    .eq('id', orderId)
    .single()

  if (fetchError) throw fetchError

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select('id, status, notes, pickup_date, deposit_paid_cents, updated_at')
    .single()

  if (updateError) throw updateError

  const auditRows = Object.entries(updates)
    .filter(([field, newVal]) => String(current[field]) !== String(newVal))
    .map(([field, newVal]) => ({
      order_id: orderId,
      changed_by: adminId,
      field,
      old_value: current[field] != null ? String(current[field]) : null,
      new_value: String(newVal),
      reason,
    }))

  if (auditRows.length > 0) {
    const { error: auditError } = await supabaseAdmin
      .from('order_audit_logs')
      .insert(auditRows)

    if (auditError) {
      console.error('[adminUpdateOrder] audit log insert failed:', auditError)
    }
  }

  return { data: updated, error: null }
}