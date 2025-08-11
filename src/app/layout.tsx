import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import { PerformanceProvider } from '@/providers/PerformanceProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'G24Mart - Convenience Store Management System',
  description: 'Complete POS and inventory management solution for convenience stores',
  keywords: 'POS, convenience store, inventory management, smart AI, sales analytics',
  authors: [{ name: 'G24Mart Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'G24Mart - Convenience Store Management System',
    description: 'Complete POS and inventory management solution for convenience stores',
    type: 'website',
    locale: 'vi_VN',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <ErrorBoundary>
          <PerformanceProvider>
            {children}
          </PerformanceProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
