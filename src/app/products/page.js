'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import GoldDivider from '@/components/GoldDivider'
import Footer from '@/components/Footer'

// Available product categories shown as filter buttons
const CATEGORIES = ['All', 'Pork', 'Beef', 'Lamb', 'Poultry', 'Seafood', 'Other']

// Placeholder card shown while backend product data is not connected yet
function PlaceholderCard() {
  return (
    <article>
      <div>
        <p>Image Placeholder</p>
      </div>

      <div>
        <h3>Product Name</h3>
        <p>$00.00/kg</p>
        <button type="button">See Details</button>
      </div>
    </article>
  )
}

// Reusable card for real product data
// Handles availability and price display logic
function ProductCard({ product }) {
  const soldOut = !product.is_available || product.stock === 0

  const priceDisplay =
    product.product_type === 'FIXED'
      ? `$${(product.price_cents / 100).toFixed(2)}/box`
      : `$${(product.price_per_kg_cents / 100).toFixed(2)}/kg`

  return (
    <article>
      <div>
        <img src={product.image_url} alt={product.name} />
        {soldOut && <p>Sold Out</p>}
      </div>

      <div>
        <h3>{product.name}</h3>
        <p>{priceDisplay}</p>

        {soldOut ? (
          <p>Unavailable</p>
        ) : (
          <Link href={`/products/${product.id}`}>See Details</Link>
        )}
      </div>
    </article>
  )
}


export default function ProductsPage() {
    
  // Stores the currently selected category
  const [activeCategory, setActiveCategory] = useState('All')

  // Temporary empty array until backend is connected
  const products = []
// Filters products based on the selected category
  const filteredProducts = products.filter((product) => {
    return activeCategory === 'All' || product.category === activeCategory
  })
  return (
    <div
    
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#faf3e0',
      }}
    
    >
      <Navbar />
      <GoldDivider />

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
                marginBottom: '12px',
              }}>Ready for Christmas</h1>
          <p style={{
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6',
              }}>
            Browse our selection of premium meats. All orders require a $20 deposit,
            with final payment upon collection.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2>Categories</h2>

          <div>
            {CATEGORIES.map((category) => (
              <button key={category} 
              type="button">
                onClick={() => setActiveCategory(category)}
                {category}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2>Products</h2>

          <div>
            {products.length === 0 ? (
              <>
              <PlaceholderCard />
            <PlaceholderCard />
            <PlaceholderCard />
            <PlaceholderCard />
            <PlaceholderCard />
            <PlaceholderCard />
              </>
             ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
          {products.length === 0 && (
            <p>Products will load here once connected to the database</p>
          )}
        </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}