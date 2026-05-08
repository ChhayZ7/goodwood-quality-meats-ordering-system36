'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Shared styles
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

const selectSt = { ...inputSt, cursor: 'pointer' }

const CATEGORIES = ['Beef', 'Pork', 'Lamb', 'Poultry', 'Seafood', 'Other']

// Utility functions
function centsToDollars(cents){
    return (cents / 100).toFixed(2)
}
function dollarsToCents(str){
    return Math.round(parseFloat(str) * 100)
}
function priceDisplay(product){
    if (product.product_type === 'FIXED'){
        return '$' + centsToDollars(product.price_cents) + '/box'
    }
    return '$' + centsToDollars(product.price_per_kg_cents) + '/kg'
}
function typeLabel(type){
    return type === 'FIXED' ? 'Fixed Price' : 'Weight-based'
}

// Modal backdrop
function Backdrop({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 100,
      }}
    />
  )
}
 
// Weight option row
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
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', fontSize: '18px', lineHeight: 1, padding: '4px' }}
      >×</button>
    </div>
  )
}
 
// Product form (shared between Add + Edit)
function ProductForm({ initial, onSave, onCancel, saving, error }) {
  const isEdit = !!initial?.id
 
  const [name,        setName]        = useState(initial?.name        ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category,    setCategory]    = useState(initial?.category    ?? 'Beef')
  const [type,        setType]        = useState(initial?.product_type ?? 'WEIGHT_RANGE')
  const [price,       setPrice]       = useState(
    initial
      ? centsToDollars(initial.product_type === 'FIXED' ? initial.price_cents : initial.price_per_kg_cents)
      : ''
  )
  const [available,   setAvailable]   = useState(initial?.is_available ?? true)
  const [weightOpts,  setWeightOpts]  = useState(
    initial?.product_weight_options?.map(o => ({ ...o })) ?? []
  )
 
  function addWeightOpt() {
    setWeightOpts(prev => [...prev, { _tempId: Date.now(), label: '', min_weight_kg: '', max_weight_kg: '' }])
  }
  function updateOpt(idx, updated) {
    setWeightOpts(prev => prev.map((o, i) => i === idx ? updated : o))
  }
  function removeOpt(idx) {
    setWeightOpts(prev => prev.filter((_, i) => i !== idx))
  }
 
  function buildPayload() {
    const base = {
      name,
      description,
      category,
      product_type: type,
      is_available: available,
    }
    if (type === 'FIXED') {
      base.price_cents         = dollarsToCents(price)
      base.price_per_kg_cents  = 0
    } else {
      base.price_per_kg_cents  = dollarsToCents(price)
      base.price_cents         = 0
      base.weight_options      = weightOpts.map(o => ({
        id:             o.id,   // undefined for new rows → backend creates
        label:          o.label,
        min_weight_kg:  parseFloat(o.min_weight_kg),
        max_weight_kg:  parseFloat(o.max_weight_kg),
      }))
    }
    return base
  }
 
  return (
    <div>
      {/* Name */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelSt}>Product Name *</label>
        <input style={inputSt} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Boneless Ham" />
      </div>
 
      {/* Description */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelSt}>Description</label>
        <textarea
          style={{ ...inputSt, minHeight: '72px', resize: 'vertical' }}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Short description shown on the product page"
        />
      </div>
 
      {/* Category + Type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelSt}>Category *</label>
          <select style={selectSt} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelSt}>Type *</label>
          <select style={selectSt} value={type} onChange={e => setType(e.target.value)}>
            <option value="FIXED">Fixed Price</option>
            <option value="WEIGHT_RANGE">Weight-based</option>
          </select>
        </div>
      </div>
 
      {/* Price */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelSt}>{type === 'FIXED' ? 'Price per Box ($) *' : 'Price per kg ($) *'}</label>
        <input
          style={inputSt}
          type="number" min="0" step="0.01"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="0.00"
        />
      </div>
 
      {/* Weight options */}
      {type === 'WEIGHT_RANGE' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={labelSt}>Weight Options</label>
          {weightOpts.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginBottom: '6px' }}>
              {['Label', 'Min kg', 'Max kg', ''].map(h => (
                <span key={h} style={{ fontSize: '11px', color: COLOR.muted, fontWeight: 700, textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
          )}
          {weightOpts.map((opt, i) => (
            <WeightRow
              key={opt.id ?? opt._tempId}
              opt={opt}
              onChange={updated => updateOpt(i, updated)}
              onRemove={() => removeOpt(i)}
            />
          ))}
          <button
            onClick={addWeightOpt}
            style={{
              background: 'none', border: `1.5px dashed ${COLOR.border}`,
              borderRadius: '8px', padding: '8px 16px',
              fontSize: '13px', color: COLOR.red, cursor: 'pointer',
              fontFamily: '"Lato", sans-serif', fontWeight: 700, marginTop: '4px',
            }}
          >
            + Add Weight Option
          </button>
        </div>
      )}
 
      {/* Availability */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
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
 
      {error && (
        <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', marginBottom: '16px' }}>
          {error}
        </div>
      )}
 
      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{ padding: '10px 20px', background: 'none', border: `1.5px solid ${COLOR.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: COLOR.muted, cursor: 'pointer', fontFamily: '"Lato", sans-serif' }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(buildPayload())}
          disabled={saving}
          style={{ padding: '10px 24px', background: saving ? '#C9A08A' : COLOR.red, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: COLOR.white, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: '"Lato", sans-serif' }}
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
        </button>
      </div>
    </div>
  )
}
 
// Edit modal
function EditModal({ product, onClose, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)
 
  async function handleSave(payload) {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update product')
      onSaved(data.product)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
 
  return (
    <>
      <Backdrop onClose={onClose} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: COLOR.white, borderRadius: '14px',
        padding: '32px', width: '560px', maxWidth: '95vw',
        maxHeight: '90vh', overflowY: 'auto',
        zIndex: 101, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', fontWeight: 700, color: COLOR.text, margin: 0 }}>
            Edit Product
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: COLOR.muted, lineHeight: 1 }}>×</button>
        </div>
        <ProductForm initial={product} onSave={handleSave} onCancel={onClose} saving={saving} error={error} />
      </div>
    </>
  )
}
 
// Add modal
function AddModal({ onClose, onAdded }) {
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)
 
  async function handleSave(payload) {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create product')
      onAdded(data.product)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
 
  return (
    <>
      <Backdrop onClose={onClose} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: COLOR.white, borderRadius: '14px',
        padding: '32px', width: '560px', maxWidth: '95vw',
        maxHeight: '90vh', overflowY: 'auto',
        zIndex: 101, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', fontWeight: 700, color: COLOR.text, margin: 0 }}>
            Add New Product
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: COLOR.muted, lineHeight: 1 }}>×</button>
        </div>
        <ProductForm initial={null} onSave={handleSave} onCancel={onClose} saving={saving} error={error} />
      </div>
    </>
  )
}
 
// Sidebar
// function Sidebar({ adminName }) {
//   const router = useRouter()
//   const links = [
//     { label: 'Orders',              href: '/admin/orders' },
//     { label: 'Inventory',           href: '/admin/inventory' },
//     { label: 'Products & Pricing',  href: '/admin/products', active: true },
//     { label: 'Staff Management',    href: '/admin/staff' },
//     { label: 'Reports',             href: '/admin/reports' },
//     { label: 'Feedback',            href: '/admin/feedback' },
//     { label: 'My Account',          href: '/admin/account' },
//   ]

//   async function handleLogout() {
//     await fetch('/api/auth/signout', { method: 'POST' })
//     router.replace('/login')
//   }

//   return (
//     <aside style={{
//       width: '260px', minHeight: '100vh', background: COLOR.sidebar,
//       borderRight: `1px solid ${COLOR.border}`,
//       display: 'flex', flexDirection: 'column',
//       padding: '32px 0', flexShrink: 0,
//       position: 'sticky', top: 0, alignSelf: 'flex-start', height: '100vh',
//     }}>
//       {/* Greeting */}
//       <p style={{ fontSize: '15px', color: COLOR.muted, padding: '0 28px', marginBottom: '28px' }}>
//         Hi, {adminName}
//       </p>

//       {/* Nav links */}
//       <nav style={{ flex: 1 }}>
//         {links.map(link => (
//           <a
//             key={link.href}
//             href={link.href}
//             style={{
//               display: 'block',
//               padding: '13px 28px',
//               fontSize: '15px',
//               fontFamily: '"Lato", sans-serif',
//               fontWeight: link.active ? 700 : 400,
//               color: link.active ? COLOR.white : COLOR.text,
//               background: link.active ? COLOR.red : 'transparent',
//               borderRadius: link.active ? '0' : '0',
//               textDecoration: 'none',
//               transition: 'background .12s',
//             }}
//             onMouseEnter={e => { if (!link.active) e.currentTarget.style.background = '#EDE5CC' }}
//             onMouseLeave={e => { if (!link.active) e.currentTarget.style.background = 'transparent' }}
//           >
//             {link.label}
//           </a>
//         ))}
//       </nav>

//       {/* Bottom actions */}
//       <div style={{ padding: '0 28px', borderTop: `1px solid ${COLOR.border}`, paddingTop: '20px', marginTop: '16px' }}>
//         <button
//           onClick={handleLogout}
//           style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', fontSize: '15px', color: COLOR.text, cursor: 'pointer', fontFamily: '"Lato", sans-serif', marginBottom: '16px', padding: 0 }}
//         >
//           ↪ Log Out
//         </button>
//         <a
//           href="/"
//           style={{ fontSize: '14px', color: COLOR.red, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
//         >
//           ← Back to Home
//         </a>
//       </div>
//     </aside>
//   )
// }
 
// Main page
export default function AdminProductsPage() {
  const router = useRouter()
 
  const [products,    setProducts]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [fetchError,  setFetchError]  = useState(null)
  const [editProduct, setEditProduct] = useState(null)   // product being edited
  const [showAdd,     setShowAdd]     = useState(false)
  const [adminName,   setAdminName]   = useState('David')
 
  // Load products
  const loadProducts = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load products')
      setProducts(data.products)
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])
 
  useEffect(() => { loadProducts() }, [loadProducts])
 
  // Optimistic updates after save/add
  function handleSaved(updated) {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
    setEditProduct(null)
  }
  function handleAdded(newProduct) {
    setProducts(prev => [...prev, newProduct])
    setShowAdd(false)
  }
 
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLOR.cream, fontFamily: '"Lato", sans-serif' }}>
      {/* <Sidebar adminName={adminName} /> */}
 
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '36px', fontWeight: 700, color: COLOR.red, margin: 0 }}>
            Products &amp; Pricing
          </h1>
        </div>
 
        {/* Gold divider */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`, marginBottom: '32px', borderRadius: '1px' }} />
 
        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: COLOR.muted, fontSize: '15px' }}>
            Loading products…
          </div>
        )}
 
        {/* Error */}
        {fetchError && (
          <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '10px', padding: '16px 20px', color: '#B91C1C', fontSize: '14px', marginBottom: '24px' }}>
            {fetchError} — <button onClick={loadProducts} style={{ background: 'none', border: 'none', color: COLOR.red, cursor: 'pointer', textDecoration: 'underline', fontSize: '14px', padding: 0 }}>retry</button>
          </div>
        )}
 
        {/* Table */}
        {!loading && !fetchError && (
          <div style={{ background: COLOR.white, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
              padding: '14px 28px',
              borderBottom: `2px solid ${COLOR.border}`,
            }}>
              {['Product Name', 'Category', 'Type', 'Current Price', 'Actions'].map((h, i) => (
                <span key={h} style={{
                  fontSize: '13px', fontWeight: 700, color: COLOR.muted,
                  textTransform: 'uppercase', letterSpacing: '.06em',
                  textAlign: i === 4 ? 'center' : 'left',
                }}>
                  {h}
                </span>
              ))}
            </div>
 
            {/* Rows */}
            {products.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: COLOR.muted, fontSize: '14px' }}>
                No products yet. Add your first one below.
              </div>
            ) : (
              products.map((product, idx) => (
                <div
                  key={product.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
                    padding: '18px 28px',
                    borderBottom: idx < products.length - 1 ? `1px solid ${COLOR.border}` : 'none',
                    alignItems: 'center',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FDFAF3'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Name */}
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: COLOR.text }}>
                      {product.name}
                    </span>
                    {!product.is_available && (
                      <span style={{
                        marginLeft: '10px', fontSize: '11px', fontWeight: 700,
                        background: '#F3F4F6', color: COLOR.muted,
                        padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase',
                      }}>
                        Unavailable
                      </span>
                    )}
                  </div>
 
                  {/* Category */}
                  <span style={{ fontSize: '14px', color: COLOR.muted }}>{product.category}</span>
 
                  {/* Type */}
                  <span style={{ fontSize: '14px', color: COLOR.muted }}>{typeLabel(product.product_type)}</span>
 
                  {/* Price */}
                  <span style={{ fontSize: '15px', fontWeight: 600, color: COLOR.text }}>{priceDisplay(product)}</span>
 
                  {/* Edit button */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => setEditProduct(product)}
                      style={{
                        padding: '7px 20px',
                        border: `1.5px solid ${COLOR.red}`,
                        borderRadius: '8px',
                        background: 'transparent',
                        color: COLOR.red,
                        fontSize: '13px',
                        fontWeight: 700,
                        fontFamily: '"Lato", sans-serif',
                        cursor: 'pointer',
                        transition: 'all .12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = COLOR.red; e.currentTarget.style.color = COLOR.white }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLOR.red }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
 
        {/* Add New Product button */}
        {!loading && !fetchError && (
          <div style={{ marginTop: '28px' }}>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                padding: '14px 32px',
                background: COLOR.red,
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                fontFamily: '"Lato", sans-serif',
                color: COLOR.white,
                cursor: 'pointer',
                transition: 'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#5C1212'}
              onMouseLeave={e => e.currentTarget.style.background = COLOR.red}
            >
              + Add New Product
            </button>
          </div>
        )}
      </main>
 
      {/* Modals */}
      {editProduct && (
        <EditModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSaved={handleSaved}
        />
      )}
      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  )
}