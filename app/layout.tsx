import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Torre Admin',
  description: 'Panel de administración',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-[#f4f5f7]">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton={false}
        />

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}