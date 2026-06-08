// Database operations for the admin orders API.
// Includes audit trail logging so every change to an order is recorded

import { supabaseAdmin } from '@/lib/supabase-admin'

// Queries

// Fetch all orders for the admin/staff dashboard.
// Supports optional filters
// PENDING orders are always excluded, they represent unpaid checkouts.
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

  // Apply optional filters if provided
  if (status)   query = query.eq('status', status)
  if (dateFrom) query = query.gte('pickup_date', dateFrom)
  if (dateTo)   query = query.lte('pickup_date', dateTo)

  const { data, error } = await query
  if (error) throw error

  // Customer name search is done in JS rather than SQL because Supabase
  // doesn't support filtering on joined table columns directly in the query builder
  const filtered = search
    ? data.filter(order => {
        const name = `${order.customer?.first_name ?? ''} ${order.customer?.last_name ?? ''}`.toLowerCase()
        return name.includes(search.toLowerCase())
      })
    : data

  return { data: filtered, error: null }
}

// Fetch a single order with its full audit log for the detail view.
// Runs both queries in parallel via Promise.all to avoid waiting for one
// to finish before starting the other.
export async function getAdminOrderById(orderId) {
  const [orderResult, auditResult] = await Promise.all([

    // Full order with customer, line items, products, weight options, and payments
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

    // Full audit log for this order, newest entries first
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

  // Attach the audit log onto the order object before returning
  return {
    data: {
      ...orderResult.data,
      audit_log: auditResult.data ?? [],
    },
    error: null,
  }
}

// Changes

// Update allowed fields on an order and write one audit log row per changed field.
// Only fields that actually changed get logged
export async function adminUpdateOrder(orderId, fields, adminId, reason = null) {

  // Whitelist which fields can be updated, prevents arbitrary column writes
  const allowed = ['status', 'notes', 'pickup_date', 'deposit_paid_cents']
  const updates = Object.fromEntries(
    Object.entries(fields).filter(([k]) => allowed.includes(k))
  )

  if (!Object.keys(updates).length) {
    return { data: null, error: { message: 'No valid fields to update' } }
  }

  // Fetch current values before updating so we can record old to new in the audit log
  const { data: current, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('status, notes, pickup_date, deposit_paid_cents')
    .eq('id', orderId)
    .single()

  if (fetchError) throw fetchError

  // Apply the update
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select('id, status, notes, pickup_date, deposit_paid_cents, updated_at')
    .single()

  if (updateError) throw updateError

  // Build audit log rows, one per field that actually changed value
  const auditRows = Object.entries(updates)
    .filter(([field, newVal]) => String(current[field]) !== String(newVal))
    .map(([field, newVal]) => ({
      order_id:   orderId,
      changed_by: adminId,
      field,
      old_value:  current[field] != null ? String(current[field]) : null,
      new_value:  String(newVal),
      reason,
    }))

  if (auditRows.length > 0) {
    const { error: auditError } = await supabaseAdmin
      .from('order_audit_logs')
      .insert(auditRows)

    // Log the failure but don't block the response, the order update already
    // succeeded so don't roll back over an audit log issue
    if (auditError) {
      console.error('[adminUpdateOrder] audit log insert failed:', auditError)
    }
  }

  return { data: updated, error: null }
}