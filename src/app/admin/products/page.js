'use client'

import { useState, useEffect, useCallback } from 'react'
// useRouter lets us navigate to the new product page or the edit page
import { useRouter } from 'next/navigation'

// COLOR stores all brand colours in one place so they are consistent and easy to update
const COLOR = {
  red:       '#7B1A1A',
  redLight:  '#FEF2F2',
  redBorder: '#FECACA',
  cream:     '#FAF3E0',
  gold:      '#C9A84C',
  text:      '#1A1A1A',
  muted:     '#6B7280',
  border:    '#E5DCC8',
  white:     '#FFFFFF',
  sidebar:   '#F5EDD8',
}

// centsToDollars converts a price stored in cents to a dollar string with 2 decimal places
// e.g. 1500 becomes "15.00"
function centsToDollars(cents) {
  return (cents / 100).toFixed(2)
}

// priceDisplay returns a formatted price string based on product type
// FIXED products show price per box e.g. "$25.00/box"
// WEIGHT_RANGE products show price per kg e.g. "$18.00/kg"
function priceDisplay(product) {
  if (product.product_type === 'FIXED') {
    return '$' + centsToDollars(product.price_cents) + '/box'
  }
  return '$' + centsToDollars(product.price_per_kg_cents) + '/kg'
}

// typeLabel returns a readable label for the product type
// FIXED becomes "Fixed Price", anything else becomes "Weight-based"
function typeLabel(type) {
  return type === 'FIXED' ? 'Fixed Price' : 'Weight-based'
}

export default function AdminProductsPage() {
  const router = useRouter()

  // products stores the full list of products fetched from the API
  const [products, setProducts] = useState([])

  // loading is true while the API call is in progress, controls skeleton rows
  const [loading, setLoading] = useState(true)

  // fetchError stores any error message if the API call fails
  const [fetchError, setFetchError] = useState(null)

  // searchQuery stores the current text in the search bar
  const [searchQuery, setSearchQuery] = useState('')

  //AI support
  // loadProducts fetches all products from GET /api/admin/products
  // wrapped in useCallback so it does not get recreated on every render
  // the empty dependency array [] means it is only created once
  // this allows it to be safely passed to useEffect without causing infinite loops
  const loadProducts = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res  = await fetch('/api/admin/products')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load products')
      setProducts(data.products)
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // useEffect calls loadProducts once on mount
  // loadProducts is listed as a dependency because it is defined outside the effect
  useEffect(() => { loadProducts() }, [loadProducts])

  // filteredProducts filters the products array based on searchQuery
  // .toLowerCase() on both sides makes the search case-insensitive
  // .includes() returns true if the product name contains the search string
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLOR.cream, fontFamily: '"Lato", sans-serif' }}>

      {/* Inline CSS classes for responsive layout
          products-main is the main content area, flex 1 makes it take up remaining width
          overflow-y auto allows the content to scroll independently
          min-width 0 prevents flex children from overflowing their container
          @media (max-width: 768px) reduces padding on small screens */}
      <style>{`
        .products-main { flex: 1; padding: 40px 48px; overflow-y: auto; min-width: 0; }
        .products-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; gap: 12px; flex-wrap: wrap; }
        .products-search-wrap { position: relative; width: 400px; max-width: 100%; }
        .products-table-scroll { overflow-x: auto; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .products-table { background: #fff; border-radius: 12px; overflow: hidden; min-width: 560px; }
        @media (max-width: 768px) {
          .products-main { padding: 20px 16px; }
          .products-search-wrap { width: 100%; }
        }
      `}</style>

      <main className="products-main">

        {/* Header -- page title on the left, Add New Product button on the right
            button only shows after loading is done and there is no fetch error */}
        <div className="products-header">
          <h1 style={{ fontFamily: '"Lato", serif', fontSize: '36px', fontWeight: 700, color: COLOR.red, margin: 0 }}>
            Products &amp; Pricing
          </h1>
          {!loading && !fetchError && (
            <button
              onClick={() => router.push('/admin/products/new')}
              style={{ padding: '12px 28px', background: COLOR.red, border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, fontFamily: '"Lato", sans-serif', color: COLOR.white, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#5C1212'}
              onMouseLeave={e => e.currentTarget.style.background = COLOR.red}
            >
              + Add New Product
            </button>
          )}
        </div>

        {/* Gold gradient divider -- fades from gold to transparent from left to right */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`, marginBottom: '32px', borderRadius: '1px' }} />

        {/* Search bar
            position relative on the wrapper lets the SVG icon be positioned absolutely inside it
            the SVG icon is the magnifying glass, pointerEvents none means clicks pass through it to the input
            translateY(-50%) centres the icon vertically inside the input
            onFocus changes border to red when the input is active, onBlur resets it
            onKeyDown prevents the Enter key from submitting a form if this is ever inside one
            Clear Search button only appears when searchQuery has text, clicking it resets searchQuery to empty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div className="products-search-wrap">
            <svg
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
              style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #CCCCCC', borderRadius: '8px', fontSize: '13px', fontFamily: '"Lato", sans-serif', color: COLOR.text, background: COLOR.white, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = COLOR.red}
              onBlur={e => e.target.style.borderColor = '#CCCCCC'}
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ padding: '9px 18px', background: 'transparent', color: COLOR.muted, border: '1.5px solid #CCCCCC', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: '"Lato", sans-serif', whiteSpace: 'nowrap' }}
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Error banner -- shown if loadProducts failed
            includes a retry button that calls loadProducts again */}
        {fetchError && (
          <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '10px', padding: '16px 20px', color: '#B91C1C', fontSize: '14px', marginBottom: '24px' }}>
            {fetchError}{' '}
            <button onClick={loadProducts} style={{ background: 'none', border: 'none', color: COLOR.red, cursor: 'pointer', textDecoration: 'underline', fontSize: '14px', padding: 0 }}>
              retry
            </button>
          </div>
        )}

        {/* Table -- only rendered when there is no fetch error
            products-table-scroll allows horizontal scrolling on small screens
            min-width 560px on products-table ensures columns don't get too squished */}
        {!fetchError && (
          <div className="products-table-scroll">
            <div className="products-table">

              {/* Table header row
                  grid with 6 columns: thumbnail, name, category, type, price, actions
                  60px for thumbnail, 2fr for name (wider), 1fr for the rest, 100px for actions
                  last column (Actions) is centre aligned, all others are left aligned */}
              <div style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 100px', padding: '14px 28px', borderBottom: `2px solid ${COLOR.border}` }}>
                {['', 'Product Name', 'Category', 'Type', 'Current Price', 'Actions'].map((h, i) => (
                  <span key={i} style={{ fontSize: '13px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '.06em', textAlign: i === 5 ? 'center' : 'left' }}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Skeleton rows -- shown while loading is true
                  Array.from({ length: 7 }) creates 7 empty slots, one for each skeleton row
                  each row has placeholder blocks matching the shape of the real columns
                  borderBottom is skipped on the last row (i < 6) */}
              {loading && Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 100px', padding: '16px 28px', borderBottom: i < 6 ? `1px solid ${COLOR.border}` : 'none', alignItems: 'center' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: '#F0E8D0' }} />
                  <div style={{ width: '160px', height: '14px', background: '#F0E8D0', borderRadius: '4px' }} />
                  <div style={{ width: '80px', height: '14px', background: '#F3F4F6', borderRadius: '4px' }} />
                  <div style={{ width: '90px', height: '14px', background: '#F3F4F6', borderRadius: '4px' }} />
                  <div style={{ width: '70px', height: '14px', background: '#F3F4F6', borderRadius: '4px' }} />
                  <div style={{ width: '60px', height: '30px', background: '#F3F4F6', borderRadius: '8px', margin: '0 auto' }} />
                </div>
              ))}

              {/* Empty state -- shown when loading is done but no products match the search
                  the icon and message change based on whether a search is active or the list is just empty */}
              {!loading && filteredProducts.length === 0 && (
                <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: COLOR.red, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', boxShadow: '0 4px 16px rgba(123,26,26,0.25)' }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                  <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '18px', fontWeight: 700, color: COLOR.red, margin: 0 }}>No products found</p>
                  <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '13px', color: COLOR.muted, margin: 0, maxWidth: '300px', lineHeight: 1.6 }}>
                    {/* message depends on whether there is an active search or the list is just empty */}
                    {searchQuery
                      ? `We couldn't find anything matching "${searchQuery}". Try a different search term.`
                      : 'No products yet. Click "+ Add New Product" to get started.'
                    }
                  </p>
                </div>
              )}

              {/* Product rows -- rendered after loading is done
                  idx is used to skip the bottom border on the last row
                  onMouseEnter and onMouseLeave give a subtle cream hover effect on each row
                  thumbnail shows the product image or a meat emoji fallback if no image exists
                  Unavailable badge only shows if is_available is false
                  Edit button navigates to the edit page for that product using its id */}
              {!loading && filteredProducts.map((product, idx) => (
                <div
                  key={product.id}
                  style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 100px', padding: '16px 28px', borderBottom: idx < filteredProducts.length - 1 ? `1px solid ${COLOR.border}` : 'none', alignItems: 'center', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FDFAF3'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Thumbnail -- overflow hidden clips the image inside rounded corners */}
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: COLOR.sidebar, flexShrink: 0 }}>
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🥩</div>
                    }
                  </div>

                  {/* Name + Unavailable badge */}
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: COLOR.text }}>{product.name}</span>
                    {/* badge only renders if is_available is false */}
                    {!product.is_available && (
                      <span style={{ marginLeft: '10px', fontSize: '11px', fontWeight: 700, background: '#F3F4F6', color: COLOR.muted, padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase' }}>
                        Unavailable
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '14px', color: COLOR.muted }}>{product.category}</span>
                  {/* typeLabel converts FIXED or WEIGHT_RANGE to a readable label */}
                  <span style={{ fontSize: '14px', color: COLOR.muted }}>{typeLabel(product.product_type)}</span>
                  {/* priceDisplay formats the price with the correct unit based on product type */}
                  <span style={{ fontSize: '15px', fontWeight: 600, color: COLOR.text }}>{priceDisplay(product)}</span>

                  {/* Edit button -- navigates to /admin/products/[id] */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                      style={{ padding: '7px 20px', border: `1.5px solid ${COLOR.red}`, borderRadius: '8px', background: 'transparent', color: COLOR.red, fontSize: '13px', fontWeight: 700, fontFamily: '"Lato", sans-serif', cursor: 'pointer', transition: 'all .12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = COLOR.red; e.currentTarget.style.color = COLOR.white }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLOR.red }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}