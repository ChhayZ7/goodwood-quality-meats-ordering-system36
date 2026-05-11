//This page let admin create new product by click on create new products on the product list page

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

const CATEGORIES = ['Beef', 'Pork', 'Lamb', 'Poultry', 'Seafood', 'Other']

function dollarsToCents(str) {
    return Math.round(parseFloat(str) * 100)
}

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

export default function NewProductPage() {
  
 // router: used to navigate back to /admin/products after successful create
  const router = useRouter()

 
  //Form field state
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [category,    setCategory]    = useState('Beef')
  const [type,        setType]        = useState('WEIGHT_RANGE')
  const [price,       setPrice]       = useState('')
  const [available,   setAvailable]   = useState(true)
 
  // Weight options state 
  // weightOpts: array of { _tempId, label, min_weight_kg, max_weight_kg }
  //              only used when type === 'WEIGHT_RANGE'
  const [weightOpts,  setWeightOpts]  = useState([])

 
  // for image 
  const [imageFile,   setImageFile]   = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
 
  // UI feedback state ────────────────────────────────────────────────────
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
 
  //handleImageChange 
   const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }
 
  //Weight option helpers 
  // addWeightOpt(): appends a new blank weight option row
  // updateOpt(i, updated): replaces the option at index i with updated object
  // removeOpt(i): removes the option at index i
const addWeightOpt    = () => setWeightOpts(o => [...o, { _tempId: Date.now(), label: '', min_weight_kg: '', max_weight_kg: '' }])
  const updateOpt       = (i, updated) => setWeightOpts(o => o.map((opt, idx) => idx === i ? updated : opt))
  const removeOpt       = (i) => setWeightOpts(o => o.filter((_, idx) => idx !== i))
 
  //handleSubmit 
  // Calls when the admin clicks "Create Product"
  //Validate — name, category, and type are required
  //If imageFile exists, upload it to Supabase Storage bucket 'product-images'
  //then build a unique path: products/${Date.now()}.${ext}
  //get the public URL after upload and store as image_url
  //Next, Build the payload object with all form fields
  //         - price_cents set if type === 'FIXED', otherwise 0
  //         - price_per_kg_cents set if type === 'WEIGHT_RANGE', otherwise 0
  //         - weight_options array included only if type === 'WEIGHT_RANGE'
  //After that, POST to /api/admin/products with the payload
  // Finally, On success, redirect to /admin/products
  //if fail, show error banner

    const handleSubmit = async () => {
    setError('')
    if (!name.trim() || !category || !type) {
      setError('Name, category, and product type are required.')
      return
    }
    setSaving(true)
    try {
      // Upload image
      let image_url = null
      if (imageFile) {
        const ext  = imageFile.name.split('.').pop()
        const path = `products/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, imageFile, { upsert: true })
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
        image_url = urlData.publicUrl
      }

      // Build payload
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        product_type: type,
        price_cents:         type === 'FIXED'        ? dollarsToCents(price) : 0,
        price_per_kg_cents:  type === 'WEIGHT_RANGE'  ? dollarsToCents(price) : 0,
        is_available: available,
        image_url,
        weight_options: type === 'WEIGHT_RANGE'
          ? weightOpts.map(o => ({
              label:         o.label,
              min_weight_kg: parseFloat(o.min_weight_kg),
              max_weight_kg: parseFloat(o.max_weight_kg),
            }))
          : [],
      }

      const res  = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create product')

      router.push('/admin/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
 

  //render, most copied from edit page's render
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
        <h1 style={{ fontFamily: '"Lato", san-serif', fontSize: '32px', fontWeight: 700, color: COLOR.red, margin: '0 0 8px' }}>
          Add New Product
        </h1>
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`, marginBottom: '32px', borderRadius: '1px' }} />


        {/* Banners */}
     {error && (
          <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '14px', color: '#B91C1C' }}>
            {error}
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
                onClick={() => document.getElementById('img-input-new').click()}
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
            onClick={handleSubmit}
            disabled={saving}
            style={{ padding: '10px 28px', background: saving ? '#C9A08A' : COLOR.red, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: COLOR.white, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: '"Lato", sans-serif' }}
          >
            {saving ? 'Creating…' : 'Create Product'}
          </button>

        </div>

      </div>
    </div>
  )
}
