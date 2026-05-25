// This page lets admin create a new product.
// Admin can add image, details, price, weight options and availability.

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

const COLOR = {
  red: '#7B1A1A',
  redDark: '#5C1212',
  redLight: '#FEF2F2',
  redBorder: '#FECACA',
  cream: '#FAF3E0',
  gold: '#C9A84C',
  text: '#1A1A1A',
  muted: '#6B7280',
  border: '#E5DCC8',
  white: '#FFFFFF',
  sidebar: '#F5EDD8',
}

const CATEGORIES = ['Beef', 'Pork', 'Lamb', 'Poultry', 'Seafood', 'Other']

const pageSt = {
  minHeight: '100vh',
  background: COLOR.cream,
  fontFamily: '"Lato", sans-serif',
}

const containerSt = {
  maxWidth: '1180px',
  margin: '0 auto',
  padding: '36px 40px 70px',
}

const cardSt = {
  background: COLOR.white,
  borderRadius: '12px',
  border: `1px solid ${COLOR.border}`,
  padding: '24px 26px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.035)',
}

const labelSt = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: COLOR.muted,
  textTransform: 'uppercase',
  letterSpacing: '.06em',
  marginBottom: '6px',
  marginTop: '14px',
}

const inputSt = {
  width: '100%',
  padding: '10px 12px',
  border: `1.5px solid ${COLOR.border}`,
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: '"Lato", sans-serif',
  color: COLOR.text,
  background: COLOR.white,
  outline: 'none',
  boxSizing: 'border-box',
}

function dollarsToCents(str) {
  const value = parseFloat(str)
  return Number.isNaN(value) ? 0 : Math.round(value * 100)
}

function WeightRow({ opt, onChange, onRemove }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr 1fr auto',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '10px',
      }}
    >
      <input
        style={inputSt}
        placeholder="Label e.g. 1–1.5kg"
        value={opt.label}
        onChange={e => onChange({ ...opt, label: e.target.value })}
      />

      <input
        style={inputSt}
        type="number"
        min="0"
        step="0.1"
        placeholder="Min kg"
        value={opt.min_weight_kg}
        onChange={e => onChange({ ...opt, min_weight_kg: e.target.value })}
      />

      <input
        style={inputSt}
        type="number"
        min="0"
        step="0.1"
        placeholder="Max kg"
        value={opt.max_weight_kg}
        onChange={e => onChange({ ...opt, max_weight_kg: e.target.value })}
      />

      <button
        type="button"
        onClick={onRemove}
        style={{
          width: '38px',
          height: '38px',
          background: COLOR.redLight,
          border: `1px solid ${COLOR.redBorder}`,
          borderRadius: '8px',
          cursor: 'pointer',
          color: '#B91C1C',
          fontSize: '18px',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}

export default function NewProductPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Beef')
  const [type, setType] = useState('WEIGHT_RANGE')
  const [price, setPrice] = useState('')
  const [available, setAvailable] = useState(true)
  const [weightOpts, setWeightOpts] = useState([])

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = e => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const addWeightOpt = () => {
    setWeightOpts(o => [
      ...o,
      {
        _tempId: Date.now(),
        label: '',
        min_weight_kg: '',
        max_weight_kg: '',
      },
    ])
  }

  const updateOpt = (i, updated) => {
    setWeightOpts(o => o.map((opt, idx) => (idx === i ? updated : opt)))
  }

  const removeOpt = i => {
    setWeightOpts(o => o.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async () => {
    setError('')

    if (!name.trim() || !category || !type) {
      setError('Name, category, and product type are required.')
      return
    }

    if (!price || Number.isNaN(parseFloat(price))) {
      setError('Price is required.')
      return
    }

    setSaving(true)

    try {
      let image_url = null

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `products/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, imageFile, { upsert: true })

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(path)

        image_url = urlData.publicUrl
      }

      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        product_type: type,
        price_cents: type === 'FIXED' ? dollarsToCents(price) : 0,
        price_per_kg_cents:
          type === 'WEIGHT_RANGE' ? dollarsToCents(price) : 0,
        is_available: available,
        image_url,
        weight_options:
          type === 'WEIGHT_RANGE'
            ? weightOpts.map(o => ({
                label: o.label,
                min_weight_kg: parseFloat(o.min_weight_kg),
                max_weight_kg: parseFloat(o.max_weight_kg),
              }))
            : [],
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create product')
      }

      router.push('/admin/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={pageSt}>
      <div style={containerSt}>
        {/* Back link */}
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: COLOR.red,
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: '"Lato", sans-serif',
            marginBottom: '20px',
            padding: 0,
            letterSpacing: '.02em',
          }}
        >
          ← Back to Products
        </button>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '18px',
            marginBottom: '28px',
          }}
        >
          <h1
            style={{
              fontFamily: '"Lato", serif',
              fontSize: '36px',
              fontWeight: 700,
              color: COLOR.red,
              margin: 0,
            }}
          >
            Add New Product
          </h1>
        </div>

        <div
          style={{
            height: '1px',
            background: COLOR.gold,
            marginBottom: '26px',
          }}
        />

        {/* Error banner */}
        {error && (
          <div
            style={{
              background: COLOR.redLight,
              border: `1px solid ${COLOR.redBorder}`,
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '18px',
              fontSize: '14px',
              color: '#B91C1C',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Product Image */}
          <section style={cardSt}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: COLOR.text,
                  margin: 0,
                }}
              >
                Product Image
              </h2>

              <button
                type="button"
                onClick={() =>
                  document.getElementById('img-input-new')?.click()
                }
                style={{
                  padding: '9px 16px',
                  background: COLOR.red,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: COLOR.white,
                  cursor: 'pointer',
                  fontFamily: '"Lato", sans-serif',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLOR.redDark
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = COLOR.red
                }}
              >
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </button>
            </div>

            <div
              style={{
                width: '100%',
                height: '400px',
                borderRadius: '10px',
                overflow: 'hidden',
                background: COLOR.sidebar,
                border: `1px solid ${COLOR.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '34px', marginBottom: '8px' }}>
                    🖼️
                  </div>
                  <p
                    style={{
                      margin: 0,
                      color: COLOR.muted,
                      fontSize: '14px',
                    }}
                  >
                    No product image uploaded
                  </p>
                </div>
              )}
            </div>

            <input
              id="img-input-new"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />

            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null)
                  setImagePreview(null)
                }}
                style={{
                  marginTop: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#B91C1C',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 700,
                }}
              >
                Remove image
              </button>
            )}
          </section>

          {/* Product Details */}
          <section style={cardSt}>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: COLOR.text,
                margin: '0 0 4px',
              }}
            >
              Product Details
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '16px',
              }}
            >
              <div>
                <label style={labelSt}>Product Name *</label>
                <input
                  style={inputSt}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={labelSt}>
                  {type === 'FIXED'
                    ? 'Price per Box ($) *'
                    : 'Price per kg ($) *'}
                </label>

                <input
                  style={inputSt}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
            </div>

            <label style={labelSt}>Description</label>
            <textarea
              style={{
                ...inputSt,
                minHeight: '95px',
                resize: 'vertical',
                lineHeight: 1.6,
              }}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              <div>
                <label style={labelSt}>Category *</label>
                <select
                  style={{ ...inputSt, cursor: 'pointer' }}
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelSt}>Type *</label>
                <select
                  style={{ ...inputSt, cursor: 'pointer' }}
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="FIXED">Fixed Price</option>
                  <option value="WEIGHT_RANGE">Weight-based</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '18px',
                padding: '12px 14px',
                background: COLOR.sidebar,
                borderRadius: '10px',
                border: `1px solid ${COLOR.border}`,
              }}
            >
              <input
                type="checkbox"
                id="avail"
                checked={available}
                onChange={e => setAvailable(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  accentColor: COLOR.red,
                }}
              />

              <label
                htmlFor="avail"
                style={{
                  fontSize: '14px',
                  color: COLOR.text,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Available for ordering
              </label>
            </div>
          </section>

          {/* Weight Options */}
          {type === 'WEIGHT_RANGE' && (
            <section style={cardSt}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: COLOR.text,
                    margin: 0,
                  }}
                >
                  Weight Options
                </h2>

                <button
                  type="button"
                  onClick={addWeightOpt}
                  style={{
                    background: COLOR.red,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    fontSize: '14px',
                    color: COLOR.white,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontFamily: '"Lato", sans-serif',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = COLOR.redDark
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = COLOR.red
                  }}
                >
                  + Add Option
                </button>
              </div>

              {weightOpts.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1fr 1fr auto',
                    gap: '12px',
                    marginBottom: '8px',
                    padding: '0 2px',
                  }}
                >
                  {['Label', 'Min kg', 'Max kg', ''].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '11px',
                        color: COLOR.muted,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '.06em',
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}

              {weightOpts.length === 0 ? (
                <p
                  style={{
                    color: COLOR.muted,
                    fontSize: '14px',
                    margin: 0,
                    padding: '16px',
                    background: COLOR.sidebar,
                    borderRadius: '10px',
                    border: `1px dashed ${COLOR.border}`,
                  }}
                >
                  No weight options added yet. Click “+ Add Option” to create
                  one.
                </p>
              ) : (
                weightOpts.map((opt, i) => (
                  <WeightRow
                    key={opt.id ?? opt._tempId ?? i}
                    opt={opt}
                    onChange={updated => updateOpt(i, updated)}
                    onRemove={() => removeOpt(i)}
                  />
                ))
              )}
            </section>
          )}
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '11px 24px',
              background: 'none',
              border: `1.5px solid ${COLOR.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              color: COLOR.muted,
              cursor: 'pointer',
              fontFamily: '"Lato", sans-serif',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: '11px 32px',
              background: saving ? '#A0A0A0' : COLOR.red,
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              color: COLOR.white,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: '"Lato", sans-serif',
            }}
            onMouseEnter={e => {
              if (!saving) e.currentTarget.style.background = COLOR.redDark
            }}
            onMouseLeave={e => {
              if (!saving) e.currentTarget.style.background = COLOR.red
            }}
          >
            {saving ? 'Creating…' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  )
}