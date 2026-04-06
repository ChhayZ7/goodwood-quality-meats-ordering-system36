'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

const TABLES = ['users', 'products', 'product_weight_options', 'orders', 'order_items', 'payments', 'inventory', 'notifications']

const TABLE_FIELDS = {
  users: [
    { name: 'first_name', label: 'First name', type: 'text', required: false },
    { name: 'last_name', label: 'Last name', type: 'text', required: false },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'select', options: ['customer', 'staff', 'owner'], required: false },
  ],
  products: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'product_type', label: 'Product type', type: 'text', required: false },
    { name: 'price_cents', label: 'Price (cents)', type: 'number', required: true },
    { name: 'price_per_kg_cents', label: 'Price per kg (cents)', type: 'number', required: false },
    { name: 'is_price_estimate', label: 'Is price estimate', type: 'checkbox', required: false },
    { name: 'is_available', label: 'Is available', type: 'checkbox', required: false },
    { name: 'image_url', label: 'Image URL', type: 'text', required: false },
  ],
  product_weight_options: [
    { name: 'product_id', label: 'Product ID (uuid)', type: 'text', required: true },
    { name: 'min_weight_kg', label: 'Min weight (kg)', type: 'number', required: false },
    { name: 'max_weight_kg', label: 'Max weight (kg)', type: 'number', required: false },
    { name: 'label', label: 'Label', type: 'text', required: false },
  ],
  orders: [
    { name: 'customer_id', label: 'Customer ID (uuid)', type: 'text', required: false },
    { name: 'status', label: 'Status', type: 'select', options: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COLLECTED', 'CANCELLED'], required: false },
    { name: 'pickup_date', label: 'Pickup date', type: 'date', required: false },
    { name: 'notes', label: 'Notes', type: 'textarea', required: false },
    { name: 'total_cents', label: 'Total (cents)', type: 'number', required: false },
    { name: 'deposit_required_cents', label: 'Deposit required (cents)', type: 'number', required: false },
    { name: 'deposit_paid_cents', label: 'Deposit paid (cents)', type: 'number', required: false },
  ],
  order_items: [
    { name: 'order_id', label: 'Order ID (uuid)', type: 'text', required: false },
    { name: 'product_id', label: 'Product ID (uuid)', type: 'text', required: false },
    { name: 'quantity', label: 'Quantity', type: 'number', required: false },
    { name: 'weight_preference', label: 'Weight preference', type: 'text', required: false },
    { name: 'unit_price_cents', label: 'Unit price (cents)', type: 'number', required: false },
    { name: 'subtotal_cents', label: 'Subtotal (cents)', type: 'number', required: false },
    { name: 'notes', label: 'Notes', type: 'textarea', required: false },
  ],
  payments: [
    { name: 'order_id', label: 'Order ID (uuid)', type: 'text', required: false },
    { name: 'stripe_payment_intent_id', label: 'Stripe payment intent ID', type: 'text', required: false },
    { name: 'provider', label: 'Provider', type: 'text', required: false },
    { name: 'amount_cents', label: 'Amount (cents)', type: 'number', required: false },
    { name: 'type', label: 'Type', type: 'text', required: false },
    { name: 'status', label: 'Status', type: 'select', options: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], required: false },
  ],
  inventory: [
    { name: 'product_id', label: 'Product ID (uuid)', type: 'text', required: false },
    { name: 'stock_quantity', label: 'Stock quantity', type: 'number', required: false },
    { name: 'low_stock_threshold', label: 'Low stock threshold', type: 'number', required: false },
  ],
  notifications: [
    { name: 'order_id', label: 'Order ID (uuid)', type: 'text', required: true },
    { name: 'stripe_payment_intent_id', label: 'Stripe payment intent ID', type: 'text', required: false },
    { name: 'provider', label: 'Provider', type: 'text', required: false },
    { name: 'amount_cents', label: 'Amount (cents)', type: 'number', required: false },
    { name: 'type', label: 'Type', type: 'text', required: false },
    { name: 'status', label: 'Status', type: 'select', options: ['PENDING', 'SENT', 'FAILED'], required: false },
  ],
}

const BADGE_COLORS = {
  PENDING: { bg: '#FFF3CD', text: '#856404', border: '#FFEAA7' },
  CONFIRMED: { bg: '#D1ECF1', text: '#0C5460', border: '#BEE5EB' },
  IN_PROGRESS: { bg: '#D4EDDA', text: '#155724', border: '#C3E6CB' },
  READY: { bg: '#CCE5FF', text: '#004085', border: '#B8DAFF' },
  COLLECTED: { bg: '#D6D8D9', text: '#383D41', border: '#C6C8CA' },
  CANCELLED: { bg: '#F8D7DA', text: '#721C24', border: '#F5C6CB' },
  PAID: { bg: '#D4EDDA', text: '#155724', border: '#C3E6CB' },
  FAILED: { bg: '#F8D7DA', text: '#721C24', border: '#F5C6CB' },
  REFUNDED: { bg: '#E2E3E5', text: '#383D41', border: '#D6D8DB' },
  SENT: { bg: '#D4EDDA', text: '#155724', border: '#C3E6CB' },
  customer: { bg: '#E8F4FD', text: '#1A5276', border: '#AED6F1' },
  staff: { bg: '#EBF5FB', text: '#1B4F72', border: '#85C1E9' },
  owner: { bg: '#F4ECF7', text: '#6C3483', border: '#C39BD3' },
}

function Badge({ value }) {
  const colors = BADGE_COLORS[value] || { bg: '#F0F0F0', text: '#555', border: '#DDD' }
  return (
    <span style={{
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.03em',
      fontFamily: 'monospace',
    }}>
      {value}
    </span>
  )
}

function ResultLog({ logs }) {
  if (!logs.length) return null
  return (
    <div style={{
      background: '#0D1117',
      borderRadius: '8px',
      padding: '14px 16px',
      marginTop: '16px',
      fontFamily: 'monospace',
      fontSize: '12px',
      maxHeight: '200px',
      overflowY: 'auto',
      border: '1px solid #30363D',
    }}>
      {logs.map((log, i) => (
        <div key={i} style={{
          marginBottom: '6px',
          color: log.type === 'error' ? '#FF7B72' : log.type === 'success' ? '#3FB950' : '#E6EDF3',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
        }}>
          <span style={{ opacity: 0.5, flexShrink: 0 }}>{log.time}</span>
          <span>{log.message}</span>
        </div>
      ))}
    </div>
  )
}

function FormField({ field, value, onChange }) {
  const base = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    fontSize: '13px',
    fontFamily: 'inherit',
    background: '#F8FAFC',
    color: '#1A202C',
    outline: 'none',
    boxSizing: 'border-box',
  }

  if (field.type === 'checkbox') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
        <input
          type="checkbox"
          checked={value === true || value === 'true'}
          onChange={e => onChange(e.target.checked)}
          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '13px', color: '#64748B' }}>Enabled</span>
      </div>
    )
  }
  if (field.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        rows={2}
        style={{ ...base, resize: 'vertical', minHeight: '60px' }}
        placeholder={`Enter ${field.label.toLowerCase()}...`}
      />
    )
  }
  if (field.type === 'select') {
    return (
      <select value={value || ''} onChange={e => onChange(e.target.value)} style={base}>
        <option value="">— select —</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  return (
    <input
      type={field.type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      style={base}
      placeholder={`Enter ${field.label.toLowerCase()}...`}
    />
  )
}

export default function SupabaseCRUDTest() {
  const [activeTable, setActiveTable] = useState('products')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [formData, setFormData] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const log = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-AU', { hour12: false })
    setLogs(prev => [{ message, type, time }, ...prev].slice(0, 50))
  }

  const fetchRows = async (table) => {
    setLoading(true)
    log(`Fetching all rows from ${table}...`)
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false }).limit(50)
    if (error) {
      log(`Error: ${error.message}`, 'error')
    } else {
      setRows(data || [])
      log(`Fetched ${data?.length ?? 0} rows from ${table}`, 'success')
    }
    setLoading(false)
  }

  useEffect(() => {
    setRows([])
    setFormData({})
    setEditingId(null)
    setShowForm(false)
    fetchRows(activeTable)
  }, [activeTable])

  const handleCreate = async () => {
    log(`Creating new row in ${activeTable}...`)

    const cleanedData = Object.fromEntries(
    Object.entries(formData).filter(([_, v]) => v !== '' && v !== undefined)
    )

    const { data, error } = await supabase.from(activeTable).insert(cleanedData).select().single()
    if (error) {
      log(`Create failed: ${error.message}`, 'error')
    } else {
      log(`Created row ${data.id}`, 'success')
      setFormData({})
      setShowForm(false)
      fetchRows(activeTable)
    }
  }

  const handleUpdate = async () => {
    log(`Updating row ${editingId} in ${activeTable}...`)

    const cleanedData = Object.fromEntries(
    Object.entries(formData).filter(([_, v]) => v !== '' && v !== undefined)
    )

    const { error } = await supabase.from(activeTable).update(cleanedData).eq('id', editingId)
    if (error) {
      log(`Update failed: ${error.message}`, 'error')
    } else {
      log(`Updated row ${editingId}`, 'success')
      setFormData({})
      setEditingId(null)
      setShowForm(false)
      fetchRows(activeTable)
    }
  }

  const handleDelete = async (id) => {
    log(`Deleting row ${id} from ${activeTable}...`)
    const { error } = await supabase.from(activeTable).delete().eq('id', id)
    if (error) {
      log(`Delete failed: ${error.message}`, 'error')
    } else {
      log(`Deleted row ${id}`, 'success')
      setDeleteConfirm(null)
      fetchRows(activeTable)
    }
  }

  const startEdit = (row) => {
    setFormData({ ...row })
    setEditingId(row.id)
    setShowForm(true)
  }

  const startCreate = () => {
    setFormData({})
    setEditingId(null)
    setShowForm(true)
  }

  const cancelForm = () => {
    setFormData({})
    setEditingId(null)
    setShowForm(false)
  }

  const fields = TABLE_FIELDS[activeTable] || []
  const allColumns = rows.length > 0 ? Object.keys(rows[0]) : []
  const STATUS_FIELDS = ['status', 'role']
  const isStatusField = (col) => STATUS_FIELDS.includes(col)

  const btnStyle = (variant) => ({
    padding: variant === 'sm' ? '4px 10px' : '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: variant === 'sm' ? '11px' : '13px',
    fontWeight: 600,
    fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F8FA',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      padding: '24px',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 0 3px #DCFCE7' }} />
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.08em' }}>
              SUPABASE · CRUD TEST PANEL
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Goodwood Quality Meats — DB Test
          </h1>
          <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0' }}>
            Create, read, update and delete records across all tables. Operations hit your live Supabase database.
          </p>
        </div>

        {/* Table selector */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {TABLES.map(t => (
            <button
              key={t}
              onClick={() => setActiveTable(t)}
              style={{
                ...btnStyle('sm'),
                background: activeTable === t ? '#0F172A' : '#fff',
                color: activeTable === t ? '#fff' : '#475569',
                border: `1px solid ${activeTable === t ? '#0F172A' : '#E2E8F0'}`,
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 340px' : '1fr', gap: '16px', alignItems: 'start' }}>

          {/* Table panel */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                  {activeTable}
                </span>
                <span style={{ color: '#94A3B8', fontSize: '12px', marginLeft: '8px' }}>
                  {loading ? 'loading...' : `${rows.length} rows`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => fetchRows(activeTable)}
                  style={{ ...btnStyle('sm'), background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}
                >
                  ↻ Refresh
                </button>
                <button
                  onClick={startCreate}
                  style={{ ...btnStyle('sm'), background: '#0F172A', color: '#fff', border: 'none' }}
                >
                  + New row
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                  Loading...
                </div>
              ) : rows.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                  No rows found. Create one using "+ New row".
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      {allColumns.map(col => (
                        <th key={col} style={{
                          padding: '8px 12px',
                          textAlign: 'left',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          color: '#64748B',
                          fontSize: '11px',
                          borderBottom: '1px solid #F1F5F9',
                          whiteSpace: 'nowrap',
                        }}>
                          {col}
                        </th>
                      ))}
                      <th style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9', minWidth: '100px' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC', background: ri % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                        {allColumns.map(col => (
                          <td key={col} style={{
                            padding: '8px 12px',
                            color: '#1E293B',
                            maxWidth: '180px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontFamily: col === 'id' || col.endsWith('_id') ? 'monospace' : 'inherit',
                            fontSize: col === 'id' || col.endsWith('_id') ? '10px' : '12px',
                            color: col === 'id' || col.endsWith('_id') ? '#94A3B8' : '#1E293B',
                          }}>
                            {row[col] === null || row[col] === undefined ? (
                              <span style={{ color: '#CBD5E1', fontFamily: 'monospace', fontSize: '11px' }}>null</span>
                            ) : typeof row[col] === 'boolean' ? (
                              <Badge value={row[col] ? 'true' : 'false'} />
                            ) : isStatusField(col) && row[col] ? (
                              <Badge value={row[col]} />
                            ) : String(row[col])}
                          </td>
                        ))}
                        <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => startEdit(row)}
                              style={{ ...btnStyle('sm'), background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #DBEAFE' }}
                            >
                              Edit
                            </button>
                            {deleteConfirm === row.id ? (
                              <>
                                <button
                                  onClick={() => handleDelete(row.id)}
                                  style={{ ...btnStyle('sm'), background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  style={{ ...btnStyle('sm'), background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(row.id)}
                                style={{ ...btnStyle('sm'), background: '#FFF1F2', color: '#E11D48', border: '1px solid #FFE4E6' }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Form panel */}
          {showForm && (
            <div style={{
              background: '#fff',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              position: 'sticky',
              top: '24px',
            }}>
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                  {editingId ? 'Edit row' : 'Create row'}
                </span>
                <button
                  onClick={cancelForm}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '16px', padding: '0 4px' }}
                >
                  ×
                </button>
              </div>

              {editingId && (
                <div style={{ padding: '10px 16px', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#94A3B8' }}>
                    id: {editingId}
                  </span>
                </div>
              )}

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {fields.map(field => (
                  <div key={field.name}>
                    <label style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: '4px',
                      fontFamily: 'monospace',
                      letterSpacing: '0.02em',
                    }}>
                      {field.name}
                      {field.required && <span style={{ color: '#E11D48', marginLeft: '2px' }}>*</span>}
                    </label>
                    <FormField
                      field={field}
                      value={formData[field.name]}
                      onChange={val => setFormData(prev => ({ ...prev, [field.name]: val }))}
                    />
                  </div>
                ))}

                <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                  <button
                    onClick={editingId ? handleUpdate : handleCreate}
                    style={{
                      ...btnStyle('md'),
                      flex: 1,
                      background: '#0F172A',
                      color: '#fff',
                    }}
                  >
                    {editingId ? 'Save changes' : 'Create row'}
                  </button>
                  <button
                    onClick={cancelForm}
                    style={{
                      ...btnStyle('md'),
                      background: '#F1F5F9',
                      color: '#475569',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Log panel */}
        <ResultLog logs={logs} />

        <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '12px', fontFamily: 'monospace' }}>
          ⚠ This page hits your live database. Do not use in production. Remove before deploying.
        </p>
      </div>
    </div>
  )
}