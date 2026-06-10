'use client'

// This page needs to be a Client Component because it uses state, effects,
// search input changes, admin edit inputs, and save button events
// Reference - https://nextjs.org/docs/app/api-reference/directives/use-client

import { useState, useEffect, useCallback } from 'react'
// useState is used for data that changes on the page, such as inventory,
// loading, errors, search text, and admin edits.
// useEffect is used to load the inventory when the page first opens.
// useCallback is used so loadInventory does not get recreated on every render.
// References used:
// https://react.dev/reference/react/useState
// https://react.dev/reference/react/useEffect
// https://react.dev/reference/react/useCallback

import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'
import SearchInput from '@/components/dashboard/SearchInput'

const LOW_STOCK = 5 //constant to declare that any item with 5 or lower units is considered as low stock

// These colours are used for the category badges in the inventory table.
// It keeps category styling consistent across admin and staff views
const CATEGORY_COLOURS = {
    Pork: { bg: '#FEE2E2', color: '#991B1B' },
    Beef: { bg: '#FEF3C7', color: '#92400E' },
    Lamb: { bg: '#DCFCE7', color: '#166534' },
    Poultry: { bg: '#DBEAFE', color: '#1E40AF' },
    Seafood: { bg: '#F3E8FF', color: '#7C3AED' },
    Other: { bg: '#F3F4F6', color: '#6B7280' },
}

// role decides how the page behaves. ADMIN can edit and save stock. STAFF can only view stock.
export default function InventoryPage({ role }) {
    const isAdmin = role === 'ADMIN' //true when a page's role = admin, false when role is not admin

    const [inventory, setInventory] = useState([]) //full list of inventory items returned from the API
    const [loading, setLoading] = useState(true) // Shows skeleton rows while the inventory is loading.
    const [fetchError, setFetchError] = useState(null) //stores error message if fetch fails

    //tracks unsaved stock changes, when admin has typed in but not saved yet, start as an empty object as no edits have been made yet
    // AI was used to help structure this object-based edit tracking
    const [edits, setEdits] = useState({})

    const [saving, setSaving] = useState(false) // currently false, true when saving edit changes to the API
    const [saveError, setSaveError] = useState(null) //stores error message if saving stock chnage is failed
    const [searchQuery, setSearchQuery] = useState('') //current vakue typed in the search box

    // Loads inventory from the API.
    // useCallback is used here because this function is also used inside useEffect
    // and by the retry button. This helps avoid unnecessary re-creation of the function.
    // AI was used in this part to avoid a possible useEffect dependency loop.
    // References used:
    // https://react.dev/reference/react/useCallback
    // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
    const loadInventory = useCallback(async () => {
        setLoading(true) //show skeleton while loading
        setFetchError(null) //clear any previous error before retrying
        try {
            const res = await fetch('/api/admin/inventory') //fetch inventory from the API
            const data = await res.json() //parse the JSON response
            if (!res.ok) throw new Error(data.error || 'Failed to load inventory') //throw if the server returned an error
            setInventory(data.inventory) //store the inventory list in state
            setEdits({}) //clear any pending edit when data is refreshed
        } catch (err) {
            setFetchError(err.message) //if catch error, show message on screen
        } finally {
            setLoading(false) //lastly, always stop the loading state whether it succeed or failed
        }
    }, [])

    useEffect(() => { loadInventory() }, [loadInventory]) //fetch the inventory when the component first loads

    //use when admin type a new number into a stock input field
    //2 parameters taken are the id of the item in inventory and the new value that just typed in
    function handleEdit(inventoryId, typedValue) {
        //if the field is empty, keep it empty so the input does not jump to 0 while typing
        // This feels better than instantly forcing it back to 0.
        if (typedValue === '') {
            setEdits(previousEdits => ({ ...previousEdits, [inventoryId]: '' }))
            return
        }
        // Convert the typed string into a whole number.
        // AI was used to help keep this input conversion simple and safe
        // Reference - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
        let value = parseInt(typedValue, 10) || 0

        // Stock should not be negative, so force the minimum value to 0
        if (value < 0) value = 0

        // Save this edit without removing other unsaved edits
        setEdits(previousEdits => ({ ...previousEdits, [inventoryId]: value }))

    }

    // changedItems contains only the rows that admin has actually changed.
    // This prevents sending unchanged inventory rows to the API.
    // AI was used here to help compare the edited value with the saved value.
    // Reference - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    const changedItems = inventory.filter(item => {
        const edited = edits[item.id]
        // The item counts as changed only if:
        // 1. it has been edited,
        // 2. it is not an empty input,
        // 3. the edited value is different from the saved stock value.
        return edited !== undefined && edited !== '' && edited !== item.stock_quantity
        //only item that pass all 3 conditions get added to changedItems
    })


    // Counts low stock items but excludes items that are completely sold out. This is used for the low stock warning badge.
    const lowCount = inventory.filter(item => {
        const isNotSoldOut = item.stock_quantity > 0 //this is to exclude the item that is out of stock
        const isLowOnStock = item.stock_quantity <= LOW_STOCK //and check if stock is at or below the low stock threshold which is 5 as declared above
        return isNotSoldOut && isLowOnStock //only count items that are low but now sold out
    }).length //count how many items are left in the filtered list, if there are 3 low stock items, return 3

    // Filters inventory by the search text.
    // Both admin and staff use this filtered list, so search works for both roles.
    // Reference - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
    const filteredInventory = inventory.filter(item =>
        item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )


    async function handleSave() {
        if (changedItems.length === 0) return //if there is nothing to save, exit early and do not call the API
        // This is a safety limit so a huge accidental update is not sent at once
        if (changedItems.length > 50) {
            setSaveError('Too many changes at once. Please save in smaller batches.');
            return
        }
        setSaving(true) //set Saving to true to disable the save button when save and show "Saving..."
        setSaveError(null) //clear previous save error

        // Convert changed rows into the format expected by the PATCH API.
        // AI was used here to help shape the request body from changedItems.
        // References used:
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
        // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
        const updates = changedItems.map(item => ({ inventory_id: item.id, stock_quantity: Number(edits[item.id]) }))
        try {
            const res = await fetch('/api/admin/inventory', {
                // PATCH is used because only stock quantities are being updated, not the whole inventory resource.
                // Reference used:
                // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates), //send the array of changes 
            })
            const data = await res.json()

            // 207 means partial success, so it is not treated as a full failure here
            // Reference - https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/207
            if (!res.ok && res.status !== 207) throw new Error(data.error || 'Failed to save')

            // If some rows failed but others succeeded, show a warning message.
            if (data.failures?.length > 0) setSaveError(`${data.failures.length} item(s) failed to update.`)

            // Update local inventory with saved values returned by the API.
            // AI was used here to help update only the rows that were saved.
            setInventory(prev => prev.map(item => {
                const saved = data.updated?.find(u => u.id === item.id) //find this item in the API's list of saved items
                return saved ? { ...item, stock_quantity: saved.stock_quantity } : item //replace stock quantity if it was saved
            }))
            setEdits({}) // Clear all unsaved edits after the save finishes.
        } catch (err) {
            setSaveError(err.message) //show error if the entire request failed
        } finally {
            setSaving(false) //enable the save button again 
        }
    }

    //function to discard all unsaved edits without saving and to clear any save errors.
    function handleCancel() { setEdits({}); setSaveError(null) }

    // Table layout configuration. Keeping this in constants makes the table header, skeleton, and rows match.
    const COLS = '1fr 140px 200px 120px'
    const HEADERS = ['Product Name', 'Category', 'Stock Quantity', 'Status']

    //main page layout
    return (
        <PageWrapper>
            <PageHeader title="Inventory Management" />

            {/* Search bar is shown to both admin and staff */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <SearchInput value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." width="min(400px, 100%)" />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ padding: '9px 18px', background: 'transparent', color: '#6B7280', border: '1.5px solid #CCCCCC', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: '"Lato",sans-serif', whiteSpace: 'nowrap' }}>
                        Clear Search
                    </button>
                )}
            </div>

            {/* Staff-only read-only notice. Admin does not need this notice because admin can edit. */}
            {!isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#F0E8D0', border: '1px solid #E8D48A', marginBottom: '20px', width: 'fit-content' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7B1A1A" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#7B1A1A' }}>Read only! Please contact an admin to update stock levels</span>
                </div>
            )}

            {/* Low stock badge. It appears only after loading and only if low stock items exist. */}
            {!loading && lowCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', background: '#FEE2E2', border: '1px solid #FECACA', marginBottom: '20px', width: 'fit-content' }}>
                    {/* Go through lsit and add badge on item that is low stock*/}
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>{lowCount} item{lowCount > 1 ? 's' : ''} low on stock</span>
                </div>
            )}

            {/* Fetch error message with retry button */}
            {fetchError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#B91C1C', marginBottom: '20px' }}>
                    {fetchError} —{' '}
                    <button onClick={loadInventory} style={{ background: 'none', border: 'none', color: '#7B1A1A', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', padding: 0 }}>retry</button>
                </div>
            )}
            {/* Save error message*/}
            {saveError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#B91C1C', marginBottom: '20px' }}>
                    {saveError}
                </div>
            )}

            {/* Inventory table */}
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', minWidth: '480px' }}>

                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '12px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {HEADERS.map(h => (
                        <span key={h} style={{ fontFamily: '"Lato",sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>
                    ))}
                </div>

                {/* Skeleton rows shown while data is loading. */}
                {/* This avoids showing an empty table while the API request is still running. */}
                {loading && Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '15px 20px', borderBottom: i < 6 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>
                        <div style={{ width: '160px', height: '14px', background: '#F0E8D0', borderRadius: '4px' }} />
                        <div style={{ width: '68px', height: '22px', background: '#F3F4F6', borderRadius: '12px' }} />
                        {isAdmin
                            ? <input disabled placeholder="0" style={{ width: '80px', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '6px', fontSize: '14px', color: '#D1D5DB', background: '#F9FAFB', cursor: 'not-allowed' }} />
                            : <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#D1D5DB' }}>-</span>
                        }
                        <div style={{ width: '60px', height: '14px', background: '#F3F4F6', borderRadius: '4px' }} />
                    </div>
                ))}

                {/* Empty state shown when there are no matching search results. */}
                {!loading && filteredInventory.length === 0 && (
                    <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#7B1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(123,26,26,0.25)' }}>
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
                            </svg>
                        </div>
                        <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '18px', fontWeight: 700, color: '#7B1A1A', margin: 0 }}>No products found</p>
                        <p style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#9CA3AF', margin: 0, maxWidth: '300px', lineHeight: 1.6 }}>
                            Couldn't find anything matching "{searchQuery}".
                        </p>
                    </div>
                )}

                {/* Data rows for both admin and staff. */}
                {/* Reference - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map */}
                {!loading && filteredInventory.map((item, i) => {

                    // Admin sees the edited value if one exists. Staff always sees saved stock.
                    const current = isAdmin && edits[item.id] !== undefined ? edits[item.id] : item.stock_quantity

                    const isLow = Number(current) > 0 && Number(current) <= LOW_STOCK
                    const isOut = Number(current) === 0

                    // This checks whether the admin changed the value but has not saved yet.
                    const hasChanged = isAdmin && edits[item.id] !== undefined && edits[item.id] !== '' && edits[item.id] !== item.stock_quantity

                    const cat = CATEGORY_COLOURS[item.product?.category] ?? CATEGORY_COLOURS['Other']
                    return (
                        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '15px 20px', borderBottom: i < filteredInventory.length - 1 ? '1px solid #F3F4F6' : 'none', alignItems: 'center', background: isOut ? '#FFFBFB' : hasChanged ? '#FFFDF5' : 'transparent' }}>
                            <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{item.product?.name ?? '—'}</span>
                            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', background: cat.bg, color: cat.color, fontSize: '12px', fontWeight: 700, width: 'fit-content' }}>{item.product?.category ?? '—'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* Admin gets an editable input. Staff gets read-only text. */}
                                {isAdmin ? (
                                    <input type="number" min="0" value={current} onChange={e => handleEdit(item.id, e.target.value)} className="gw-input"
                                        style={{ width: '80px', padding: '8px 10px', fontSize: '14px', fontWeight: 700, color: isOut ? '#DC2626' : isLow ? '#D97706' : '#1A1A1A', border: `1.5px solid ${hasChanged ? '#E8D48A' : '#CCCCCC'}`, background: hasChanged ? '#FFFEF0' : '#fff' }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '14px', fontWeight: isLow ? 700 : 400, color: isOut ? '#DC2626' : isLow ? '#D97706' : '#1A1A1A' }}>{item.stock_quantity}</span>
                                )}
                                {/* Stock badges make the row easier to understand quickly */}
                                {isOut && <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700, background: '#FEE2E2', padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>Sold out</span>}
                                {isLow && !isOut && <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 700, background: '#FEF3C7', padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>Low stock</span>}
                                {hasChanged && <span style={{ fontSize: '11px', color: '#A07C2A', fontWeight: 600 }}>edited</span>}
                            </div>
                            {/* Status column shown to both admin and staff. */}
                            <span style={{ fontSize: '13px', fontWeight: 600, color: isOut ? '#DC2626' : isLow ? '#D97706' : '#16A34A' }}>
                                {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                            </span>
                        </div>
                    )
                })}
            </div>
            </div>

            {/* Floating save bar for admin only. This appears only when there are unsaved edits*/}
            {isAdmin && !loading && changedItems.length > 0 && (
                <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#1A1A1A', borderRadius: '12px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 200 }}>
                    <span style={{ fontFamily: '"Lato",sans-serif', fontSize: '13px', color: '#E5E5E5' }}>{changedItems.length} unsaved change{changedItems.length > 1 ? 's' : ''}</span>
                    <button onClick={handleCancel} disabled={saving} style={{ padding: '8px 20px', background: 'transparent', color: '#E5E5E5', border: '1px solid #555', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: '"Lato",sans-serif' }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', background: saving ? '#555' : '#E8D48A', color: '#1A1A1A', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: '"Lato",sans-serif' }}>{saving ? 'Saving…' : 'Save Changes'}</button>
                </div>
            )}
        </PageWrapper>
    )
}
