//PATCH /api/users/me/password
//Updates the logged-in user's password via Supabase Auth

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { withHandler } from "@/lib/middleware/withHandler";

export const PATCH = withHandler(
    async (request) => {
        const { current_password, new_password } = request._body

        const supabase = await createClient()

        // Verify the user is logged in
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user){
            return NextResponse.json(
                { error: 'Unauthorised - please log in', status: 401},
                { status: 401 }
            )
        }

        // Re-authenticate with current password to verify they know it
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: current_password,
        })

        if (signInError){
            return NextResponse.json(
                { error: 'Current password is incorrect', status: 400},
                { status: 400 }
            )
        }

        // Update to new password
        const { error: updateError } = await supabase.auth.updateUser({
            password: new_password
        })

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message, status: 400 },
                { status: 400}
            )
        }

        return NextResponse.json({ message: 'Password updated successfully'})
    },
    {
        schema: {
            required: ['current_password', 'new_password'],
            types: {
                current_password: 'string',
                new_password: 'string',
            },
            validators: {
                new_password: (val) => {
                    if (val.length < 8){
                        return 'New password must be at least 8 characters'
                    }
                    // if (val == val.toLowerCase()){
                    //     return 'Password must contain at least one uppercase letter'
                    // }
                    // if (!/\d/.test(val)){
                    //     return 'Password must contain at least one number'
                    // }
                    return null
                },
            },
        },
    }
)