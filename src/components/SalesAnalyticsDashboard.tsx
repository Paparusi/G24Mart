'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  Clock,
  AlertTriangle,
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { useAnalyticsStore } from '@/stores/useAnalyticsStore'
import { useAdvancedPOSStore } from '@/stores/useAdvancedPOSStore'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
  color: string
}

function MetricCard({ title, value, icon, trend, trendUp, color }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trendUp ? '' : 'rotate-180'}`} />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function SalesAnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')
  const { 
    todaySummary, 
    weeklySummary, 
    monthlySummary, 
    customers,
    lowStockItems,
    profitMargins 
  } = useAnalyticsStore()
  
  const { transactions, currentShift, cashDrawer } = useAdvancedPOSStore()
  
  const currentSummary = selectedPeriod === 'today' ? todaySummary : 
                        selectedPeriod === 'week' ? weeklySummary : monthlySummary

  // Calculate real-time metrics from transactions
  const todayTransactions = transactions.filter(t => {
    const today = new Date().toDateString()
    const transactionDate = new Date(t.timestamp).toDateString()
    return today === transactionDate
  })

  const realTimeMetrics = {
    totalSales: todayTransactions.reduce((sum, t) => sum + t.total, 0),
    totalTransactions: todayTransactions.length,
    averageTransaction: todayTransactions.length > 0 
      ? todayTransactions.reduce((sum, t) => sum + t.total, 0) / todayTransactions.length 
      : 0,
    totalCustomers: new Set(todayTransactions.map(t => t.customerPhone).filter(Boolean)).size
  }

  // Calculate hourly sales
  const hourlySales = Array.from({ length: 24 }, (_, hour) => {
    const hourTransactions = todayTransactions.filter(t => {
      const transactionHour = new Date(t.timestamp).getHours()
      return transactionHour === hour
    })
    return {
      hour,
      sales: hourTransactions.reduce((sum, t) => sum + t.total, 0),
      transactions: hourTransactions.length
    }
  })

  const peakHour = hourlySales.reduce((peak, current) => 
    current.sales > peak.sales ? current : peak, 
    { hour: 0, sales: 0, transactions: 0 }
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Phân Tích Bán Hàng</h1>
        <p className="text-gray-600">Dashboard theo dõi hiệu suất và insights kinh doanh</p>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'today', label: 'Hôm Nay' },
            { key: 'week', label: 'Tuần Này' },
            { key: 'month', label: 'Tháng Này' }
          ].map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Tổng Doanh Thu"
          value={`${realTimeMetrics.totalSales.toLocaleString('vi-VN')}₫`}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          trend="+12.5% từ hôm qua"
          trendUp={true}
          color="bg-green-500"
        />
        
        <MetricCard
          title="Số Giao Dịch"
          value={realTimeMetrics.totalTransactions}
          icon={<ShoppingCart className="w-6 h-6 text-white" />}
          trend="+8.3% từ hôm qua"
          trendUp={true}
          color="bg-blue-500"
        />
        
        <MetricCard
          title="Giá Trị TB/Giao Dịch"
          value={`${realTimeMetrics.averageTransaction.toLocaleString('vi-VN')}₫`}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          trend="+5.2% từ hôm qua"
          trendUp={true}
          color="bg-purple-500"
        />
        
        <MetricCard
          title="Khách Hàng Mới"
          value={realTimeMetrics.totalCustomers}
          icon={<Users className="w-6 h-6 text-white" />}
          trend="+15.7% từ hôm qua"
          trendUp={true}
          color="bg-orange-500"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Hourly Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Doanh Thu Theo Giờ</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {hourlySales.filter(h => h.sales > 0).slice(-6).map(hour => (
              <div key={hour.hour} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {String(hour.hour).padStart(2, '0')}:00
                </span>
                <div className="flex items-center flex-1 mx-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${(hour.sales / Math.max(...hourlySales.map(h => h.sales))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {hour.sales.toLocaleString('vi-VN')}₫
                </span>
              </div>
            ))}
            {peakHour.sales > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Giờ cao điểm: {String(peakHour.hour).padStart(2, '0')}:00 
                  ({peakHour.sales.toLocaleString('vi-VN')}₫)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sản Phẩm Bán Chạy</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {profitMargins.slice(0, 5).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">{product.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {product.sellPrice.toLocaleString('vi-VN')}₫
                  </span>
                  <p className="text-xs text-gray-500">{product.marginPercent}% lãi</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts and Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cảnh Báo Tồn Kho</h3>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            {lowStockItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-600">
                    Còn: {item.currentStock}
                  </p>
                  <p className="text-xs text-gray-500">
                    Tối thiểu: {item.minimumStock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Drawer Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trạng Thái Ca Làm</h3>
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {currentShift ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nhân viên:</span>
                  <span className="font-medium">{currentShift.cashier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tiền mở ca:</span>
                  <span className="font-medium">
                    {currentShift.openingBalance.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tiền hiện tại:</span>
                  <span className="font-medium text-green-600">
                    {cashDrawer.currentBalance.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Thời gian:</span>
                  <span className="font-medium">
                    {new Date(currentShift.startTime).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">✅ Ca làm đang hoạt động</p>
                </div>
              </>
            ) : (
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-800 font-medium">Chưa mở ca làm</p>
                <p className="text-sm text-red-600 mt-1">Vui lòng mở ca trước khi bán hàng</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
