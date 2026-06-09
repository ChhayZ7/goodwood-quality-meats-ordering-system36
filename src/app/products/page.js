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
      <div className={styles.imageWrapper} style={{ position: 'relative' }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className={styles.image} />
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
            position: 'absolute', top: '10px', right: '10px',
            padding: '6px 10px', backgroundColor: '#7b1a1a', color: '#ffffff',
            borderRadius: '6px', fontWeight: 600, fontSize: '12px',
          }}>
            Sold Out
          </span>
        )}
      </div>

      <div className={styles.cardContent}>
        <span className={styles.cardCategory}>{product.category}</span>
        <h3 className={styles.cardTitle}>{product.name}</h3>
        <p className={styles.cardPrice}>{priceDisplay}</p>
        {soldOut ? (
          <p style={{
            margin: 0, padding: '10px', textAlign: 'center',
            backgroundColor: '#eeeeee', borderRadius: '6px',
            color: '#666666', fontWeight: 600, fontSize: '13px',
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
  const [searchQuery, setSearchQuery] = useState('')
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

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>
      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>

          {/* Header */}
          <section style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{
              margin: '0 0 16px', color: '#7b1a1a', fontSize: '36px',
              fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>
              Ready for Christmas
            </h1>
            <p style={{ maxWidth: '520px', margin: '0 auto', lineHeight: 1.7, color: '#5b5b5b', fontSize: '14px' }}>
              Browse our selection of premium meats. All orders require a $20 deposit,
              with final payment upon collection.
            </p>
          </section>

          {/* Search Bar */}
          <section style={{ marginBottom: '24px' }}>
            <div style={{ position: 'relative', maxWidth: '620px', margin: '0 auto' }}>
              <svg
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }}
                width="16" height="16" viewBox="0 0 24 24" fill="none"
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
                style={{
                  width: '100%', padding: '11px 40px 11px 40px',
                  border: '1.5px solid #e0d5b7', borderRadius: '8px',
                  fontSize: '14px', color: '#333', background: '#fff',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#7b1a1a'}
                onBlur={e => e.target.style.borderColor = '#e0d5b7'}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    color: '#999', display: 'flex', alignItems: 'center',
                  }}
                  aria-label="Clear search"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
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
                    <div style={{
                      gridColumn: '1 / -1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px 24px',
                      gap: '12px',
                    }}>
                      {/* Red circle icon */}
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#7b1a1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '4px',
                        boxShadow: '0 4px 16px rgba(123,26,26,0.25)',
                      }}>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </div>

                      {/* Bold heading */}
                      <p style={{
                        margin: 0,
                        fontSize: '22px',
                        fontWeight: 700,
                        color: '#7b1a1a',
                        letterSpacing: '0.3px',
                      }}>
                        No products found
                      </p>

                      {/* Helper text */}
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#888',
                        textAlign: 'center',
                        maxWidth: '340px',
                        lineHeight: 1.6,
                      }}>
                        {searchQuery
                          ? `We couldn't find anything matching "${searchQuery}". Try a different search term or browse by category.`
                          : 'No products available in this category right now. Try another category.'
                        }
                      </p>

                    </div>
                  )
              }
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}