"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import logo from '@/assets/logoWithoutBrand.png'

const AUS_PHONE = /^(\+?61|0)[2-9]\d{8}$/;

export default function SignUp() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError] = useState('')
  const [verified, setVerified] = useState(false)

  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/account')
      }
    }
    checkSession()
  }, [router])

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    let err = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanedPhone = form.phone.replace(/\s/g, "");

    if (form.firstName.trim() === "") err.firstName = "This field is required.";
    if (form.lastName.trim() === "") err.lastName = "This field is required.";

    if (form.email.trim() === "") {
      err.email = "This field is required.";
    } else if (!emailPattern.test(form.email)) {
      err.email = "Please enter a valid email.";
    }

    if (form.phone.trim() === "") {
      err.phone = "This field is required.";
    } else if (!AUS_PHONE.test(cleanedPhone)) {
      err.phone = "Invalid Australian number.";
    }

    if (form.password === "") {
      err.password = "This field is required.";
    } else if (form.password.length < 8) {
      err.password = "Minimum 8 characters.";
    }

    if (form.confirmPassword === "") {
      err.confirmPassword = "This field is required.";
    } else if (form.password !== form.confirmPassword) {
      err.confirmPassword = "Passwords do not match.";
    }

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setErrors({});
    setAuthError('')
    setSubmitting(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
        }
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setErrors({ email: 'An account with this email already exists.' })
      } else if (error.message.includes('users_phone_key')) {
        setErrors({ phone: 'This phone number is already linked to an account.' })
      } else if (
        error.message.toLowerCase().includes('database') ||
        error.message.toLowerCase().includes('saving new user') ||
        error.message.toLowerCase().includes('unexpected') ||
        error.message.toLowerCase().includes('internal')
      ) {
        setAuthError('Something went wrong creating your account. Please try again.')
      } else {
        setAuthError(error.message)
      }
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setVerified(true)
  };

  // ── VERIFICATION SCREEN ──────────────────────────────────────────────────
  if (verified) {
    return (
      <div className="min-h-screen flex bg-[#f4f1ec]">

        <div className="hidden md:block md:w-[55%] relative">
          <img src="/signupImage.png" alt="meat" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f4f1ec]/40 to-[#f4f1ec]"></div>
        </div>

        <div className="w-full md:w-[45%] flex items-center justify-center px-6 md:px-20 py-10">
          <div className="w-full max-w-md text-center">

            <div className="flex items-center gap-4 justify-center mb-8">
              <img src={logo.src} alt="Goodwood Quality Meats" style={{ height: '90px', width: 'auto' }} />
              <div className="flex flex-col">
                <h1 style={{ fontFamily: '"Lato", sans-serif', fontWeight: 700, fontSize: '22px', color: '#7B1A1A', letterSpacing: '2px', margin: 0 }}>GOODWOOD</h1>
                <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#888', letterSpacing: '3px', margin: 0 }}>QUALITY MEATS</p>
              </div>
            </div>

            <div style={{ height: '2px', background: 'linear-gradient(90deg, #D4AF37, transparent)', borderRadius: '1px', marginBottom: '40px' }} />

            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-4xl font-bold text-black mb-3">Check your email</h2>
            <p className="text-gray-500 text-lg mb-1">We've sent a verification link to</p>
            <p className="text-red-800 font-semibold text-lg mb-8">{form.email}</p>

            <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-8 text-left">
              <p className="text-gray-500 text-sm leading-relaxed">
                Click the link in the email to activate your account. If you don't see it within a few minutes, check your spam or junk folder.
              </p>
            </div>

            <Link href="/login" className="text-red-700 underline italic text-sm">
              Back to login
            </Link>

          </div>
        </div>
      </div>
    )
  }

  // ── SIGNUP FORM ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#f4f1ec]">

      <div className="hidden md:block md:w-[55%] relative">
        <img src="/signupImage.png" alt="meat" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f4f1ec]/40 to-[#f4f1ec]"></div>
      </div>

      <div className="w-full md:w-[45%] flex items-center px-6 md:px-20 py-10 overflow-y-auto">
        <div className="w-full max-w-lg">

          <div className="flex items-center gap-4 justify-left mb-6">
            <img src={logo.src} alt="Goodwood Quality Meats" style={{ height: '90px', width: 'auto' }} />
            <div className="flex flex-col justify-left">
              <h1 style={{ fontFamily: '"Lato", sans-serif', fontWeight: 700, fontSize: '22px', color: '#7B1A1A', letterSpacing: '2px', margin: 0 }}>GOODWOOD</h1>
              <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#888', letterSpacing: '3px', margin: 0 }}>QUALITY MEATS</p>
            </div>
          </div>

          <div style={{ height: '2px', background: 'linear-gradient(90deg, #D4AF37, transparent)', borderRadius: '1px', marginBottom: '40px' }} />

          <h2 className="text-3xl md:text-5xl font-bold mb-2 text-black">Create an Account</h2>

          <p className="mb-8 text-gray-600 text-lg italic">
            Already have an account?{" "}
            <Link href="/login" className="text-red-700 underline italic">Log in</Link>
          </p>

          {authError && (
            <p className="text-red-500 text-sm mb-4">{authError}</p>
          )}

          <form onSubmit={handleSubmit}>

            <div className="flex gap-4 mb-2">
              <div className="w-1/2">
                <input
                  type="text"
                  placeholder="First Name"
                  className={`w-full p-4 mb-2 rounded-xl border ${errors.firstName ? "border-red-500" : "border-gray-300"} bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
                  onChange={(e) => update("firstName", e.target.value)}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  placeholder="Last Name"
                  className={`w-full p-4 mb-2 rounded-xl border ${errors.lastName ? "border-red-500" : "border-gray-300"} bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
                  onChange={(e) => update("lastName", e.target.value)}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <input
              type="email"
              placeholder="Email Address"
              className={`w-full p-4 mb-3 rounded-xl border ${errors.email ? "border-red-500" : "border-gray-300"} mb-1 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
              onChange={(e) => update("email", e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

            <input
              type="tel"
              placeholder="Phone Number"
              className={`w-full p-4 mb-3 rounded-xl border ${errors.phone ? "border-red-500" : "border-gray-300"} mb-1 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
              onChange={(e) => update("phone", e.target.value)}
            />
            {errors.phone && <p className="text-red-500 text-sm mb-2">{errors.phone}</p>}

            <input
              type="password"
              placeholder="Password"
              className={`w-full p-4 mb-3 rounded-xl border ${errors.password ? "border-red-500" : "border-gray-300"} mb-1 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
              onChange={(e) => update("password", e.target.value)}
            />
            {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password}</p>}

            <input
              type="password"
              placeholder="Confirm Password"
              className={`w-full p-4 mb-3 rounded-xl border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} mb-1 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
              onChange={(e) => update("confirmPassword", e.target.value)}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mb-3">{errors.confirmPassword}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 bg-red-800 text-white py-5 rounded-xl text-lg font-semibold hover:bg-red-900 transition shadow-md"
            >
              {submitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}