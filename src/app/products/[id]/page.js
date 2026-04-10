// Single Product Detail - image, price, add to cart
'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function ProductDetailPage() {
  
  const { id } = useParams()


  const [quantity, setQuantity] = useState(1)


  const [selectedWeight, setSelectedWeight] = useState(null)

 
  const product = null

  // If no product yet, show placeholder layout
  if (!product) {
    return (
      <div>
        <a href="/products">← Back to Products</a>

        <div>
          {/* Image placeholder */}
          <div>Product image will appear here</div>

          {/* Details placeholder */}
          <div>
            <h1>Product Name</h1>
            <p>$00.00/kg</p>

            <label>Quantity</label>
            <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            <p>Total: $--</p>

            <button disabled>Add to Cart</button>

            <h2>Description</h2>
            <p>Product description will appear here</p>

            <h2>How You'll Be Charged</h2>
            <p>Deposit: $20.00 paid at checkout. Final payment upon collection.</p>
          </div>
        </div>

        <p>Product data will load once connected to the database</p>
      </div>
    )
  }

  
}