// This page lets admin edit the current product.
// Admin can update image, details, price, weight options, availability,
// or delete the product.

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

function centsToDollars(cents) {
  return cents ? (cents / 100).toFixed(2) : ''
}

function dollarsToCents(str) {
  const value = parseFloat(str)
  return Number.isNaN(value) ? 0 : Math.round(value * 100)
}

function SkeletonBox({ height = 20, width = '100%', radius = 8 }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, #EFE6D1 25%, #F7EFD9 50%, #EFE6D1 75%)',
        backgroundSize: '200% 100%',
        animation: 'pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div style={pageSt}>
      <style>
        {`
          @keyframes pulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>

      <div style={containerSt}>
        <SkeletonBox width="140px" height={18} />
        <div style={{ height: 24 }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '26px',
          }}
        >
          <SkeletonBox width="280px" height={42} />
          <SkeletonBox width="140px" height={44} />
        </div>

        <SkeletonBox height={1} />
        <div style={{ height: 24 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={cardSt}>
            <SkeletonBox width="190px" height={24} />
            <div style={{ height: 18 }} />
            <SkeletonBox height={500} radius={10} />
          </div>

          <div style={cardSt}>
            <SkeletonBox width="190px" height={24} />
            <div style={{ height: 18 }} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: 16,
              }}
            >
              <SkeletonBox height={42} />
              <SkeletonBox height={42} />
            </div>
            <div style={{ height: 14 }} />
            <SkeletonBox height={95} />
            <div style={{ height: 14 }} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              <SkeletonBox height={42} />
              <SkeletonBox height={42} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
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

function DeleteModal({ productName, onConfirm, onCancel, deleting }) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 100,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: COLOR.white,
          borderRadius: '14px',
          padding: '32px',
          width: '440px',
          maxWidth: '90vw',
          zIndex: 101,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: COLOR.text,
            margin: '0 0 12px',
          }}
        >
          Delete Product?
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: COLOR.muted,
            lineHeight: 1.7,
            margin: '0 0 28px',
          }}
        >
          Are you sure you want to delete{' '}
          <strong style={{ color: COLOR.text }}>{productName}</strong>? This
          action cannot be undone.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: `1.5px solid ${COLOR.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              color: COLOR.muted,
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontFamily: '"Lato", sans-serif',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            style={{
              padding: '10px 24px',
              background: '#B91C1C',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              color: COLOR.white,
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontFamily: '"Lato", sans-serif',
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function EditProductPage() {
  const router = useRouter()
  const { id } = useParams()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Beef')
  const [type, setType] = useState('WEIGHT_RANGE')
  const [price, setPrice] = useState('')
  const [available, setAvailable] = useState(true)
  const [weightOpts, setWeightOpts] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')

  useEffect(() => {
    if (!id) return

    fetch(`/api/admin/products/${id}`)
      .then(r => r.json())
      .then(({ product, error }) => {
        if (error || !product) {
          setLoadError('Product not found.')
          return
        }

        setName(product.name ?? '')
        setDescription(product.description ?? '')
        setCategory(product.category ?? 'Beef')
        setType(product.product_type ?? 'WEIGHT_RANGE')

        setPrice(
          product.product_type === 'FIXED'
            ? centsToDollars(product.price_cents)
            : centsToDollars(product.price_per_kg_cents)
        )

        setAvailable(product.is_available ?? true)
        setWeightOpts(product.product_weight_options?.map(o => ({ ...o })) ?? [])
        setImagePreview(product.image_url ?? null)
        setExistingImageUrl(product.image_url ?? null)
        setLoaded(true)
      })
      .catch(() => setLoadError('Failed to load product.'))
  }, [id])

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

  const handleSave = async () => {
    setSaveError('')
    setSaveSuccess('')

    if (!name.trim()) {
      setSaveError('Product name is required.')
      return
    }

    if (!price || Number.isNaN(parseFloat(price))) {
      setSaveError('Price is required.')
      return
    }

    setSaving(true)

    try {
      let image_url = existingImageUrl

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `products/${id}-${Date.now()}.${ext}`

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

      if (!imagePreview) image_url = null

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
                ...(o.id ? { id: o.id } : {}),
                label: o.label,
                min_weight_kg: parseFloat(o.min_weight_kg),
                max_weight_kg: parseFloat(o.max_weight_kg),
              }))
            : [],
      }

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes')
      }

      setSaveSuccess('Product saved successfully.')
      setImageFile(null)
      setExistingImageUrl(data.product.image_url)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete product')
      }

      router.push('/admin/products')
    } catch (err) {
      setSaveError(err.message)
      setShowDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loadError) {
    return (
      <div
        style={{
          ...pageSt,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: COLOR.redLight,
            border: `1px solid ${COLOR.redBorder}`,
            borderRadius: '10px',
            padding: '24px 32px',
            color: '#B91C1C',
            fontSize: '15px',
          }}
        >
          {loadError}
        </div>
      </div>
    )
  }

  if (!loaded) {
    return <LoadingSkeleton />
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

        {/* Header matching Products & Pricing */}
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
            Edit Product
          </h1>

          <button
            type="button"
            onClick={() => setShowDelete(true)}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: `1.5px solid #B91C1C`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#B91C1C',
              cursor: 'pointer',
              fontFamily: '"Lato", sans-serif',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = COLOR.redLight
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Delete Product
          </button>
        </div>

        <div
          style={{
            height: '1px',
            background: COLOR.gold,
            marginBottom: '26px',
          }}
        />

        {/* Banners */}
        {saveError && (
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
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #86EFAC',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '18px',
              fontSize: '14px',
              color: '#15803D',
            }}
          >
            {saveSuccess}
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
                  document.getElementById('img-input-edit')?.click()
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
                Change Image
              </button>
            </div>

            <div
  style={{
    width: '100%',
    height: '600px',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#F5EDD8',
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
      <div style={{ fontSize: '34px', marginBottom: '8px' }}>🖼️</div>
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
              id="img-input-edit"
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
            onClick={handleSave}
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
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {showDelete && (
        <DeleteModal
          productName={name}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          deleting={deleting}
        />
      )}
    </div>
  )
}