//This page let admin edit the current product, they can either change the price, description, etc
// but not the name or they can decided to delete this product on this page

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

const COLOR = {
  red:       '#7B1A1A',
  redLight:  '#FEF2F2',
  redBorder: '#FECACA',
  cream:     '#FAF3E0',
  gold:      '#C9A84C',
  text:      '#1A1A1A',
  muted:     '#6B7280',
  border:    '#E5DCC8',
  white:     '#FFFFFF',
  sidebar:   '#F5EDD8',
}

//style for every labels above a form field
const labelSt = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: COLOR.muted,
  textTransform: 'uppercase',
  letterSpacing: '.06em',
  marginBottom: '6px',
  marginTop: '16px',
}

//style for every user input, inc. textarea, input field, etc
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

//categories to show in the dropdown
const CATEGORIES = ['Beef', 'Pork', 'Lamb', 'Poultry', 'Seafood', 'Other']

//function to convert cents to dollars, return an empty string of the field is left as zero or null
function centsToDollars(cents) {
  return cents ? (cents / 100).toFixed(2) : ''
}

//function to convert a dollar string entered by the admin back to cents (integer) for storage

function dollarsToCents(str) {
  return Math.round(parseFloat(str) * 100)
}

// Renders a single row of inputs for one weight option (label, min kg, max kg).
// Used inside the Weight Options section when product type is WEIGHT_RANGE.
//
// Props:
//   opt: the weight option object { label, min_weight_kg, max_weight_kg }
//   onChange: callback to update this option in the parent's weightOpts array
//   onRemove: callback to remove this option from the parent's weightOpts array

function WeightRow({ opt, onChange, onRemove }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
      <input
        style={inputSt}
        placeholder="Label (e.g. 2–3 kg)"
        value={opt.label}
        onChange={e => onChange({ ...opt, label: e.target.value })}
      />
      <input
        style={inputSt}
        type="number" min="0" step="0.1"
        placeholder="Min kg"
        value={opt.min_weight_kg}
        onChange={e => onChange({ ...opt, min_weight_kg: e.target.value })}
      />
      <input
        style={inputSt}
        type="number" min="0" step="0.1"
        placeholder="Max kg"
        value={opt.max_weight_kg}
        onChange={e => onChange({ ...opt, max_weight_kg: e.target.value })}
      />
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', fontSize: '20px', lineHeight: 1, padding: '4px' }}
      >×</button>
    </div>
  )
}

// Delete confirmation pop up, this is to ask the admin if they are sure to delete the product
function DeleteModal({ productName, onConfirm, onCancel, deleting }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100 }}
      />
      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: COLOR.white, borderRadius: '14px',
        padding: '32px', width: '440px', maxWidth: '90vw',
        zIndex: 101, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: COLOR.text, margin: '0 0 12px' }}>
          Delete Product?
        </h2>
        <p style={{ fontSize: '14px', color: COLOR.muted, lineHeight: 1.7, margin: '0 0 28px' }}>
          Are you sure you want to delete <strong style={{ color: COLOR.text }}>{productName}</strong>?
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onCancel}
            disabled={deleting}
            style={{ padding: '10px 20px', background: 'none', border: `1.5px solid ${COLOR.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: COLOR.muted, cursor: 'pointer', fontFamily: '"Lato", sans-serif' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{ padding: '10px 24px', background: '#B91C1C', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: COLOR.white, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: '"Lato", sans-serif', opacity: deleting ? 0.7 : 1 }}
          >
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function EditProductPage() {
  const router  = useRouter()
  const { id }  = useParams()

  //hooks 

  //form fieds
  const [name,         setName]         = useState('')
  const [description,  setDescription]  = useState('')
  const [category,     setCategory]     = useState('Beef')
  const [type,         setType]         = useState('WEIGHT_RANGE')
  const [price,        setPrice]        = useState('')
  const [available,    setAvailable]    = useState(true)

  //to set wieight options, should be all weight ioptions available for the product
  const [weightOpts,   setWeightOpts]   = useState([])

  //hook for store different pieces of image fields

  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)

  //UI state
  const [loaded,       setLoaded]       = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [showDelete,   setShowDelete]   = useState(false)
  const [deleting,     setDeleting]     = useState(false)

  //feedback
  const [loadError,    setLoadError]    = useState(null)
  const [saveError,    setSaveError]    = useState('')
  const [saveSuccess,  setSaveSuccess]  = useState('')
  
  // load products
  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/products/${id}`)
      .then(r => r.json())
      .then(({ product, error }) => {
        if (error || !product) { setLoadError('Product not found.'); return }
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

  // image change handle
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // weight options 
  const addWeightOpt   = () => setWeightOpts(o => [...o, { _tempId: Date.now(), label: '', min_weight_kg: '', max_weight_kg: '' }])
  const updateOpt      = (i, updated) => setWeightOpts(o => o.map((opt, idx) => idx === i ? updated : opt))
  const removeOpt      = (i) => setWeightOpts(o => o.filter((_, idx) => idx !== i))

  // save
  const handleSave = async () => {
    setSaveError(''); setSaveSuccess('')
    if (!name.trim()) { setSaveError('Product name is required.'); return }
    setSaving(true)
    try {
      // Upload new image if selected
      let image_url = existingImageUrl
      if (imageFile) {
        const ext  = imageFile.name.split('.').pop()
        const path = `products/${id}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, imageFile, { upsert: true })
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
        image_url = urlData.publicUrl
      }
      // If image was removed
      if (!imagePreview) image_url = null

      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        product_type: type,
        price_cents:        type === 'FIXED'       ? dollarsToCents(price) : 0,
        price_per_kg_cents: type === 'WEIGHT_RANGE' ? dollarsToCents(price) : 0,
        is_available: available,
        image_url,
        weight_options: type === 'WEIGHT_RANGE'
          ? weightOpts.map(o => ({
              ...(o.id ? { id: o.id } : {}),
              label:         o.label,
              min_weight_kg: parseFloat(o.min_weight_kg),
              max_weight_kg: parseFloat(o.max_weight_kg),
            }))
          : [],
      }

      const res  = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save changes')

      setSaveSuccess('Product saved successfully.')
      setImageFile(null)
      setExistingImageUrl(data.product.image_url)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  //handle delete a selected product
  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
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

  // loading / error states
  if (loadError) {
    return (
      <div style={{ minHeight: '100vh', background: COLOR.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Lato", sans-serif' }}>
        <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '10px', padding: '24px 32px', color: '#B91C1C', fontSize: '15px' }}>
          {loadError}
        </div>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: COLOR.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Lato", sans-serif', color: COLOR.muted, fontSize: '15px' }}>
        Loading product…
      </div>
    )
  }

  // render 
  return (
    <div style={{ minHeight: '100vh', background: COLOR.cream, fontFamily: '"Lato", sans-serif' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 48px' }}>

        {/* Back link */}
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: COLOR.red, fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: '"Lato", sans-serif', marginBottom: '16px', padding: 0, letterSpacing: '.04em' }}
        >
          ← Back to Products
        </button>

        {/* Title row with delete */}
          <h1 style={{fontFamily: '"Lato", sans-serif', fontSize: '32px', fontWeight: 700, color: COLOR.red, margin: 0 }}>
            Edit Product
          </h1>
        
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`, marginBottom: '32px', borderRadius: '1px' }} />

        {/* Banners */}
        {saveError && (
          <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '14px', color: '#B91C1C' }}>
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '14px', color: '#15803D' }}>
            {saveSuccess}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

          {/* ── Left: Product Details ── */}
          <div style={{ background: COLOR.white, borderRadius: '12px', border: `1px solid ${COLOR.border}`, padding: '28px' }}>
            <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '18px', fontWeight: 700, color: COLOR.text, margin: '0 0 4px' }}>
              Product Details
            </h2>
            <div style={{ height: '1px', background: COLOR.border, marginBottom: '8px' }} />

            <label style={labelSt}>Product Name *</label>
            <input style={inputSt} value={name} onChange={e => setName(e.target.value)} />

            <label style={labelSt}>Description</label>
            <textarea
              style={{ ...inputSt, minHeight: '80px', resize: 'vertical' }}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelSt}>Category *</label>
                <select style={{ ...inputSt, cursor: 'pointer' }} value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSt}>Type *</label>
                <select style={{ ...inputSt, cursor: 'pointer' }} value={type} onChange={e => setType(e.target.value)}>
                  <option value="FIXED">Fixed Price</option>
                  <option value="WEIGHT_RANGE">Weight-based</option>
                </select>
              </div>
            </div>

            <label style={labelSt}>{type === 'FIXED' ? 'Price per Box ($) *' : 'Price per kg ($) *'}</label>
            <input
              style={inputSt}
              type="number" min="0" step="0.01"
              placeholder="0.00"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
              <input
                type="checkbox"
                id="avail"
                checked={available}
                onChange={e => setAvailable(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: COLOR.red }}
              />
              <label htmlFor="avail" style={{ fontSize: '14px', color: COLOR.text, cursor: 'pointer' }}>
                Available for ordering
              </label>
            </div>
          </div>

          {/* ── Right: Image + Weight Options ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Image */}
            <div style={{ background: COLOR.white, borderRadius: '12px', border: `1px solid ${COLOR.border}`, padding: '28px' }}>
              <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '18px', fontWeight: 700, color: COLOR.text, margin: '0 0 4px' }}>
                Product Image
              </h2>
              <div style={{ height: '1px', background: COLOR.border, marginBottom: '16px' }} />

              <div
                onClick={() => document.getElementById('img-input-edit').click()}
                style={{
                  border: `2px dashed ${COLOR.border}`, borderRadius: '10px',
                  height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', background: COLOR.sidebar,
                  transition: 'border-color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = COLOR.gold}
                onMouseLeave={e => e.currentTarget.style.borderColor = COLOR.border}
              >
                {imagePreview
                  ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
                      <p style={{ margin: 0, color: COLOR.muted, fontSize: '13px' }}>Click to upload image</p>
                    </div>
                }
              </div>
              <input id="img-input-edit" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              {imagePreview && (
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  style={{ marginTop: '8px', background: 'none', border: 'none', color: '#B91C1C', fontSize: '13px', cursor: 'pointer', padding: 0 }}
                >
                  Remove image
                </button>
              )}
            </div>

            {/* Weight Options */}
            {type === 'WEIGHT_RANGE' && (
              <div style={{ background: COLOR.white, borderRadius: '12px', border: `1px solid ${COLOR.border}`, padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '18px', fontWeight: 700, color: COLOR.text, margin: 0 }}>
                    Weight Options
                  </h2>
                  <button
                    onClick={addWeightOpt}
                    style={{ background: 'none', border: `1.5px dashed ${COLOR.border}`, borderRadius: '8px', padding: '5px 14px', fontSize: '13px', color: COLOR.red, cursor: 'pointer', fontFamily: '"Lato", sans-serif', fontWeight: 700 }}
                  >
                    + Add
                  </button>
                </div>
                <div style={{ height: '1px', background: COLOR.border, marginBottom: '16px' }} />

                {weightOpts.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginBottom: '6px' }}>
                    {['Label', 'Min kg', 'Max kg', ''].map((h, i) => (
                      <span key={i} style={{ fontSize: '11px', color: COLOR.muted, fontWeight: 700, textTransform: 'uppercase' }}>{h}</span>
                    ))}
                  </div>
                )}

                {weightOpts.length === 0
                  ? <p style={{ color: COLOR.muted, fontSize: '13px', margin: 0 }}>No weight options. Click + Add to create one.</p>
                  : weightOpts.map((opt, i) => (
                      <WeightRow
                        key={opt.id ?? opt._tempId ?? i}
                        opt={opt}
                        onChange={updated => updateOpt(i, updated)}
                        onRemove={() => removeOpt(i)}
                      />
                    ))
                }
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
          <button
            onClick={() => router.back()}
            style={{ padding: '10px 20px', background: 'none', border: `1.5px solid ${COLOR.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: COLOR.muted, cursor: 'pointer', fontFamily: '"Lato", sans-serif' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '10px 28px', background: saving ? '#C9A08A' : COLOR.red, border: 'none', borderRadius: '5px', fontSize: '14px', fontWeight: 700, color: COLOR.white, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: '"Lato", sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#c86c6c' }}
            onMouseLeave={e => { e.currentTarget.style.background = COLOR.red }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
              <button
            onClick={() => setShowDelete(true)}
            style={{ padding: '10px 20px', background: COLOR.red, border: 'none', borderRadius: '5px', fontSize: '14px', fontWeight: 700, color: COLOR.redLight, cursor: 'pointer', fontFamily: '"Lato", sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#c86c6c' }}
            onMouseLeave={e => { e.currentTarget.style.background = COLOR.red }}
          >
            Delete Product
          </button>
        </div>

      </div>

      {/* Delete modal */}
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
