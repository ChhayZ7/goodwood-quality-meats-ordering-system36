// src/components/PageWrapper.jsx
//This one is the share component for every tabs in admin and staff dashboard
export default function PageWrapper({ children }) {
  return (
    <>
      <style>{`
        .page-wrapper { padding: 32px; max-width: 1200px; width: 100%; margin: 0 auto; }
        @media (max-width: 640px) { .page-wrapper { padding: 16px; } }
      `}</style>
      <div className="page-wrapper">{children}</div>
    </>
  )
}
