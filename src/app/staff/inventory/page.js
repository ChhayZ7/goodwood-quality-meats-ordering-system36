'use client'

const LOW_STOCK = 5

// BACKEND TEAM: replace with useState([]) + useEffect fetch (see notes above)
const inventory = []

const CATEGORY_COLOURS = {
  Pork:    { bg: '#FEE2E2', color: '#991B1B' },
  Beef:    { bg: '#FEF3C7', color: '#92400E' },
  Lamb:    { bg: '#DCFCE7', color: '#166534' },
  Poultry: { bg: '#DBEAFE', color: '#1E40AF' },
  Seafood: { bg: '#F3E8FF', color: '#7C3AED' },
  Other:   { bg: '#F3F4F6', color: '#6B7280' },
}

export default function StaffInventoryPage() {
  const showPlaceholders = inventory.length === 0
  const lowCount = inventory.filter(i => i.stock_quantity <= LOW_STOCK).length

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '26px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>Inventory</h1>
          <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', color: '#888', margin: 0 }}>Current stock levels — read only</p>
        </div>
        {/* Low stock badge — only appears when real data is loaded */}
        {!showPlaceholders && lowCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', background: '#FEE2E2', border: '1px solid #FECACA' }}>
            <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>{lowCount} item{lowCount > 1 ? 's' : ''} low on stock</span>
          </div>
        )}
      </div>

      {/* Read-only notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#F0E8D0', border: '1px solid #E8D48A', marginBottom: '20px', width: 'fit-content' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7B1A1A" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '12px', fontWeight: 600, color: '#7B1A1A' }}>Read only — contact an admin to update stock levels</span>
      </div>
      
      






      </div>
  )
}