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
            <h1>Product Name</h1>
            <p>$00.00/kg</p>

            <label>Quantity</label>
            <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            <p>Total: $--</p>

            <button disabled>Add to Cart</button>

            <h2>Description</h2>
            <p>Product description will appear here</p>

            <h2>How You'll Be Charged</h2>
            <p>Deposit: $20.00 paid at checkout. Final payment upon collection.</p>
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