"use client";

import Link from "next/link";
import { useState } from "react";

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function getStrength(pwd) {
  if (!pwd) return null;
  const hasLower   = /[a-z]/.test(pwd);
  const hasUpper   = /[A-Z]/.test(pwd);
  const hasNumber  = /[0-9]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  const longEnough = pwd.length >= 8;

  const onlyNumbers = /^\d+$/.test(pwd);
  const onlyLetters = /^[a-zA-Z]+$/.test(pwd);

  // Weak: only numbers, only letters, or too short
  if (!longEnough || onlyNumbers || onlyLetters) {
    return { score: 1, label: "Weak", color: "bg-red-500" };
  }

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  // Fair: letters + numbers but no uppercase or special, or short combo
  if (varietyCount === 2) {
    return { score: 2, label: "Fair", color: "bg-orange-400" };
  }

  // Strong: letters (mixed case) + numbers OR letters + special char
  if (varietyCount === 3) {
    return { score: 3, label: "Strong", color: "bg-yellow-500" };
  }

  // Very Strong: has lowercase + uppercase + number + special
  if (varietyCount === 4) {
    return { score: 4, label: "Very Strong", color: "bg-green-500" };
  }

  return { score: 1, label: "Weak", color: "bg-red-500" };
}

export default function ResetPasswordPage() {
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const strength = getStrength(password);

  return (
    <div className="h-screen flex bg-[#f4f1ec] overflow-hidden">

      {/* LEFT SIDE */}
      <div className="w-[45%] flex items-center justify-center px-20 -mt-20">
        <div className="w-full max-w-lg">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-800 text-white px-4 py-2 rounded-lg font-bold text-lg">G</div>
              <div>
                <h1 className="font-bold text-2xl tracking-wide" style={{ color: "#7b1e1e" }}>GOODWOOD</h1>
                <p className="text-sm text-gray-500 tracking-[3px]">QUALITY MEATS</p>
              </div>
            </div>
          </div>

          {/* LINE */}
          <div className="w-full h-[4px] bg-yellow-600 mb-10"></div>

          {/* TITLE */}
          <h2 className="text-5xl font-bold mb-4 text-black">Reset Password</h2>
          <p className="mb-10 text-gray-600 text-lg leading-relaxed">
            Choose a new password for your account.
          </p>

          <div className="space-y-6">

            {/* NEW PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                className="w-full p-5 rounded-xl border border-gray-300 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700 pr-14 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                style={{ WebkitTextSecurity: showPassword ? 'none' : undefined }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>

            {/* Password strength bar */}
            {strength && (
              <div className="flex items-center gap-1 -mt-2">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      level <= strength.score ? strength.color : "bg-gray-200"
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {strength.label}
                </span>
              </div>
            )}

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                className="w-full p-5 rounded-xl border border-gray-300 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700 pr-14 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showConfirm ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>

            {/* Match indicator */}
            {confirm.length > 0 && (
              <p className={`text-sm -mt-2 ${password === confirm ? "text-green-600" : "text-red-500"}`}>
                {password === confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}

            {/* BUTTON */}
            <button
              type="button"
              className="w-full bg-red-800 text-white py-5 rounded-xl text-lg font-semibold hover:bg-red-900 transition shadow-md"
            >
              Reset Password
            </button>

          </div>

          {/* BACK */}
          <p className="mt-6 text-sm text-gray-600">
            Remember your password?{" "}
            <Link href="/login" className="text-red-700 font-semibold">Log in</Link>
          </p>

        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="w-[55%] relative h-full">
        <img src="/meat.png" alt="meat" className="w-full h-full object-cover grayscale opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#f4f1ec]/40 to-[#f4f1ec]"></div>
      </div>

    </div>
  );
}