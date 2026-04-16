// Top navigation bar - logo, navigation links (Products, Recipes, Contact Us), cart icon, auth state

'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
    return (
        <nav className="w-full bg-white border-b" style={{ borderColor: '#e5e5e5' }}>
            <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <img
                        src="https://www.goodwoodqualitymeats.com.au/wp-content/uploads/2020/01/Goodwood-Quality-Meats-Logo-Vertical-3-Colour-Transparent-Background.png"
                        alt="Goodwood Quality Meats"
                        className="h-20 w-auto object-contain"
                    />
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-30">
                    <Link
                        href="/products"
                        className="text-sm tracking-wide transition-opacity hover:opacity-70"
                        style={{ color: '#060606' }}
                    >
                        PRODUCTS
                    </Link>
                    <Link
                        href="/recipes"
                        className="text-sm tracking-wide transition-opacity hover:opacity-70"
                        style={{ color: '#060606' }}
                    >
                        RECIPES
                    </Link>
                    <Link
                        href="/contact"
                        className="text-sm tracking-wide transition-opacity hover:opacity-70"
                        style={{ color: '#060606' }}
                    >
                        CONTACT US
                    </Link>
                </div>

                {/* Icons */}


                <div className="flex items-center gap-16">
                    <Link href="/cart">
                        <ShoppingCartIcon className="w-6 h-6" style={{ color: '#060606' }} />
                    </Link>
                    <Link href="/login">
                        <UserIcon className="w-6 h-6" style={{ color: '#060606' }} />
                    </Link>
                </div>

            </div>

            {/* Gold divider */}
            <div style={{ height: '2px', backgroundColor: '#D4AF37' }} />
        </nav>
    )
}