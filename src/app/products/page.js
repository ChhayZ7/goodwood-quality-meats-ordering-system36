'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import GoldDivider from '@/components/GoldDivider'
import Footer from '@/components/Footer'

// Available product categories shown as filter buttons
const CATEGORIES = ['All', 'Pork', 'Beef', 'Lamb', 'Poultry', 'Seafood', 'Other']

// Placeholder card shown while backend product data is not connected yet
function PlaceholderCard() {
  return (
    <article
    style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4d3a3',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      <div
      style={{
          height: '180px',
          backgroundColor: '#efe3c4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7a6a49'
        }}
      >
        <p>Image Placeholder</p>
      </div>

      <div style={{ padding: '16px' }}>
        <h3 style={{ marginBottom: '8px', color: '#1a1a1a'}}>Product Name</h3>
        <p style={{ marginBottom: '12px', color: '#7b1a1a', fontWeight: '600'}}>$00.00/kg</p>
        <button type="button"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #d6c08d',
            backgroundColor: '#f5ead0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>See Details
          </button>
      </div>
    </article>
  )
}

// Reusable card for real product data
// Handles availability and price display logic
function ProductCard({product}) {
  const soldOut = !product.is_available || product.stock === 0

  const priceDisplay =
    product.product_type === 'FIXED'
      ? `$${(product.price_cents / 100).toFixed(2)}/box`
      : `$${(product.price_per_kg_cents / 100).toFixed(2)}/kg`

  return (
    <article 
    style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4d3a3',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      <div style={{
          position: 'relative',
          height: '180px',
        }}>
        <img src={product.image_url} alt={product.name} style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}/>
        {soldOut && (
          <p
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              margin: 0,
              padding: '6px 10px',
              backgroundColor: '#7b1a1a',
              color: '#ffffff',
              borderRadius: '6px',
              fontWeight: '600',
            }}
          >
            Sold Out
          </p>)}
      </div>

      <div style={{ padding: '16px' }}>
        <h3 style={{ marginBottom: '8px', color: '#1a1a1a'}}>{product.name}</h3>
        <p style={{ marginBottom: '12px', fontWeight: '600', color: '#7b1a1a'  }}>{priceDisplay}</p>

        {soldOut ? (
          <p  style={{
              margin: 0,
              padding: '10px',
              textAlign: 'center',
              backgroundColor: '#eeeeee',
              borderRadius: '6px',
               color: '#666666',
              fontWeight: '600'
            }}>Unavailable</p>
        ) : (
          <Link href={`/products/${product.id}`}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '10px',
              backgroundColor: '#7b1a1a',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600'
            }}>See Details</Link>
        )}
      </div>
    </article>
  )
}


export default function ProductsPage() {
    
  const [activeCategory, setActiveCategory] = useState('All')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
 
  // Fetch products from your API route on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products')
        if (!res.ok) throw new Error('Failed to fetch products')
        const json = await res.json()
        setProducts(json.products ?? [])
      } catch (err) {
        console.error(err)
        setError('Could not load products. Please try again.')
      } finally {
        setLoading(false)
      }
    }
 
    fetchProducts()
  }, [])
  
// Filters products based on the selected category
  const filteredProducts = products.filter((product) => {
    return activeCategory === 'All' || product.category === activeCategory
  })
  const showPlaceholders = products.length === 0
  const placeholderCount = 6
  return (
    <div
    
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#faf3e0',
      }}
    
    >

      <main style={{ flex: 1 }}>
        <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '48px 24px',
          }}>

        
        <section style={{
              textAlign: 'center',
              marginBottom: '40px',
            }}>
          <h1 style={{
                margin: '0 0 16px',
                color: '#7b1a1a',
                fontSize: '30px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>Ready for Christmas</h1>
          <p style={{
                maxWidth: '520px',
                margin: '0 auto',
                lineHeight: '1.7',
                color: '#5b5b5b',
                fontSize: '14px'
              }}>
            Browse our selection of premium meats. All orders require a $20 deposit,
            with final payment upon collection.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          

          <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
              }}>
            {CATEGORIES.map((category) => (
              <button key={category} 
              type="button"
              onClick={() => setActiveCategory(category)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #d9c48d',
                    backgroundColor:
                      activeCategory === category ? '#8f1d1d' : '#efe3c4',
                    color: activeCategory === category ? '#ffffff' : '#1a1a1a',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
              >
                
                {category}
              </button>
            ))}
          </div>
        </section>
        <section>
          

          <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
              }}>
            {showPlaceholders
                ? Array.from({ length: placeholderCount }).map((_, index) => (
                    <PlaceholderCard key={index} />
                  ))
                : filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
          ))}
          </div>
          {showPlaceholders && (
            <p style={{
                  marginTop: '20px',
                  textAlign: 'center',
                  color: '#999999',
                  fontStyle: 'italic',
                  fontSize: '13px'
                }}>Products will load here once connected to the database</p>
          )}
        </section>
        </div>
      </main>
      <GoldDivider />
    </div>
  )
}