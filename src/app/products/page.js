'use client'

// This page needs to be a Client Component because it uses React state,
// fetching, search input changes, and category button clicks.
// Referece - https://nextjs.org/docs/app/api-reference/directives/use-client

import { useState, useEffect } from 'react'
// useState stores values that change on the page, like products, loading, and search text.
// useEffect runs the product fetch when the page first loads.
// AI-assisted reference used for hooks:
// https://react.dev/reference/react/useState
// https://react.dev/reference/react/useEffect

import Link from 'next/link'
// Link is used instead of a normal <a> tag so navigation works properly in Next.js.
// Reference used:
// https://nextjs.org/docs/app/api-reference/components/link

import styles from '@/app/styles/card.module.css'
// CSS module is used so the card styles stay scoped to this component.
// Reference used:
// https://nextjs.org/docs/app/getting-started/css#css-modules


// Product categories used for the filter buttons.
// "All" is included so the customer can reset the filter and see every product.
const CATEGORIES = ['All', 'Pork', 'Beef', 'Lamb', 'Poultry', 'Seafood', 'Other']

// This component displays grey loading cards while the products are being fetched.
// I used this so the page does not look empty while waiting for the API.
// AI was used to help organise the loading UI pattern.
// Reference used for conditional rendering idea:
// https://react.dev/learn/conditional-rendering
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

// This component displays one product card. It keeps the product card code separate 
// from the main ProductsPage, which makes the page easier to read and maintain.
function ProductCard({ product }) {
  // A product is sold out if it is marked unavailable or its stock is 0
  const soldOut = !product.is_available || product.stock === 0

  // This decides how the price should display. Fixed products show price per box, and weight products show price per kg
  const priceDisplay =
    product.product_type === 'FIXED'
      ? `$${(product.price_cents / 100).toFixed(2)}/box`
      : `$${(product.price_per_kg_cents / 100).toFixed(2)}/kg`

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper} style={{ position: 'relative' }}>
        {/* If the product has an image, show it. Otherwise, show a placeholder icon. */}
        {/* https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img */}
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
        {/* This badge is only shown when the product is sold out. */}
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
        <h3 className={styles.cardTitle}>{product.name}</h3>
        {/* Shows the calculated price text for this product. */}
        <p style={{ marginBottom: '12px', fontWeight: 600, color: '#7b1a1a', fontSize: '14px' }}>
          {priceDisplay}
        </p>
        {/* If sold out, do not allow the customer to open details/order flow. */}
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
  // activeCategory controls which category button is selected.
  const [activeCategory, setActiveCategory] = useState('All')
  // searchQuery stores what the user types into the search bar.
  const [searchQuery, setSearchQuery] = useState('')
  // products stores the product list returned from the API.
  const [products, setProducts] = useState([])
  // loading is true while the products are still being fetched.
  const [loading, setLoading] = useState(true)
  // error stores a friendly message if the API request fails.
  const [error, setError] = useState(null)

  // This useEffect runs once when the page loads.
  // It calls the products API and then saves the result into products state.
  // Reference - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products')

        // If the API returns an error response, show the user an error message.
        if (!res.ok) throw new Error('Failed to fetch products')
        const json = await res.json()

        // If products is missing for any reason, use an empty array to avoid crashing.
        setProducts(json.products ?? [])
      } catch (err) {
        console.error(err)
        setError('Could not load products. Please try again.')
      } finally {
        // This runs whether the fetch succeeds or fails.
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // This filters products using both the selected category and search text.
  // AI was used to help simplify this filtering logic.
  // Reference used for Array.filter:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>
      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>

          {/* Header section for the customer product page. */}
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

          {/* Search bar section. This lets customers search by product name. */}
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

              {/* This clear button only appears when the user has typed something. */}
              {/* aria-label is added so screen readers know what this icon button does. */}
              {/* Reference - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label */}
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

          {/* Category filter buttons. */}
          {/* The active button is styled differently using the CSS module class. */}
          <section style={{ marginBottom: '32px' }}>
            <div className={styles.filterContainer}>

              {/* map is used to render one button for each category. */}
              {/* Reference used for rendering lists in React: */}
              {/* https://react.dev/learn/rendering-lists */}
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

          {/* Product grid section */}
          <section>
            {/* Shows an error message if loading products failed*/}
            {error && (
              <p style={{ textAlign: 'center', color: '#7B1A1A', fontSize: '14px' }}>{error}</p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {loading
              // While loading, show 6 skeleton cards instead of an empty screen.
                ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)

                // If products exist after filtering, show the product cards
                : filteredProducts.length > 0
                  ? filteredProducts.map(product => <ProductCard key={product.id} product={product} />)

                  // If nothing matches the search or category, show a friendly empty state.
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
                      {/* This red circle icon gives the empty state a more finished look*/}
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

                      {/* Empty state heading. */}
                      <p style={{
                        margin: 0,
                        fontSize: '22px',
                        fontWeight: 700,
                        color: '#7b1a1a',
                        letterSpacing: '0.3px',
                      }}>
                        No products found
                      </p>

                      {/* Helper text changes depending on whether the user searched or filtered*/}
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