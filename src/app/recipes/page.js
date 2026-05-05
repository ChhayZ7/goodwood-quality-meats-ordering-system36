'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bold } from 'lucide-react'


const CATEGORIES = ['All', 'Beef', 'Poultry', 'Christmas', 'Lamb', 'Pork', 'Sauce']

function RecipeCardSkeleton() {
  return (
    <div style={{
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#9e9067',
    }}>
      <div style={{ width: '100%', height: '220px', background: '#bca26c' }} />
      <div style={{ padding: '16px' }}>
        <div style={{ width: '60px', height: '12px', background: '#bca26c', borderRadius: '4px', marginBottom: '10px' }} />
        <div style={{ width: '80%', height: '18px', background: '#bca26c', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ width: '100%', height: '12px', background: '#bca26c', borderRadius: '4px', marginBottom: '4px' }} />
        <div style={{ width: '70%', height: '12px', background: '#bca26c', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

function RecipeCard({ recipe }) {
  const categories = Array.isArray(recipe.category) ? recipe.category : [recipe.category]
  const descriptionPreview = recipe.description
    ? recipe.description.split(' ').slice(0, 10).join(' ') + '...'
    : ''

  return (
    <div
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#f7e4bc',
        cursor: 'pointer',
        transition: 'transform .2s, box-shadow .2s',
        display: 'flex',
        flexDirection: 'column',
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
      {/* Image */}
      <div style={{ width: '100%', height: '220px', overflow: 'hidden', flexShrink: 0 }}>
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', background: '#E0D5BE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {categories.map((cat, i) => (
            <span key={i} style={{
              fontSize: '11px',
              fontWeight: 700,
              fontStyle:Bold,
              color: '#6d1313',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {cat}{i < categories.length - 1 ? ' ·' : ''}
            </span>
          ))}
        </div>

        {/* Name */}
        <h3 style={{
          fontSize: '17px',
          fontWeight: 700,
          color: '#8B1A1A',
          margin: '0 0 8px',
          lineHeight: 1.3,
        }}>
          {recipe.name}
        </h3>

        {/* Description preview */}
        {descriptionPreview && (
          <p style={{
            fontSize: '13px',
            color: '#2e4631',
            lineHeight: 1.6,
            margin: '0 0 12px',
            flex: 1,
          }}>
            {descriptionPreview}
          </p>
        )}

        {/* Read more link */}
        <Link
          href={`/recipes/${recipe.id}`}
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#8B1A1A',
            textDecoration: 'none',
            borderBottom: '1.5px solid #8B1A1A',
            paddingBottom: '1px',
            alignSelf: 'flex-start',
            marginTop: 'auto',
          }}
        >
          Read More →
        </Link>
      </div>
    </div>
  )
}

export default function RecipesPage() {
  const [selected, setSelected] = useState('All')
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const res = await fetch('/api/recipes')
        if (!res.ok) throw new Error('Failed to fetch recipes')
        const json = await res.json()
        setRecipes(json.recipes ?? [])
      } catch (err) {
        console.error(err)
        setError('Could not load recipes. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchRecipes()
  }, [])

  const filtered = selected === 'All'
    ? recipes
    : recipes.filter(r => {
        const cats = Array.isArray(r.category) ? r.category : [r.category]
        return cats.includes(selected)
      })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>

      <main style={{ flex: 1 }}>
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
            color: '#222222',
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
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                border: '2px solid #7B1A1A',
                borderRadius: '4px',
                fontStyle: Bold,
                cursor: 'pointer',
                transition: 'all .15s',
                background: selected === cat ? '#7B1A1A' : 'transparent',
                color: selected === cat ? '#fff' : '#7B1A1A',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recipe Grid */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px' }}>
          {error && (
            <p style={{ textAlign: 'center', color: '#7B1A1A', fontSize: '14px' }}>{error}</p>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)
              : filtered.length > 0
                ? filtered.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)
                : (
                  <p style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    color: '#999',
                    fontStyle: 'italic',
                    fontSize: '14px',
                    padding: '40px 0',
                  }}>
                    No recipes found for this category.
                  </p>
                )
            }
          </div>
        </div>
      </main>

    </div>
  )
}