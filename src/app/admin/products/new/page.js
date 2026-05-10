//This page let admin create new product by click on create new products on the product list page

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

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
}

function WeightRow({ opt, onChange, onRemove }) {
  return (

  )
}

export default function NewProductPage() {
  
 // router: used to navigate back to /admin/products after successful create
  // supabase: used for uploading the product image to Supabase Storage
 
  //Form field state
  // name        — product name
  // description — short description
  // category    — selected category, defaults to 'Beef'
  // type        — FIXED or WEIGHT_RANGE, defaults to 'WEIGHT_RANGE'
  // price       — price in dollars (converted to cents on submit)
  // available   — whether the product is orderable, defaults to true
 
  // Weight options state 
  // weightOpts: array of { _tempId, label, min_weight_kg, max_weight_kg }
  //              only used when type === 'WEIGHT_RANGE'
 
  // for image 
  // imageFile: the raw File object selected by the admin, used for uploading
  // imagePreview: a temporary blob URL to preview the image before uploading
 
  // UI feedback state ────────────────────────────────────────────────────
  // saving: true while the POST request is running, disables the submit button
  // error: shown in a red banner if validation fails or the API returns error
 
  //handleImageChange 
  // Fired when the admin picks a file from their computer
  // Sets imageFile to the raw File object
  // Sets imagePreview to a temporary blob URL for the UI preview
 
  //Weight option helpers 
  // addWeightOpt(): appends a new blank weight option row
  // updateOpt(i, updated): replaces the option at index i with updated object
  // removeOpt(i): removes the option at index i
 
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
 

  //render, most copied from edit page's render
  return (
    <div style={{ minHeight: '100vh', background: COLOR.cream, fontFamily: '"Lato", sans-serif' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 48px' }}>

        {/* Back button + Title */}
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: COLOR.red, fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: '"Lato", sans-serif', marginBottom: '16px', padding: 0, letterSpacing: '.04em' }}
        >
          ← Back to Products
        </button>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', fontWeight: 700, color: COLOR.red, margin: '0 0 8px' }}>
          Add New Product
        </h1>
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`, marginBottom: '32px', borderRadius: '1px' }} />

        {/* Error banner */}
        {error && (
          <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '14px', color: '#B91C1C' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

          {/* ── Left: Product Details ── */}
          <div style={{ background: COLOR.white, borderRadius: '12px', border: `1px solid ${COLOR.border}`, padding: '28px' }}>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', fontWeight: 700, color: COLOR.text, margin: '0 0 4px' }}>
              Product Details
            </h2>
            <div style={{ height: '1px', background: COLOR.border, marginBottom: '8px' }} />

            <label style={labelSt}>Product Name *</label>
            <input style={inputSt} placeholder="e.g. Boneless Ham" value={name} onChange={e => setName(e.target.value)} />

            <label style={labelSt}>Description</label>
            <textarea
              style={{ ...inputSt, minHeight: '80px', resize: 'vertical' }}
              placeholder="Short description shown on the product page"
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

            {/* Availability checkbox */}
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

            {/* Image upload */}
            <div style={{ background: COLOR.white, borderRadius: '12px', border: `1px solid ${COLOR.border}`, padding: '28px' }}>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', fontWeight: 700, color: COLOR.text, margin: '0 0 4px' }}>
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
              <input id="img-input-new" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
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
                  <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', fontWeight: 700, color: COLOR.text, margin: 0 }}>
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
                  ? <p style={{ color: COLOR.muted, fontSize: '13px', margin: 0 }}>No weight options yet. Click + Add to create one.</p>
                  : weightOpts.map((opt, i) => (
                      <WeightRow
                        key={opt._tempId ?? i}
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

        {/* Footer actions */}
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