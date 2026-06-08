// Database operations for customer profile reads and updates.
// Uses the server-side Supabase client (not the admin client) so that
// row-level security policies apply, users can only read and update their own data.

import { createClient } from '../supabase-server'

// Reusable select fragment for user profile fields.
// email_unsubscribed controls whether the customer receives marketing emails.
const USER_SELECT = `
  id,
  first_name,
  last_name,
  email,
  phone,
  role,
  email_unsubscribed,
  created_at
`

// Fetch a single user's profile by their ID.
// Used by /api/users/me to populate the customer account page.
export async function getUserById(userId) {
  const supabase = await createClient()
  return supabase
    .from('users')
    .select(USER_SELECT)
    .eq('id', userId)
    .single()
}

// Fields a customer is allowed to update on their own profile.
// Whitelisted here so route handlers can't accidentally write to
// sensitive columns like role or email.
const ALLOWED_UPDATE_FIELDS = ['first_name', 'last_name', 'phone', 'email_unsubscribed']

// Update a customer's profile, only applying fields that are whitelisted above.
// Returns the updated profile row so the frontend can reflect changes immediately.
export async function updateUser(userId, fields) {
  const supabase = await createClient()

  const updates = Object.fromEntries(
    Object.entries(fields).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
  )

  if (!Object.keys(updates).length) {
    return { data: null, error: { message: 'No valid fields to update' } }
  }

  return supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select(USER_SELECT)
    .single()
}