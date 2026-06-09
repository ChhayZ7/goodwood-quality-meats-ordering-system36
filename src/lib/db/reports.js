// All database queries for the admin reports page.
// Each function is a separate query so the route can run them in parallel.

import { supabaseAdmin } from '@/lib/supabase-admin'



//helpers
//as the admin will pick the month (December, January, etc) and then the date from the dropdowns
//but Supabase does not understand, they can only understand date string so this function is made for it
//convert the month and year into date string range
//eg. December 2026 will be from "2026-12-01" to "2026-12-31"
//before doing it, a pad function here is used to pad the number so it will always be 2 digits since it will be reuse to convert last date and month

function pad(n) {
  //String(n) converts the number to a string first, e.g. 1 → "1"
  //.padStart(2, '0') is a JavaScript method that add 0 to the front if the string is shorter than 2 characters
  return String(n).padStart(2, '0')
}

//AI support
function getDateRange(month, year) {

  // First day of the selected month, as it is always start with 01
  const from = `${year}-${pad(month)}-01`

  //Find the last day of the selected month
  // day 0 of the next month is the same as the last day of the current month
  // e.g. new Date(2026, 12, 0) → Dec 31 2026, so .getDate() returns 31
  const lastDay = new Date(year, month, 0).getDate()

  // Build the "to" date string, e.g. "2026-12-31"
  const to = `${year}-${pad(month)}-${pad(lastDay)}`

  //Return both date strings as an object so the queries can use them
  return { from, to }
}


//Queries

//This query is using to count the sum of the orders per status for the selected time frame
export async function getOrderCountsByStatus(month, year) {
  // decalre all valid statuses in the system
  const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED']

  // Create an object with each status as a key and set it to 0 as the starting count
  // e.g. { PENDING: 0, CONFIRMED: 0, IN_PROGRESS: 0, READY: 0, COMPLETED: 0, CANCELLED: 0 }
  // Object.fromEntries() builds an object from an array of [key, value] pairs
  // .map(s => [s, 0]) turns each status string into a [key, value] pair like ['PENDING', 0]
  const counts = Object.fromEntries(validStatuses.map(s => [s, 0]))

  // Convert the selected month and year into date strings for the Supabase filter
  const { from, to } = getDateRange(month, year)

  //Query the orders table in Supabase to retuen only the status column for orders picking up in the selected month of the selected year
  //so has to filter by pickup_date column

  //Use the Supabase client to fetch the status column from the orders table, and wait until the data comes back before continuing
  const { data: orderStatus, error: orderStatusError } = await supabaseAdmin
    .from('orders')
    .select('status')
    .gte('pickup_date', from)   // pickup_date greater than or equal to the first day of month
    .lte('pickup_date', to)     // pickup_date <= last day of month

  //if fail, throw error (500)
  if (orderStatusError) throw orderStatusError

  //loop through every orders returned and increase the count for everytime they find its own status
  // e.g if a row has status "CONFIRMED", counts.CONFIRMED goes from 0 to 1
  for (const row of orderStatus) {
    //ignore the undefined status just in case there is other status rather than what has been declared, prevent confuse
    if (counts[row.status] !== undefined) counts[row.status]++
  }
  return counts

}

//AI supported

//This second query is used to get the order summary including the order count, estimated total which is includifg the deposits and the estimated final payment (minimum estimated)
// count minimum estimated final payment, and average order value (how much does 1 order cost in average)
//however, the total deposit count should be include cancelled orders as well since refunds are process manually outside the system

export async function getOrderSummary(month, year) {

  //convert the selected month and year
  const { from, to } = getDateRange(month, year)

  //fetch all the order picking up this month 

  const { data: allOrders, error: allOrdersError } = await supabaseAdmin
    .from('orders')
    //get id as it has to match orders with their payments when querying deposits, 
    //total_cents: used to calculate estimated total and average order value
    //status: needed to filter out cancelled orders after fetching
    .select('id, total_cents, status')
    .gte('pickup_date', from)
    .lte('pickup_date', to)

  if (allOrdersError) throw allOrdersError

  // Split into non-cancelled and all order IDs
  //non cancelled one is used to calculate the avg cost per order and the final estimated payment
  const activeOrders = allOrders.filter(order => order.status !== "CANCELLED");

  //this list collect all order IDs, hence, it is easier to find matching payments in the payments table
  //since order_id is a fk in payments table so the coming query just go, "gimme all payments where order_id is in this list"
  const orderIdList = allOrders.map(order => order.id);

  //This query is used to fetch PAID deposits for all orders in this pickup month
  //if orderIdList has more than 0 id , run supabase query, otherwise, skip, return empty data and null error
  const { data: deposits, error: depositsError } = orderIdList.length > 0
    ? await supabaseAdmin
      .from('payments')
      .select('amount_cents')
      .eq('type', 'DEPOSIT')      // only deposit payments, just in case in the futur, there is another type of payment
      .eq('status', 'PAID')       // only payments that have been successfully paid
      .in('order_id', orderIdList) // only for orders in this pickup month
    : { data: [], error: null }

  if (depositsError) throw depositsError;

  //Calculate algorithms

  //1. calculate all orders that has been placed for the selected time
  const orderCount = allOrders.length

  //2. Sum of total_cents across non-cancelled orders only (min estimated order value)
  let estimatedFinalPayCents = 0
  //loop throuh all orders in activeOrders
  for (const order of activeOrders) {
    estimatedFinalPayCents += order.total_cents ?? 0 //if total_cent is null or undefined, use 0 instead
  }

  //3. Sum of all PAID deposits from Stripe for this pickup month (including cancelled orders)
  let depositsCollectedCents = 0
  for (const payment of deposits) {
    depositsCollectedCents += payment.amount_cents ?? 0
  }

  //4. Estimated final payment = estimated total minus deposits already paid, minimum 0
  const estimatedTotalCents = depositsCollectedCents + estimatedFinalPayCents

  //5. Average order value = estimated total divided by non-cancelled order count
  // If there are no active orders, return 0 to avoid dividing by zero
  let avgOrderValueCents = 0
  if (activeOrders.length > 0) {
    avgOrderValueCents = Math.round(estimatedFinalPayCents / activeOrders.length)
  }

  //since API use snake_case to have to return snake_case
  return {
    order_count: orderCount, // total orders placed
    estimated_total_cents: estimatedTotalCents,  // sum of all order totals
    deposits_collected_cents: depositsCollectedCents, // real money received through strip, this must match stripe income statement(incl. cancelled)
    estimated_final_pay_cents: estimatedFinalPayCents, // what's still owed
    avg_order_value_cents: avgOrderValueCents,   // average per order (min estimate)
  }

}

//Query 3, find the top 3 product of the selected time frame so admin can predict the products for upcoming season
//Excludes cancelled orders so admin only sees what they actually needs to prepare

export async function getTopProducts(month, year) {
  const { from, to } = getDateRange(month, year)
 
  //Get IDs of all non-cancelled orders picking up this month
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('id')
    .gte('pickup_date', from)
    .lte('pickup_date', to)
    .not('status', 'eq', 'CANCELLED')   // exclude cancelled, don't prep these
 
  if (ordersError) throw ordersError

  // If no orders exist for this period, return empty array early
  const orderIds = orders.map(o => o.id)
  if (orderIds.length === 0) return []
 
  //Fetch order_items for those orders, joining to products for the name
  // The join syntax "product:products!order_items_product_id_fkey" explicitly names
  // the foreign key so Supabase knows which relationship to use
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select(`
      quantity,
      product:products!order_items_product_id_fkey ( name )
    `)
    .in('order_id', orderIds)   // only items belonging to our filtered orders
 
  if (itemsError) throw itemsError

  //Aggregate quantity by product name
  // We use a map (object) keyed by product name to accumulate totals
  const map = {}
  for (const item of items) {
    const name = item.product?.name ?? 'Unknown'  // fallback if join returns null
    if (!map[name]) map[name] = { name, units: 0 }  // initialise if first time seeing this product
    map[name].units += item.quantity ?? 0            // add this line item's quantity
  }
 
  //Sort by units descending and return only the top 3
  return Object.values(map)
    .sort((a, b) => b.units - a.units)  // highest quantity first
    .slice(0, 3)                         // top 3 only
}
