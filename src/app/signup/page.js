"use client";

import Link from "next/link";
import { useState } from "react";

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

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // remove error when typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    let err = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanedPhone = form.phone.replace(/\s/g, "");

    if (form.firstName.trim() === "") {
      err.firstName = "This field is required.";
    }

    if (form.lastName.trim() === "") {
      err.lastName = "This field is required.";
    }

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const err = validate();

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setErrors({});
    console.log("Signup success", form);
  };

  return (
    <div className="h-screen flex bg-[#f4f1ec] overflow-hidden">

      {/* LEFT IMAGE */}
      <div className="w-[55%] relative h-full">
        <img
          src="/signupImage.png"
          alt="meat"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f4f1ec]/40 to-[#f4f1ec]"></div>
      </div>

      {/* RIGHT FORM */}
      <div className="w-[45%] flex items-center justify-center px-20 -mt-20">
        <div className="w-full max-w-lg">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-800 text-white px-4 py-2 rounded-lg font-bold text-lg">
                G
              </div>
              <div>
                <h1 className="font-bold text-2xl tracking-wide text-[#7b1e1e]">
                  GOODWOOD
                </h1>
                <p className="text-sm text-gray-500 tracking-[3px]">
                  QUALITY MEATS
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-[4px] bg-yellow-600 mb-10"></div>

          <h2 className="text-5xl font-bold mb-2 text-black">
            Create an Account
          </h2>

          <p className="mb-8 text-gray-600 text-lg">
            Already have an account?{" "}
            <Link href="/login" className="text-red-700 font-semibold">
              Log in
            </Link>
          </p>

          <form onSubmit={handleSubmit}>

            {/* NAME */}
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

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email Address"
              className={`w-full p-4 mb-3 rounded-xl border ${errors.email ? "border-red-500" : "border-gray-300"} mb-1 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
              onChange={(e) => update("email", e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

            {/* PHONE */}
            <input
              type="tel"
              placeholder="Phone Number"
              className={`w-full p-4 mb-3 rounded-xl border ${errors.phone ? "border-red-500" : "border-gray-300"} mb-1 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
              onChange={(e) => update("phone", e.target.value)}
            />
            {errors.phone && <p className="text-red-500 text-sm mb-2">{errors.phone}</p>}

            {/* PASSWORD */}
            <input
              type="password"
              placeholder="Password"
              className={`w-full p-4 mb-3 rounded-xl border ${errors.password ? "border-red-500" : "border-gray-300"} mb-1 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
              onChange={(e) => update("password", e.target.value)}
            />
            {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password}</p>}

            {/* CONFIRM */}
            <input
              type="password"
              placeholder="Confirm Password"
              className={`w-full p-4 mb-3 rounded-xl border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} mb-1 bg-white text-black text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700`}
              onChange={(e) => update("confirmPassword", e.target.value)}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mb-3">{errors.confirmPassword}</p>}

            <button
              type="submit"
              className="w-full mt-3 bg-red-800 text-white py-5 rounded-xl text-lg font-semibold hover:bg-red-900 transition shadow-md"
            >
              Sign Up
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}