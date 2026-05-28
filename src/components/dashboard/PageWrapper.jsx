// src/components/PageWrapper.jsx
//This one is the share component for every tabs in admin and staff dashboard
export default function PageWrapper({ children }) {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {children}
    </div>
  )
}
