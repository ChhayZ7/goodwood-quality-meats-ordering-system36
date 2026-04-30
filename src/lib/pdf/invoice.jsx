// Invoice PDF template
// Uses @react-pdf/renderer to generate a styled PDF buffer

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'

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
  colProduct: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colWeight: { width: '20%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#717182',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableBodyText: {
    fontSize: 11,
    color: '#1A1A1A',
  },
  tableBodyMuted: {
    fontSize: 9,
    color: '#717182',
    marginTop: 2,
  },

  // Totals
  totalsBlock: {
    marginTop: 16,
    marginLeft: 'auto',
    width: '40%',
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

function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

function InvoiceDocument({ order, customer }) {
  const invoiceNumber = `GW-${order.id.slice(0, 8).toUpperCase()}`
  const issueDate = new Date().toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const pickupDate = order.pickup_date
    ? new Date(order.pickup_date).toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'TBC'

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Goodwood Quality Meats</Text>
            <Text style={styles.brandSub}>121 Goodwood Road, Goodwood SA 5034</Text>
            <Text style={styles.brandSub}>08 8271 4183 · info@goodwoodmeats.com.au</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            <Text style={styles.invoiceNumber}>Issued: {issueDate}</Text>
          </View>
        </View>

        {/* Bill to / Order details */}
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Bill to</Text>
            <Text style={styles.sectionText}>
              {customer.first_name} {customer.last_name}
            </Text>
            <Text style={styles.sectionMuted}>{customer.email}</Text>
            {customer.phone ? (
              <Text style={styles.sectionMuted}>{customer.phone}</Text>
            ) : null}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Order details</Text>
            <Text style={styles.sectionText}>Order #{invoiceNumber}</Text>
            <Text style={styles.sectionMuted}>Pickup date: {pickupDate}</Text>
            <Text style={styles.sectionMuted}>Status: Deposit Paid — Confirmed</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colProduct]}>Product</Text>
          <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.colWeight]}>Weight range</Text>
          <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
        </View>

        {/* Items */}
        {(order.order_items ?? []).map((item, i) => {
          const product = item.product ?? {}
          const isWeight = product.product_type === 'WEIGHT_RANGE'
          const weightOption = item.weight_option

          const priceDisplay = isWeight
            ? `${formatCents(product.price_per_kg_cents ?? 0)}/kg`
            : formatCents(item.unit_price_cents ?? 0)

          const weightDisplay =
            weightOption
              ? `${weightOption.min_weight_kg}–${weightOption.max_weight_kg} kg`
              : item.weight_preference ?? '—'

          return (
            <View key={i} style={styles.tableRow}>
              <View style={styles.colProduct}>
                <Text style={styles.tableBodyText}>{product.name ?? 'Product'}</Text>
                {item.notes ? (
                  <Text style={styles.tableBodyMuted}>Note: {item.notes}</Text>
                ) : null}
              </View>
              <Text style={[styles.tableBodyText, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableBodyText, styles.colWeight]}>
                {isWeight ? weightDisplay : '—'}
              </Text>
              <Text style={[styles.tableBodyText, styles.colPrice]}>
                {priceDisplay}
              </Text>
            </View>
          )
        })}

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated total</Text>
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
            <Text style={styles.grandTotalLabel}>Balance due at pickup</Text>
            <Text style={styles.grandTotalValue}>
              {formatCents(
                (order.total_cents ?? 0) - (order.deposit_paid_cents ?? 2000)
              )}
            </Text>
          </View>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <Text style={styles.infoText}>
            Our team will weigh your order and send a final invoice before your pickup date.
            Please pay the remaining balance via EFTPOS in store at the time of collection.
            If you have any questions, call us on 08 8271 4183.
          </Text>
        </View>

        {/* Footer */}
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