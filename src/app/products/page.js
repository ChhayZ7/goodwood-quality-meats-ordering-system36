'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '@/app/styles/card.module.css'

const CATEGORIES = ['All', 'Pork', 'Beef', 'Lamb', 'Poultry', 'Seafood', 'Other']

function ProductCardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine} style={{ width: '60px', height: '12px', marginBottom: '10px' }} />
        <div className={styles.skeletonLine} style={{ width: '80%', height: '18px', marginBottom: '8px' }} />
        <div className={styles.skeletonLine} style={{ width: '100%', height: '12px', marginBottom: '4px' }} />
        <div className={styles.skeletonLine} style={{ width: '70%', height: '12px' }} />
      </div>
    </div>
  )
}

function ProductCard({ product }) {
  const soldOut = !product.is_available || product.stock === 0

  const priceDisplay =
    product.product_type === 'FIXED'
      ? `$${(product.price_cents / 100).toFixed(2)}/box`
      : `$${(product.price_per_kg_cents / 100).toFixed(2)}/kg`

  return (
    <div className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrapper} style={{ position: 'relative' }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={styles.image}
          />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {soldOut && (
          <span style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '6px 10px',
            backgroundColor: '#7b1a1a',
            color: '#ffffff',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '12px',
          }}>
            Sold Out
          </span>
        )}
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{product.name}</h3>
        <p style={{ marginBottom: '12px', fontWeight: 600, color: '#7b1a1a', fontSize: '14px' }}>
          {priceDisplay}
        </p>

        {soldOut ? (
          <p style={{
            margin: 0,
            padding: '10px',
            textAlign: 'center',
            backgroundColor: '#eeeeee',
            borderRadius: '6px',
            color: '#666666',
            fontWeight: 600,
            fontSize: '13px',
          }}>
            Unavailable
          </p>
        ) : (
          <Link href={`/products/${product.id}`} className={styles.cardLink}>
            See Details →
          </Link>
        )}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const filteredProducts = products.filter(product =>
    activeCategory === 'All' || product.category === activeCategory
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>


      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>

          {/* Header */}
          <section style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{
              margin: '0 0 16px',
              color: '#7b1a1a',
              fontSize: '36px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Ready for Christmas
            </h1>
            <p style={{
              maxWidth: '520px',
              margin: '0 auto',
              lineHeight: 1.7,
              color: '#5b5b5b',
              fontSize: '14px',
            }}>
              Browse our selection of premium meats. All orders require a $20 deposit,
              with final payment upon collection.
            </p>
          </section>

          {/* Category Filter */}
          <section style={{ marginBottom: '32px' }}>
            <div className={styles.filterContainer}>
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`${styles.filterButton} ${activeCategory === category ? styles.filterButtonActive : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          {/* Product Grid */}
          <section>
            {error && (
              <p style={{ textAlign: 'center', color: '#7B1A1A', fontSize: '14px' }}>{error}</p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : filteredProducts.length > 0
                  ? filteredProducts.map(product => <ProductCard key={product.id} product={product} />)
                  : (
                    <p style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      color: '#999',
                      fontStyle: 'italic',
                      fontSize: '14px',
                      padding: '40px 0',
                    }}>
                      No products found for this category.
                    </p>
                  )
              }
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}