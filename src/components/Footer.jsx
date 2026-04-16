import { FaInstagram, FaFacebookF } from "react-icons/fa";
import Link from 'next/link'


export default function Footer() {
  return (
    <footer className="bg-white text-black">
      {/* TOP LINE */}
      <div style={{ height: '2px', backgroundColor: '#D4AF37' }} />
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-3 gap-8 items-start">

        {/* LEFT- OPENING HOURS */}
        <div>
          <h3 className="text-md font-semibold tracking-wide mb-4" style={{ color: "#8B1A1A" }}>
            OPENING HOURS
          </h3>
          <p className="text-sm  mb-1">Monday to Friday: 7am - 5:30pm</p>
          <p className="text-sm mb-1">Saturday: 7am – 12:00pm</p>
          <p className="text-sm">Sunday: Closed</p>
        </div>


        {/* CENTER - LOCATION */}
        <div className="text-center">
          <h3 className="text-md font-semibold tracking-wide mb-4" style={{ color: "#8B1A1A" }}>
            VISIT OUR STORE
          </h3>
          <p className="text-sm mb-1">121 Goodwood Road, Goodwood</p>
          <p className="text-sm mb-4">Ph: <span className="font-semibold">08 8271 4183</span></p>

          <div className="flex justify-center gap-8">

            {/* Instagram */}
            <a
              href="https://www.instagram.com/goodwoodqualitymeats"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center hover:scale-70 transition-opacity"
              style={{ color: '#060606' }}
            >
              <FaInstagram size={35} />
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/goodwoodqualitymeats"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center hover:scale-70 transition-opacity rounded-md bg-black text-white"
            >
              <FaFacebookF size={16} />
            </a>

          </div>

        </div>


        {/* RIGHT - LOGO*/}
        <div className="flex justify-end items-start">
          <Link href="/" className="flex items-center">
            <img
              src="https://www.goodwoodqualitymeats.com.au/wp-content/uploads/2020/01/Goodwood-Quality-Meats-Logo-Vertical-3-Colour-Transparent-Background.png"
              alt="Goodwood Quality Meats"
              className="h-32 w-auto object-contain"
            />
          </Link>
        </div>

      </div>
      {/* Bottom bar */}
      <div
        className="text-center py-4 text-xs border-t"
        style={{ color: '#717182', borderColor: '#e5e5e5' }}
      >
        © 2025 Goodwood Quality Meats. All rights reserved.
      </div>

    </footer>
  );
}