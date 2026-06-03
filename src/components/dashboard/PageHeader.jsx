//This is a reuse compoents for headers on every single tabs on customer dashbpardm, staff dashboard and admin dashbpoard

export default function PageHeader({ title, action }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: '"Lato", sans-serif', fontSize: '36px', fontWeight: 700, color: '#7B1A1A', margin: 0 }}>
          {title}
        </h1>
        {action}
      </div>
      <div style={{ height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)', borderRadius: '1px' }} />
    </div>
  )
}

