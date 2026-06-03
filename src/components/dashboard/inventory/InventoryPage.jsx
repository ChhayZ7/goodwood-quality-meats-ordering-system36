'use client'

import { useState, useEffect, useCallback } from 'react'
import PageWrapper from '@/components/dashboard/PageWrapper'
import PageHeader from '@/components/dashboard/PageHeader'
import SearchInput from '@/components/dashboard/SearchInput'

const LOW_STOCK = 5 //constant to declare that any item with 5 or lower units is considered as low stock

const CATEGORY_COLOURS = {
    Pork: { bg: '#FEE2E2', color: '#991B1B' },
    Beef: { bg: '#FEF3C7', color: '#92400E' },
    Lamb: { bg: '#DCFCE7', color: '#166534' },
    Poultry: { bg: '#DBEAFE', color: '#1E40AF' },
    Seafood: { bg: '#F3E8FF', color: '#7C3AED' },
    Other: { bg: '#F3F4F6', color: '#6B7280' },
}

//role prop is either admin or staff
export default function InventoryPage({ role }) {
    const isAdmin = role === 'ADMIN' //true when a page's role = admin, false when role is not admin

    const [inventory, setInventory] = useState([]) //full list of inventory items from the API
    const [loading, setLoading] = useState(true) //true while fetching data, false when not fetching data
    const [fetchError, setFetchError] = useState(null) //stores error message if fetch fails
    const [edits, setEdits] = useState({}) //tracks unsaved stock changes, when admin has typed in but not saved yet, start as an empty object as no edits have been made yet
    const [saving, setSaving] = useState(false) // currently false, true when saving edit changes to the API
    const [saveError, setSaveError] = useState(null) //stores error message if save is failed
    const [searchQuery, setSearchQuery] = useState('') //current vakue typed in the search box

    //useCallBack is used to prevent function loadInventory() from being recreated on every render
    //hence, the useEffect below does not loop infinitely
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
        if (typedValue === '') {
            setEdits(previousEdits => ({ ...previousEdits, [inventoryId]: '' }))
            return
        }
        //convert the typed string to a whole number, default to 0 if it is not a valid number
        let value = parseInt(typedValue, 10) || 0

        //since stock cant be negativem force min t0 0
        if (value < 0) value = 0

        //add this new value to the edits list without losing other items' edits
        setEdits(previousEdits => ({ ...previousEdits, [inventoryId]: value }))

    }

    //lis of items that have been edited and different from the saved value
    //this const is used to know exactly what needs to be sent to the API when admin clicks SAVE
    const changedItems = inventory.filter(item => {
        const edited = edits[item.id]
        //has this item been touch at all, is the field not empty?, is the new value actually different from what us saved in the database
        return edited !== undefined && edited !== '' && edited !== item.stock_quantity
        //only item that pass all 3 conditions get added to changedItems
    })


    //this const is to count how many items are low but not completely out of stock
    //use for warning badges
    //lowCount go through every single item in the inventory
    const lowCount = inventory.filter(item => {
        const isNotSoldOut = item.stock_quantity > 0 //this is to exclude the item that is out of stock
        const isLowOnStock = item.stock_quantity <= LOW_STOCK //and check if stock is at or below the low stock threshold which is 5 as declared above
        return isNotSoldOut && isLowOnStock //only count items that are low but now sold out
    }).length //count hpw many items are left in the filtered list, if there are 3 low stock items, return 3

    //filter inventory by the search query typed in the search box
    //both admin and staff use this filtered list as the display list
    const filteredInventory = inventory.filter(item =>
        item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )


    async function handleSave() {
        if (changedItems.length === 0) return //if there is nothing to save, exit early
        if (changedItems.length > 50) { setSaveError('Too many changes at once. Please save in smaller batches.'); return } //prevent accidentally sending a huge request
        setSaving(true) //set Saving to true to disable the save button when save and show "Saving..."
        setSaveError(null) //ckear previous save error

        //const updates is like an array of updates that is to send to the API
        const updates = changedItems.map(item => ({ inventory_id: item.id, stock_quantity: Number(edits[item.id]) }))
        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'PATCH',  //PATCH is used because there are only partial modifications is applied to an existing resource on a server
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates), //send the array of changes 
            })
            const data = await res.json()
            if (!res.ok && res.status !== 207) throw new Error(data.error || 'Failed to save') //207 means partial success, some items saved, some failed
            if (data.failures?.length > 0) setSaveError(`${data.failures.length} item(s) failed to update.`) //show how many failed if some failed

            //usdate each item in state with the new saved value from the API response
            setInventory(prev => prev.map(item => {
                const saved = data.updated?.find(u => u.id === item.id) //find this item in the API's list of saved items
                return saved ? { ...item, stock_quantity: saved.stock_quantity } : item //replace stock quantity if it was saved
            }))
            setEdits({}) //empty as clear all pending edits after a succesful save
        } catch (err) {
            setSaveError(err.message) //show error if the entire request failed
        } finally {
            setSaving(false) //enable the save button again 
        }
    }

    //function to discard all unsaved edits without saving
    function handleCancel() { setEdits({}); setSaveError(null) }


    const COLS = '1fr 140px 200px 120px'
    const HEADERS = ['Product Name', 'Category', 'Stock Quantity', 'Status']


    const displayList = isAdmin ? filteredInventory : inventory


    //main page layout
    return (
        0
    )
}
