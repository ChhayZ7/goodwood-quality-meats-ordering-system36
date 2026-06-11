// Recipe Detail page — displays full recipe info including image, ingredients, method, equipment and more

'use client'

import { useState, useEffect } from 'react'
// useParams reads the dynamic [id] segment from the URL
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function RecipeDetailPage() {
  // id comes from the URL, e.g. /recipes/123 gives id = '123'
  const { id } = useParams()

  // recipe stores the full recipe object fetched from the API
  const [recipe, setRecipe] = useState(null)

  // loading is true while the API call is in progress
  const [loading, setLoading] = useState(true)

  // error stores any error message to display if the fetch fails
  const [error, setError] = useState(null)

  // useEffect runs when id changes (or on first mount)
  // fetches the recipe from GET /api/recipes/[id]
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
        // setLoading false runs whether fetch succeeded or failed
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [id])

  // Loading state -- shown while waiting for the API response
  // minHeight 100vh keeps the page full height, flex centres the loading text
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#7a6a49', fontSize: '16px' }}>Loading recipe...</p>
        </main>
      </div>
    )
  }

  // Error state -- shown if fetch failed or recipe was not found
  // flex column centres the error message and back link vertically
  if (error || !recipe) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <p style={{ color: '#7B1A1A', fontSize: '16px' }}>{error ?? 'Recipe not found.'}</p>
          <Link href="/recipes" style={{ fontSize: '14px', color: '#555', textDecoration: 'none', borderBottom: '1px solid #555' }}>
            Back to Recipes
          </Link>
        </main>
      </div>
    )
  }

  // Array.isArray() checks if a value is an array or not
  // recipe.category could come from the database as either a single string e.g. "Beef"
  // or an array e.g. ["Beef", "Christmas"]
  // if it is already an array, use it as is
  // if it is just a string, wrap it in [] to make it an array so .map() always works
  const categories = Array.isArray(recipe.category) ? recipe.category : [recipe.category]
  const equipment = Array.isArray(recipe.equipment) ? recipe.equipment : []
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const method = Array.isArray(recipe.method) ? recipe.method : []

  // isSubheading detects section labels stored inside the ingredients/method arrays
  // e.g. "FOR THE SAUCE" or "Marinade" -- text that starts with a capital letter
  // and contains only letters and spaces (no numbers or measurements)
  //^ means start of string, [A-Z] means first character must be uppercase,
  // [a-zA-Z\s&]+ means the rest can only be letters, spaces, or &
  // $ means end of string
  // so "FOR THE SAUCE" or "Marinade" passes, but "2 cups flour" or "1. Preheat oven" does not
  // .trim() removes any leading or trailing spaces before testing
  const isSubheading = (text) => /^[A-Z][a-zA-Z\s&]+$/.test(text.trim())

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>

      {/* flex 1 on main pushes footer to the bottom if one is added later */}
      <main style={{ flex: 1 }}>
        {/* maxWidth 900px keeps content readable on large screens, padding adds breathing room */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 60px' }}>

          {/* Back link to the recipes listing page */}
          <Link href="/recipes" style={{
            display: 'inline-block',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#555',
            textDecoration: 'none',
          }}>
            Back to Recipes
          </Link>

          {/* Hero image -- only renders if the recipe has an image_url
              fixed height 420px, borderRadius rounds the corners
              overflow hidden clips the image inside the rounded container
              objectFit cover fills the container without stretching */}
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

          {/* Category tags -- maps over categories array
              adds a dot separator between tags but not after the last one */}
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

          {/* Recipe title -- Playfair Display serif font for an editorial look */}
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

          {/* Description -- only renders if the recipe has a description */}
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

          {/* Time and Servings bar
              borderTop and borderBottom add gold lines above and below
              flex with flexWrap allows items to wrap on smaller screens
              .filter(item => item.value) skips any fields the recipe doesn't have
              borderRight on each item except the last creates divider lines between stats */}
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
                // no border on last item
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

          {/* Two column layout -- left column is 1/3 width (equipment + ingredients)
              right column is 2/3 width (method)
              gap 48px adds space between the two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '48px' }}>

            {/* LEFT COLUMN */}
            <div>

              {/* Equipment section -- only renders if the recipe has equipment items
                  borderBottom gold line under the heading consistent with ingredients and method headings */}
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
                  {/* listStyle none removes default bullet points
                      custom gold dot positioned absolutely to the left of each item */}
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

              {/* Ingredients section -- only renders if the recipe has ingredients
                  isSubheading check renders section labels differently from regular ingredients
                  subheadings are styled uppercase dark red, regular items get the gold dot */}
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
                        // Subheading style -- uppercase dark red label
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
                        // Regular ingredient with gold dot
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

            {/* RIGHT COLUMN -- Method */}
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
                  {/* listStyle none removes default numbering, counterReset resets step counter, step is the current item in method array and i is the position number */}
                  <ol style={{ listStyle: 'none', padding: 0, margin: 0, counterReset: 'step-counter' }}>
                    {method.map((step, i) => (
                      isSubheading(step) ? (
                        // Subheading style -- same as ingredients subheadings
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
                        // Regular step with a numbered dark red circle badge
                        // flexShrink 0 prevents the circle from shrinking
                        // alignItems flex-start aligns circle to the top of the step text
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
                            {/*method.slice(0, i) takes all items in the method array before the current index
                            .filter(s => !isSubheading(s)) removes any subheadings from that slice
                            .length + 1 counts only the real steps before this one, then adds 1
                            this gives the correct step number even when subheadings are mixed in between steps
                            e.g. if items 0 and 2 are subheadings, item 3 should show as step 2 not step 4 */}
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

              {/* Recipe Source -- only renders if the recipe has a source
                  borderLeft gold line gives it a blockquote-like accent */}
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