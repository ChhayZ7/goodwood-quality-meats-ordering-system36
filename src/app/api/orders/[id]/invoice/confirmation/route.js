import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getOrderById } from "@/lib/db/orders";
import { generateInvoicePDF } from "@/lib/pdf/invoice";

export async function GET(request, {params }){
    const { id } = await params

    // Auth check
    const supabase = await createClient()
    const { data:  { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user){
        return NextResponse.json({ error: 'Unauthorised - please log in'}, { status: 401 })
    }

    // Fetch order
    const { data: order, error: orderError } = await getOrderById(id)

    if (orderError || !order){
        return NextResponse.json({ error: 'Order not found'}, {status: 404 })
    }

    // Make sure the order belongs to the user ( or they are staff/admin)
    const { data: profile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    const isStaffOrAdmin = ["STAFF", "ADMIN"].includes(profile?.role)
    const isOwner = order.customer?.id === user.id

    if (!isOwner && !isStaffOrAdmin){
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch customer profile for the PDF
    const { data: customer } = await supabaseAdmin
        .from('users')
        .select('id, first_name, last_name, email, phone')
        .eq('id', order.customer.id)
        .single()

    if (!customer){
        return NextResponse.json({ error: 'Customer not found'}, { status: 404 })
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(order, customer)

    const invoiceNumber = `GW-${id.slice(0, 8).toUpperCase()}`

    // Return as downloadable PDF
    return new Response(pdfBuffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${invoiceNumber}.pdf`,
        },
    })
}