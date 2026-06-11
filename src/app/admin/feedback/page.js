'use client'

import { useState, useMemo, useEffect } from 'react'
import { FaStar } from "react-icons/fa6"
import { CiStar } from "react-icons/ci"
import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'

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

// SORT_OPTIONS is the list of sort options shown in the sort dropdown
// each option has a value (used to track which is selected),
// a label (shown in the dropdown), and a compareFn (the sort logic)
// compareFn is a function that takes two feedback items a and b (AI Support this function)
// and returns a negative, zero, or positive number
// negative means a comes first, positive means b comes first
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

// renderStars takes a rating number (1 to 5) and returns an array of 5 star icons
// Array.from({ length: 5 }) creates an array of 5 empty slots
// for each slot, _ is the value (ignored), i is the index (0 to 4)
// if i is less than the rating, render a filled FaStar, otherwise render an empty CiStar
// e.g. rating 3 renders filled stars for i=0,1,2 and empty stars for i=3,4
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

// formatDate takes an ISO date string from the database e.g. "2024-12-01T10:30:00Z"
// and returns a readable date string e.g. "1 Dec 2024"
// toLocaleDateString formats it using Australian date format (en-AU)
function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-AU', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

// StarBreakdown renders the rating breakdown bars (5 star, 4 star, etc.)
// props:
//   feedback -- the full list of feedback items
//   activeFilter -- the currently selected star filter (a number 1-5 or 'all')
//   onFilter -- function called when a row is clicked to set the active filter
function StarBreakdown({ feedback, activeFilter, onFilter }) {
    // total is the total number of feedback items, used to calculate percentage
    const total = feedback.length

    // renders one row for each star value from 5 down to 1
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[5, 4, 3, 2, 1].map(star => {
                // count how many feedback items have this star rating
                const count = feedback.filter(f => f.rating === star).length

                // pct is the percentage of total reviews that have this rating
                // if total is 0, set pct to 0 to avoid dividing by zero
                const pct = total > 0 ? (count / total) * 100 : 0

                // isActive is true if this row's star value matches the current active filter
                const isActive = activeFilter === star

                return (
                    <div
                        key={star}
                        // clicking the row calls onFilter
                        // if this row is already active, pass 'all' to clear the filter
                        // if it is not active, pass the star number to set the filter
                        onClick={() => onFilter(isActive ? 'all' : star)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            cursor: 'pointer', padding: '4px 6px', borderRadius: '6px',
                            // highlight the row in gold if it is the active filter
                            background: isActive ? COLOR.goldLight : 'transparent',
                            transition: 'background .15s',
                        }}
                    >
                        {/* Star number label on the left e.g. 5, 4, 3 */}
                        <span style={{ fontSize: '13px', color: COLOR.muted, width: '20px', textAlign: 'right', flexShrink: 0 }}>
                            {star}
                        </span>

                        {/* Gold star symbol next to the number */}
                        <span style={{ fontSize: '13px', color: COLOR.gold, flexShrink: 0 }}>★</span>

                        {/* Progress bar container -- grey background, fixed height
                            overflow hidden clips the coloured fill inside the rounded bar */}
                        <div style={{ flex: 1, height: '8px', background: COLOR.border, borderRadius: '4px', overflow: 'hidden' }}>
                            {/* Coloured fill bar -- width is set to the percentage of reviews with this rating
                                ratingColor sets the fill colour based on the star value
                                transition animates the width change smoothly */}
                            <div style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: ratingColor(star),
                                borderRadius: '4px',
                                transition: 'width .3s ease',
                            }} />
                        </div>

                        {/* Count label on the right showing how many reviews have this rating */}
                        <span style={{ fontSize: '12px', color: COLOR.muted, width: '24px', flexShrink: 0 }}>
                            {count}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// FeedbackCard renders a single feedback entry as a card
// props: item -- a single feedback object with customer, orderRef, date, rating, comment
function FeedbackCard({ item }) {
    return (
        <div style={{
            background: COLOR.white,
            border: `1px solid ${COLOR.border}`,
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '12px',
        }}>
            {/* Top row -- customer name and order ref on the left, date on the right
                justifyContent space-between pushes them to opposite ends
                alignItems flex-start aligns them to the top of the row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: COLOR.text, margin: '0 0 2px' }}>
                        {item.customer}
                    </p>
                    <p style={{ fontSize: '12px', color: COLOR.muted, margin: 0 }}>
                        {item.orderRef}
                    </p>
                </div>
                {/* flexShrink 0 prevents the date from shrinking when the name is long
                    marginLeft 16px adds space between the name and the date */}
                <p style={{ fontSize: '12px', color: COLOR.muted, margin: 0, flexShrink: 0, marginLeft: '16px' }}>
                    {formatDate(item.date)}
                </p>
            </div>

            {/* Star icons row -- calls renderStars with this item's rating */}
            <div style={{ display: 'flex', gap: '2px', margin: '0 0 10px' }}>
                {renderStars(item.rating)}
            </div>

            {/* Comment text -- if the item has a comment, show it
                if there is no comment, show a grey italic placeholder message instead */}
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

// SectionLabel renders a small uppercase grey label used as a section title
// children is whatever text is passed between the opening and closing tags
function SectionLabel({ children }) {
    return (
        <p style={{ fontSize: '12px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '12px' }}>
            {children}
        </p>
    )
}

// Divider renders a thin horizontal line used to separate sections
function Divider() {
    return <div style={{ height: '1px', background: COLOR.border, margin: '28px 0' }} />
}

// SkeletonBox is a reusable grey shimmer block shown while content is loading
// props: w -- width, h -- height, style -- any extra styles to merge in
// the shimmer effect is a gradient that slides from left to right using a CSS animation
function SkeletonBox({ w, h, style = {} }) {
    return (
        <div style={{
            width: w,
            height: h,
            borderRadius: '6px',
            background: 'linear-gradient(90deg, #E5DCC8 25%, #F5EDD8 50%, #E5DCC8 75%)',
            backgroundSize: '600px 100%',
            animation: 'shimmer 1.5s infinite',
            // spread operator merges any extra styles passed in via the style prop
            ...style,
        }} />
    )
}

export default function AdminFeedbackPage() {

    // feedback stores the list of feedback items fetched from the API
    const [feedback,     setFeedback]    = useState([])

    // loading is true while the API call is in progress
    const [loading,      setLoading]     = useState(true)

    // fetchError stores any error message if the API call fails
    const [fetchError,   setFetchError]  = useState(null)

    // activeFilter tracks which star rating is currently selected for filtering
    // 'all' means no filter is applied
    const [activeFilter, setActiveFilter] = useState('all')

    // sortKey tracks which sort option is currently selected
    // defaults to 'newest' so most recent feedback shows first
    const [sortKey,      setSortKey]     = useState('newest')

    // useEffect runs once on mount (empty dependency array)
    // fetches all feedback from GET /api/admin/feedback
    useEffect(() => {
        fetch('/api/admin/feedback')
            .then(r => r.json())
            .then(d => {
                // if the API returns an error field, store it and stop
                if (d.error) { setFetchError(d.error); return }

                // d.feedback is the raw array from the API
                // .map() transforms each raw item f into a cleaner object for the UI
                // f.customer?.first_name uses optional chaining -- if customer is null, return undefined instead of crashing
                // ?? '' means if first_name is null or undefined, use empty string instead
                // .trim() removes any extra spaces from the joined name
                // f.score is the raw rating number from the database, stored as rating
                // f.feedback_text is the comment from the database, stored as comment
                // f.order?.id checks if order exists before accessing id to avoid crashing
                // .slice(0, 8) takes the first 8 characters of the order id
                // .toUpperCase() converts them to uppercase for the display reference e.g. GW1A2B3C4D
                // if there is no order id, show a dash instead
                setFeedback((d.feedback ?? []).map(f => ({
                    id:       f.id,
                    customer: `${f.customer?.first_name ?? ''} ${f.customer?.last_name ?? ''}`.trim() || 'Unknown',
                    rating:   f.score,
                    comment:  f.feedback_text ?? '',
                    date:     f.created_at,
                    orderRef: f.order?.id ? `GW${f.order.id.slice(0, 8).toUpperCase()}` : '',
                })))
            })
            .catch(() => setFetchError('Failed to load feedback'))
            .finally(() => setLoading(false))
    }, [])

    // avgRating calculates the average star rating across all feedback
    // if there is no feedback, default to 0 to avoid dividing by zero
    // .reduce() adds up all rating values -- sum starts at 0, then adds each f.rating
    // the total is divided by feedback.length to get the average
    const avgRating = feedback.length
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
        : 0

    // processedFeedback is the final list shown in the UI after filtering and sorting
    // useMemo recalculates it only when activeFilter, sortKey, or feedback changes
    // this avoids re-running the filter and sort on every render unnecessarily
    const processedFeedback = useMemo(() => {

        // if activeFilter is 'all', use the full feedback list
        // otherwise filter to only items whose rating matches activeFilter
        const filtered = activeFilter === 'all'
            ? feedback
            : feedback.filter(f => f.rating === activeFilter)

        // find the matching sort option object from SORT_OPTIONS using the current sortKey
        const sortOption = SORT_OPTIONS.find(o => o.value === sortKey)

        // [...filtered] creates a copy of the filtered array so we don't mutate the original
        // .sort() sorts the copy using the compareFn from the selected sort option
        return [...filtered].sort(sortOption.compareFn)
    }, [activeFilter, sortKey, feedback])

    // Skeleton loading state -- shown while the API call is in progress
    // renders placeholder shimmer blocks that match the shape of the real content
    if (loading) {
        return (
            <PageWrapper>
                {/* shimmer keyframe animation -- slides the gradient left to right repeatedly */}
                <style>{`
                    @keyframes shimmer {
                        0%   { background-position: -600px 0; }
                        100% { background-position:  600px 0; }
                    }
                `}</style>

                <PageHeader title="Feedback" />

                {/* Skeleton for the overall rating section
                    grid with 1fr 2fr splits into a small left box and a wider right box
                    same layout as the real content so there is no layout shift when it loads */}
                <SectionLabel>Overall rating</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '4px' }}>
                    <div style={{ background: COLOR.white, border: `1px solid ${COLOR.border}`, borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <SkeletonBox w="72px" h="56px" style={{ borderRadius: '8px' }} />
                        <SkeletonBox w="110px" h="18px" />
                        <SkeletonBox w="90px" h="13px" />
                    </div>
                    <div style={{ background: COLOR.white, border: `1px solid ${COLOR.border}`, borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <SkeletonBox w="160px" h="13px" />
                        {/* renders 5 skeleton rows, one for each star level
                            pct array gives each bar a different width to look realistic */}
                        {[80, 55, 30, 15, 5].map((pct, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <SkeletonBox w="20px" h="13px" style={{ flexShrink: 0 }} />
                                <SkeletonBox w="14px" h="13px" style={{ flexShrink: 0 }} />
                                <div style={{ flex: 1, height: '8px', background: COLOR.border, borderRadius: '4px', overflow: 'hidden' }}>
                                    <SkeletonBox w={`${pct}%`} h="100%" style={{ borderRadius: '4px' }} />
                                </div>
                                <SkeletonBox w="20px" h="12px" style={{ flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                </div>

                <Divider />

                {/* Skeleton for the sort bar above the feedback list */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <SkeletonBox w="130px" h="13px" />
                    <SkeletonBox w="160px" h="34px" style={{ borderRadius: '8px' }} />
                </div>

                {/* Skeleton for 3 feedback cards */}
                {[1, 2, 3].map(n => (
                    <div key={n} style={{ background: COLOR.white, border: `1px solid ${COLOR.border}`, borderRadius: '12px', padding: '20px 24px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <SkeletonBox w="130px" h="15px" />
                                <SkeletonBox w="80px"  h="12px" />
                            </div>
                            <SkeletonBox w="70px" h="12px" />
                        </div>
                        {/* 5 small skeleton boxes to mimic the star row */}
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                            {[...Array(5)].map((_, i) => <SkeletonBox key={i} w="16px" h="16px" style={{ borderRadius: '3px' }} />)}
                        </div>
                        <SkeletonBox w="100%" h="14px" style={{ marginBottom: '6px' }} />
                        <SkeletonBox w="65%"  h="14px" />
                    </div>
                ))}
            </PageWrapper>
        )
    }

    // Error state -- shown if the API call failed
    if (fetchError) {
        return (
            <PageWrapper>
                <PageHeader title="Feedback" />
                <p style={{ color: COLOR.red, fontSize: '14px', fontFamily: '"Lato", sans-serif' }}>{fetchError}</p>
            </PageWrapper>
        )
    }

    return (
        <PageWrapper>
            <PageHeader title="Feedback" />

            {/* Empty state -- shown if the API returned successfully but no feedback exists yet */}
            {feedback.length === 0 && (
                <p style={{ color: COLOR.muted, fontSize: '14px' }}>No feedback submitted yet.</p>
            )}

            {/* Main content -- only renders if there is at least one feedback item
                React fragment shorthand (<></>) groups multiple elements without adding a DOM node */}
            {feedback.length > 0 && (<>

                {/* Overall rating section
                    grid with 1fr 2fr -- left box is the average score, right box is the star breakdown bars */}
                <SectionLabel>Overall rating</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'center', marginBottom: '4px' }}>

                    {/* Left box -- shows the average rating number and stars
                        avgRating.toFixed(1) rounds to 1 decimal place e.g. 4.3
                        Math.round(avgRating) rounds to nearest whole number for the star icons
                        feedback.length !== 1 adds an 's' to 'review' when there is more than one */}
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

                    {/* Right box -- shows the star breakdown bars
                        passes feedback list, activeFilter, and setActiveFilter to StarBreakdown */}
                    <div style={{ background: COLOR.white, border: `1px solid ${COLOR.border}`, borderRadius: '12px', padding: '24px' }}>
                        <p style={{ fontSize: '13px', color: COLOR.muted, margin: '0 0 12px' }}>Click a row to filter by that rating</p>
                        <StarBreakdown feedback={feedback} activeFilter={activeFilter} onFilter={setActiveFilter} />
                    </div>
                </div>

                <Divider />

                {/* Sort bar and section label row
                    justifyContent space-between pushes the label to the left and sort dropdown to the right
                    flexWrap wrap allows them to stack on smaller screens */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

                        {/* Section label changes text depending on whether a filter is active
                            if activeFilter is 'all', show total count of all reviews
                            if a star filter is active, show how many reviews match that rating */}
                        <SectionLabel>
                            {activeFilter === 'all'
                                ? `All reviews (${feedback.length})`
                                : `${activeFilter}-star reviews (${processedFeedback.length})`}
                        </SectionLabel>

                        {/* Clear filter button -- only renders when a star filter is active
                            clicking it resets activeFilter back to 'all' */}
                        {activeFilter !== 'all' && (
                            <button
                                onClick={() => setActiveFilter('all')}
                                style={{
                                    background: COLOR.goldLight, border: `1px solid ${COLOR.gold}`,
                                    borderRadius: '20px', padding: '3px 10px', fontSize: '12px',
                                    color: COLOR.red, cursor: 'pointer', fontFamily: '"Lato", sans-serif',
                                    fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                                }}
                            >
                                {/* shows the active star number, a filled star icon, and an x to clear */}
                                {activeFilter} <FaStar style={{ color: COLOR.gold, fontSize: '11px' }} /> x
                            </button>
                        )}
                    </div>

                    {/* Sort dropdown -- value is tied to sortKey state
                        onChange updates sortKey when the user selects a different option
                        maps over SORT_OPTIONS to render each as an option element */}
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

                {/* Feedback list -- if no reviews match the current filter, show an empty message
                    otherwise map over processedFeedback and render a FeedbackCard for each item */}
                {processedFeedback.length === 0
                    ? <p style={{ color: COLOR.muted, fontSize: '14px' }}>No reviews for this rating.</p>
                    : processedFeedback.map(item => <FeedbackCard key={item.id} item={item} />)
                }

            </>)}
        </PageWrapper>
    )
}