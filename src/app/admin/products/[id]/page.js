// This page lets admin edit the current product.
// Admin can update image, details, price, weight options, availability,
// or delete the product.

'use client'

import { useState, useEffect } from 'react'
// useRouter lets us navigate programmatically e.g. router.push, router.back
// useParams reads the dynamic [id] from the URL e.g. /admin/products/123 gives id = '123'
import { useRouter, useParams } from 'next/navigation'
// supabase client instance used here for uploading images to Supabase Storage
import { supabase } from '@/lib/supabase-client'

// COLOR stores all brand colours in one place so they are consistent and easy to update
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

// CATEGORIES is the list of product categories shown in the category dropdown
const CATEGORIES = ['Beef', 'Pork', 'Lamb', 'Poultry', 'Seafood', 'Other']

// pageSt, containerSt, cardSt, labelSt, inputSt are reusable style objects
// defined outside the component so they are not recreated on every render
// pageSt sets the full page background and font
const pageSt = {
  minHeight: '100vh',
  background: COLOR.cream,
  fontFamily: '"Lato", sans-serif',
}

// containerSt centres the content and limits max width on large screens
const containerSt = {
  maxWidth: '1180px',
  margin: '0 auto',
  padding: '36px 40px 70px',
}

// cardSt is the white rounded card style used for each section (image, details, weight options)
const cardSt = {
  background: COLOR.white,
  borderRadius: '12px',
  border: `1px solid ${COLOR.border}`,
  padding: '24px 26px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.035)',
}

// labelSt is the small uppercase grey label style used above each input field
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

// inputSt is the shared style for all input, select, and textarea fields on the page
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

// centsToDollars converts a price stored in cents (integer) to a dollar string
// e.g. 1500 becomes "15.00"
// .toFixed(2) ensures exactly 2 decimal places
// returns empty string if cents is null or undefined
function centsToDollars(cents) {
  return cents ? (cents / 100).toFixed(2) : ''
}

// dollarsToCents converts a dollar string entered by the admin to cents (integer)
// parseFloat converts the string to a decimal number e.g. "15.00" becomes 15
// Math.round(value * 100) converts to cents and rounds to avoid floating point issues
// Number.isNaN check returns 0 if the input is not a valid number
function dollarsToCents(str) {
  const value = parseFloat(str)
  return Number.isNaN(value) ? 0 : Math.round(value * 100)
}

// SkeletonBox renders a single shimmer placeholder block
// props: height, width, radius -- control the size and shape of the block
// the pulse animation slides the gradient left to right to create the shimmer effect
function SkeletonBox({ height = 20, width = '100%', radius = 8 }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #EFE6D1 25%, #F7EFD9 50%, #EFE6D1 75%)',
        backgroundSize: '200% 100%',
        animation: 'pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

// LoadingSkeleton renders the full page skeleton layout shown while the product is loading
// it mimics the shape of the real page so there is no layout shift when data arrives
function LoadingSkeleton() {
  return (
    <div style={pageSt}>
      {/* pulse keyframe animation used by SkeletonBox
          slides the gradient from right to left repeatedly */}
      <style>
        {`
          @keyframes pulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>

      <div style={containerSt}>
        {/* Back link placeholder */}
        <SkeletonBox width="140px" height={18} />
        <div style={{ height: 24 }} />

        {/* Header row placeholder -- title on left, delete button on right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '26px' }}>
          <SkeletonBox width="280px" height={42} />
          <SkeletonBox width="140px" height={44} />
        </div>

        {/* Gold divider placeholder */}
        <SkeletonBox height={1} />
        <div style={{ height: 24 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Image card placeholder -- tall block representing the image preview area */}
          <div style={cardSt}>
            <SkeletonBox width="190px" height={24} />
            <div style={{ height: 18 }} />
            <SkeletonBox height={500} radius={10} />
          </div>

          {/* Details card placeholder -- two column row then description then two more fields */}
          <div style={cardSt}>
            <SkeletonBox width="190px" height={24} />
            <div style={{ height: 18 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
              <SkeletonBox height={42} />
              <SkeletonBox height={42} />
            </div>
            <div style={{ height: 14 }} />
            <SkeletonBox height={95} />
            <div style={{ height: 14 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <SkeletonBox height={42} />
              <SkeletonBox height={42} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// WeightRow renders a single row in the weight options section
// props:
//   opt -- the weight option object with label, min_weight_kg, max_weight_kg
//   onChange -- called when any field in this row changes, passes back the updated opt object
//   onRemove -- called when the remove button is clicked to delete this row
// grid with 4 columns: label input, min kg input, max kg input, remove button
// onChange uses spread (...opt) to copy all existing fields and only overwrite the changed one
function WeightRow({ opt, onChange, onRemove }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr auto', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
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
      {/* Remove button -- small red square with an x, calls onRemove when clicked */}
      <button
        type="button"
        onClick={onRemove}
        style={{ width: '38px', height: '38px', background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', cursor: 'pointer', color: '#B91C1C', fontSize: '18px', fontWeight: 700, lineHeight: 1 }}
      >
        x
      </button>
    </div>
  )
}

// DeleteModal is the confirmation popup shown when admin clicks Delete Product
// props:
//   productName -- the name of the product shown in the confirmation message
//   onConfirm -- called when admin clicks Yes Delete, triggers handleDelete
//   onCancel -- called when admin clicks Cancel or the backdrop, closes the modal
//   deleting -- true while the delete API call is in progress, disables buttons
function DeleteModal({ productName, onConfirm, onCancel, deleting }) {
  return (
    <>
      {/* Dark semi-transparent backdrop behind the modal
          position fixed covers the whole screen, clicking it calls onCancel */}
      <div
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100 }}
      />

      {/* Modal box -- centred on screen using position fixed + transform translate
          zIndex 101 keeps it above the backdrop (100) so it stays clickable
          maxWidth 90vw prevents it from overflowing on small screens */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: COLOR.white, borderRadius: '14px', padding: '32px', width: '440px', maxWidth: '90vw', zIndex: 101, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: COLOR.text, margin: '0 0 12px' }}>
          Delete Product?
        </h2>
        <p style={{ fontSize: '14px', color: COLOR.muted, lineHeight: 1.7, margin: '0 0 28px' }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: COLOR.text }}>{productName}</strong>? This action cannot be undone.
        </p>
        {/* Button row -- Cancel on the left, Yes Delete on the right
            both buttons are disabled while deleting is true to prevent double clicks
            cursor not-allowed shows when buttons are disabled */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            style={{ padding: '10px 20px', background: 'none', border: `1.5px solid ${COLOR.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: COLOR.muted, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: '"Lato", sans-serif' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            style={{ padding: '10px 24px', background: '#B91C1C', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: COLOR.white, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: '"Lato", sans-serif', opacity: deleting ? 0.7 : 1 }}
          >
            {/* shows Deleting while in progress, otherwise shows Yes Delete */}
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function EditProductPage() {
  const router = useRouter()
  // id comes from the URL e.g. /admin/products/123 gives id = '123'
  const { id } = useParams()

  // name, description, category, type, price, available -- form field states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Beef')
  // type controls whether the product is FIXED price or WEIGHT_RANGE (price per kg)
  const [type, setType] = useState('WEIGHT_RANGE')
  const [price, setPrice] = useState('')
  const [available, setAvailable] = useState(true)

  // weightOpts stores the list of weight option rows for WEIGHT_RANGE products
  const [weightOpts, setWeightOpts] = useState([])

  // imageFile is the new file selected by the admin (not yet uploaded)
  const [imageFile, setImageFile] = useState(null)
  // imagePreview is the URL shown in the image preview box
  // starts as the existing image URL, replaced with a local blob URL when a new file is selected
  const [imagePreview, setImagePreview] = useState(null)
  // existingImageUrl is the original image URL from the database
  // kept separately so we know what to fall back to if the admin cancels
  const [existingImageUrl, setExistingImageUrl] = useState(null)

  // loaded is false until the product data has been fetched, controls whether to show skeleton
  const [loaded, setLoaded] = useState(false)
  // saving is true while the save API call is in progress
  const [saving, setSaving] = useState(false)
  // showDelete controls whether the delete confirmation modal is visible
  const [showDelete, setShowDelete] = useState(false)
  // deleting is true while the delete API call is in progress
  const [deleting, setDeleting] = useState(false)
  // loadError stores any error from the initial product fetch
  const [loadError, setLoadError] = useState(null)
  // saveError stores any validation or API error from saving
  const [saveError, setSaveError] = useState('')
  // saveSuccess stores the success message shown after a successful save
  const [saveSuccess, setSaveSuccess] = useState('')

  // useEffect runs when id changes (or on first mount)
  // fetches the product from GET /api/admin/products/[id] and populates all form fields
  useEffect(() => {
    if (!id) return

    fetch(`/api/admin/products/${id}`)
      .then(r => r.json())
      .then(({ product, error }) => {
        if (error || !product) {
          setLoadError('Product not found.')
          return
        }

        // populate each form field with the existing product data
        setName(product.name ?? '')
        setDescription(product.description ?? '')
        setCategory(product.category ?? 'Beef')
        setType(product.product_type ?? 'WEIGHT_RANGE')

        // price field shows price_cents for FIXED products, price_per_kg_cents for WEIGHT_RANGE
        // centsToDollars converts the stored cents integer to a dollar string for the input
        setPrice(
          product.product_type === 'FIXED'
            ? centsToDollars(product.price_cents)
            : centsToDollars(product.price_per_kg_cents)
        )

        setAvailable(product.is_available ?? true)
        // map over weight options to create shallow copies so edits don't mutate the originals
        setWeightOpts(product.product_weight_options?.map(o => ({ ...o })) ?? [])
        setImagePreview(product.image_url ?? null)
        setExistingImageUrl(product.image_url ?? null)
        // set loaded to true so the skeleton is replaced with the real form
        setLoaded(true)
      })
      .catch(() => setLoadError('Failed to load product.'))
  }, [id])

  // handleImageChange is called when the admin selects a new image file
  // e.target.files?.[0] gets the first selected file, the ?. prevents crashing if no file was selected
  // URL.createObjectURL creates a temporary local URL for the browser to preview the image
  // without uploading it yet
  const handleImageChange = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // addWeightOpt adds a new empty weight option row to the weightOpts array
  // Date.now() is used as a temporary id (_tempId) so React has a unique key for the row
  // before it gets a real database id after saving
  const addWeightOpt = () => {
    setWeightOpts(o => [
      ...o,
      { _tempId: Date.now(), label: '', min_weight_kg: '', max_weight_kg: '' },
    ])
  }

  // updateOpt updates a single weight option row at index i with the updated object
  // .map() loops over all rows -- if the index matches i, replace with updated, otherwise keep the original
  const updateOpt = (i, updated) => {
    setWeightOpts(o => o.map((opt, idx) => (idx === i ? updated : opt)))
  }

  // removeOpt removes the weight option row at index i
  // .filter() keeps all rows except the one at index i
  // _ is the row value (ignored), idx is the index
  const removeOpt = i => {
    setWeightOpts(o => o.filter((_, idx) => idx !== i))
  }

  // handleSave validates the form, uploads a new image if one was selected,
  // then sends a PATCH request to /api/admin/products/[id] to save all changes
  const handleSave = async () => {
    setSaveError('')
    setSaveSuccess('')

    // basic validation -- name and price are required before we call the API
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
      // start with the existing image URL, only replace it if a new file was selected
      let image_url = existingImageUrl

      if (imageFile) {
        // build a unique file path using the product id and current timestamp
        // .split('.').pop() extracts the file extension e.g. 'jpg' from 'photo.jpg'
        const ext = imageFile.name.split('.').pop()
        const path = `products/${id}-${Date.now()}.${ext}`

        // upload the image to the store_asset bucket in Supabase Storage
        // upsert: true means it will overwrite if a file already exists at that path
        const { error: uploadError } = await supabase.storage
          .from('store_asset')
          .upload(path, imageFile, { upsert: true })

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }

        // get the public URL of the uploaded image to store in the database
        const { data: urlData } = supabase.storage
          .from('store_asset')
          .getPublicUrl(path)

        image_url = urlData.publicUrl
      }

      // if the admin clicked Remove image, imagePreview will be null
      // so set image_url to null to clear it in the database
      if (!imagePreview) image_url = null

      // payload is the object sent to the API with all updated product fields
      // price_cents is set for FIXED products, price_per_kg_cents for WEIGHT_RANGE, the other is 0
      // weight_options is only included for WEIGHT_RANGE products
      // for each weight option, only include id if it already exists (existing rows have an id, new rows don't)
      // parseFloat converts min_weight_kg and max_weight_kg from strings back to numbers for the database
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        product_type: type,
        price_cents: type === 'FIXED' ? dollarsToCents(price) : 0,
        price_per_kg_cents: type === 'WEIGHT_RANGE' ? dollarsToCents(price) : 0,
        is_available: available,
        image_url,
        weight_options:
          type === 'WEIGHT_RANGE'
            ? weightOpts.map(o => ({
                // only spread id if it exists -- new rows don't have an id yet
                ...(o.id ? { id: o.id } : {}),
                label: o.label,
                min_weight_kg: parseFloat(o.min_weight_kg),
                max_weight_kg: parseFloat(o.max_weight_kg),
              }))
            : [],
      }

      // send PATCH request with the payload as JSON body
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
      // clear the staged image file since it has now been uploaded
      setImageFile(null)
      // update existingImageUrl with the new URL returned from the API
      setExistingImageUrl(data.product.image_url)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // handleDelete sends a DELETE request to /api/admin/products/[id]
  // on success, navigates back to the products list
  // on failure, shows the error and closes the modal
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

  // loadError state -- shown if the initial product fetch failed
  if (loadError) {
    return (
      <div style={{ ...pageSt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '10px', padding: '24px 32px', color: '#B91C1C', fontSize: '15px' }}>
          {loadError}
        </div>
      </div>
    )
  }

  // show skeleton while product data is still loading
  if (!loaded) {
    return <LoadingSkeleton />
  }

  return (
    <div style={pageSt}>
      <div style={containerSt}>

        {/* Back button -- router.back() goes to the previous page in browser history */}
        <button
          type="button"
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: COLOR.red, fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: '"Lato", sans-serif', marginBottom: '20px', padding: 0, letterSpacing: '.02em' }}
        >
          Back to Products
        </button>

        {/* Header row -- page title on the left, Delete Product button on the right
            clicking Delete Product sets showDelete to true which renders the DeleteModal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '18px', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: '"Lato", serif', fontSize: '36px', fontWeight: 700, color: COLOR.red, margin: 0 }}>
            Edit Product
          </h1>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            style={{ padding: '12px 24px', background: 'transparent', border: `1.5px solid #B91C1C`, borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#B91C1C', cursor: 'pointer', fontFamily: '"Lato", sans-serif', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.background = COLOR.redLight }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            Delete Product
          </button>
        </div>

        {/* Gold divider line below the header */}
        <div style={{ height: '1px', background: COLOR.gold, marginBottom: '26px' }} />

        {/* Error banner -- shown if save or delete failed */}
        {saveError && (
          <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '18px', fontSize: '14px', color: '#B91C1C' }}>
            {saveError}
          </div>
        )}

        {/* Success banner -- shown after a successful save */}
        {saveSuccess && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px 16px', marginBottom: '18px', fontSize: '14px', color: '#15803D' }}>
            {saveSuccess}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* PRODUCT IMAGE CARD
              Change Image button triggers a hidden file input (img-input-edit)
              using document.getElementById and .click() to open the file picker
              image preview shows the current image or a placeholder if none exists
              Remove image button clears both imageFile and imagePreview */}
          <section style={cardSt}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: COLOR.text, margin: 0 }}>Product Image</h2>
              <button
                type="button"
                onClick={() => document.getElementById('img-input-edit')?.click()}
                style={{ padding: '9px 16px', background: COLOR.red, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: COLOR.white, cursor: 'pointer', fontFamily: '"Lato", sans-serif' }}
                onMouseEnter={e => { e.currentTarget.style.background = COLOR.redDark }}
                onMouseLeave={e => { e.currentTarget.style.background = COLOR.red }}
              >
                Change Image
              </button>
            </div>

            {/* Image preview container -- fixed height 600px
                overflow hidden clips the image inside the rounded corners
                shows imagePreview if available, otherwise shows a placeholder emoji */}
            <div style={{ width: '100%', height: '600px', borderRadius: '10px', overflow: 'hidden', background: '#F5EDD8', border: `1px solid ${COLOR.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Product preview" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '34px', marginBottom: '8px' }}>🖼️</div>
                  <p style={{ margin: 0, color: COLOR.muted, fontSize: '14px' }}>No product image uploaded</p>
                </div>
              )}
            </div>

            {/* Hidden file input -- triggered by the Change Image button above
                accept="image/*" restricts selection to image files only */}
            <input
              id="img-input-edit"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />

            {/* Remove image button -- only shown if there is a current image preview */}
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                style={{ marginTop: '10px', background: 'none', border: 'none', color: '#B91C1C', fontSize: '14px', cursor: 'pointer', padding: 0, fontWeight: 700 }}
              >
                Remove image
              </button>
            )}
          </section>

          {/* PRODUCT DETAILS CARD
              grid 1.2fr 1fr splits name and price into two columns, name column is slightly wider
              description is a textarea with resize vertical so admin can drag it taller
              spread (...inputSt) copies all inputSt styles then adds minHeight and resize on top
              category and type are dropdowns in a 1fr 1fr two column grid
              availability is a checkbox -- accentColor applies the brand red to the checkbox tick */}
          <section style={cardSt}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: COLOR.text, margin: '0 0 4px' }}>Product Details</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelSt}>Product Name *</label>
                <input style={inputSt} value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                {/* label text changes based on type -- FIXED shows per box, WEIGHT_RANGE shows per kg */}
                <label style={labelSt}>
                  {type === 'FIXED' ? 'Price per Box ($) *' : 'Price per kg ($) *'}
                </label>
                <input style={inputSt} type="number" min="0" step="0.01" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
            </div>

            <label style={labelSt}>Description</label>
            <textarea
              style={{ ...inputSt, minHeight: '95px', resize: 'vertical', lineHeight: 1.6 }}
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

            {/* Availability checkbox row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '18px', padding: '12px 14px', background: COLOR.sidebar, borderRadius: '10px', border: `1px solid ${COLOR.border}` }}>
              <input
                type="checkbox"
                id="avail"
                checked={available}
                onChange={e => setAvailable(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: COLOR.red }}
              />
              <label htmlFor="avail" style={{ fontSize: '14px', color: COLOR.text, cursor: 'pointer', fontWeight: 700 }}>
                Available for ordering
              </label>
            </div>
          </section>

          {/* WEIGHT OPTIONS CARD -- only rendered when type is WEIGHT_RANGE
              addWeightOpt adds a new empty row
              column headers rendered from an array using .map()
              empty string at the end is for the remove button column which has no header
              WeightRow key uses opt.id if it exists (saved row), opt._tempId if it is new,
              falling back to index i as last resort */}
          {type === 'WEIGHT_RANGE' && (
            <section style={cardSt}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: COLOR.text, margin: 0 }}>Weight Options</h2>
                <button
                  type="button"
                  onClick={addWeightOpt}
                  style={{ background: COLOR.red, border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '14px', color: COLOR.white, cursor: 'pointer', fontWeight: 700, fontFamily: '"Lato", sans-serif', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { e.currentTarget.style.background = COLOR.redDark }}
                  onMouseLeave={e => { e.currentTarget.style.background = COLOR.red }}
                >
                  + Add Option
                </button>
              </div>

              {/* Column headers -- only shown if there is at least one weight option row */}
              {weightOpts.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr auto', gap: '12px', marginBottom: '8px', padding: '0 2px' }}>
                  {['Label', 'Min kg', 'Max kg', ''].map((h, i) => (
                    <span key={i} style={{ fontSize: '11px', color: COLOR.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {h}
                    </span>
                  ))}
                </div>
              )}

              {/* Empty state -- shown when no weight options have been added yet */}
              {weightOpts.length === 0 ? (
                <p style={{ color: COLOR.muted, fontSize: '14px', margin: 0, padding: '16px', background: COLOR.sidebar, borderRadius: '10px', border: `1px dashed ${COLOR.border}` }}>
                  No weight options added yet. Click "+ Add Option" to create one.
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

        {/* FOOTER BUTTONS
            Cancel goes back to previous page without saving
            Save Changes calls handleSave
            while saving is true, button turns grey and shows Saving, cursor is not-allowed
            onMouseEnter and onMouseLeave only fire hover styles when not saving */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ padding: '11px 24px', background: 'none', border: `1.5px solid ${COLOR.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: COLOR.muted, cursor: 'pointer', fontFamily: '"Lato", sans-serif' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '11px 32px', background: saving ? '#A0A0A0' : COLOR.red, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: COLOR.white, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: '"Lato", sans-serif' }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = COLOR.redDark }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = COLOR.red }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* DeleteModal -- only renders when showDelete is true
          passes the product name, confirm and cancel handlers, and deleting state */}
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