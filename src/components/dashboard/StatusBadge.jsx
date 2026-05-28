//Since all of the order summary page and order details page show the status badges, show it is neccesary to make a share compoent for it

const STATUS_CONFIG = {
  CONFIRMED:        { label: 'Confirmed',        bg: '#FEF3C7', color: '#92400E' },
  IN_PROGRESS:      { label: 'In Progress',      bg: '#3B82F6', color: '#fff' },
  READY:            { label: 'Ready for Pickup', bg: '#DBEAFE', color: '#1E40AF' },
  COMPLETED:        { label: 'Completed',        bg: '#DCFCE7', color: '#166534' },
  CANCELLED:        { label: 'Cancelled',        bg: '#FEE2E2', color: '#991B1B' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#6B7280', color: '#fff' }
  return (
    <span style={{
      display: 'inline-block', background: cfg.bg, color: cfg.color,
      fontSize: '12px', fontWeight: 700, padding: '4px 14px',
      borderRadius: '20px', whiteSpace: 'nowrap',
      fontFamily: '"Lato", sans-serif',
    }}>
      {cfg.label}
    </span>
  )
}

