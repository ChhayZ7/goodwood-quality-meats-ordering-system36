// Single Product Detail - image, price, add to cart
'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import GoldDivider from '@/components/GoldDivider'
import Footer from '@/components/Footer'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ProductDetailPage() {
  
  const { id } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState(null)
  const [addedToCart,  setAddedToCart]  = useState(false)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

    // Fetch product from API
    useEffect(() => {
      if (!id) return
   
      async function fetchProduct() {
        try {
          const res = await fetch(`/api/products/${id}`)
          if (res.status === 404) throw new Error('Product not found')
          if (!res.ok) throw new Error('Failed to fetch product')
          const json = await res.json()
          setProduct(json.product)
   
          // Pre-select the first weight option if product has them
          if (json.product?.product_weight_options?.length > 0) {
            setSelectedWeight(json.product.product_weight_options[0])
          }
        } catch (err) {
          console.error(err)
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
   
      fetchProduct()
    }, [id])

  // In loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#7a6a49', fontSize: '16px' }}>Loading product...</p>
        </main>
      </div>
    )
  }

  // If no product yet, show placeholder layout
  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>


        <main style={{ flex: 1 }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
         <a href="/products"
            style={{ display: 'inline-block', marginBottom: '24px', fontSize: '14px', color: '#555', textDecoration: 'none' }}>
            ← Back to Products
          </a>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>

              {/* LEFT — image placeholder */}
              <div style={{
                borderRadius: '10px',
                height: '400px',
                background: '#F0E8D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>

          {/* Details placeholder */}
          <div>
                <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '26px', fontWeight: 700, color: '#CCCCCC', margin: '0 0 8px' }}>
                  Product Name
                </h1>

                <p style={{ fontSize: '20px', fontWeight: 700, color: '#DDDDDD', margin: '0 0 24px' }}>
                  $00.00/kg
                </p>

              <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#CCCCCC', marginBottom: '6px' }}>
                    Select Your Weight Range
                  </label>
                  <select disabled style={{ width: '280px', padding: '10px 14px', border: '1.5px solid #E8E8E8', borderRadius: '8px', background: '#FAFAFA', fontSize: '14px', color: '#CCCCCC', cursor: 'not-allowed' }}>
                    <option>-- kg</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#CCCCCC', marginBottom: '6px' }}>
                    Quantity
                  </label>
                  <select
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    style={{ width: '100px', padding: '10px 14px', border: '1.5px solid #CCCCCC', borderRadius: '8px', background: '#fff', fontSize: '14px', color: '#1A1A1A', cursor: 'pointer', outline: 'none' }}
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

              <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#CCCCCC', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Estimated Price Range
                  </p>
                  <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', fontWeight: 700, color: '#DDDDDD', margin: 0 }}>
                    $-- — $--
                  </p>
                </div>

                <div style={{ width: '100%', padding: '14px', background: '#F0E8D0', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#BBBBBB', textAlign: 'center', marginBottom: '24px' }}>
                  Add to Cart
                </div>

                <div style={{ borderTop: '1px solid #E8D48A', paddingTop: '20px', marginBottom: '16px' }}>
                  <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '16px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
                    Description
                  </h2>
                  <p style={{ fontSize: '13px', color: '#CCCCCC', lineHeight: 1.7, margin: 0 }}>
                    Product description will appear here once connected to the database.
                  </p>
                </div>

                <div style={{ background: '#F0E8D0', borderRadius: '8px', padding: '14px 16px' }}>
                  <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '14px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>
                    How You&apos;ll Be Charged
                  </h2>
                  <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.6, margin: 0 }}>
                    <strong>Deposit:</strong> $20.00 paid at checkout.{' '}
                    <strong>Final payment:</strong> The exact weight will be determined when your order is prepared. The balance will be charged upon collection based on the actual weight.
                  </p>
                </div>

              </div>
        </div>
        <p style={{ textAlign: 'center', color: '#BBBBBB', fontSize: '13px', marginTop: '32px', fontStyle: 'italic' }}>
          Product data will load once connected to the database</p>
        </div>
        </main>

        
      </div>
    )
  }

  // done by AI because of the null reference
  const soldOut = !product.is_available || product.stock === 0

  const priceDisplay = product.product_type === 'FIXED'
    ? '$' + (product.price_cents / 100).toFixed(2) + '/box'
    : '$' + (product.price_per_kg_cents / 100).toFixed(2) + '/kg'

  const fixedTotal = product.product_type === 'FIXED'
    ? '$' + ((product.price_cents * quantity) / 100).toFixed(2)
    : null

  const estMin = product.product_type === 'WEIGHT_RANGE' && selectedWeight
    ? '$' + ((product.price_per_kg_cents * selectedWeight.min_weight_kg * quantity) / 100).toFixed(2)
    : null

  const estMax = product.product_type === 'WEIGHT_RANGE' && selectedWeight
    ? '$' + ((product.price_per_kg_cents * selectedWeight.max_weight_kg * quantity) / 100).toFixed(2)
    : null

  function handleAddToCart() {
    if (soldOut) return
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  return (
    <div  style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>


      <main style={{ flex: 1 }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
      <a href="/products" style={{ display: 'inline-block', marginBottom: '24px', fontSize: '14px', color: '#555', textDecoration: 'none' }}>← Back to Products</a>

      <div>
        <div style={{ borderRadius: '10px', overflow: 'hidden', maxHeight: '420px' }}>
              <img
                src={product.image_url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* RIGHT — real product details */}
            <div>

              <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '26px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px', lineHeight: 1.2 }}>
                {product.name}
              </h1>

              <p style={{ fontSize: '20px', fontWeight: 700, color: '#7B1A1A', margin: '0 0 24px' }}>
                {priceDisplay}
              </p>

              {/* Weight dropdown — only for WEIGHT_RANGE products */}
              {product.product_type === 'WEIGHT_RANGE' && product.product_weight_options?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#555', marginBottom: '6px' }}>
                    Select Your Weight Range
                  </label>
                  <select
                    value={selectedWeight?.id ?? ''}
                    onChange={e => {
                      const opt = product.product_weight_options.find(o => o.id === e.target.value)
                      setSelectedWeight(opt)
                    }}
                    style={{ width: '280px', padding: '10px 14px', border: '1.5px solid #CCCCCC', borderRadius: '8px', background: '#fff', fontSize: '14px', color: '#1A1A1A', outline: 'none', cursor: 'pointer' }}
                  >
                    {product.product_weight_options.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity dropdown — both types */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#555', marginBottom: '6px' }}>
                  Quantity
                </label>
                <select
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  style={{ width: '100px', padding: '10px 14px', border: '1.5px solid #CCCCCC', borderRadius: '8px', background: '#fff', fontSize: '14px', color: '#1A1A1A', outline: 'none', cursor: 'pointer' }}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* FIXED — flat total */}
              {product.product_type === 'FIXED' && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Total</p>
                  <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{fixedTotal}</p>
                </div>
              )}

              {/* WEIGHT_RANGE — estimated min and max */}
              {product.product_type === 'WEIGHT_RANGE' && estMin && estMax && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Estimated Price Range</p>
                  <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{estMin} — {estMax}</p>
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={soldOut}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '14px',
                  fontFamily: '"Lato", sans-serif',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  cursor: soldOut ? 'not-allowed' : 'pointer',
                  transition: 'background .15s',
                  background: soldOut ? '#E5E7EB' : addedToCart ? '#16A34A' : '#7B1A1A',
                  color: soldOut ? '#9CA3AF' : '#fff',
                }}
              >
                {soldOut ? 'Sold Out' : addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
              </button>

              {/* Description */}
              <div style={{ borderTop: '1px solid #E8D48A', paddingTop: '20px', marginBottom: '16px' }}>
                <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '16px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
                  Description
                </h2>
                <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7, margin: 0 }}>
                  {product.description}
                </p>
              </div>

              {/* How You'll Be Charged */}
              <div style={{ background: '#F0E8D0', borderRadius: '8px', padding: '14px 16px' }}>
                <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '14px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>
                  How You&apos;ll Be Charged
                </h2>
                {product.product_type === 'FIXED' ? (
                  <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.6, margin: 0 }}>
                    <strong>Deposit:</strong> $20.00 paid at checkout. <strong>Final payment</strong> upon collection.
                  </p>
                ) : (
                  <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.6, margin: 0 }}>
                    <strong>Deposit:</strong> $20.00 paid at checkout. <strong>Final payment:</strong> The exact weight will be determined when your order is prepared. The balance will be charged upon collection based on the actual weight.
                  </p>
                )}
              </div>

            </div>
      </div>
      </div>
      </main>
    </div>
  )
}