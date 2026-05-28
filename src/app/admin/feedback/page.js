//display all the feedback that has been submitted by the customer after they placed the order - evelyn

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Feedback Page  (/admin/feedback)
//
// Fetches real feedback from /api/admin/feedback
//
// Sections:
// Summary:  average rating + star breakdown histogram
// Controls: star rating filter (from histogram) + sort dropdown
// Feedback cards: customer name, rating, comment, date

'use client'

import { useState, useMemo, useEffect } from 'react'
import { FaStar } from "react-icons/fa6"
import { CiStar } from "react-icons/ci"

const COLOR = {
    red: '#7B1A1A',
    redLight: '#FEF2F2',
    redBorder: '#FECACA',
    cream: '#FAF3E0',
    gold: '#C9A84C',
    goldLight: '#FBF3DC',
    text: '#1A1A1A',
    muted: '#6B7280',
    border: '#E5DCC8',
    white: '#FFFFFF',
    sidebar: '#F5EDD8',
}

// Sort options array
//
// Each object has:
//   value: key stored in sortKey state
//   label is shown in the dropdown
//   compareFn is a function(a, b) used to sort the feedback array
//
// Options:
//   newest:  sort descending by date (most recent first)
//   oldest:  sort ascending by date (oldest first)
//   highest: sort descending by rating (5 stars first)
//   lowest:  sort ascending by rating (1 star first)

const SORT_OPTIONS = [
    {
        value: 'newest',
        label: 'Most recent',
        compareFn: (a, b) => new Date(b.date) - new Date(a.date),
    },
    {
        value: 'oldest',
        label: 'Oldest first',
        compareFn: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
        value: 'highest',
        label: 'Highest rating',
        compareFn: (a, b) => b.rating - a.rating,
    },
    {
        value: 'lowest',
        label: 'Lowest rating',
        compareFn: (a, b) => a.rating - b.rating,
    },
]

// Utility functions

function renderStars(rating) {
    return Array.from({ length: 5 }, (_, i) =>
        i < rating
            ? <FaStar key={i} style={{ color: COLOR.gold, fontSize: '16px' }} />
            : <CiStar key={i} style={{ color: COLOR.gold, fontSize: '18px' }} />
    )
}

function ratingColor(rating) {
    if (rating >= 5) return COLOR.gold
    if (rating === 4) return '#D4962A'
    if (rating === 3) return COLOR.muted
    if (rating === 2) return '#C05C2A'
    return COLOR.red
}

// Formats an ISO date string to readable AU format
// e.g. '2025-12-28' → '28 Dec 2025'
function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-AU', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

// StarBreakdown component
//
// Shows a clickable horizontal bar for each star rating (5 down to 1).
// Bar width is proportional to how many reviews have that rating.
// Clicking a row toggles the star filter: clicking the active row resets to 'all'.
//
// Props:
//   feedback:     full feedback array (always all reviews, not filtered)
//   activeFilter: currently selected star filter ('all' or integer 1–5)
//   onFilter:     callback to update the star filter in the parent

function StarBreakdown({ feedback, activeFilter, onFilter }) {
    const total = feedback.length

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[5, 4, 3, 2, 1].map(star => {
                const count = feedback.filter(f => f.rating === star).length
                const pct = total > 0 ? (count / total) * 100 : 0
                const isActive = activeFilter === star

                return (
                    <div
                        key={star}
                        onClick={() => onFilter(isActive ? 'all' : star)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            cursor: 'pointer', padding: '4px 6px', borderRadius: '6px',
                            background: isActive ? COLOR.goldLight : 'transparent',
                            transition: 'background .15s',
                        }}
                    >
                        <span style={{ fontSize: '13px', color: COLOR.muted, width: '20px', textAlign: 'right', flexShrink: 0 }}>
                            {star}
                        </span>
                        <span style={{ fontSize: '13px', color: COLOR.gold, flexShrink: 0 }}>★</span>
                        <div style={{ flex: 1, height: '8px', background: COLOR.border, borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: ratingColor(star),
                                borderRadius: '4px',
                                transition: 'width .3s ease',
                            }} />
                        </div>
                        <span style={{ fontSize: '12px', color: COLOR.muted, width: '24px', flexShrink: 0 }}>
                            {count}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// FeedbackCard component
//
// Displays a single customer feedback entry as a white card.
// Layout:
//   Top row:  customer name + orderRef on the left, date on the right
//   Middle:   star rating rendered as ★ characters, coloured by ratingColor()
//   Bottom:   comment text, or italic "No comment left." if comment is empty
//
// Props:
//   item: one feedback object with { id, customer, rating, comment, date, orderRef }

function FeedbackCard({ item }) {
    return (
        <div style={{
            background: COLOR.white,
            border: `1px solid ${COLOR.border}`,
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '12px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: COLOR.text, margin: '0 0 2px' }}>
                        {item.customer}
                    </p>
                    <p style={{ fontSize: '12px', color: COLOR.muted, margin: 0 }}>
                        {item.orderRef}
                    </p>
                </div>
                <p style={{ fontSize: '12px', color: COLOR.muted, margin: 0, flexShrink: 0, marginLeft: '16px' }}>
                    {formatDate(item.date)}
                </p>
            </div>
            <div style={{ display: 'flex', gap: '2px', margin: '0 0 10px' }}>
                {renderStars(item.rating)}
            </div>
            {item.comment
                ? <p style={{ fontSize: '14px', color: COLOR.text, lineHeight: 1.6, margin: 0 }}>
                    {item.comment}
                  </p>
                : <p style={{ fontSize: '14px', color: COLOR.muted, fontStyle: 'italic', margin: 0 }}>
                    No comment left.
                  </p>
            }
        </div>
    )
}

// SectionLabel component

function SectionLabel({ children }) {
    return (
        <p style={{ fontSize: '12px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '12px' }}>
            {children}
        </p>
    )
}

// Divider component

function Divider() {
    return <div style={{ height: '1px', background: COLOR.border, margin: '28px 0' }} />
}

// Main page component

export default function AdminFeedbackPage() {

    const [feedback,    setFeedback]    = useState([])
    const [loading,     setLoading]     = useState(true)
    const [fetchError,  setFetchError]  = useState(null)
    const [activeFilter, setActiveFilter] = useState('all')
    const [sortKey,     setSortKey]     = useState('newest')

    useEffect(() => {
        fetch('/api/admin/feedback')
            .then(r => r.json())
            .then(d => {
                if (d.error) { setFetchError(d.error); return }
                // Map API shape to what the components expect
                setFeedback((d.feedback ?? []).map(f => ({
                    id:       f.id,
                    customer: `${f.customer?.first_name ?? ''} ${f.customer?.last_name ?? ''}`.trim() || 'Unknown',
                    rating:   f.score,
                    comment:  f.feedback_text ?? '',
                    date:     f.created_at,
                    orderRef: f.order?.id ? `GW${f.order.id.slice(0, 8).toUpperCase()}` : '—',
                })))
            })
            .catch(() => setFetchError('Failed to load feedback'))
            .finally(() => setLoading(false))
    }, [])

    // Average rating across all reviews
    const avgRating = feedback.length
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
        : 0

    // Final list shown to the admin
    // Step 1: filter by activeFilter
    // Step 2: sort using the compareFn from the matching SORT_OPTIONS entry
    // slice() before sort() avoids mutating the original array
    // useMemo recalculates only when activeFilter, sortKey, or feedback changes
    const processedFeedback = useMemo(() => {
        const filtered = activeFilter === 'all'
            ? feedback
            : feedback.filter(f => f.rating === activeFilter)
        const sortOption = SORT_OPTIONS.find(o => o.value === sortKey)
        return [...filtered].sort(sortOption.compareFn)
    }, [activeFilter, sortKey, feedback])

    if (loading) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', color: COLOR.muted, fontFamily: '"Lato", sans-serif' }}>
                Loading feedback…
            </div>
        )
    }

    if (fetchError) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', color: COLOR.red, fontFamily: '"Lato", sans-serif' }}>
                {fetchError}
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: COLOR.cream, fontFamily: '"Lato", sans-serif' }}>
            <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '48px 40px 80px' }}>

                {/* Page title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '18px', marginBottom: '28px' }}>
                    <h1 style={{ fontFamily: '"Lato", serif', fontSize: '36px', fontWeight: 700, color: COLOR.red, margin: 0 }}>
                        Feedback
                    </h1>
                </div>

                {/* Gold divider */}
                <div style={{ height: '2px', background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`, marginBottom: '32px', borderRadius: '1px' }} />

                {/* Empty state */}
                {feedback.length === 0 && (
                    <p style={{ color: COLOR.muted, fontSize: '14px' }}>No feedback submitted yet.</p>
                )}

                {feedback.length > 0 && (<>

                    {/* Section 1: Overall Rating */}
                    <SectionLabel>Overall rating</SectionLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'center', marginBottom: '4px' }}>

                        {/* Average score card */}
                        <div style={{ background: COLOR.white, border: `1px solid ${COLOR.border}`, borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                            <p style={{ fontSize: '52px', fontWeight: 700, color: COLOR.text, margin: '0 0 4px', lineHeight: 1 }}>
                                {avgRating.toFixed(1)}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', margin: '0 0 8px' }}>
                                {renderStars(Math.round(avgRating))}
                            </div>
                            <p style={{ fontSize: '13px', color: COLOR.muted, margin: 0 }}>
                                Based on {feedback.length} review{feedback.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Star breakdown bars */}
                        <div style={{ background: COLOR.white, border: `1px solid ${COLOR.border}`, borderRadius: '12px', padding: '24px' }}>
                            <p style={{ fontSize: '13px', color: COLOR.muted, margin: '0 0 12px' }}>
                                Click a row to filter by that rating
                            </p>
                            <StarBreakdown
                                feedback={feedback}
                                activeFilter={activeFilter}
                                onFilter={setActiveFilter}
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Section 2: Controls row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <SectionLabel>
                                {activeFilter === 'all'
                                    ? `All reviews (${feedback.length})`
                                    : `${activeFilter}-star reviews (${processedFeedback.length})`
                                }
                            </SectionLabel>

                            {/* Star filter tag — only shown when a filter is active */}
                            {activeFilter !== 'all' && (
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    style={{
                                        background: COLOR.goldLight, border: `1px solid ${COLOR.gold}`,
                                        borderRadius: '20px', padding: '3px 10px', fontSize: '12px',
                                        color: COLOR.red, cursor: 'pointer', fontFamily: '"Lato", sans-serif',
                                        fontWeight: 700, marginBottom: '12px', display: 'flex',
                                        alignItems: 'center', gap: '4px',
                                    }}
                                >
                                    {activeFilter} <FaStar style={{ color: COLOR.gold, fontSize: '11px' }} /> ×
                                </button>
                            )}
                        </div>

                        {/* Sort dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <label style={{ fontSize: '12px', color: COLOR.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>
                                Sort by
                            </label>
                            <select
                                value={sortKey}
                                onChange={e => setSortKey(e.target.value)}
                                style={{
                                    padding: '7px 12px', border: `1.5px solid ${COLOR.border}`,
                                    borderRadius: '8px', fontSize: '13px', background: COLOR.white,
                                    color: COLOR.text, cursor: 'pointer', fontFamily: '"Lato", sans-serif',
                                }}
                            >
                                {SORT_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Section 3: Feedback cards */}
                    {processedFeedback.length === 0
                        ? <p style={{ color: COLOR.muted, fontSize: '14px' }}>No reviews for this rating.</p>
                        : processedFeedback.map(item => <FeedbackCard key={item.id} item={item} />)
                    }

                </>)}

            </div>
        </div>
    )
}