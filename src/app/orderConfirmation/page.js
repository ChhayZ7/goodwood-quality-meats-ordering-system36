import Link from 'next/link'

export default function OrderConfirmationPage() {
  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: '#FDF8F0' }}>
      <div className="max-w-2xl mx-auto px-6">

        {/* Success Icon + Heading */}
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
            style={{ backgroundColor: '#D4EDDA', color: '#2D6A2D' }}
          >
            ✓
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#8B1A1A' }}>
            Order Placed!
          </h1>
          <p className="text-lg" style={{ color: '#717182' }}>
            Thank you for your order. We have received your request and your deposit has been secured.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg p-6 mb-6" style={{ border: '1px solid #e5e5e5' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#2C2C2A' }}>
            Order Summary
          </h2>

          {/* Order Number */}
          <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid #e5e5e5' }}>
            <span className="text-sm" style={{ color: '#717182' }}>Order Number</span>
            <span className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>GW20251201</span>
          </div>

          {/* Pickup Date */}
          <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid #e5e5e5' }}>
            <span className="text-sm" style={{ color: '#717182' }}>Pickup Date</span>
            <span className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>20/12/2025</span>
          </div>

          {/* Items */}
          <div className="py-3" style={{ borderBottom: '1px solid #e5e5e5' }}>
            <span className="text-sm mb-3 block" style={{ color: '#717182' }}>Items Ordered</span>
            <div className="flex flex-col gap-2">
              {[
                { name: 'Pork Loin Roast', detail: '1.5–2 kg × 1', price: '$19.50 - $26.00' },
                { name: 'Box of Cooked Prawns 5kg', detail: '× 2', price: '$40.00' },
                { name: 'Boneless Ham', detail: '4.5–5 kg × 1', price: '$157.50 - $175.00' },
              ].map((item) => (
                <div key={item.name} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>{item.name}</p>
                    <p className="text-xs" style={{ color: '#717182' }}>{item.detail}</p>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#2C2C2A' }}>{item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Deposit Paid */}
          <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid #e5e5e5' }}>
            <span className="text-sm" style={{ color: '#717182' }}>Deposit Paid</span>
            <span className="text-sm font-semibold" style={{ color: '#2D6A2D' }}>$20.00</span>
          </div>

          {/* Balance Due */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-sm font-semibold" style={{ color: '#2C2C2A' }}>Balance Due at Pickup</span>
            <span className="text-lg font-bold" style={{ color: '#8B1A1A' }}>$197.00 - $221.00</span>
          </div>
        </div>

        {/* Info Box */}
        <div
          className="rounded-lg p-5 mb-8 text-sm"
          style={{ backgroundColor: '#FEF9E7', border: '1px solid #FAC775', color: '#854F0B' }}
        >
          <p className="font-semibold mb-2">What happens next?</p>
          <ul className="flex flex-col gap-1">
            <li>A confirmation invoice has been sent to your email.</li>
            <li>Our team will weigh your order and send a final invoice before pickup.</li>
            <li>Pay the remaining balance in store via EFTPOS on collection.</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="block w-full text-center py-4 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#8B1A1A' }}
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="block w-full text-center py-4 rounded-lg font-semibold transition-opacity hover:opacity-70"
            style={{ border: '1px solid #8B1A1A', color: '#8B1A1A', backgroundColor: 'transparent' }}
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </main>
  )
}