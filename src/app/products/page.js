'use client'

import Navbar from '@/components/Navbar'
import GoldDivider from '@/components/GoldDivider'
import Footer from '@/components/Footer'

const CATEGORIES = ['All', 'Pork', 'Beef', 'Lamb', 'Poultry', 'Seafood', 'Other']

export default function ProductsPage() {
  return (
    <div>
      <Navbar />
      <GoldDivider />

      <main>
        <section>
          <h1>Ready for Christmas</h1>
          <p>
            Browse our selection of premium meats. All orders require a $20 deposit,
            with final payment upon collection.
          </p>
        </section>

        <section>
          <h2>Categories</h2>

          <div>
            {CATEGORIES.map((category) => (
              <button key={category} type="button">
                {category}
              </button>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}