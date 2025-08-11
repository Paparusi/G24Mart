'use client'

import Link from 'next/link'
import SalesAnalyticsDashboard from '@/components/SalesAnalyticsDashboard'
import AdvancedBusinessIntelligence from '@/components/AdvancedBusinessIntelligence'
import { useState } from 'react'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'business'>('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Về Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">📈 Phân Tích & Báo Cáo</h1>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'business'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🧠 Business Intelligence
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {activeTab === 'dashboard' ? (
        <SalesAnalyticsDashboard />
      ) : (
        <AdvancedBusinessIntelligence />
      )}
    </div>
  )
}
