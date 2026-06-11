import Link from 'next/link';
import HeroImage from '../assets/heroImage.jpg'
import AwardWinning from '../assets/awardWinning.png'

// Team member data, sourced from the client's existing website
//However, there photo has to be downloaded and store it in the assets folder just in case the current webpage is down
// Each member has a name, short bio, and a direct image URL from their site
const teamMembers = [
  {
    name: 'David Armstrong',
    bio: 'David is the proud owner of Goodwood Quality Meats and a Master Butcher and Smallgoods maker. David has been in the industry for more than 35 years.',
    img: 'https://www.goodwoodqualitymeats.com.au/wp-content/uploads/2025/05/IMG_0620.jpeg',
  },
  {
    name: 'Luke Leyson',
    bio: 'Luke has been part of our team for 20 years and is proudly the Captain of the Australian Competition Butchering Team.',
    img: 'https://www.goodwoodqualitymeats.com.au/wp-content/uploads/2025/05/IMG_0618.jpeg',
  },
  {
    name: 'Caleb Sundqvist',
    bio: 'Caleb has been part of our team for 16 years and runs the front of house. Caleb won Gold in the Young Butchers Cutting and Cooking Competition in Perth in 2016.',
    img: 'https://www.goodwoodqualitymeats.com.au/wp-content/uploads/2025/05/IMG_0626.jpeg',
  },
  {
    name: 'Isaac Visszmeg',
    bio: 'Isaac is one of our talented new team members and an apprentice Butcher and Smallgoods maker.',
    img: 'https://www.goodwoodqualitymeats.com.au/wp-content/uploads/2025/05/IMG_0623.jpeg',
  },
  {
    name: 'Sian Hampshire',
    bio: 'Sian is our newest team member and brings a fresh approach to our customer experience.',
    img: 'https://www.goodwoodqualitymeats.com.au/wp-content/uploads/2025/05/IMG_0628.jpeg',
  },
  {
    name: 'Steve Edwards',
    bio: 'Steve is an Experienced Butcher and Smallgoods maker with over 20 years of experience in the industry.',
    img: 'https://www.goodwoodqualitymeats.com.au/wp-content/uploads/2025/05/IMG_0617.jpeg',
  },
]

//constant to store award data
//each entry has bold label and description, bold and rest will be render later
const awards = [
  { bold: '2019', rest: 'SA Best Retail Shop' },
  { bold: '2018', rest: 'SA Award of Excellence, Best Retail Butcher Shop' },
  { bold: '2017', rest: ' SA Retail Gold Standard Award of Excellence' },
  { bold: '2016', rest: 'SA Retail Gold Standard Award of Excellence' },
  { bold: '2018', rest: 'World Butchers Challenge Ireland - Mexican Jalapeño and Sour Cream Sausage' },
  { bold: '2019', rest: 'Sausage King - Butchers Own Thin Beef, Traditional Australian' },
  { bold: '2017', rest: 'Sausage King - Vietnamese Chicken, Poultry Category' },
  { bold: '2019', rest: 'SA Best Continental Sausage - Smoked Spanish Chorizo' },
  { bold: 'SA Innovative Product Awards of Excellence', rest: 'Duck and Shiitake Mushroom Pate' },
  { bold: 'SA Innovative Product Awards of Excellence', rest: 'Hot Smoked Salmon' },
]

export default function HomePage() {
  return (
    <main>

      {/* Hero Image */}
      {/* full wdth banner image at the top of the page */}
      {/* fixed height with object cover so the image fill the container without stretching, whatever overflow outside the container is hidden */}
      <div className="w-full h-110 overflow-hidden">
        <img
          src={HeroImage.src}
          alt="Premium Meats"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gold divider */}
      <div style={{ height: '2.5px', backgroundColor: '#D4AF37' }} />

      {/* Welcome Section */}
      {/* padding top + bottom, set max width to 3xl, margin auto, padding left right */}
      <section className="py-25 text-center max-w-3xl mx-auto px-6">
        {/*tracking widest for letter spacing, margin bottom*/}
        <p className="text-3xl font-semibold tracking-widest mb-3" style={{ color: '#D4AF37' }}>
          PREMIUM MEATS
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold mb-6" style={{ color: '#8B1A1A' }}>
          Order Your Christmas Meats
        </h1>
        <p className="text-lg/8 mb-8" style={{ color: '#717182' }}>
          Make this Christmas unforgettable with our premium selection of locally sourced,
          expertly prepared meats. Pre-order now for guaranteed availability.
        </p>
        {/*make it behave like a block but stay inline so it does not stretch full width, trans smoothly animates the opacity change on hover, effect */}
        <Link
          href="/products"
          className="inline-block px-8 py-3 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#8B1A1A' }}
        >
          Order Now
        </Link>
      </section>

      {/* Gold divider */}
      <div style={{ height: '2px', backgroundColor: '#D4AF37' }} />

      {/* How it works
          3-step process section explaining how to place an order.

          Layout: grid with 1 column on mobile (grid-cols-1), switching to 3 columns
          on sm screens and above (sm:grid-cols-3). Gap increases on larger screens too
          sm means apply this style when screen is 640px wide or above */}
      <section className="py-20" style={{ backgroundColor: '#FDF8F0' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl text-center mb-16" style={{ color: '#8B1A1A' }}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                number: '1',
                color: '#a98b29',
                title: 'Browse & Select',
                description: 'Choose from our range of premium Christmas meats and specify your preferred weight',
              },
              {
                number: '2',
                color: '#2D6A2D',
                title: 'Pay Deposit',
                description: 'Secure your order with a $20.00 deposit. Final payment upon collection',
              },
              {
                number: '3',
                color: '#8B1A1A',
                title: 'Collect & Enjoy',
                description: 'Pick up your order fresh on your chosen date and enjoy a perfect Christmas feast.',
              },
              {/* Steps rendered from the array above 
                 Using .map() keeps the JSX clean and makes it
              easy to add or reorder steps later */}
            ].map((step) => (
              <div key={step.number} className="text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl text-white font-bold"
                  style={{ backgroundColor: step.color }}
                >
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: step.color }}>
                  {step.title}
                </h3>
                <p className="text-sm" style={{ color: '#717182' }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div style={{ height: '2px', backgroundColor: '#D4AF37' }} />

      {/* About Us */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-4xl mb-8 font-semibold" style={{ color: '#8B1A1A' }}>
            A Goodwood Institution
          </h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: '#353535' }}>
            Mick Hammond the previous owner had this place for 49 years. For the first 6 months, people wouldn’t even let me serve them or talk to me. So my goal was to be better than he was. We used similar or the same suppliers and looked to make everything we were doing one step better than it was and people started to warm to our approach.

            Then we started to give the shop a warmer feel so when you came in the timber gave it a more comfortable feel and we focussed on changing our uniforms to create a professional feel.
          </p>
          <blockquote
            className="text-xl italic mt-8"
            style={{ color: '#8B1A1A' }}
          >
            "We're still on a journey to make the shop the best we can and a place our customers
            want to visit and feel right at home"
          </blockquote>
          <p className="mt-2 text-md font-semibold" style={{ color: '#143f14' }}>
            — David Armstrong, Owner
          </p>
        </div>
      </section>

      {/* Gold divider */}
      <div style={{ height: '2px', backgroundColor: '#D4AF37' }} />

      {/* Our Team */}
      <section className="py-20" style={{ backgroundColor: '#FDF8F0' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl mb-4" style={{ color: '#8B1A1A' }}>Our Team</h2>
          <p className="text-lg mb-12" style={{ color: '#353535' }}>
            Meet our experienced team of master butchers dedicated to providing you with the finest quality meats
          </p>
          {/* lg:... 3 columns on screens 1024px and above for desktop*/}
          {/* for each member in teamMembers, display*/}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="text-center rounded-sm overflow-hidden"
                style={{
                  boxShadow: '0 6px 20px rgba(45, 106, 45, 0.35)',
                }}
              >
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-125 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#2C2C2A' }}>
                    {member.name}
                  </h3>
                  <p className="text-sm" style={{ color: '#717182' }}>
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div style={{ height: '2px', backgroundColor: '#D4AF37' }} />

      {/* Awards */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl mb-4 text-center  font-bold" style={{ color: '#8B1A1A' }}>
            Award Winning Butchers
          </h2>
          <p className="text-center text-sm italic mb-12" style={{ color: '#717182' }}>
            Goodwood Quality Meats has entered teams and competitions both locally, nationally, and internationally
          </p>
          <div className="flex flex-col gap-10 md:flex-row md:gap-16 md:items-center">

            {/*Image on the right ot shows on top first on mobile */}

            {/*md is another Tailwind breakpoint apply this style when the screen is 768px wide or above */}
            <div className="flex justify-center md:order-2 md:w-1/2">
              <img
                src={AwardWinning.src}
                alt="Award Winning"
                className="w-full max-w-sm md:max-w-sm object-contain"
              />
            </div>

            {/*Award List on left */}

            <div className="flex flex-col gap-2  md:order-1 md:w-1/2">
              {/*award is the current item in the array (the object with bold and rest)
              index is the index number of that item in the array (0, 1, 2, 3...), used as the key prop */}
              {awards.map((award, index) => (
                <p key={index} className="text-sm" style={{ color: '#2C2C2A' }}>
                  <span className="font-bold">{award.bold}</span>
                  {' | '}
                  {award.rest}
                </p>
              ))}
            </div>



          </div>
        </div>
      </section>

    </main>
  )
}