//Since most of the pages on admin dashboards and staff dashboard have the search bar for them to search for the looking items so making a share component
//  and reuse it in the page is needed
//making the code cleaner and reusable in the future

export default function SearchInput({ value, onChange, placeholder = 'Search…', width = '340px' }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', width }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2"
        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        className="gw-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ paddingLeft: '38px', width }}
      />
    </div>
  )
}
