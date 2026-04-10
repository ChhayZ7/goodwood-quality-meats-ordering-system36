// Single Product Detail - image, price, add to cart
'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import GoldDivider from '@/components/GoldDivider'
import Footer from '@/components/Footer'

import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function ProductDetailPage() {
  
  const { id } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState(null)
  const [addedToCart,  setAddedToCart]  = useState(false)
  const product = null

  // If no product yet, show placeholder layout
  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>
        <Navbar />
        <GoldDivider />

        <main style={{ flex: 1 }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
        <a href="/products">Back to Products</a>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>

              {/* LEFT — image placeholder */}
              <div style={{
                borderRadius: '10px',
                overflow: 'hidden',
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
            <h1 style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#CCCCCC',
                  margin: '0 0 8px',
                  lineHeight: 1.2,
                }}>Product Name</h1>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#DDDDDD', margin: '0 0 24px' }}>$00.00/kg</p>

            <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#CCCCCC', marginBottom: '6px' }}>
                    Select Your Weight Range
                  </label>
                  <select
                    disabled
                    style={{ width: '280px', padding: '10px 14px', border: '1.5px solid #E8E8E8', borderRadius: '8px', background: '#FAFAFA', fontSize: '14px', color: '#CCCCCC', cursor: 'not-allowed' }}
                  >
                    <option>-- kg</option>
                  </select>
                </div>
            <div style={{ marginBottom: '16px' }}> 
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#CCCCCC', marginBottom: '6px' }}>Quantity</label>
              <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}  style={{ width: '100px', padding: '10px 14px', border: '1.5px solid #CCCCCC', 
              borderRadius: '8px', background: '#fff', fontSize: '14px', color: '#1A1A1A', cursor: 'pointer', outline: 'none' }}
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


           <div style={{
                  width: '100%',
                  padding: '14px',
                  background: '#F0E8D0',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#BBBBBB',
                  textAlign: 'center',
                  marginBottom: '24px',
                }}>
                  Add to Cart
                </div>
            
            <div style={{ borderTop: '1px solid #E8D48A', paddingTop: '20px', marginBottom: '16px' }}>
                <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '16px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>Description</h2>
            <p style={{ fontSize: '13px', color: '#CCCCCC', lineHeight: 1.7, margin: 0 }}>Product description will appear here</p>
            </div>
            
            <div style={{ background: '#F0E8D0', borderRadius: '8px', padding: '14px 16px' }}>
                <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '14px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>How You'll Be Charged</h2>
                <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.6, margin: 0 }}>
                  <strong>Deposit:</strong> $20.00 paid at checkout.{' '}
                    <strong>Final payment:</strong> The exact weight will be determined when your
                    order is prepared. The balance will be charged upon collection based on the actual weight.</p>
            </div>
          </div>
        </div>
        </div>
        </main>

        <p>Product data will load once connected to the database</p>
        
      </div>
    )
  }

  const soldOut = !product.is_available || product.stock === 0

  return (
    <div>
      <a href="/products">← Back to Products</a>

      <div>
        <img src={product.image_url} alt={product.name} />

        <div>
          <h1>{product.name}</h1>

          <p>
            {product.product_type === 'FIXED'
              ? '$' + (product.price_cents / 100).toFixed(2) + '/box'
              : '$' + (product.price_per_kg_cents / 100).toFixed(2) + '/kg'
            }
          </p>

          {product.product_type === 'WEIGHT_RANGE' && (
            <div>
              <label>Select Your Weight Range</label>
              <select
                value={selectedWeight?.id ?? ''}
                onChange={e => {
                  const opt = product.product_weight_options.find(o => o.id === e.target.value)
                  setSelectedWeight(opt)
                }}
              >
                {product.product_weight_options.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label>Quantity</label>
            <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          {product.product_type === 'FIXED' && (
            <p>Total: ${((product.price_cents * quantity) / 100).toFixed(2)}</p>
          )}

          {product.product_type === 'WEIGHT_RANGE' && selectedWeight && (
            <p>
              Estimated: ${((product.price_per_kg_cents * selectedWeight.min_weight_kg * quantity) / 100).toFixed(2)}
              {' '}—{' '}
              ${((product.price_per_kg_cents * selectedWeight.max_weight_kg * quantity) / 100).toFixed(2)}
            </p>
          )}

          <button disabled={soldOut}>
            {soldOut ? 'Sold Out' : 'Add to Cart'}
          </button>

          <h2>Description</h2>
          <p>{product.description}</p>

          <h2>How You'll Be Charged</h2>
          {product.product_type === 'FIXED' ? (
            <p>Deposit: $20.00 paid at checkout. Final payment upon collection.</p>
          ) : (
            <p>Deposit: $20.00 paid at checkout. Final payment based on actual weight at collection.</p>
          )}
        </div>
      </div>
    </div>
  )
}