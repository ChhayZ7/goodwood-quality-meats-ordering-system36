'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
// card.module.css contains shared card styles used across the app for visual consistency
import styles from '@/app/styles/card.module.css'

// CATEGORIES is the list of filter options shown at the top of the page
// 'All' shows every recipe, the rest filter by category
const CATEGORIES = ['All', 'Beef', 'Poultry', 'Christmas', 'Lamb', 'Pork', 'Sauce']

// RecipeCardSkeleton is shown while recipes are loading
// each skeleton block mimics the shape of a real card using grey placeholder bars
// this prevents layout shift and gives a smoother loading experience
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

// RecipeCard renders a single recipe as a card
// receives a recipe object as a prop from the parent page
function RecipeCard({ recipe }) {
  // normalise category to an array so .map() always works
  const categories = Array.isArray(recipe.category) ? recipe.category : [recipe.category]

  // descriptionPreview shortens the description to the first 10 words
  // .split(' ') breaks the string into an array of words by splitting on spaces
  // e.g. "This is a great recipe" becomes ["This", "is", "a", "great", "recipe"]
  // .slice(0, 10) takes only the first 10 items from that array
  // .join(' ') joins them back into a single string with spaces
  // + '...' adds the three dots at the end to signal the text continues
  const descriptionPreview = recipe.description
    ? recipe.description.split(' ').slice(0, 10).join(' ') + '...'
    : ''

  return (
    <div className={styles.card}>

      {/* Image wrapper -- if no image_url, shows a placeholder SVG icon instead */}
      <div className={styles.imageWrapper}>
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className={styles.image}
          />
        ) : (
          // Placeholder shown when a recipe has no image uploaded
          <div className={styles.cardImagePlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Card content area */}
      <div className={styles.cardContent}>

        {/* Category tags -- dot separator between tags, no dot after the last one */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {categories.map((cat, i) => (
            <span key={i} className={styles.cardCategory}>
              {cat}{i < categories.length - 1 ? ' ·' : ''}
            </span>
          ))}
        </div>

        {/* Recipe name */}
        <h3 className={styles.cardTitle}>{recipe.name}</h3>

        {/* Short description preview -- only renders if there is a description */}
        {descriptionPreview && (
          <p className={styles.cardDescription}>{descriptionPreview}</p>
        )}

        {/* Read More link navigates to the recipe detail page using the recipe id */}
        <Link href={`/recipes/${recipe.id}`} className={styles.cardLink}>
          Read More
        </Link>
      </div>
    </div>
  )
}

export default function RecipesPage() {
  // selected tracks which category filter button is currently active
  const [selected, setSelected] = useState('All')

  // recipes stores the full list of recipes fetched from the API
  const [recipes, setRecipes] = useState([])

  // loading is true while the API call is in progress
  const [loading, setLoading] = useState(true)

  // error stores any error message if the fetch fails
  const [error, setError] = useState(null)

  // useEffect runs once on mount (empty dependency array)
  // fetches all recipes from GET /api/recipes
  useEffect(() => {
    async function fetchRecipes() {
      try {
        const res = await fetch('/api/recipes')
        if (!res.ok) throw new Error('Failed to fetch recipes')
        const json = await res.json()
        // fallback to empty array if recipes is undefined
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

  // filtered is the list of recipes shown in the grid
  // if selected is 'All', show everything
  // otherwise filter by checking if the recipe's category array includes the selected category
  const filtered = selected === 'All'
    ? recipes
    : recipes.filter(r => {
      const cats = Array.isArray(r.category) ? r.category : [r.category]
      return cats.includes(selected)
    })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>

      <main style={{ flex: 1 }}>

        {/* Page header -- centred title and description */}
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

        {/* Category filter buttons -- clicking a button sets selected state
            active button gets filterButtonActive style from card.module.css
            template literal combines the base style and active style conditionally */}
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

        {/* Recipe grid -- maxWidth 1200px, 3 equal columns, 24px gap between cards
            while loading, renders 6 skeleton cards
            if no recipes match the filter, shows an empty state message
            gridColumn 1 / -1 on the empty message spans it across all 3 columns */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px' }}>
          {error && (
            <p style={{ textAlign: 'center', color: '#7B1A1A', fontSize: '14px' }}>{error}</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {/*Array.from({ length: 6 }) creates an array of 6 empty slot
            .map((_, i) renders a skeleton card for each slot
            _ means we dont need the value of each slot, only i (the index) for the key*/}
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