import { FaInstagram, FaFacebookF } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white text-black pb-14">
      {/* TOP LINE */}
      <div className="w-full h-[2px] bg-[#caa46b] mb-16"></div>

      <div className="max-w-7xl mx-auto pl-0 pr-6 grid grid-cols-3 gap-25 items-start">

        {/* LEFT- TIMINGS */}
        <div className="ml-1">
          <h3 className="text-3xl font-semibold mb-6" style={{ color: "#7b1e1e" }}>
            OPENING HOURS
          </h3>
          <p className="text-2xl  mb-2">Monday to Friday: 7am - 5:30pm</p>
          <p className="text-2xl mb-2">Saturday: 7am – 12:00pm</p>
          <p className="text-2xl">Sunday: Closed</p>
        </div>


        {/* CENTER - LOCATION */}
        <div className="text-center">
          <h3 className="text-3xl font-semibold mb-6" style={{ color: "#7b1e1e" }}>
            VISIT OUR STORE
          </h3>
          <p className="text-2xl">121 Goodwood Road, Goodwood</p>
          <p className="text-2xl mt-2">Ph <b>08 8271 4183</b></p>

          <div className="flex justify-center gap-5 mt-3 pt-2">

            {/* Instagram */}
            <a
                href="https://www.instagram.com/goodwoodqualitymeats"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center hover:scale-110 transition"
            >
                <FaInstagram className="text-5xl font-bold" />
            </a>

            {/* Facebook */}
            <a
                href="https://www.facebook.com/goodwoodqualitymeats"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center hover:scale-110 transition rounded-full bg-black text-white"
            >
                <FaFacebookF className="text-4xl font-bold translate-x-[1px]" />
            </a>

          </div>

        </div>


        {/* RIGHT - LOGO*/}
        <div className="flex justify-end items-start">
          <img
            src="/logo.png" alt="Goodwood Logo" className="w-60"
          />
        </div>

      </div>
    </footer>
  );
}