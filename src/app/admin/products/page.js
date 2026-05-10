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

  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState(null)

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLOR.cream, fontFamily: '"Lato", sans-serif' }}>
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
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

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: COLOR.muted, fontSize: '15px' }}>
            Loading products…
          </div>
        )}

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
        {!loading && !fetchError && (
          <div style={{ background: COLOR.white, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

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

            {/* Rows */}
            {products.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: COLOR.muted, fontSize: '14px' }}>
                No products yet. Click &ldquo;+ Add New Product&rdquo; to get started.
              </div>
            ) : (
              products.map((product, idx) => (
                <div
                  key={product.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 2fr 1fr 1fr 1fr 100px',
                    padding: '16px 28px',
                    borderBottom: idx < products.length - 1 ? `1px solid ${COLOR.border}` : 'none',
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

                  {/* Edit button -> navigates to separate page */}
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
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}