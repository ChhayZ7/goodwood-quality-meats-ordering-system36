// Wraps every API route handler with consistent error catching
// and input validation. All errors are returned in consistent format

// Input validation done with AI for convenience and comprehensiveness


import { NextResponse } from 'next/server'

// Input validation
function validate(body, schema) {
  const errors = {}

  for (const field of schema.required ?? []) {
    const val = body[field]
    if (val === undefined || val === null || val === '') {
      errors[field] = 'This field is required'
    }
  }

  for (const [field, expectedType] of Object.entries(schema.types ?? {})) {
    const val = body[field]
    if (val === undefined || val === null) continue
    const actual = Array.isArray(val) ? 'array' : typeof val
    if (actual !== expectedType) {
      errors[field] = `Expected ${expectedType}, got ${actual}`
    }
  }

  for (const [field, validator] of Object.entries(schema.validators ?? {})) {
    const val = body[field]
    if (val === undefined || val === null) continue
    const msg = validator(val, body)
    if (msg) errors[field] = msg
  }

  return Object.keys(errors).length ? errors : null
}


// Wrapper function
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

        // Attach to request so handler can read it without parsing again
        request._body = body
      }

      return await handler(request, context)
    } catch (err) {
      console.error(`[API Error] ${request.method} ${request.url}`, err)

      // Error if row cannot be found in supabase
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



// Reusable schemas to check attributes
export const schemas = {
  createOrder: {
    required: ['customer_id', 'pickup_date', 'items'],
    types: {
      customer_id: 'string',
      pickup_date: 'string',
      items:       'array',
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
          if (!item.product_id)                    return 'Each item must have a product_id'
          if (!item.quantity || item.quantity < 1) return 'Each item must have quantity >= 1'
          if (item.unit_price_cents === undefined) return 'Each item must have unit_price_cents'
          if (item.subtotal_cents === undefined)   return 'Each item must have subtotal_cents'
        }
        return null
      },
    },
  },

  updateOrder: {
    types: {
      status:             'string',
      notes:              'string',
      pickup_date:        'string',
      deposit_paid_cents: 'number',
    },
    validators: {
      status: (val) => {
        const valid = ['PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED']
        return valid.includes(val) ? null : `Must be one of: ${valid.join(', ')}`
      },
    },
  },

  confirmPayment: {
    required: ['order_id', 'payment_intent_id', 'items'],
    types: {
      order_id:          'string',
      payment_intent_id: 'string',
      items:             'array',
    },
  },

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