'use client'

// This page is a Client Component because it uses useState, useEffect,
// useParams, cart context, button clicks, dropdowns, and browser-side interactivity.
// Reference - https://nextjs.org/docs/app/api-reference/directives/use-client

// Single Product Detail - image, price, add to cart

import Link from 'next/link'
// Link is used instead of a normal <a> tag because this is a Next.js app.
// It helps navigate between pages without doing a full page reload.
// Reference used:
// https://nextjs.org/docs/app/api-reference/components/link

import { useState, useEffect } from 'react'
// useState is used to store values that change on this page.
// useEffect is used to fetch the product when the page loads.
// AI-assisted reference used for React hooks:
// https://react.dev/reference/react/useState
// https://react.dev/reference/react/useEffect

import { useParams } from 'next/navigation'
// useParams gets the dynamic product id from the URL.
// For example, /products/abc123 gives this page the id value.
// Reference used:
// https://nextjs.org/docs/app/api-reference/functions/use-params

import { useCart } from '@/context/CartContext'
// This custom cart context gives access to addToCart().
// It lets this page add the selected product into the shared cart state.

export default function ProductDetailPage() {

  const { id } = useParams() // Gets the product id from the route.
  const { addToCart } = useCart() // Gets the addToCart function from the cart context.
  const [quantity, setQuantity] = useState(1) // quantity stores how many of this product the customer wants
  const [selectedWeight, setSelectedWeight] = useState(null) // selectedWeight stores the selected weight option for weight-range products
  const [addedToCart, setAddedToCart] = useState(false) // addedToCart is used to briefly change the button text after adding an item
  const [product, setProduct] = useState(null) // product stores the product data fetched from the API.
  const [loading, setLoading] = useState(true) // loading controls the loading screen while the product is being fetched
  const [error, setError] = useState(null) // error stores the error message if the API request fails

  // Fetch product from API.
  // This runs when the page has an id available.
  // AI was used to help structure the async fetch + try/catch pattern.
  // Reference used for fetch:
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  useEffect(() => {
    if (!id) return

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)

        // If the API says the product does not exist, show a clear error.
        if (res.status === 404) throw new Error('Product not found')
        
        // If another server error happens, show a general error
        if (!res.ok) throw new Error('Failed to fetch product')
        const json = await res.json()
        setProduct(json.product)

        // Pre-select the first weight option if product has them.
        // This avoids the page having no selected weight for WEIGHT_RANGE products.
        // AI was used here to help avoid a null reference issue.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
        if (json.product?.product_weight_options?.length > 0) {
          setSelectedWeight(json.product.product_weight_options[0])
        }
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        // Loading should stop whether the request succeeds or fails.
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  // Loading state.
  // This is shown while the product request is still running.
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FAF3E0'
        }}>

        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <p
            style={{
              color: '#7a6a49',
              fontSize: '16px'
            }}>
            Loading product...
          </p>
        </main>
      </div>
    )
  }

  // If there is an error or no product data, show a placeholder layout.
  // This makes the page still render nicely instead of crashing
  // https://react.dev/learn/conditional-rendering
  if (error || !product) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FAF3E0'
        }}>
        <main
          style={{
            flex: 1
          }}>
          <div
            style={{
              maxWidth: '960px',
              margin: '0 auto',
              padding: '32px 24px'
            }}>
            <Link
              href="/products"
              style={{
                display: 'inline-block',
                marginBottom: '24px',
                fontSize: '14px',
                color: '#555',
                textDecoration: 'none'
              }}>
              ← Back to Products
            </Link>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '48px'
              }}>

              {/* LEFT — image placeholder */}
              <div
                style={{
                  borderRadius: '10px',
                  height: '400px',
                  background: '#F0E8D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>

                {/* Placeholder image icon shown when product data is missing*/}
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="1">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                  />
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="1.5"
                  />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>

              {/* RIGHT — placeholder product details */}
              <div>
                <h1
                  style={{
                    fontSize: '26px',
                    fontWeight: 700,
                    color: '#CCCCCC',
                    margin: '0 0 8px'
                  }}>
                  Product Name
                </h1>

                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#DDDDDD',
                    margin: '0 0 24px'
                  }}>
                  $00.00/kg
                </p>

                {/* Disabled weight dropdown placeholder. */}
                <div
                  style={{
                    marginBottom: '16px'
                  }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#CCCCCC',
                      marginBottom: '6px'
                    }}>
                    Select Your Weight Range
                  </label>
                  <select
                    disabled
                    style={{
                      width: '280px',
                      padding: '10px 14px',
                      border: '1.5px solid #E8E8E8',
                      borderRadius: '8px',
                      background: '#FAFAFA',
                      fontSize: '14px',
                      color: '#CCCCCC',
                      cursor: 'not-allowed'
                    }}>
                    <option>-- kg</option>
                  </select>
                </div>

                {/* Quantity still shows, but this is only placeholder UI */}
                <div
                  style={{
                    marginBottom: '16px'
                  }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#CCCCCC',
                      marginBottom: '6px'
                    }}>
                    Quantity
                  </label>
                  <select
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    style={{
                      width: '100px',
                      padding: '10px 14px',
                      border: '1.5px solid #CCCCCC',
                      borderRadius: '8px',
                      background: '#fff',
                      fontSize: '14px',
                      color: '#1A1A1A',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {/* map is used to create quantity options from 1 to 10 */}
                    {/* Reference used for rendering lists: */}
                    {/* https://react.dev/learn/rendering-lists */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#CCCCCC',
                      margin: '0 0 3px',
                      textTransform: 'uppercase',
                      letterSpacing: '.05em'
                    }}>
                    Estimated Price Range
                  </p>
                  <p
                    style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#DDDDDD',
                      margin: 0
                    }}>
                    $-- — $--
                  </p>
                </div>
                
                {/* Disabled placeholder add-to-cart button */}
                <div
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#F0E8D0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#BBBBBB',
                    textAlign: 'center',
                    marginBottom: '24px'
                  }}>
                  Add to Cart
                </div>
                
                {/* Placeholder description section */}
                <div
                  style={{
                    borderTop: '1px solid #E8D48A',
                    paddingTop: '20px',
                    marginBottom: '16px'
                  }}>
                  <h2
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#1A1A1A',
                      margin: '0 0 8px'
                    }}>
                    Description
                  </h2>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#CCCCCC',
                      lineHeight: 1.7,
                      margin: 0
                    }}>
                    Product description will appear here once connected to the database.
                  </p>
                </div>
                
                {/* Charging explanation placeholder. */}
                <div
                  style={{
                    background: '#F0E8D0',
                    borderRadius: '8px',
                    padding: '14px 16px'
                  }}>
                  <h2
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1A1A1A',
                      margin: '0 0 6px'
                    }}>
                    How You Will Be Charged
                  </h2>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#555',
                      lineHeight: 1.6,
                      margin: 0
                    }}>
                    <strong>Deposit:</strong> $20.00 paid at checkout.{' '}
                    <strong>Final payment:</strong> The exact weight will be determined when your order is prepared. The balance will be charged upon collection based on the actual weight.
                  </p>
                </div>

              </div>
            </div>
            <p
              style={{
                textAlign: 'center',
                color: '#BBBBBB',
                fontSize: '13px',
                marginTop: '32px',
                fontStyle: 'italic'
              }}>
              Product data will load once connected to the database</p>
          </div>
        </main>


      </div>
    )
  }

  // This was AI-assisted because this condition prevents null and unavailable product issues.
  // It checks two possible sold-out cases:
  // 1. product is marked unavailable
  // 2. stock is exactly 0
  // Reference used for logical OR
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR
  const soldOut = !product.is_available || product.stock === 0

  // This formats the visible product price.
  // Fixed products show price per box, while weight range products show price per kg
  const priceDisplay = product.product_type === 'FIXED'
    ? '$' + (product.price_cents / 100).toFixed(2) + '/box'
    : '$' + (product.price_per_kg_cents / 100).toFixed(2) + '/kg'

  // For fixed products, the total is just item price multiplied by quantity.
  const fixedTotal = product.product_type === 'FIXED'
    ? '$' + ((product.price_cents * quantity) / 100).toFixed(2)
    : null

  // This checks whether the selected weight option has a min and max range.
  // AI was used here to help avoid showing a price range when min and max are the same
  const isRange = selectedWeight && selectedWeight.max_weight_kg && selectedWeight.max_weight_kg !== selectedWeight.min_weight_kg

  // Estimated minimum price for weight range products.
  const estMin = product.product_type === 'WEIGHT_RANGE' && selectedWeight
    ? '$' + ((product.price_per_kg_cents * selectedWeight.min_weight_kg * quantity) / 100).toFixed(2)
    : null

  // Estimated maximum price for weight range products
  const estMax = isRange
    ? '$' + ((product.price_per_kg_cents * selectedWeight.max_weight_kg * quantity) / 100).toFixed(2)
    : null

  // Adds the product to the cart.
  // It also briefly changes the button text to show the user it worked.
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
  function handleAddToCart() {
    if (soldOut) return
    addToCart(product, selectedWeight, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  return (
    <>
      {/* Page-specific responsive layout styles. */}
      {/* AI was used to help organise the responsive two-column layout. */}
      {/* Reference used for CSS media queries: */}
      {/* https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries */}
      <style>{`
        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }
        .product-image {
          width: 100%;
          height: 450px;
          object-fit: cover;
          display: block;
          border-radius: 10px;
        }
        @media (max-width: 768px) {
          .product-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .product-image {
            height: 280px;
          }
        }
      `}</style>

      <main>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '32px 48px' }}>
          <Link
            href="/products"
            style={{
              display: 'inline-block',
              marginBottom: '24px',
              fontSize: '14px',
              color: '#555',
              textDecoration: 'none'
            }}>
            ← Back to Products
          </Link>

          <div className="product-layout">

            {/* LEFT — image */}
            <div>
              {/* The product image uses alt text for accessibility. */}
              {/* Reference used for img alt attribute: */}
              {/* https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img */}
              <img
                src={product.image_url}
                alt={product.name}
                className="product-image"
              />
            </div>

            {/* RIGHT — real product details */}
            <div>

              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: '1000',
                  color: '#1A1A1A',
                  margin: '0 0 20px',
                  lineHeight: 1.2
                }}>
                {product.name}
              </h1>

              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#7B1A1A',
                  margin: '0 0 20px'
                }}>
                {priceDisplay}
              </p>

              {/* Weight dropdown - only for WEIGHT_RANGE products. */}
              {/* This section does not appear for fixed-price products. */}
              {product.product_type === 'WEIGHT_RANGE' && product.product_weight_options?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#555',
                      marginBottom: '6px'
                    }}>
                    Select Your Weight Range
                  </label>
                  <select
                    value={selectedWeight?.id ?? ''}
                    onChange={e => {
                      // Finds the selected weight option object based on the dropdown value.
                      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
                      const opt = product.product_weight_options.find(o => o.id === e.target.value)
                      setSelectedWeight(opt)
                    }}
                    style={{
                      width: '280px',
                      padding: '10px 14px',
                      border: '1.5px solid #CCCCCC',
                      borderRadius: '8px',
                      background: '#fff',
                      fontSize: '14px',
                      color: '#1A1A1A',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {product.product_weight_options.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity dropdown - shown for both fixed and weight range products. */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#555', marginBottom: '6px' }}>
                  Quantity
                </label>
                <select
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  style={{ width: '100px', padding: '10px 14px', border: '1.5px solid #CCCCCC', borderRadius: '8px', background: '#fff', fontSize: '14px', color: '#1A1A1A', outline: 'none', cursor: 'pointer' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* FIXED product - show one flat total */}
              {product.product_type === 'FIXED' && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Total</p>
                  <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{fixedTotal}</p>
                </div>
              )}

              {/* WEIGHT_RANGE product - show estimated minimum and maximum price. */}
              {/* The final charge can change later because the real weight is confirmed during preparation. */}
              {product.product_type === 'WEIGHT_RANGE' && estMin && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Estimated Price
                  </p>
                  <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                    {isRange ? `${estMin} — ${estMax}` : `~${estMin}`}
                  </p>
                </div>
              )}

              {/* Add to Cart button. */}
              {/* Button is disabled when sold out, otherwise it adds the item to cart. */}
              <button
                onClick={handleAddToCart}
                disabled={soldOut}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '14px',
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

              {/* Product description from the database*/}
              <div style={{ borderTop: '1px solid #E8D48A', paddingTop: '20px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
                  Description
                </h2>
                <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7, margin: 0 }}>
                  {product.description}
                </p>
              </div>

              {/* Explanation of deposit and final payment*/}
              <div style={{ background: '#F0E8D0', borderRadius: '8px', padding: '14px 16px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>
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
    </>
  )
}