//since there are many dropdown boxes will be use in the dashboard including filter the order status, fileter the date, etc. 
//So this share component will be reuse for this purpose

export default function FilterTabs({ tabs, labels, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
      {tabs.map(tab => {
        const isActive = tab === active
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              padding: '7px 16px', borderRadius: '20px',
              border: `1.5px solid ${isActive ? '#7B1A1A' : '#E5E7EB'}`,
              background: isActive ? '#7B1A1A' : '#fff',
              color: isActive ? '#fff' : '#555',
              fontSize: '13px', fontWeight: isActive ? 700 : 400,
              cursor: 'pointer', fontFamily: '"Lato", sans-serif',
              transition: 'all .15s',
            }}
          >
            {labels[tab] ?? tab}
          </button>
        )
      })}
    </div>
  )
}
