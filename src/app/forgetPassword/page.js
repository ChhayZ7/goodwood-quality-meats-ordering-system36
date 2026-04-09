"use client";

import Link from "next/link";
import { useState } from "react";

export default function forgetPassword() {
  const [email, setEmail] = useState("");

  return (
    <div className="h-screen flex bg-[#f4f1ec] overflow-hidden">

      {/* LEFT SIDE */}
      <div className="w-[45%] flex items-center justify-center px-20">
        <div className="w-full max-w-lg">


          {/* LOGO */}
            <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-4">
                <div className="bg-red-800 text-white px-4 py-2 rounded-lg font-bold text-lg">
                G
                </div>
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

          {/* LINE */}
          <div className="w-full h-[4px] bg-yellow-600 mb-10"></div>

          {/* TITLE */}
          <h2 className="text-5xl font-bold mb-4 text-black">
            Forgot Password
          </h2>

          <p className="mb-10 text-gray-600 text-lg leading-relaxed">
            Enter your email and we’ll send you a reset link.
          </p>

          {/* INPUT */}
          <input
            type="email"
            placeholder="your.email@example.com"
            className="w-full p-5 rounded-xl border border-gray-300 mb-6 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* BUTTON */}
          <button className="w-full bg-red-800 text-white py-5 rounded-xl text-lg font-semibold hover:bg-red-900 transition shadow-md">
            Send Reset Link
          </button>

          {/* BACK */}
          <p className="mt-6 text-sm text-gray-600">
            Remember your password?{" "}
            <Link href="/login" className="text-red-700 font-semibold">
              Log in
            </Link>
          </p>

        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="w-[55%] relative h-full">
        <img
          src="/meat.png"
          alt="meat"
          className="w-full h-full object-cover grayscale opacity-80"
        />

        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#f4f1ec]/40 to-[#f4f1ec]"></div>
      </div>

    </div>
  );
}