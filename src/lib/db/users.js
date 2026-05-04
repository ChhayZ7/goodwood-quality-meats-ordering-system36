import { createClient } from '../supabase-server'

const USER_SELECT = `
    id,
    first_name,
    last_name,
    email,
    phone,
    role,
    created_at
`


export async function getUserById(userId){
    const supabase = await createClient()
    return supabase
    .from('users')
    .select(USER_SELECT)
    .eq('id', userId)
    .single()
}

const ALLOWED_UPDATE_FIELDS = ['first_name', 'last_name', 'phone']

export async function updateUser(userId, fields){
     const supabase = await createClient()

    const updates = Object.fromEntries(
        Object.entries(fields).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
    )

    if (!Object.keys(updates).length){
        return { data: null, error: { message: 'No valid fields to update'}}
    }

    return supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select(USER_SELECT)
    .single()
}