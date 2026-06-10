'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'
// useCart is a custom context hook that provides cart item count across the app (Chhay made this)
import { useCart } from '@/context/CartContext'
// createClient creates a Supabase client instance for the browser (client-side auth)
import { createClient } from '@/lib/supabase-browser'

export default function Navbar() {

    // itemCount comes from CartContext, tracks how many items are in the cart
    const { itemCount } = useCart()

    // mounted, tracks if the component has loaded on the client side
    // prevents hydration mismatch between server and client render
    const [mounted, setMounted] = useState(false)

    // isLoggedIn, tracks whether the user is currently authenticated
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // firstName, stores the logged-in user's first name to display in the navbar
    const [firstName, setFirstName] = useState('')

    // loadingName, true while fetching the user's name, used to show skeleton shimmer
    const [loadingName, setLoadingName] = useState(false)

    // role, stores the user's role (ADMIN, STAFF, or customer) to control what links appear
    const [role, setRole] = useState('')

    // dropdownOpen, controls whether the profile dropdown menu is visible
    const [dropdownOpen, setDropdownOpen] = useState(false)

    // useEffect runs once on mount (empty dependency array [])
    // sets mounted to true, checks auth state, fetches user name and role
    useEffect(() => {
        setMounted(true)

        const supabase = createClient()

        // fetchName — calls /api/users/me to get the logged-in user's first name and role
        // if 401 (unauthorized), clears the login state
        // hits the users API route which reads from the users table in Supabase
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

        // getUser checks Supabase auth session on page load
        // if a valid user session exists, sets isLoggedIn to true and fetches their name
        // if no session, signs out and clears state
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

        // onAuthStateChange listens for login/logout events in real time
        // if a session starts (login), fetches the user's name
        // if session ends (logout), clears the first name
        // returns unsubscribe to clean up the listener when the component unmounts
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
            if (session) fetchName()
            else setFirstName('')
        })

        return () => subscription.unsubscribe()
    }, [])

    // handleSignOut signs the user out via Supabase auth, then redirects to /login
    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    return (
        <>
            {/* Skeleton shimmer animation, shown while the user's name is loading
                Uses a CSS keyframe animation (shimmer) that slides a gradient across
                a grey placeholder bar, giving a loading effect instead of a blank space */}
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

            {/* w-full full width, bg-white white background, border-b bottom border line */}
            <nav className="w-full bg-white border-b" style={{ borderColor: '#e5e5e5' }}>

                {/* ROW 1: Logo, desktop nav links, and icons
                    max-w-7xl limits width, mx-auto centres it
                    px-4 md:px-6 — smaller padding on mobile, larger on md and above (768px+)
                    py-3 vertical padding, flex items-center justify-between spaces logo and icons at opposite ends */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">

                    {/* Logo links back to homepage
                        h-14 on mobile, h-20 on md and above (768px+)
                        w-auto keeps the aspect ratio, flex-shrink-0 prevents it from shrinking */}
                    <Link href="/" className="flex items-center flex-shrink-0">
                        <img
                            src="https://www.goodwoodqualitymeats.com.au/wp-content/uploads/2020/01/Goodwood-Quality-Meats-Logo-Vertical-3-Colour-Transparent-Background.png"
                            alt="Goodwood Quality Meats"
                            className="h-14 md:h-20 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop nav links, hidden on mobile (hidden), visible on md and above (md:flex)
                        gap-30 adds large spacing between the links
                        tracking-wide letter spacing, hover:opacity-70 fades slightly on hover */}
                    <div className="hidden md:flex items-center gap-30">
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

                    {/* Icons - cart and user profile
                        gap-4 on mobile, gap-16 on md and above */}
                    <div className="flex items-center gap-4 md:gap-16">

                        {/* Cart icon: links to /cart
                            relative on the parent so the badge can be positioned absolutely on top
                            mounted check prevents the badge from rendering on the server (avoids hydration error)
                            itemCount > 9 shows 9+ instead of a large number to keep the badge small */}
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

                        {/* If mounted and logged in, show profile button with dropdown
                            If not logged in, show a plain Login link */}
                        {mounted && isLoggedIn ? (
                            <div style={{ position: 'relative' }}>

                                {/* Profile button is a clicking toggles dropdownOpen state
                                    shows skeleton shimmer while loadingName is true, then shows firstName */}
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

                                {/* Dropdown menu only renders when dropdownOpen is true */}
                                {dropdownOpen && (
                                    <>
                                        {/* Invisible full screen overlay behind the dropdown
                                            clicking it sets dropdownOpen to false, closing the dropdown */}
                                        <div
                                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 98 }}
                                            onClick={() => setDropdownOpen(false)}
                                        />

                                        {/* Dropdown panel positioned absolutely below the profile button
                                            zIndex 99 keeps it above the overlay (98) so it stays clickable */}
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

                                            {/* Profile link redirects based on role
                                                ADMIN → /admin/profile, STAFF → /staff/profile, customer → /account */}
                                            <Link
                                                href={role === 'ADMIN' ? '/admin/profile' : role === 'STAFF' ? '/staff/profile' : '/account'}
                                                onClick={() => setDropdownOpen(false)}
                                                style={{ display: 'block', padding: '12px 16px', fontSize: '14px', color: '#1A1A1A', textDecoration: 'none', borderBottom: '1px solid #F3F4F6' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FAF3E0'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                Profile
                                            </Link>

                                            {/* Dashboard link only shows for ADMIN and STAFF roles
                                                ADMIN → /admin/orders, STAFF → /staff/orders */}
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

                                            {/* Sign Out button calls handleSignOut which signs out via Supabase and redirects to /login */}
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
                            // Not logged in, then show plain Login link
                            <Link href="/login" className="flex items-center gap-2 text-sm text-gray-700 hover:opacity-70">
                                <UserIcon className="w-6 h-6" style={{ color: '#060606' }} />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>

                </div>

                {/*AI supported here since I don't know how to split it as the nav bar has too many components and really wide */}
                {/*so it suggested me to drop is down as 2 rows */}
                {/* ROW 2:  Mobile only nav links (flex on mobile, hidden on md and above)
                    border-t top border separates it from the logo row above
                    flex-1 makes each link take equal width, text-center centres the text
                    text-xs smaller font for the compact mobile bar */}
                <div className="flex md:hidden border-t" style={{ borderColor: '#e5e5e5' }}>
                    <Link href="/products" className="flex-1 text-center py-2 text-xs tracking-wide transition-opacity hover:opacity-70" style={{ color: '#060606' }}>
                        PRODUCTS
                    </Link>
                    <Link href="/recipes" className="flex-1 text-center py-2 text-xs tracking-wide transition-opacity hover:opacity-70" style={{ color: '#060606' }}>
                        RECIPES
                    </Link>
                    <Link href="/contact" className="flex-1 text-center py-2 text-xs tracking-wide transition-opacity hover:opacity-70" style={{ color: '#060606' }}>
                        CONTACT US
                    </Link>
                </div>

            </nav>
        </>
    )
}