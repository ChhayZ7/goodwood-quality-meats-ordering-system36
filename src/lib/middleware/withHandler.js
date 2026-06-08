// Wraps every API route handler with two things:
//   1. Input validation — checks the request body against a schema before the handler runs
//   2. Error catching — catches any unhandled errors and returns a consistent JSON error shape
//
// Every API route exports its handler wrapped in withHandler() so error handling
// never has to be repeated across individual route files.
//
// developed with AI assistance.

import { NextResponse } from 'next/server'

// Validation

// Validates a parsed request body against a schema object.
// Returns an object of field errors if any fail, or null if everything passes.
function validate(body, schema) {
  const errors = {}

  // Check required fields are present and not empty
  for (const field of schema.required ?? []) {
    const val = body[field]
    if (val === undefined || val === null || val === '') {
      errors[field] = 'This field is required'
    }
  }

  // Check each field matches its expected type
  // Arrays need special handling because typeof [] === 'object' in JS
  for (const [field, expectedType] of Object.entries(schema.types ?? {})) {
    const val = body[field]
    if (val === undefined || val === null) continue
    const actual = Array.isArray(val) ? 'array' : typeof val
    if (actual !== expectedType) {
      errors[field] = `Expected ${expectedType}, got ${actual}`
    }
  }

  // Run any custom validators (e.g. date format checks, enum membership)
  for (const [field, validator] of Object.entries(schema.validators ?? {})) {
    const val = body[field]
    if (val === undefined || val === null) continue
    const msg = validator(val, body)
    if (msg) errors[field] = msg
  }

  return Object.keys(errors).length ? errors : null
}

// Wrapper

// Wraps a route handler function with validation and error handling.
// If a schema is provided, the request body is parsed, validated, and attached
// to request._body so the handler can read it without calling request.json() again.
export function withHandler(handler, options = {}) {
  return async function (request, context) {
    try {
      if (options.schema) {
        let body
        try {
          body = await request.json()
        } catch {
          return NextResponse.json(
            { error: 'Request body must be valid JSON', status: 400 },
            { status: 400 }
          )
        }

        const errors = validate(body, options.schema)
        if (errors) {
          return NextResponse.json(
            { error: 'Validation failed', details: errors, status: 422 },
            { status: 422 }
          )
        }

        // Attach the parsed body so handlers don't need to call request.json() themselves
        request._body = body
      }

      return await handler(request, context)

    } catch (err) {
      console.error(`[API Error] ${request.method} ${request.url}`, err)

      // PGRST116 is Supabase's error code for "no rows returned" on a .single() query
      if (err?.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Resource not found', status: 404 },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'An unexpected server error occurred', status: 500 },
        { status: 500 }
      )
    }
  }
}

// Schemas

// Reusable validation schemas passed into withHandler as options.schema.
// Each schema is specific to one type of request body.
export const schemas = {

  // Used by POST /api/checkout
  createOrder: {
    required: ['customer_id', 'pickup_date', 'items'],
    types: {
      customer_id: 'string',
      pickup_date: 'string',
      items: 'array',
    },
    validators: {
      pickup_date: (val) => {
        const d = new Date(val)
        if (isNaN(d.getTime())) return 'Must be a valid date (YYYY-MM-DD)'
        if (d < new Date()) return 'Pickup date must be in the future'
        return null
      },
      items: (val) => {
        if (!val.length) return 'Order must contain at least one item'
        for (const item of val) {
          if (!item.product_id) return 'Each item must have a product_id'
          if (!item.quantity || item.quantity < 1) return 'Each item must have quantity >= 1'
          if (item.unit_price_cents === undefined) return 'Each item must have unit_price_cents'
          if (item.subtotal_cents === undefined) return 'Each item must have subtotal_cents'
        }
        return null
      },
    },
  },

  // Used by PATCH /api/orders/:id and PATCH /api/admin/orders/:id
  updateOrder: {
    types: {
      status: 'string',
      notes: 'string',
      pickup_date: 'string',
      deposit_paid_cents: 'number',
    },
    validators: {
      status: (val) => {
        const valid = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED']
        return valid.includes(val) ? null : `Must be one of: ${valid.join(', ')}`
      },
    },
  },

  // Used by POST /api/checkout/confirm
  confirmPayment: {
    required: ['order_id', 'payment_intent_id', 'items'],
    types: {
      order_id: 'string',
      payment_intent_id: 'string',
      items: 'array',
    },
  },

  // Used by PATCH /api/users/me
  updateUser: {
    types: {
      first_name: 'string',
      last_name: 'string',
      phone: 'string',
    },
    validators: {
      phone: (val) => {
        if (val && !/^[\d\s\+\-\(\)]{8,15}$/.test(val)) {
          return 'Please enter a valid phone number'
        }
        return null
      },
    },
  },
}