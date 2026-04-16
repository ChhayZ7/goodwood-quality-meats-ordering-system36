//Get /api/users/me returns the logged-in customer's profile
//PATCH /api/users/me updates first_name, last_name, phone only

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server"
import { withHandler, schemas } from "@/lib/middleware/withHandler"
import { getUserById, updateUser } from "@/lib/db/users"

// Shared auth check - gets the logged-in user from the session cookie
async function getAuthUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    console.log('[/api/users/me] auth.getUser result:')
    console.log('  user:', user)
    console.log('  error:', error)

    if (error || !user) return null
    return user ?? null
}

// GET /api/users/me
export const GET = withHandler(async (request) => {
    console.log('[/api/users/me] GET called')
    console.log('[/api/users/me] cookies:', request.cookies?.getAll?.())
    const authUser = await getAuthUser()
    console.log('[/api/users/me] authUser:', authUser)

    if (!authUser){
        console.log('[/api/users/me] No auth user — returning 401')
        return NextResponse.json(
            { error: 'Unauthorised - please log in', status: 401},
            { status: 401 }
        )
    }

    const { data, error } = await getUserById(authUser.id)

    if (error) throw error

    if(!data){
        return NextResponse.json(
            { error: 'Profile not found', status: 404},
            { status: 404 }
        )
    }

    return NextResponse.json({ user: data })
})

// PATCH /api/users/me
export const PATCH = withHandler(
    async (request) => {
        const authUser = await getAuthUser()

        if (!authUser){
            return NextResponse.json(
                { error: "Unauthorised = please log in", status: 401 },
                { status: 401 }
            )
        }

        const { data, error } = await updateUser(authUser.id, request._body)

        if (error) {
            throw error
        }

        return NextResponse.json({ user: data })
    },
    { schema: schemas.updateUser}
)