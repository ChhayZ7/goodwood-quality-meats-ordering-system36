// src/context/CartContext.jsx
// Global cart state for the GQM storefront.
//
// Wraps the app in a React Context so any component can read or modify the
// cart without prop drilling. The cart is persisted to localStorage under the
// key 'gqm-cart' so it survives a page refresh or browser close.
//
// Usage:
//   - Wrap the app once with <CartProvider> (done in src/app/layout.js)
//   - Any child component calls useCart() to get items and actions
//
// Exposed via useCart():
//   items          — array of cart line items (see shape below)
//   itemCount      — total quantity across all lines (drives the navbar badge)
//   addToCart()    — add a product, or increment quantity if already in cart
//   updateQuantity() — change the quantity on an existing line
//   updateNotes()  — update the per-item special instructions
//   removeItem()   — remove a single line from the cart
//   clearCart()    — empty the cart entirely (called after successful checkout)

'use client'

import { createContext, useContext, useState, useCallback, useEffect } from "react"

const CartContext = createContext(null)

// ─── Cart item shape ──────────────────────────────────────────────────────────
// Each line in the cart is one unique product + weight option combination.
// Both price fields are stored so the cart page can display estimates without
// a second API call — only one will be non-zero depending on product_type.
//
// {
//   cartId:             string  — composite key: product_id or product_id-weight_option_id
//   product_id:         string
//   name:               string
//   image_url:          string
//   product_type:       'FIXED' | 'WEIGHT_RANGE'
//   price_cents:        number  — flat price per box; only used for FIXED products
//   price_per_kg_cents: number  — price per kg; only used for WEIGHT_RANGE products
//   weight_option:      { id, label, min_weight_kg, max_weight_kg } | null
//   quantity:           number
//   notes:              string  — per-item special instructions
// }

// ─── CartProvider ─────────────────────────────────────────────────────────────
export function CartProvider({ children }){

    // ── State: initialise from localStorage ────────────────────────────────────
    // Lazy initialiser runs once on mount — reads any saved cart from the previous
    // session. The SSR guard (typeof window) prevents a crash during server render
    // where localStorage is not available. The try/catch handles malformed JSON.
    const [items, setItems] = useState(() => {
        if (typeof window === 'undefined') return []
        try {
            const saved = localStorage.getItem('gqm-cart')
            return saved ? JSON.parse(saved) : []
        } catch { return [] } // corrupt data — start with an empty cart
    })

    // ── Persist: sync to localStorage on every state change ────────────────────
    // Runs after every render where items changed, keeping localStorage in sync.
    // This means the cart is always recoverable after a refresh.
    useEffect(() => {
        localStorage.setItem('gqm-cart', JSON.stringify(items))
    }, [items])

    // ── addToCart ───────────────────────────────────────────────────────────────
    // Adds a product to the cart, or increments its quantity if the same
    // product + weight option combination already exists.
    //
    // cartId is the uniqueness key:
    //   FIXED product          → cartId = product.id
    //   WEIGHT_RANGE product   → cartId = product.id-weightOption.id
    // This means the same product with two different weight options occupies
    // two separate lines, which is the correct behaviour.
    const addToCart = useCallback((product, weightOption = null, quantity = 1, notes = '') => {
        const cartId = weightOption ? `${product.id}-${weightOption.id}`
        // Composite key — weight option id is appended so different weight choices
        // for the same product don't collapse into one line
        : product.id

        setItems(prev => {
            const existing = prev.find(item => item.cartId === cartId)

            if (existing) {
                // Line already exists — increment quantity rather than adding a duplicate
                return prev.map(item =>
                    item.cartId === cartId
                    ? { ...item, quantity: item.quantity + quantity}
                    : item
                )
            }

            // New line — snapshot all display fields from the product object so the
            // cart page can render without fetching from the API again
            return [...prev, {
                cartId,
                product_id: product.id,
                name: product.name,
                image_url: product.image_url,
                product_type: product.product_type,
                price_cents: product.price_cents ?? 0,
                price_per_kg_cents: product.price_per_kg_cents ?? 0,
                weight_option: weightOption,
                quantity,
                notes,
            }]
        })
    }, [])

    // ── updateQuantity ──────────────────────────────────────────────────────────
    // Replaces the quantity on a specific cart line.
    // Enforces a minimum of 1 — quantity can never be set to 0 via this function;
    // use removeItem() to remove a line entirely.
    const updateQuantity = useCallback((cartId, quantity) => {
        if (quantity < 1) return
        setItems(prev => 
            prev.map(item => item.cartId === cartId ? { ...item, quantity } : item)
        )
    }, [])

     
    // ── updateNotes ─────────────────────────────────────────────────────────────
    // Updates the per-item special instructions typed on the cart page.
    // Notes are passed to the order_items table at checkout.
    const updateNotes = useCallback((cartId, notes) => {
        setItems(prev => 
            prev.map(item => item.cartId === cartId ? { ...item, notes } : item)
        )
    }, [])

    // ── removeItem ──────────────────────────────────────────────────────────────
    // Removes a single line from the cart by its cartId.
    const removeItem = useCallback((cartId) => {
        setItems(prev => prev.filter(item => item.cartId !== cartId))
    }, [])

    // ── clearCart ───────────────────────────────────────────────────────────────
    // Empties the cart entirely. Called in checkout/page.js after a successful
    // payment — the customer is redirected to the confirmation page with an empty cart.
    const clearCart = useCallback(() => {
        setItems([])
    }, [])

    // Total quantity across all lines — used by the Navbar to show the badge count.
    // e.g. 2 lines with qty 3 each → itemCount = 6
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider value={{
            items,
            itemCount,
            addToCart,
            updateQuantity,
            updateNotes,
            removeItem,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    )
}

// ─── useCart ──────────────────────────────────────────────────────────────────
// Custom hook — the only way components should access cart state.
// Throws a clear error if called outside <CartProvider> rather than returning
// undefined and causing a confusing null-reference failure downstream.
export function useCart(){
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used inside CartProvider')
        return ctx
}