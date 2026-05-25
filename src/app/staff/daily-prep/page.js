'use client'

import { useState, useEffect, useCallback } from 'react'
// Product categories matching the database values
const CATEGORIES = ['All', 'Pork', 'Beef', 'Lamb', 'Poultry', 'Seafood', 'Other']

// Status badge colours — same as used throughout the staff portal
const STATUS_CONFIG = {
  CONFIRMED:   { label: 'Confirmed',        bg: '#F59E0B', color: '#fff' },
  IN_PROGRESS: { label: 'In Progress',      bg: '#3B82F6', color: '#fff' },
  READY:       { label: 'Ready for Pickup', bg: '#22C55E', color: '#fff' },
  COMPLETED:   { label: 'Completed',        bg: '#6B7280', color: '#fff' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#6B7280', color: '#fff' }
  return (
    <span style={{
      display: 'inline-block', background: cfg.bg, color: cfg.color,
      fontSize: '11px', fontWeight: 700, padding: '3px 10px',
      borderRadius: '20px', whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}
// Category badge — same colour scheme as inventory page
const CATEGORY_COLOURS = {
  Pork:    { bg: '#FEE2E2', color: '#991B1B' },
  Beef:    { bg: '#FEF3C7', color: '#92400E' },
  Lamb:    { bg: '#DCFCE7', color: '#166534' },
  Poultry: { bg: '#DBEAFE', color: '#1E40AF' },
  Seafood: { bg: '#F3E8FF', color: '#7C3AED' },
  Other:   { bg: '#F3F4F6', color: '#6B7280' },
}

function CategoryBadge({ category }) {
  const cfg = CATEGORY_COLOURS[category] || CATEGORY_COLOURS['Other']
  return (
    <span style={{
      display: 'inline-block', background: cfg.bg, color: cfg.color,
      fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
    }}>
      {category}
    </span>
  )
}