//display all the feedback that has been submitted by the customer after they placed the order - evelyn

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Feedback Page  (/admin/feedback)
//
// Currently uses mock data — replace MOCK_FEEDBACK with a real
// fetch('/api/admin/feedback') call once the backend is ready.
//
// Sections:
//Summary:  average rating + star breakdown histogram
//Controls: star rating filter (from histogram) + sort dropdown
//Feedback cards: customer name, rating, comment, date

'use client'

// import useState, useMemo from react

// Design tokens — same colour palette used across all admin pages, a share css file will be made when ashboard is finished

const COLOR = {  }

// Sort options array 
//
// Each object has:
//   value: key stored in sortKey state
//   label is shown in the dropdown
//   compareFn is a function(a, b) used to sort the feedback array
//
// Options:
//   newest: sort descending by date (most recent first)
//   oldest: sort ascending by date (oldest first)
//   highest:sort descending by rating (5 stars first)
//   lowest: sort ascending by rating (1 star first)

const SORT_OPTIONS = [  ]

// Mock feedback data 
//
// Replace with real API data once backend is ready.
//
//assuming that this is all attributes in the feedback table 
// Each entry has:
//   id; unique identifier
//   customer: customer full name
//   rating: integer 1–5
//   comment: feedback text (can be empty string)
//   dateL ISO date string e.g. '2025-12-28'
//   orderRef:  order number e.g. 'ORD-0042'

const MOCK_FEEDBACK = [  ]

// Utility functions

// renderStars(rating)
// Returns a string of filled + empty star characters for a given rating
// e.g. rating=4 → '★★★★☆'

// ratingColor(rating)
// Returns a colour based on star rating
// 5 = gold, 4 = amber, 3 = muted grey, 2 = orange-red, 1 = dark red

// formatDate(iso)
// Formats an ISO date string to readable AU format
// e.g. '2025-12-28' → '28 Dec 2025'


// StarBreakdown component
//
// Shows a clickable horizontal bar for each star rating (5 down to 1).
// Bar width is proportional to how many reviews have that rating.
// Clicking a row toggles the star filter: clicking the active row resets to 'all'.
//
// Props:
//   feedbackL full MOCK_FEEDBACK array (always all reviews, not filtered)
//   activeFilter: currently selected star filter ('all' or integer 1–5)
//   onFilter :callback to update the star filter in the parent
// ─────────────────────────────────────────────────────────────────────────────

function StarBreakdown({ feedback, activeFilter, onFilter }) { }

// FeedbackCard component
//
// Displays a single customer feedback entry as a white card.
// Layout:
//   Top row  customer name + orderRef on the left, date on the right
//   Middle: star rating rendered as ★ characters, coloured by ratingColor()
//   Bottom: comment text, or italic "No comment left." if comment is empty
//
// Props:
//   item: one feedback object from MOCK_FEEDBACK


function FeedbackCard({ item }) {  }

// SectionLabel component


function SectionLabel({ children }) { }

// Divider component


function Divider() { 
      return <div style={{ height: '1px', background: COLOR.border, margin: '28px 0' }} />
 }

// main page component

export default function AdminFeedbackPage() {


  return (
 
        // ── Section 1: Overall Rating 

          // Two-column grid: average score card (left) + star breakdown (right)

          // Average score card (left)
            // Big number — avgRating.toFixed(1)
            // Stars — renderStars(Math.round(avgRating)) in gold
            // Sub text — "Based on X reviews"

          // Star breakdown card (right)
            // Helper text: "Click a row to filter by that rating"
            // StarBreakdown component

        // Divider

        //Section 2: Controls row 

          // Left side — section heading showing count
          //   "All reviews (10)" or "4-star reviews (3)"
          //   Active star filter tag — only shown when activeFilter !== 'all'
          //     shows e.g. "4 ★ ×", clicking resets activeFilter to 'all'

          // Right side sort dropdown
          //   Label: "Sort by"
          //   <select> bound to sortKey, options from SORT_OPTIONS

        //Section 3: Feedback cards 

          // If processedFeedback is empty: show "No reviews for this rating."
          // Otherwise: map processedFeedback → <FeedbackCard key={item.id} item={item} />

        // Mock data note 

    null
  )
}