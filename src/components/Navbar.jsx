'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase-browser'

export default function Navbar() {

    const { itemCount } = useCart()

    const [mounted, setMounted] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        setMounted(true)

        const supabase = createClient()

        // Check session immediately
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session)
        })

        // Also listen for auth changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
        })

        return () => subscription.unsubscribe()
    }, [])

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
                    <Link href="/products" className="text-sm tracking-wide transition-opacity hover:opacity-70" style={{ color: '#060606' }}>
                        PRODUCTS
                    </Link>
                    <Link href="/recipes" className="text-sm tracking-wide transition-opacity hover:opacity-70" style={{ color: '#060606' }}>
                        RECIPES
                    </Link>
                    <Link href="/contact" className="text-sm tracking-wide transition-opacity hover:opacity-70" style={{ color: '#060606' }}>
                        CONTACT US
                    </Link>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-16">
                    <Link href="/cart" className='relative'>
                        <ShoppingCartIcon className="w-6 h-6" style={{ color: '#060606' }} />
                        {mounted && itemCount > 0 && (
                            <span
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: '#8B1A1A', fontSize: '10px' }}
                            >
                                {itemCount > 9 ? '9+' : itemCount}
                            </span>
                        )}
                    </Link>

                    <Link href={mounted && isLoggedIn ? '/account' : '/login'}>
                        <UserIcon className="w-6 h-6" style={{ color: '#060606' }} />
                    </Link>
                </div>

            </div>

            {/* Gold divider */}
            <div style={{ height: '2px', backgroundColor: '#D4AF37' }} />
        </nav>
    )
}