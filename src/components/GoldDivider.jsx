// This component creates a simple gold divider line.
// It is reusable, so the same divider style can be used across different pages.
// Reference - https://react.dev/learn/your-first-component

export default function GoldDivider() {
  return (
    <div
    // The divider is only decorative, so screen readers do not need to announce it
      aria-hidden="true"
      style={{
        width: '100%', // Full width makes the divider stretch across its parent container
        height: '2px', // Small height makes it look like a thin divider line
        backgroundColor: '#D4AF37', // This sets the divider colour to gold.
      }}
    />
  )
}
