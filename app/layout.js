import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";


export const metadata = {
  title: "Schedular",
  description: "created a simple meeting scheduler app using nextjs",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className} 
        suppressHydrationWarning={true}
        >
          {/* Header */}
          <header>
            <Header/>
          </header>
          {/* Main content */}
          <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="bg-blue-100 py-12">
            <div className="container mx-auto text-center text-gray-600">
            <p>© 2023 Schedular. All rights reserved.</p>
            <p>Created by Javed</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
