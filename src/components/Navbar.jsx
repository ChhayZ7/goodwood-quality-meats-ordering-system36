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
    const [firstName, setFirstName] = useState('')

    useEffect(() => {
        setMounted(true)

        const supabase = createClient()

        // Check session immediately
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session)
            if (session) fetchName()
            
        })

        // Also listen for auth changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
            if (session) fetchName()
            else setFirstName('')
        })

         async function fetchName() {
            const res = await fetch('/api/users/me')
            const json = await res.json()
            if (json.user) setFirstName(json.user.first_name ?? '')
        }

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

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

                
                    {mounted && isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            <Link href="/account" className="flex items-center gap-2 text-sm text-gray-700 hover:opacity-70">
                                <UserIcon className="w-6 h-6" style={{ color: '#060606' }} />
                                <span>Hi, {firstName}</span>
                            </Link>
                            <button onClick={handleSignOut} className="hover:opacity-70">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="flex items-center gap-2 text-sm text-gray-700 hover:opacity-70">
                            <UserIcon className="w-6 h-6" style={{ color: '#060606' }} />
                            <span>Login</span>
                        </Link>
                    )}
                </div>

            </div>

            {/* Gold divider */}
            <div style={{ height: '2px', backgroundColor: '#D4AF37' }} />
        </nav>
    )
}