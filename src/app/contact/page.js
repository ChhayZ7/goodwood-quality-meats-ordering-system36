"use client";

import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from "react-icons/fa";

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">

          {/* LEFT SIDE */}
          <div className="pl-6">

            <h2 className="text-3xl font-semibold mb-10" style={{ color: "#222" }}>
              Get in Touch
            </h2>

            {/* ADDRESS */}
            <div className="flex items-start gap-4 mb-8">
              <FaMapMarkerAlt style={{ color: "#7b1e1e" }} size={20} />
              <div>
                <h3 style={{ color: "#000" }}>Visit Our Store</h3>
                <p style={{ color: "#555" }}>121 Goodwood Road</p>
                <p style={{ color: "#555" }}>Goodwood, SA 5034</p>
                <p style={{ color: "#555" }}>Australia</p>
              </div>
            </div>

            {/* PHONE */}
            <div className="flex items-start gap-4 mb-8">
              <FaPhoneAlt style={{ color: "#7b1e1e" }} size={20} />
              <div>
                <h3 style={{ color: "#000" }}>Call Us</h3>
                <p style={{ color: "#555" }}>08 8271 4183</p>
              </div>
            </div>

            {/* EMAIL */}
            <div className="flex items-start gap-4 mb-8">
              <FaEnvelope style={{ color: "#7b1e1e" }} size={20} />
              <div>
                <h3 style={{ color: "#000" }}>Email</h3>
                <p style={{ color: "#555" }}>info@goodwoodmeats.com.au</p>
              </div>
            </div>

            {/* HOURS */}
            <div className="flex items-start gap-4">
              <FaClock style={{ color: "#7b1e1e" }} size={20} />
              <div>
                <h3 style={{ color: "#000" }}>Opening Hours</h3>
                <p style={{ color: "#555" }}>Monday – Friday: 7am – 5:30pm</p>
                <p style={{ color: "#555" }}>Saturday: 7am – 12pm</p>
                <p style={{ color: "#555" }}>Sunday: Closed</p>
              </div>
            </div>

          </div>

         <div className="self-start">
            <a
              href="https://www.google.com/maps?q=121+Goodwood+Road+Goodwood+SA"
              target="_blank"
            >
              <img
                src="/map.png"
                alt="Map"
                className="w-[350px] h-[220px] object-cover rounded-2xl shadow-sm ml-auto"
              />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}