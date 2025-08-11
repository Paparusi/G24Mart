'use client'

import Link from 'next/link'
import CustomerManagement from '@/components/CustomerManagement'

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Về Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">👥 Quản Lý Khách Hàng</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <CustomerManagement />
    </div>
  )
}
