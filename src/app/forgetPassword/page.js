"use client";

import Link from "next/link";
import { useState } from "react"; // useState is a React hook used to store and update values like email, loading, error, etc.
import { createClient } from "@/lib/supabase-browser"; // This imports your Supabase browser client so this page can talk to Supabase authentication.
import logo from '@/assets/logoWithoutBrand.png'

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); // Stores the email typed by the user.
  const [loading, setLoading] = useState(false); // Stores whether the reset email is currently being sent.
  const [sent, setSent] = useState(false); // Stores whether the reset link has been successfully sent.
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    // This function runs when the user submits the form.

    e.preventDefault(); // Prevents the page from refreshing when the form is submitted.
    setError(""); // Clears any old error message before checking again.

    // Checks if the email field is empty.
    if (!email.trim()) {
      setError("Please enter your email address."); // Shows an error message if no email was entered.
      return;
    }

    setLoading(true); // Starts the loading state, so the button shows "Sending..."

    const supabase = createClient(); // Creates the Supabase client so we can call Supabase auth functions.

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        // Sends a password reset email to the user through Supabase.

        redirectTo: `${window.location.origin}/resetPassword`, // This tells Supabase where to send the user after they click the reset link.
      },
    );

    setLoading(false); // Stops the loading state after Supabase finishes sending the email.

    if (resetError) {
      // Checks if Supabase returned any error.

      setError(resetError.message); // Shows the error message from Supabase.
      return;
    }

    setSent(true); // If there is no error, this changes the page to show the success message.
  };

  return (
    <div className="min-h-screen flex bg-[#f4f1ec]">

      {/* LEFT SIDE */}
      <div className="w-full md:w-[45%] flex items-center justify-center px-6 md:px-20 py-10 md:-mt-20">
        <div className="w-full max-w-lg">
          {/* LOGO */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-4">
              <img
                  src={logo.src}
                  alt="Goodwood Quality Meats"
                  style={{ height: '90px', width: 'auto' }}
              />

              <div>
                <h1
                  className="font-bold text-2xl tracking-wide"
                  style={{ color: "#7b1e1e" }}
                >
                  GOODWOOD
                </h1>
                <p className="text-sm text-gray-500 tracking-[3px]">
                  QUALITY MEATS
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-[4px] bg-yellow-600 mb-10" />

          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-black">Forgot Password</h2>

          {sent ? ( // If sent is true, show the success message instead of the form.
            <div>
              {/* Success message container. */}

              <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
                <p className="text-green-700 font-semibold mb-1">
                  Reset link sent!
                </p>

                <p className="text-green-600 text-sm">
                  Check your email at <strong>{email}</strong> for a password
                  reset link. It may take a few minutes to arrive.
                </p>
              </div>

              <Link
                href="/login"
                className="text-red-700 font-semibold text-sm"
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            // If sent is false, show the email input form.

            <>
              <p className="mb-10 text-gray-600 text-lg leading-relaxed">
                Enter your email and we'll send you a reset link.
              </p>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <form onSubmit={handleSubmit}>
                {" "}
                {/* Form. When submitted, it runs handleSubmit. */}
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full p-5 rounded-xl border border-gray-300 mb-6 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }} // Updates email state with the typed value.
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-800 text-white py-5 rounded-xl text-lg font-semibold hover:bg-red-900 transition shadow-md disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-600">
                Remember your password?{" "}
                <Link href="/login" className="text-red-700 font-semibold">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDE IMAGE — hidden on mobile */}
      <div className="hidden md:block md:w-[55%] relative">
        <img src="/meat.png" alt="meat" className="w-full h-full object-cover grayscale opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#f4f1ec]/40 to-[#f4f1ec]" />
      </div>
    </div>
  );
}
