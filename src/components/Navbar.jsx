// Top navigation bar - logo, navigation links (Products, Recipes, Contact Us), cart icon, auth state

'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
    return (
        <nav className="w-full bg-white border-b" style={{ borderColor: '#e5e5e5' }}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <img
                        src="https://www.goodwoodqualitymeats.com.au/wp-content/uploads/2020/01/Goodwood-Quality-Meats-Logo-Vertical-3-Colour-Transparent-Background.png"
                        alt="Goodwood Quality Meats"
                        className="h-16 w-auto object-contain"
                    />
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-8">
                    <Link
                        href="/products"
                        className="text-sm transition-opacity hover:opacity-70"
                        style={{ color: '#2C2C2A' }}
                    >
                        Products
                    </Link>
                    <Link
                        href="/recipes"
                        className="text-sm transition-opacity hover:opacity-70"
                        style={{ color: '#2C2C2A' }}
                    >
                        Recipes
                    </Link>
                    <Link
                        href="/contact"
                        className="text-sm transition-opacity hover:opacity-70"
                        style={{ color: '#2C2C2A' }}
                    >
                        Contact Us
                    </Link>
                </div>

                {/* Icons */}


                <div className="flex items-center gap-16">
                    <Link href="/cart">
                        <ShoppingCartIcon className="w-5 h-5" style={{ color: '#2C2C2A' }} />
                    </Link>
                    <Link href="/login">
                        <UserIcon className="w-5 h-5" style={{ color: '#2C2C2A' }} />
                    </Link>
                </div>

            </div>

            {/* Gold divider */}
            <div style={{ height: '2px', backgroundColor: '#D4AF37' }} />
        </nav>
    )
}