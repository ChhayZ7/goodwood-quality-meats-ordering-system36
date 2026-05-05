//Recipe Detail page where it will display the recipe name, procedure, preparation and much more info including the photot in here

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    async function fetchRecipe() {
      try {
        const res = await fetch(`/api/recipes/${id}`)
        if (res.status === 404) throw new Error('Recipe not found')
        if (!res.ok) throw new Error('Failed to fetch recipe')
        const json = await res.json()
        setRecipe(json.recipe)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [id])

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#7a6a49', fontSize: '16px' }}>Loading recipe...</p>
        </main>
      </div>
    )
  }

  // Error state
  if (error || !recipe) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <p style={{ color: '#7B1A1A', fontSize: '16px' }}>{error ?? 'Recipe not found.'}</p>
          <Link href="/recipes" style={{ fontSize: '14px', color: '#555', textDecoration: 'none', borderBottom: '1px solid #555' }}>
            ← Back to Recipes
          </Link>
        </main>
      </div>
    )
  }

  const categories = Array.isArray(recipe.category) ? recipe.category : [recipe.category]
  const equipment = Array.isArray(recipe.equipment) ? recipe.equipment : []
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const method = Array.isArray(recipe.method) ? recipe.method : []

  // Helper to detect subheadings (no numbers/measurements at the start)
  const isSubheading = (text) => /^[A-Z][a-zA-Z\s&]+$/.test(text.trim())

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 60px' }}>

          {/* Back link */}
          <Link href="/recipes" style={{
            display: 'inline-block',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#555',
            textDecoration: 'none',
          }}>
            ← Back to Recipes
          </Link>

          {/* Hero Image */}
          {recipe.image_url && (
            <div style={{
              width: '100%',
              height: '420px',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '32px',
            }}>
              <img
                src={recipe.image_url}
                alt={recipe.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Category tags */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {categories.map((cat, i) => (
              <span key={i} style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#7B1A1A',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {cat}{i < categories.length - 1 ? ' ·' : ''}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '32px',
            fontWeight: 700,
            color: '#1A1A1A',
            margin: '0 0 16px',
            lineHeight: 1.2,
          }}>
            {recipe.name}
          </h1>

          {/* Description */}
          {recipe.description && (
            <p style={{
              fontSize: '15px',
              color: '#555',
              lineHeight: 1.8,
              margin: '0 0 32px',
              maxWidth: '720px',
            }}>
              {recipe.description}
            </p>
          )}

          {/* Time & Servings */}
          <div style={{
            display: 'flex',
            gap: '0',
            borderTop: '1px solid #E8D48A',
            borderBottom: '1px solid #E8D48A',
            padding: '20px 0',
            marginBottom: '40px',
            flexWrap: 'wrap',
          }}>
            {[
              { label: 'Servings', value: recipe.servings },
              { label: 'Prep Time', value: recipe.prep_time },
              { label: 'Cook Time', value: recipe.cooking_time },
              { label: 'Total Time', value: recipe.total_time },
            ].filter(item => item.value).map((item, i, arr) => (
              <div key={i} style={{
                flex: 1,
                minWidth: '120px',
                textAlign: 'center',
                borderRight: i < arr.length - 1 ? '1px solid #E8D48A' : 'none',
                padding: '0 16px',
              }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', margin: '0 0 4px', fontWeight: 700 }}>
                  {item.label}
                </p>
                <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '16px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '48px' }}>

            {/* LEFT COLUMN */}
            <div>
              {/* Equipment */}
              {equipment.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    margin: '0 0 16px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #E8D48A',
                  }}>
                    Equipment
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {equipment.map((item, i) => (
                      <li key={i} style={{
                        fontSize: '14px',
                        color: '#444',
                        lineHeight: 1.7,
                        paddingLeft: '14px',
                        position: 'relative',
                        marginBottom: '4px',
                      }}>
                        <span style={{ position: 'absolute', left: 0, color: '#C9A84C' }}>·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ingredients */}
              {ingredients.length > 0 && (
                <div>
                  <h2 style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    margin: '0 0 16px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #E8D48A',
                  }}>
                    Ingredients
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {ingredients.map((item, i) => (
                      isSubheading(item) ? (
                        <li key={i} style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#7B1A1A',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          margin: '16px 0 8px',
                        }}>
                          {item}
                        </li>
                      ) : (
                        <li key={i} style={{
                          fontSize: '14px',
                          color: '#444',
                          lineHeight: 1.7,
                          paddingLeft: '14px',
                          position: 'relative',
                          marginBottom: '4px',
                        }}>
                          <span style={{ position: 'absolute', left: 0, color: '#C9A84C' }}>·</span>
                          {item}
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN - Method */}
            <div>
              {method.length > 0 && (
                <div>
                  <h2 style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    margin: '0 0 16px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #E8D48A',
                  }}>
                    Method
                  </h2>
                  <ol style={{ listStyle: 'none', padding: 0, margin: 0, counterReset: 'step-counter' }}>
                    {method.map((step, i) => (
                      isSubheading(step) ? (
                        <li key={i} style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#7B1A1A',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          margin: '24px 0 12px',
                        }}>
                          {step}
                        </li>
                      ) : (
                        <li key={i} style={{
                          display: 'flex',
                          gap: '16px',
                          marginBottom: '20px',
                          alignItems: 'flex-start',
                        }}>
                          <span style={{
                            flexShrink: 0,
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#7B1A1A',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '2px',
                          }}>
                            {/* Count only non-subheading items */}
                            {method.slice(0, i).filter(s => !isSubheading(s)).length + 1}
                          </span>
                          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.8, margin: 0 }}>
                            {step}
                          </p>
                        </li>
                      )
                    ))}
                  </ol>
                </div>
              )}

              {/* Recipe Source */}
              {recipe.recipe_source && (
                <div style={{
                  marginTop: '32px',
                  padding: '16px',
                  background: '#F0E8D0',
                  borderRadius: '8px',
                  borderLeft: '3px solid #C9A84C',
                }}>
                  <p style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px', fontWeight: 700 }}>
                    Recipe Source
                  </p>
                  <p style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: 1.6 }}>
                    {recipe.recipe_source}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}