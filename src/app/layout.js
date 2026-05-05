import { Geist, Arvo } from "next/font/google";
import "./globals.css";
import Footer from '@/components/Footer'
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";

// Root Layout Page - navbar, footer, font, cart provider
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Goodwood Quality Meats",
  description: "Christmas Ordering System — Pre-order your Christmas meats online.",
};
/// suppressHydrationWarning

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      
      <body className="min-h-full flex flex-col">
          <Navbar />
          <CartProvider>
          <main className="flex-1 ">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
