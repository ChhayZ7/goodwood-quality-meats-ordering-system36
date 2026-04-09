'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import GoldDivider from '@/components/GoldDivider'
import Footer from '@/components/Footer'

const CATEGORIES = ['All', 'Pork', 'Beef', 'Lamb', 'Poultry', 'Seafood', 'Other']

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
    
    
  const [activeCategory, setActiveCategory] = useState('All')

  // Temporary empty array until backend is connected
  const products = []

  const filteredProducts = products.filter((product) => {
    return activeCategory === 'All' || product.category === activeCategory
  })
  return (
    <div>
      <Navbar />
      <GoldDivider />

      <main>
        <section>
          <h1>Ready for Christmas</h1>
          <p>
            Browse our selection of premium meats. All orders require a $20 deposit,
            with final payment upon collection.
          </p>
        </section>

        <section>
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
      </main>

      <Footer />
    </div>
  )
}