'use client'
import { useState } from "react"

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
      <path d="M1 1l22 22" />
    </svg>
  )
}

/**
 * Reusable password input with show/hide toggle.
 *
 * Props:
 *   id          – links the <label htmlFor> and aria-controls
 *   value       – controlled value
 *   onChange    – change handler
 *   placeholder – input placeholder text
 *   className   – optional extra classes for the <input> (e.g. border colour overrides)
 *   error       – boolean; when true applies a red border so callers don't need custom className
 */
export default function PasswordInput({ value, onChange, placeholder, id, className = '', error = false }) {
  const [visible, setVisible] = useState(false)

  return (
    <>
      {/* Suppress the browser-native password reveal button in Edge and Chrome.
          Scoped to this component so it doesn't leak into global styles. */}
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear { display: none; }
        input[type="password"]::-webkit-credentials-auto-fill-button,
        input[type="password"]::-webkit-caps-lock-indicator {
          display: none !important;
          visibility: hidden;
          pointer-events: none;
        }
      `}</style>

      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={[
            'w-full p-5 pr-14 rounded-xl border bg-white text-black text-lg shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-red-700',
            error ? 'border-red-500' : 'border-gray-300',
            className,
          ].join(' ')}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-controls={id}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-800 transition-colors"
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </div>
    </>
  )
}