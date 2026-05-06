'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

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

// Calculate estimated price for a single line item
function getLineEstimate(item){
    if (item.product_type === 'FIXED') {
        const total = (item.price_cents * item.quantity) / 100
        return { min: total, max: total, isRange: false }
    }

    if (item.weight_option){
        const min = (item.price_per_kg_cents * item.weight_option.min_weight_kg * item.quantity) / 100
        const max = (item.price_per_kg_cents * item.weight_option.max_weight_kg * item.quantity) / 100
        return { min, max, isRange: true}
    }

    return { min: 0, max: 0, isRange: false }
}

export default function CartPage() {
    const { items, updateQuantity, updateNotes, removeItem } = useCart()
    const [pickupDate, setPickupDate] = useState('')
    const [notes, setNotes] = useState('')
    const [dateError, setDateError] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    const handleDateChange = (e) => {
        const val = e.target.value
        setPickupDate(val)
        if (!isValidDate(val)) {
            setDateError('This date is not available. Sundays, Christmas Day, Boxing Day, and New Year\'s Day are blocked.')
        } else {
            setDateError('')
        }
    }

    // Calculate cart totals
    const totalMin = items.reduce((sum, item) => sum + getLineEstimate(item).min, 0)
    const totalMax = items.reduce((sum, item) => sum + getLineEstimate(item).max, 0)
    const hasRangeItems = items.some(item => item.product_type === 'WEIGHT_RANGE')

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
          {items.map((item, index) => {
            const estimate = getLineEstimate(item)
 
            return (
                <div
                    key={item.cartId}
                    className="p-5"
                    style={{ borderBottom: index < items.length - 1 ? '1px solid #e5e5e5' : 'none' }}
                >
                    <div className="flex items-start gap-4">
                    {/* Image */}
                    {item.image_url ? (
                        <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                    ) : (
                        <div
                        className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: '#F0E8D0' }}
                        >
                        <span style={{ color: '#C9A84C', fontSize: '24px' }}>🥩</span>
                        </div>
                    )}
    
                    {/* Details */}
                    <div className="flex-1">
                        <p className="font-semibold text-sm mb-1" style={{ color: '#2C2C2A' }}>
                        {item.name}
                        </p>
    
                        {/* Weight option */}
                        {item.weight_option && (
                        <p className="text-xs mb-1" style={{ color: '#717182' }}>
                            Weight: {item.weight_option.label} ({item.weight_option.min_weight_kg}–{item.weight_option.max_weight_kg} kg)
                        </p>
                        )}
    
                        {/* Price per unit */}
                        <p className="text-xs mb-2" style={{ color: '#717182' }}>
                        {item.product_type === 'FIXED'
                            ? `$${(item.price_cents / 100).toFixed(2)}/box`
                            : `$${(item.price_per_kg_cents / 100).toFixed(2)}/kg`
                        }
                        </p>
    
                        {/* Estimated line price */}
                        <p className="text-sm font-semibold" style={{ color: '#8B1A1A' }}>
                        {estimate.isRange
                            ? `$${estimate.min.toFixed(2)} — $${estimate.max.toFixed(2)}`
                            : `$${estimate.min.toFixed(2)}`
                        }
                        </p>
                    </div>
    
                    {/* Quantity */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <label className="text-xs" style={{ color: '#717182' }}>Qty:</label>
                        <select
                        value={item.quantity}
                        onChange={e => updateQuantity(item.cartId, parseInt(e.target.value))}
                        className="px-2 py-1 rounded border text-sm"
                        style={{ borderColor: '#e5e5e5', backgroundColor: '#ffffff', color: '#2C2C2A' }}
                        >
                        {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                        </select>
                    </div>
    
                    {/* Delete */}
                    {deleteConfirm === item.cartId ? (
                        <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                            onClick={() => { removeItem(item.cartId); setDeleteConfirm(null) }}
                            className="text-xs px-3 py-1 rounded text-white"
                            style={{ backgroundColor: '#DC2626' }}
                        >
                            Remove
                        </button>
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs px-3 py-1 rounded"
                            style={{ backgroundColor: '#F1F5F9', color: '#475569' }}
                        >
                            Cancel
                        </button>
                        </div>
                    ) : (
                        <button
                        onClick={() => setDeleteConfirm(item.cartId)}
                        className="p-2 rounded-lg transition-opacity hover:opacity-70 flex-shrink-0"
                        style={{ color: '#ef4444' }}
                        >
                        🗑
                        </button>
                    )}
                </div>
    
                    {/* Per-item notes */}
                    <div className="mt-3 ml-24">
                    <input
                        type="text"
                        placeholder="Special instructions for this item (optional)"
                        value={item.notes}
                        onChange={e => updateNotes(item.cartId, e.target.value)}
                        maxLength={150}
                        className="w-full px-3 py-2 rounded text-sm"
                        style={{ border: '1px solid #e5e5e5', backgroundColor: '#FAFAFA', color: '#2C2C2A', outline: 'none' }}
                    />
                    </div>
                </div>
                )
            })}
    
            <Link
                href="/products"
                className="block w-full text-center py-4 font-semibold transition-opacity hover:opacity-70"
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
                    Between Dec 1 – Feb 1. Sundays and public holidays unavailable.
                </p>
                )}
            </div>
    
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2A' }}>
                Order Notes <span style={{ color: '#717182' }}>(Optional)</span>
                </label>
                <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="Any special requests for the whole order..."
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
    
            {/* Line items */}
            {items.map(item => {
                const est = getLineEstimate(item)
                return (
                <div key={item.cartId} className="flex justify-between items-center mb-2">
                    <span className="text-sm" style={{ color: '#717182' }}>
                    {item.name} × {item.quantity}
                    {item.weight_option && ` (${item.weight_option.label})`}
                    </span>
                    <span className="text-sm" style={{ color: '#2C2C2A' }}>
                    {est.isRange
                        ? `$${est.min.toFixed(2)} — $${est.max.toFixed(2)}`
                        : `$${est.min.toFixed(2)}`
                    }
                    </span>
                </div>
                )
            })}
    
            <div className="flex justify-between items-center pt-3 mt-3" style={{ borderTop: '1px solid #e5e5e5' }}>
                <span className="text-sm" style={{ color: '#717182' }}>
                {hasRangeItems ? 'Estimated Total' : 'Total'}
                </span>
                <span className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>
                {hasRangeItems
                    ? `$${totalMin.toFixed(2)} — $${totalMax.toFixed(2)}`
                    : `$${totalMin.toFixed(2)}`
                }
                </span>
            </div>
    
            <div className="flex justify-between items-center pt-3 mt-3" style={{ borderTop: '1px solid #e5e5e5' }}>
                <span className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>Deposit (due today)</span>
                <span className="text-lg font-bold" style={{ color: '#8B1A1A' }}>$20.00</span>
            </div>
    
            {hasRangeItems && (
                <p className="text-xs mt-2" style={{ color: '#717182' }}>
                Final payment based on actual weights at collection.
                </p>
            )}
            </div>
    
            {/* Proceed Button */}
            <Link
            href={pickupDate && !dateError ? `/checkout?date=${pickupDate}&notes=${encodeURIComponent(notes)}` : '#'}
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