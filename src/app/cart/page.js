'use client'
import { useState } from 'react'
import Link from 'next/link'

const mockCartItems = [
    {
        id: '1',
        productId: '2',
        productName: 'Pork Loin Roast',
        type: 'weight',
        weightRange: '1.5-2 kg',
        quantity: 1,
        pricePerKg: 13.00,
        estimatedMin: 19.50,
        estimatedMax: 26.00,
        image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    },
    {
        id: '2',
        productId: '1',
        productName: 'Box of Cooked Prawns 5kg',
        type: 'fixed',
        quantity: 2,
        price: 20.00,
        image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    },
    {
        id: '3',
        productId: '3',
        productName: 'Boneless Ham',
        type: 'weight',
        weightRange: '4.5-5 kg',
        quantity: 1,
        pricePerKg: 35.00,
        estimatedMin: 157.50,
        estimatedMax: 175.00,
        image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    },
]

const BLOCKED_DATES = ['2026-12-25', '2026-12-26', '2027-01-01']
const MIN_DATE = '2026-12-01'
const MAX_DATE = '2027-02-01'

function isValidDate(dateStr) {
    if (!dateStr) return false
    if (BLOCKED_DATES.includes(dateStr)) return false
    const date = new Date(dateStr)
    if (date.getDay() === 0) return false // Sunday
    return true
}

function isSaturday(dateStr) {
    if (!dateStr) return false
    return new Date(dateStr).getDay() === 6
}

export default function CartPage() {
    const [items, setItems] = useState(mockCartItems)
    const [pickupDate, setPickupDate] = useState('')
    const [notes, setNotes] = useState('')
    const [dateError, setDateError] = useState('')

    const updateQuantity = (id, newQty) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, quantity: newQty } : item
        ))
    }

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id))
    }

    const handleDateChange = (e) => {
        const val = e.target.value
        setPickupDate(val)
        if (!isValidDate(val)) {
            setDateError('This date is not available. Sundays, Christmas Day, Boxing Day, and New Year\'s Day are blocked.')
        } else {
            setDateError('')
        }
    }

    const totalEstimatedMin = items.reduce((sum, item) => {
        if (item.type === 'weight') return sum + item.estimatedMin * item.quantity
        return sum + item.price * item.quantity
    }, 0)

    const totalEstimatedMax = items.reduce((sum, item) => {
        if (item.type === 'weight') return sum + item.estimatedMax * item.quantity
        return sum + item.price * item.quantity
    }, 0)

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#FDF8F0' }}>
                <p className="text-xl mb-6" style={{ color: '#717182' }}>Your cart is empty.</p>
                <Link
                    href="/products"
                    className="px-6 py-3 rounded-lg text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#8B1A1A' }}
                >
                    Browse Products
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-12" style={{ backgroundColor: '#FDF8F0' }}>
            <div className="max-w-3xl mx-auto px-6">

                <h1 className="text-4xl font-bold mb-10" style={{ color: '#8B1A1A' }}>
                    Your Cart
                </h1>

                {/* Cart Items */}
                <div className="bg-white rounded-lg overflow-hidden mb-6" style={{ border: '1px solid #e5e5e5' }}>
                  
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 p-5"
                            style={{ borderBottom: index < items.length - 1 ? '1px solid #e5e5e5' : 'none' }}
                        >
                            {/* Image */}
                            <img
                                src={item.image}
                                alt={item.productName}
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />

                            {/* Details */}
                            <div className="flex-1">
                                <p className="font-semibold text-sm mb-1" style={{ color: '#2C2C2A' }}>
                                    {item.productName}
                                </p>
                                {item.type === 'weight' && (
                                    <p className="text-xs mb-1" style={{ color: '#717182' }}>
                                        Weight Range: {item.weightRange}
                                    </p>
                                )}

                                {item.type === 'weight' && (
                                    <p className="text-xs mb-1" style={{ color: '#717182' }}>
                                        Price per kg: ${item.pricePerKg}
                                    </p>
                                )}

                                {/* Price */}
                                {item.type === 'weight' ? (
                                    <p className="text-sm font-semibold" style={{ color: '#8B1A1A' }}>
                                        ${(item.estimatedMin * item.quantity).toFixed(2)} — ${(item.estimatedMax * item.quantity).toFixed(2)}
                                    </p>
                                ) : (
                                    <p className="text-sm font-semibold" style={{ color: '#8B1A1A' }}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                )}
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center gap-2">
                                <label className="text-xs" style={{ color: '#717182' }}>Qty:</label>
                                <select
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                    className="px-2 py-1 rounded border text-sm"
                                    style={{ borderColor: '#e5e5e5', backgroundColor: '#ffffff', color: '#2C2C2A' }}
                                >
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Delete */}
                            <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 rounded-lg transition-opacity hover:opacity-70"
                                style={{ color: '#ef4444' }}
                            >
                                🗑
                            </button>

                        </div>
                    ))}

                      <Link
                        href="/products"
                        className="block w-full text-center py-4 rounded-lg font-semibold transition-opacity hover:opacity-70"
                        style={{ border: '1px solid #8B1A1A', color: '#8B1A1A', backgroundColor: 'transparent' }}
                    >
                        ← Continue Shopping
                    </Link>
                </div>

                {/* Pickup Details */}
                <div className="bg-white rounded-lg p-6 mb-6" style={{ border: '1px solid #e5e5e5' }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: '#2C2C2A' }}>
                        Pickup Details
                    </h2>

                    {/* Pickup Date */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2A' }}>
                            Pickup Date
                        </label>
                        <input
                            type="date"
                            value={pickupDate}
                            onChange={handleDateChange}
                            min={MIN_DATE}
                            max={MAX_DATE}
                            className="w-full px-4 py-3 rounded-lg"
                            style={{ border: '1px solid #e5e5e5', backgroundColor: '#ffffff', color: '#2C2C2A', outline: 'none' }}
                        />
                        {dateError && (
                            <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{dateError}</p>
                        )}
                        {!dateError && pickupDate && isSaturday(pickupDate) && (
                            <p className="text-xs mt-2" style={{ color: '#854F0B' }}>
                                ⚠ Please note the store closes at 12:00pm on Saturdays.
                            </p>
                        )}
                        {!dateError && !pickupDate && (
                            <p className="text-xs mt-2" style={{ color: '#717182' }}>
                                Must be at least 3 business days from today. Between Dec 1 – Feb 1.
                            </p>
                        )}
                    </div>

                    {/* Special Requirements */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2A' }}>
                            Special Requirements <span style={{ color: '#717182' }}>(Optional)</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            maxLength={300}
                            placeholder="Any special requests or notes..."
                            className="w-full px-4 py-3 rounded-lg text-sm"
                            style={{ border: '1px solid #e5e5e5', backgroundColor: '#ffffff', color: '#2C2C2A', outline: 'none', resize: 'none' }}
                        />
                        <p className="text-xs mt-1 text-right" style={{ color: '#717182' }}>
                            {notes.length}/300
                        </p>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg p-6 mb-6" style={{ border: '1px solid #e5e5e5' }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: '#2C2C2A' }}>
                        Order Summary
                    </h2>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm" style={{ color: '#717182' }}>Estimated Total</span>
                        <span className="text-sm" style={{ color: '#2C2C2A' }}>
                            ${totalEstimatedMin.toFixed(2)} — ${totalEstimatedMax.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3" style={{ borderTop: '1px solid #e5e5e5' }}>
                        <span className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>Deposit (due today)</span>
                        <span className="text-lg font-bold" style={{ color: '#8B1A1A' }}>$20.00</span>
                    </div>
                    <p className="text-xs mt-2" style={{ color: '#717182' }}>
                        Final payment will be calculated based on actual weights and charged upon collection.
                    </p>
                </div>

                {/* Proceed Button */}
                <Link
                    href="/checkout"
                    className="block w-full text-center py-4 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
                    style={{
                        backgroundColor: pickupDate && !dateError ? '#8B1A1A' : '#9ca3af',
                        pointerEvents: pickupDate && !dateError ? 'auto' : 'none',
                    }}
                >
                    Proceed to Checkout
                </Link>

            </div>
        </div>
    )
}