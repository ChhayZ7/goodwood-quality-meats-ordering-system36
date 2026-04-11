"use client";

import { FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";

export default function ContactPage() {
  return (
    <div className="bg-[#f4f1ec] min-h-screen py-20">

      {/* TITLE */}
      <h1
        className="text-center text-5xl font-semibold mb-16"
        style={{ color: "#7b1e1e" }}
      >
        Contact Us
      </h1>

      {/* CENTER CONTAINER */}
      <div className="max-w-7xl mx-auto px-10">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

          {/* LEFT SIDE */}
          <div className="pl-6">

            <h2 className="text-3xl font-bold mb-10" style={{ color: "#222" }}>
              Get in Touch
            </h2>

            {/* ADDRESS */}
            <div className="flex items-start gap-4 mb-8">
              <FiMapPin className="text-[#7b1e1e] mt-1" size={22} />
              <div>
                <h3 style={{ color: "#000" }} className="text-2xl mb-2"><b>Visit Our Store</b></h3>
                <p style={{ color: "#555" }} className="text-2xl">121 Goodwood Road</p>
                <p style={{ color: "#555" }}className="text-2xl">Goodwood, SA 5034</p>
                <p style={{ color: "#555" }}className="text-2xl">Australia</p>
              </div>
            </div>

            {/* PHONE */}
            <div className="flex items-start gap-4 mb-8">
              <FiPhone className="text-[#7b1e1e] mt-1" size={22} />
              <div>
                <h3 style={{ color: "#000" }} className="text-2xl mb-2"><b>Call Us</b></h3>
                <p style={{ color: "#555" }}className="text-2xl">08 8271 4183</p>
              </div>
            </div>

            {/* EMAIL */}
            <div className="flex items-start gap-4 mb-8">
              <FiMail className="text-[#7b1e1e] mt-1" size={22} />
              <div>
                <h3 style={{ color: "#000" }}className="text-2xl mb-2" ><b>Email</b></h3>
                <p style={{ color: "#555" }} className="text-2xl" >info@goodwoodmeats.com.au</p>
              </div>
            </div>

            {/* HOURS */}
            <div className="flex items-start gap-4">
              <FiClock className="text-[#7b1e1e] mt-1" size={22} />
              <div>
                <h3 style={{ color: "#000" }} className="text-2xl mb-2"> <b>Opening Hours</b></h3>
                <p style={{ color: "#555" }} className="text-2xl">Monday – Friday: 7am – 5:30pm</p>
                <p style={{ color: "#555" }} className="text-2xl">Saturday: 7am – 12pm</p>
                <p style={{ color: "#555" }} className="text-2xl">Sunday: Closed</p>
              </div>
            </div>

          </div>

         <div className="flex justify-center md:justify-end">
          <a
            href="https://www.google.com/maps?q=121+Goodwood+Road+Goodwood+SA"
            target="_blank"
            className="relative group"
          >
            <img
              src="/map.png"
              alt="Map"
              className="w-[980px] h-[600px] object-cover rounded-2xl shadow-sm cursor-pointer"
            />

            {/* HOVER TEXT */}
            <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-50 opacity-0 group-hover:opacity-100 transition duration-300">
              <p className="bg-[#7b1e1e]/90 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md">
                📍 Open in Maps
              </p>
            </div>
          </a>
        </div>

        </div>
      </div>
    </div>
  );
}