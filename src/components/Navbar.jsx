'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase-browser'

export default function Navbar() {

    const { itemCount } = useCart()

    const [mounted, setMounted] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [firstName, setFirstName] = useState('')
    const [loadingName, setLoadingName] = useState(false)
    const [role, setRole] = useState('')
    const [dropdownOpen, setDropdownOpen] = useState(false)

    useEffect(() => {
        setMounted(true)

        const supabase = createClient()

        async function fetchName() {
            setLoadingName(true)
            const res = await fetch('/api/users/me')
            if (res.status === 401) {
                setIsLoggedIn(false)
                setFirstName('')
                setLoadingName(false)
                return
            }
            const json = await res.json()
            if (json.user) {
                setFirstName(json.user.first_name ?? '')
                setRole(json.user.role ?? '')
            }
            setLoadingName(false)
        }

        supabase.auth.getUser().then(({ data: { user }, error }) => {
            if (user && !error) {
                setIsLoggedIn(true)
                fetchName()
            } else {
                setIsLoggedIn(false)
                setFirstName('')
                supabase.auth.signOut()
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
            if (session) fetchName()
            else setFirstName('')
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    return (
        <>
            {/* Skeleton shimmer animation */}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200px 0; }
                    100% { background-position: 200px 0; }
                }
                .name-skeleton {
                    display: inline-block;
                    width: 60px;
                    height: 12px;
                    border-radius: 6px;
                    background: linear-gradient(90deg, #e5e5e5 25%, #f0f0f0 50%, #e5e5e5 75%);
                    background-size: 400px 100%;
                    animation: shimmer 1.2s ease-in-out infinite;
                    vertical-align: middle;
                }
            `}</style>

            <nav className="w-full bg-white border-b" style={{ borderColor: '#e5e5e5' }}>
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

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
                            <div style={{ position: 'relative' }}>

                                {/* Profile button — clicking opens/closes dropdown */}
                                <button
                                    onClick={() => setDropdownOpen(p => !p)}
                                    className="flex items-center gap-2 text-sm text-gray-700 hover:opacity-70"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                    <UserIcon className="w-6 h-6" style={{ color: '#060606' }} />
                                    <span>
                                        Hi,{' '}
                                        {loadingName
                                            ? <span className="name-skeleton" aria-label="Loading name" />
                                            : firstName
                                        }
                                    </span>
                                </button>

                                {/* Dropdown */}
                                {dropdownOpen && (
                                    <>
                                        {/* Click outside to close */}
                                        <div
                                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 98 }}
                                            onClick={() => setDropdownOpen(false)}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 10px)',
                                            right: 0,
                                            background: '#fff',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '10px',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                                            minWidth: '160px',
                                            zIndex: 99,
                                            overflow: 'hidden',
                                        }}>

                                            {/* Profile */}
                                            <Link
                                                href={role === 'ADMIN' ? '/admin/profile' : role === 'STAFF' ? '/staff/profile' : '/account'}
                                                onClick={() => setDropdownOpen(false)}
                                                style={{ display: 'block', padding: '12px 16px', fontSize: '14px', color: '#1A1A1A', textDecoration: 'none', borderBottom: '1px solid #F3F4F6' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FAF3E0'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                Profile
                                            </Link>

                                            {/* Dashboard — only for ADMIN and STAFF */}
                                            {(role === 'ADMIN' || role === 'STAFF') && (
                                                <Link
                                                    href={role === 'ADMIN' ? '/admin/orders' : '/staff/orders'}
                                                    onClick={() => setDropdownOpen(false)}
                                                    style={{ display: 'block', padding: '12px 16px', fontSize: '14px', color: '#1A1A1A', textDecoration: 'none', borderBottom: '1px solid #F3F4F6' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#FAF3E0'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    Dashboard
                                                </Link>
                                            )}

                                            {/* Sign Out */}
                                            <button
                                                onClick={() => { setDropdownOpen(false); handleSignOut() }}
                                                style={{ display: 'block', width: '100%', padding: '12px 16px', fontSize: '14px', color: '#7B1A1A', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                Sign Out
                                            </button>

                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 text-sm text-gray-700 hover:opacity-70">
                                <UserIcon className="w-6 h-6" style={{ color: '#060606' }} />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>

                </div>
            </nav>
        </>
    )
}