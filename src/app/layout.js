import { Geist, Arvo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// Root Layout Page - navbar, footer, font, cart provider
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Goodwood Quality Meats",
  description: "Christmas Ordering System — Pre-order your Christmas meats online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}