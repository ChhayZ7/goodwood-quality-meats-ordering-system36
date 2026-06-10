'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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

function centsToDollars(cents) {
  return (cents / 100).toFixed(2)
}
function priceDisplay(product) {
  if (product.product_type === 'FIXED') {
    return '$' + centsToDollars(product.price_cents) + '/box'
  }
  return '$' + centsToDollars(product.price_per_kg_cents) + '/kg'
}
function typeLabel(type) {
  return type === 'FIXED' ? 'Fixed Price' : 'Weight-based'
}

export default function AdminProductsPage() {
  const router = useRouter()

  const [products,    setProducts]   = useState([])
  const [loading,     setLoading]    = useState(true)
  const [fetchError,  setFetchError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

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

  useEffect(() => { loadProducts() }, [loadProducts])

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLOR.cream, fontFamily: '"Lato", sans-serif' }}>
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

        {/* Header */}
        <div className="products-header">
          <h1 style={{ fontFamily: '"Lato", serif', fontSize: '36px', fontWeight: 700, color: COLOR.red, margin: 0 }}>
            Products &amp; Pricing
          </h1>
          {!loading && !fetchError && (
            <button
              onClick={() => router.push('/admin/products/new')}
              style={{
                padding: '12px 28px',
                background: COLOR.red,
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                fontFamily: '"Lato", sans-serif',
                color: COLOR.white,
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#5C1212'}
              onMouseLeave={e => e.currentTarget.style.background = COLOR.red}
            >
              + Add New Product
            </button>
          )}
        </div>

        {/* Gold divider */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`, marginBottom: '32px', borderRadius: '1px' }} />

        {/* Search bar */}
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
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                border: '1.5px solid #CCCCCC',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: '"Lato", sans-serif',
                color: COLOR.text,
                background: COLOR.white,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = COLOR.red}
              onBlur={e => e.target.style.borderColor = '#CCCCCC'}
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                padding: '9px 18px',
                background: 'transparent',
                color: COLOR.muted,
                border: '1.5px solid #CCCCCC',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: '"Lato", sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Error */}
        {fetchError && (
          <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '10px', padding: '16px 20px', color: '#B91C1C', fontSize: '14px', marginBottom: '24px' }}>
            {fetchError} —{' '}
            <button
              onClick={loadProducts}
              style={{ background: 'none', border: 'none', color: COLOR.red, cursor: 'pointer', textDecoration: 'underline', fontSize: '14px', padding: 0 }}
            >
              retry
            </button>
          </div>
        )}

        {/* Table */}
        {!fetchError && (
          <div className="products-table-scroll">
          <div className="products-table">

            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 100px',
              padding: '14px 28px',
              borderBottom: `2px solid ${COLOR.border}`,
            }}>
              {['', 'Product Name', 'Category', 'Type', 'Current Price', 'Actions'].map((h, i) => (
                <span key={i} style={{
                  fontSize: '13px', fontWeight: 700, color: COLOR.muted,
                  textTransform: 'uppercase', letterSpacing: '.06em',
                  textAlign: i === 5 ? 'center' : 'left',
                }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Skeleton rows while loading */}
            {loading && Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 100px',
                  padding: '16px 28px',
                  borderBottom: i < 6 ? `1px solid ${COLOR.border}` : 'none',
                  alignItems: 'center',
                }}
              >
                {/* Thumbnail placeholder */}
                <div style={{ width: 44, height: 44, borderRadius: 8, background: '#F0E8D0' }} />
                {/* Name placeholder */}
                <div style={{ width: '160px', height: '14px', background: '#F0E8D0', borderRadius: '4px' }} />
                {/* Category placeholder */}
                <div style={{ width: '80px', height: '14px', background: '#F3F4F6', borderRadius: '4px' }} />
                {/* Type placeholder */}
                <div style={{ width: '90px', height: '14px', background: '#F3F4F6', borderRadius: '4px' }} />
                {/* Price placeholder */}
                <div style={{ width: '70px', height: '14px', background: '#F3F4F6', borderRadius: '4px' }} />
                {/* Button placeholder */}
                <div style={{ width: '60px', height: '30px', background: '#F3F4F6', borderRadius: '8px', margin: '0 auto' }} />
              </div>
            ))}

            {/* No search results */}
            {!loading && filteredProducts.length === 0 && (
              <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  backgroundColor: COLOR.red, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: '4px',
                  boxShadow: '0 4px 16px rgba(123,26,26,0.25)',
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '18px', fontWeight: 700, color: COLOR.red, margin: 0 }}>
                  No products found
                </p>
                <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '13px', color: COLOR.muted, margin: 0, maxWidth: '300px', lineHeight: 1.6 }}>
                  {searchQuery
                    ? `We couldn't find anything matching "${searchQuery}". Try a different search term.`
                    : 'No products yet. Click "+ Add New Product" to get started.'
                  }
                </p>
              </div>
            )}

            {/* Rows */}
            {!loading && filteredProducts.map((product, idx) => (
              <div
                key={product.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 100px',
                  padding: '16px 28px',
                  borderBottom: idx < filteredProducts.length - 1 ? `1px solid ${COLOR.border}` : 'none',
                  alignItems: 'center',
                  transition: 'background .1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FDFAF3'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Thumbnail */}
                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: COLOR.sidebar, flexShrink: 0 }}>
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🥩</div>
                  }
                </div>

                {/* Name */}
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: COLOR.text }}>{product.name}</span>
                  {!product.is_available && (
                    <span style={{
                      marginLeft: '10px', fontSize: '11px', fontWeight: 700,
                      background: '#F3F4F6', color: COLOR.muted,
                      padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase',
                    }}>
                      Unavailable
                    </span>
                  )}
                </div>

                {/* Category */}
                <span style={{ fontSize: '14px', color: COLOR.muted }}>{product.category}</span>

                {/* Type */}
                <span style={{ fontSize: '14px', color: COLOR.muted }}>{typeLabel(product.product_type)}</span>

                {/* Price */}
                <span style={{ fontSize: '15px', fontWeight: 600, color: COLOR.text }}>{priceDisplay(product)}</span>

                {/* Edit button */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => router.push(`/admin/products/${product.id}`)}
                    style={{
                      padding: '7px 20px',
                      border: `1.5px solid ${COLOR.red}`,
                      borderRadius: '8px',
                      background: 'transparent',
                      color: COLOR.red,
                      fontSize: '13px',
                      fontWeight: 700,
                      fontFamily: '"Lato", sans-serif',
                      cursor: 'pointer',
                      transition: 'all .12s',
                    }}
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