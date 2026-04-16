'use client'
import { useState } from 'react'

const categories = ['All', 'Beef', 'Chicken', 'Christmas', 'Lamb', 'Pork', 'Sauce']

const mockRecipes = [
  { id: '1', category: 'Sauce' },
  { id: '2', category: 'Sauce' },
  { id: '3', category: 'Lamb' },
  { id: '4', category: 'Beef' },
  { id: '5', category: 'Pork' },
  { id: '6', category: 'Christmas' },
  { id: '7', category: 'Chicken' },
  { id: '8', category: 'Lamb' },
  { id: '9', category: 'Beef' },
]

export default function RecipesPage() {
  const [selected, setSelected] = useState('All')

  const filtered = selected === 'All'
    ? mockRecipes
    : mockRecipes.filter(r => r.category === selected)

  return (
    <main style={{ minHeight: '100vh', background: '#FAF3E0' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 600,
          color: '#8B1A1A',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '16px',
        }}>
          Your Next Meal Is Right Here
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#353535',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          We know how much it matters to have a great meal each night so we have made the effort
          and gone the distance to provide some amazing recipes below. Some are ours and some are
          from our fantastic customers. We hope you enjoy them!
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', padding: '0 24px 40px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              border: '1.5px solid #1A1A1A',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all .15s',
              background: selected === cat ? '#1A1A1A' : 'transparent',
              color: selected === cat ? '#fff' : '#1A1A1A',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
      }}>
        {filtered.map(recipe => (
          <div
            key={recipe.id}
            style={{
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#F0E8D0',
              cursor: 'pointer',
              transition: 'transform .2s, box-shadow .2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Image placeholder */}
            <div style={{
              width: '100%',
              height: '220px',
              background: '#E0D5BE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>

            {/* Card content */}
            <div style={{ padding: '16px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#7B1A1A',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {recipe.category}
              </span>
            </div>
          </div>
        ))}
      </div>

    </main>
  )
}
