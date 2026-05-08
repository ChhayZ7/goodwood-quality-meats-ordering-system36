'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '@/app/styles/card.module.css'

const CATEGORIES = ['All', 'Beef', 'Poultry', 'Christmas', 'Lamb', 'Pork', 'Sauce']

function RecipeCardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine} style={{ width: '60px', height: '12px', marginBottom: '10px' }} />
        <div className={styles.skeletonLine} style={{ width: '80%', height: '18px', marginBottom: '8px' }} />
        <div className={styles.skeletonLine} style={{ width: '100%', height: '12px', marginBottom: '4px' }} />
        <div className={styles.skeletonLine} style={{ width: '70%', height: '12px' }} />
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
    <div className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className={styles.image}
          />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        {/* Category tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {categories.map((cat, i) => (
            <span key={i} className={styles.cardCategory}>
              {cat}{i < categories.length - 1 ? ' ·' : ''}
            </span>
          ))}
        </div>

        {/* Name */}
        <h3 className={styles.cardTitle}>{recipe.name}</h3>

        {/* Description preview */}
        {descriptionPreview && (
          <p className={styles.cardDescription}>{descriptionPreview}</p>
        )}

        {/* Read more link */}
        <Link href={`/recipes/${recipe.id}`} className={styles.cardLink}>
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
        <div className={styles.filterContainer}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`${styles.filterButton} ${selected === cat ? styles.filterButtonActive : ''}`}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
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