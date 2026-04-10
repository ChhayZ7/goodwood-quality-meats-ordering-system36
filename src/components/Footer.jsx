import GoldDivider from './GoldDivider'
//This is Dummy, just for me

export default function Footer() {
  return (
    <footer>
      <GoldDivider />

      <section>
        <h2 style={{ color: '#000000'}}>Opening Hours</h2>
        <p style={{ color: '#000000'}}>Monday to Friday: 7am - 5:30pm</p>
        <p style={{ color: '#000000'}}>Saturday: 7am - 12:00pm</p>
        <p style={{ color: '#000000'}}>Sunday: Closed</p>
      </section>

      <section>
        <h2 style={{ color: '#000000'}}>Visit Our Store</h2>
        <p style={{ color: '#000000'}}>121 Goodwood Road, Goodwood</p>
        <p style={{ color: '#000000'}}>Phone: 08 8271 4183</p>
      </section>

      <section>
        <p style={{ color: '#000000'}}>Goodwood Quality Meats</p>
      </section>
    </footer>
  )
}