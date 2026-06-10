//This is a reuse compoents for headers on every single tabs on customer dashbpardm, staff dashboard and admin dashbpoard

export default function PageHeader({ title, action }) {
  return (
    <>
      <style>{`
        .page-header { margin-bottom: 32px; }
        .page-header-row {
          display: flex; justify-content: space-between;
          align-items: flex-start; margin-bottom: 32px;
          gap: 12px; flex-wrap: wrap;
        }
        .page-header-title {
          font-family: "Lato", sans-serif; font-size: 36px;
          font-weight: 700; color: #7B1A1A; margin: 0;
        }
        @media (max-width: 640px) {
          .page-header-title { font-size: 26px; }
        }
      `}</style>
      <div className="page-header">
        <div className="page-header-row">
          <h1 className="page-header-title">{title}</h1>
          {action}
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)', borderRadius: '1px' }} />
      </div>
    </>
  )
}

