'use client'

import { createContext, useContext, useState, useCallback, useEffect } from "react"

const CartContext = createContext(null)

// Cart item shape:
// {
//   cartId:           string  — unique ID for this cart line (product_id + weight_option_id)
//   product_id:       string
//   name:             string
//   image_url:        string
//   product_type:     'FIXED' | 'WEIGHT_RANGE'
//   price_cents:      number  — for FIXED products
//   price_per_kg_cents: number — for WEIGHT_RANGE products
//   weight_option:    { id, label, min_weight_kg, max_weight_kg } | null
//   quantity:         number
//   notes:            string
// }

export function CartProvider({ children }){
    // initialise from localStorage
    const [items, setItems] = useState(() => {
        if (typeof window === 'undefined') return []
        try {
            const saved = localStorage.getItem('gqm-cart')
            return saved ? JSON.parse(saved) : []
        } catch { return [] }
    })

    // sync to localStorage on every change
    useEffect(() => {
        localStorage.setItem('gqm-cart', JSON.stringify(items))
    }, [items])

    // Add a product to the cart
    // If same product + weight option already in cart, increment quantity
    const addToCart = useCallback((product, weightOption = null, quantity = 1, notes = '') => {
        const cartId = weightOption ? `${product.id}-${weightOption.id}`
        : product.id

        setItems(prev => {
            const existing = prev.find(item => item.cartId === cartId)

            if (existing) {
                return prev.map(item =>
                    item.cartId === cartId
                    ? { ...item, quantity: item.quantity + quantity}
                    : item
                )
            }

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

    // Update quantity of a cart item
    const updateQuantity = useCallback((cartId, quantity) => {
        if (quantity < 1) return
        setItems(prev => 
            prev.map(item => item.cartId === cartId ? { ...item, quantity } : item)
        )
    }, [])

    // Update notes on a cart item
    const updateNotes = useCallback((cartId, notes) => {
        setItems(prev => 
            prev.map(item => item.cartId === cartId ? { ...item, notes } : item)
        )
    }, [])

    // Remove a single item from the cart
    const removeItem = useCallback((cartId) => {
        setItems(prev => prev.filter(item => item.cartId !== cartId))
    }, [])

    // Clear the entire cart
    const clearCart = useCallback(() => {
        setItems([])
    }, [])

    // Total number of items (sum of quantities)
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

export function useCart(){
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used inside CartProvider')
        return ctx
}