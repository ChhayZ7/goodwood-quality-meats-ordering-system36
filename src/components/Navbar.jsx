"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-black text-white fixed top-0 w-full z-50 px-8 py-4 flex justify-between items-center">

      <h1 className="font-bold text-lg">Goodwood Meats</h1>

      <div className="flex gap-6">
        <Link href="/">Home</Link>
       
        <Link href="/contact">Contact</Link>
      </div>

    </nav>
  );
}