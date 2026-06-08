// src/lib/pdf/invoice.jsx
// Generates either a Confirmation Invoice or a Final Invoice depending on
// whether all weight-based items have actual weights saved.
//
// Confirmation Invoice  — estimated totals, shown immediately after checkout
// and for any order still being prepared.
// Final Invoice — actual weights, exact subtotals, shown once the
// order is READY or COMPLETED and all weights are entered.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCents(cents) {
  if (cents == null) return '—'
  return `$${(cents / 100).toFixed(2)}`
}

// Decide whether this order qualifies as a Final Invoice.
// Requires: every weight-based item has actual_weight_kg set, AND
// the order status is READY or COMPLETED.
function isFinalInvoice(order) {
  const finalStatuses = ['READY', 'COMPLETED']
  if (!finalStatuses.includes(order.status)) return false

  const weightItems = (order.order_items ?? []).filter(
    item => item.product?.product_type === 'WEIGHT_RANGE'
  )
  if (weightItems.length === 0) return true // all fixed-price — always final
  return weightItems.every(item => item.actual_weight_kg != null)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1A1A1A',
    padding: 48,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: '2px solid #8B1A1A',
  },
  brandName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#8B1A1A',
  },
  brandSub: {
    fontSize: 10,
    color: '#717182',
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#8B1A1A',
    textAlign: 'right',
  },
  invoiceBadge: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    marginTop: 4,
    padding: '3 8',
    borderRadius: 4,
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#717182',
    textAlign: 'right',
    marginTop: 4,
  },

  // Two column layout
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  col: {
    width: '48%',
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#8B1A1A',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 11,
    color: '#1A1A1A',
    lineHeight: 1.5,
  },
  sectionMuted: {
    fontSize: 10,
    color: '#717182',
    lineHeight: 1.5,
  },

  // Gold divider
  divider: {
    height: 1,
    backgroundColor: '#D4AF37',
    marginBottom: 16,
  },

  // Items table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FDF8F0',
    padding: '8 12',
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '8 12',
    borderBottom: '1px solid #F0EAD8',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: '8 12',
    borderBottom: '1px solid #F0EAD8',
    backgroundColor: '#FDFAF3',
  },

  // Column widths — shared between header and rows
  colProduct:  { width: '30%' },
  colQty:      { width: '8%',  textAlign: 'center' },
  colWeight:   { width: '18%', textAlign: 'center' },
  colActual:   { width: '16%', textAlign: 'center' },
  colPrice:    { width: '14%', textAlign: 'right' },
  colSubtotal: { width: '14%', textAlign: 'right' },

  tableHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#717182',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableBodyText: {
    fontSize: 10,
    color: '#1A1A1A',
  },
  tableBodyMuted: {
    fontSize: 9,
    color: '#717182',
    marginTop: 2,
  },
  tableBodyEstimate: {
    fontSize: 9,
    color: '#C9A84C',
    marginTop: 2,
    fontFamily: 'Helvetica-Bold',
  },

  // Totals
  totalsBlock: {
    marginTop: 16,
    marginLeft: 'auto',
    width: '44%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 11,
    color: '#717182',
  },
  totalValue: {
    fontSize: 11,
    color: '#1A1A1A',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#E0D5BE',
    marginVertical: 6,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1A1A1A',
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#8B1A1A',
  },
  depositLabel: {
    fontSize: 11,
    color: '#2D6A2D',
  },
  depositValue: {
    fontSize: 11,
    color: '#2D6A2D',
    fontFamily: 'Helvetica-Bold',
  },

  // Estimate disclaimer (shown on confirmation invoices only)
  disclaimer: {
    marginTop: 10,
    padding: '8 10',
    backgroundColor: '#FEF9E7',
    borderRadius: 4,
    border: '1px solid #FAC775',
  },
  disclaimerText: {
    fontSize: 9,
    color: '#854F0B',
    lineHeight: 1.5,
  },

  // Info box
  infoBox: {
    marginTop: 28,
    padding: 14,
    backgroundColor: '#FEF9E7',
    borderRadius: 6,
    border: '1px solid #FAC775',
  },
  infoTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#854F0B',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 10,
    color: '#854F0B',
    lineHeight: 1.6,
  },

  // Confirmed info box (final invoice)
  confirmedBox: {
    marginTop: 28,
    padding: 14,
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    border: '1px solid #86EFAC',
  },
  confirmedTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
    marginBottom: 6,
  },
  confirmedText: {
    fontSize: 10,
    color: '#166534',
    lineHeight: 1.6,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #E0D5BE',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: '#717182',
  },
})

// ─── Document component ───────────────────────────────────────────────────────

function InvoiceDocument({ order, customer }) {
  const invoiceNumber = `GW-${order.id.slice(0, 8).toUpperCase()}`
  const final = isFinalInvoice(order)

  const issueDate = new Date().toLocaleDateString('en-AU', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
  const pickupDate = order.pickup_date
    ? new Date(order.pickup_date).toLocaleDateString('en-AU', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : 'TBC'

  const items = order.order_items ?? []

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Goodwood Quality Meats</Text>
            <Text style={styles.brandSub}>121 Goodwood Road, Goodwood SA 5034</Text>
            <Text style={styles.brandSub}>08 8271 4183 · info@goodwoodmeats.com.au</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>
              {final ? 'FINAL INVOICE' : 'INVOICE'}
            </Text>
            {/* Coloured badge under the title */}
            <Text style={[
              styles.invoiceBadge,
              final
                ? { color: '#166534', backgroundColor: '#DCFCE7' }
                : { color: '#854F0B', backgroundColor: '#FEF9E7' },
            ]}>
              {final ? '✓ Weights confirmed' : 'Estimated — subject to final weight'}
            </Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            <Text style={styles.invoiceNumber}>Issued: {issueDate}</Text>
          </View>
        </View>

        {/* ── Bill to / Order details ── */}
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Bill to</Text>
            <Text style={styles.sectionText}>
              {customer.first_name} {customer.last_name}
            </Text>
            <Text style={styles.sectionMuted}>{customer.email}</Text>
            {customer.phone
              ? <Text style={styles.sectionMuted}>{customer.phone}</Text>
              : null}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Order details</Text>
            <Text style={styles.sectionText}>Order #{invoiceNumber}</Text>
            <Text style={styles.sectionMuted}>Pickup date: {pickupDate}</Text>
            <Text style={styles.sectionMuted}>
              Status: {final ? 'Confirmed — awaiting pickup' : 'Deposit paid — being prepared'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Items table header ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colProduct]}>Product</Text>
          <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.colWeight]}>
            {final ? 'Weight range' : 'Weight range'}
          </Text>
          {/* Only show Actual column on final invoice */}
          {final && (
            <Text style={[styles.tableHeaderText, styles.colActual]}>Actual kg</Text>
          )}
          <Text style={[styles.tableHeaderText, styles.colPrice]}>Price/kg</Text>
          <Text style={[styles.tableHeaderText, styles.colSubtotal]}>Subtotal</Text>
        </View>

        {/* ── Item rows ── */}
        {items.map((item, i) => {
          const product     = item.product ?? {}
          const isWeight    = product.product_type === 'WEIGHT_RANGE'
          const pricePerKg  = product.price_per_kg_cents ?? 0
          const fixedPrice  = item.unit_price_cents ?? 0

          const weightOption  = item.weight_option
          const weightDisplay = weightOption
            ? `${weightOption.label}`
            : item.weight_preference ?? '—'

          // Subtotal: use actual_weight_kg if available, else stored subtotal
          const actualKg    = item.actual_weight_kg
          const subtotal    = isWeight && actualKg != null
            ? Math.round(actualKg * pricePerKg * item.quantity)
            : item.subtotal_cents

          const priceDisplay = isWeight
            ? `${formatCents(pricePerKg)}/kg`
            : formatCents(fixedPrice)

          const RowStyle = i % 2 === 0 ? styles.tableRow : styles.tableRowAlt

          return (
            <View key={i} style={RowStyle}>
              <View style={styles.colProduct}>
                <Text style={styles.tableBodyText}>{product.name ?? 'Product'}</Text>
                {item.notes
                  ? <Text style={styles.tableBodyMuted}>Note: {item.notes}</Text>
                  : null}
                {/* Show "estimated" flag on confirmation invoice for weight items */}
                {!final && isWeight && (
                  <Text style={styles.tableBodyEstimate}>ESTIMATED</Text>
                )}
              </View>

              <Text style={[styles.tableBodyText, styles.colQty]}>
                {item.quantity}
              </Text>

              <Text style={[styles.tableBodyText, styles.colWeight]}>
                {isWeight ? weightDisplay : '—'}
              </Text>

              {/* Actual kg column — final invoice only */}
              {final && (
                <Text style={[styles.tableBodyText, styles.colActual]}>
                  {isWeight && actualKg != null
                    ? `${actualKg} kg`
                    : isWeight ? '—' : 'Fixed'}
                </Text>
              )}

              <Text style={[styles.tableBodyText, styles.colPrice]}>
                {priceDisplay}
              </Text>

              <Text style={[styles.tableBodyText, styles.colSubtotal]}>
                {formatCents(subtotal)}
              </Text>
            </View>
          )
        })}

        {/* ── Totals ── */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {final ? 'Total' : 'Estimated total'}
            </Text>
            <Text style={styles.totalValue}>
              {formatCents(order.total_cents ?? 0)}
            </Text>
          </View>

          <View style={styles.totalDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.depositLabel}>Deposit paid</Text>
            <Text style={styles.depositValue}>
              {formatCents(order.deposit_paid_cents ?? 2000)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>
              Balance due at pickup
            </Text>
            <Text style={styles.grandTotalValue}>
              {formatCents(
                (order.total_cents ?? 0) - (order.deposit_paid_cents ?? 2000)
              )}
            </Text>
          </View>
        </View>

        {/* ── Disclaimer / info box ── */}
        {final ? (
          <View style={styles.confirmedBox}>
            <Text style={styles.confirmedTitle}>Ready for pickup</Text>
            <Text style={styles.confirmedText}>
              Your order has been weighed and prepared. Please pay the balance via
              EFTPOS in store at the time of collection. If you have any questions,
              call us on 08 8271 4183.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                Prices for weight-based items are estimates only. The final amount will
                be calculated once your order has been weighed by our team. You will
                receive a final invoice before your pickup date.
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>What happens next?</Text>
              <Text style={styles.infoText}>
                Our team will weigh your order and send a final invoice before your
                pickup date. Please pay the remaining balance via EFTPOS in store at
                the time of collection. If you have any questions, call us on
                08 8271 4183.
              </Text>
            </View>
          </>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Goodwood Quality Meats · ABN 00 000 000 000
          </Text>
          <Text style={styles.footerText}>{invoiceNumber}</Text>
        </View>

      </Page>
    </Document>
  )
}

// Returns a Buffer — ready to attach to an email or save to storage
export async function generateInvoicePDF(order, customer) {
  return renderToBuffer(<InvoiceDocument order={order} customer={customer} />)
}