'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SalesData {
  date: string
  revenue: number
  transactions: number
  items: number
  profit: number
  topProducts: Array<{name: string, quantity: number, revenue: number}>
}

interface ProductSalesData {
  name: string
  quantity: number
  revenue: number
  profit: number
  category: string
}

const mockSalesData: SalesData[] = [
  { 
    date: '2024-01-01', 
    revenue: 2450000, 
    transactions: 45, 
    items: 120, 
    profit: 980000,
    topProducts: [
      {name: 'Coca Cola 330ml', quantity: 15, revenue: 225000},
      {name: 'Bánh mì sandwich', quantity: 8, revenue: 200000},
      {name: 'Nước suối Lavie', quantity: 25, revenue: 200000}
    ]
  },
  { 
    date: '2024-01-02', 
    revenue: 3200000, 
    transactions: 58, 
    items: 156, 
    profit: 1280000,
    topProducts: [
      {name: 'Coca Cola 330ml', quantity: 20, revenue: 300000},
      {name: 'Mì tôm Hảo Hảo', quantity: 30, revenue: 135000},
      {name: 'Kẹo Mentos', quantity: 18, revenue: 216000}
    ]
  },
  { 
    date: '2024-01-03', 
    revenue: 1800000, 
    transactions: 32, 
    items: 89, 
    profit: 720000,
    topProducts: [
      {name: 'Bánh mì sandwich', quantity: 12, revenue: 300000},
      {name: 'Nước suối Lavie', quantity: 20, revenue: 160000},
      {name: 'Kẹo Mentos', quantity: 10, revenue: 120000}
    ]
  },
  { 
    date: '2024-01-04', 
    revenue: 2800000, 
    transactions: 51, 
    items: 135, 
    profit: 1120000,
    topProducts: [
      {name: 'Coca Cola 330ml', quantity: 18, revenue: 270000},
      {name: 'Mì tôm Hảo Hảo', quantity: 25, revenue: 112500},
      {name: 'Bánh mì sandwich', quantity: 10, revenue: 250000}
    ]
  },
  { 
    date: '2024-01-05', 
    revenue: 3500000, 
    transactions: 62, 
    items: 178, 
    profit: 1400000,
    topProducts: [
      {name: 'Coca Cola 330ml', quantity: 22, revenue: 330000},
      {name: 'Bánh mì sandwich', quantity: 14, revenue: 350000},
      {name: 'Nước suối Lavie', quantity: 30, revenue: 240000}
    ]
  },
]

const mockProductSales: ProductSalesData[] = [
  { name: 'Coca Cola 330ml', quantity: 95, revenue: 1425000, profit: 285000, category: 'Nước Giải Khát' },
  { name: 'Bánh mì sandwich', quantity: 44, revenue: 1100000, profit: 308000, category: 'Thực Phẩm Tươi Sống' },
  { name: 'Nước suối Lavie', quantity: 75, revenue: 600000, profit: 150000, category: 'Nước Giải Khát' },
  { name: 'Mì tôm Hảo Hảo', quantity: 55, revenue: 247500, profit: 38500, category: 'Thực Phẩm Khô' },
  { name: 'Kẹo Mentos', quantity: 28, revenue: 336000, profit: 84000, category: 'Bánh Kẹo' },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('7days')
  const [reportType, setReportType] = useState('sales')
  const [viewMode, setViewMode] = useState('summary')

  const totalRevenue = mockSalesData.reduce((sum, data) => sum + data.revenue, 0)
  const totalTransactions = mockSalesData.reduce((sum, data) => sum + data.transactions, 0)
  const totalProfit = mockSalesData.reduce((sum, data) => sum + data.profit, 0)
  const totalItems = mockSalesData.reduce((sum, data) => sum + data.items, 0)
  const averageTransaction = totalRevenue / totalTransactions
  const profitMargin = ((totalProfit / totalRevenue) * 100)

  const getGrowthRate = () => {
    if (mockSalesData.length < 2) return 0
    const latest = mockSalesData[mockSalesData.length - 1].revenue
    const previous = mockSalesData[mockSalesData.length - 2].revenue
    return ((latest - previous) / previous * 100)
  }

  const getBestSellingDay = () => {
    return mockSalesData.reduce((max, current) => 
      current.revenue > max.revenue ? current : max
    )
  }

  const topProductsByRevenue = mockProductSales
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const categoryRevenue = mockProductSales.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + product.revenue
    return acc
  }, {} as {[key: string]: number})

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Về Trang Chủ
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Báo Cáo Bán Hàng</h1>
          </div>
          <div className="flex gap-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium">
              Xuất PDF
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
              Xuất Excel
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Report Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Loại Báo Cáo</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="sales">Báo Cáo Bán Hàng</option>
                <option value="inventory">Báo Cáo Kho Hàng</option>
                <option value="customer">Báo Cáo Khách Hàng</option>
                <option value="profit">Báo Cáo Lợi Nhuận</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Khoảng Thời Gian</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Hôm Nay</option>
                <option value="7days">7 Ngày Qua</option>
                <option value="30days">30 Ngày Qua</option>
                <option value="90days">90 Ngày Qua</option>
                <option value="thisMonth">Tháng Này</option>
                <option value="lastMonth">Tháng Trước</option>
                <option value="thisYear">Năm Này</option>
                <option value="custom">Tùy Chọn</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Chế Độ Xem</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="summary">Tổng Quan</option>
                <option value="detailed">Chi Tiết</option>
                <option value="comparison">So Sánh</option>
                <option value="trends">Xu Hướng</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Định Dạng</label>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                  Xem
                </button>
                <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  PDF
                </button>
                <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  Excel
                </button>
              </div>
            </div>
          </div>
          
          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2">Từ Ngày</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Đến Ngày</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Doanh Thu</p>
                <p className="text-2xl font-semibold text-green-600">
                  {totalRevenue.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Giao Dịch</p>
                <p className="text-2xl font-semibold text-blue-600">{totalTransactions}</p>
              </div>
              <div className="text-3xl">🧾</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lợi Nhuận</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {totalProfit.toLocaleString('vi-VN')} ₫
                </p>
                <p className="text-xs text-gray-500">
                  Tỷ suất: {profitMargin.toFixed(1)}%
                </p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">TB/Giao Dịch</p>
                <p className="text-2xl font-semibold text-indigo-600">
                  {Math.round(averageTransaction).toLocaleString('vi-VN')} ₫
                </p>
                <p className="text-xs text-gray-500">
                  {(totalItems / totalTransactions).toFixed(1)} sản phẩm
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tăng Trưởng</p>
                <p className={`text-2xl font-semibold ${getGrowthRate() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getGrowthRate() >= 0 ? '+' : ''}{getGrowthRate().toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">So với hôm trước</p>
              </div>
              <div className="text-3xl">{getGrowthRate() >= 0 ? '📈' : '📉'}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Data Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Dữ Liệu Bán Hàng Theo Ngày</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Ngày</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Doanh Thu</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">GD</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Lãi</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSalesData.map((data, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {new Date(data.date).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600">
                        {(data.revenue / 1000000).toFixed(1)}M ₫
                      </td>
                      <td className="py-3 px-4 text-sm">{data.transactions}</td>
                      <td className="py-3 px-4 text-sm text-purple-600">
                        {(data.profit / 1000000).toFixed(1)}M ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Sản Phẩm Bán Chạy</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {topProductsByRevenue.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600 text-sm">
                      {product.revenue.toLocaleString('vi-VN')} ₫
                    </div>
                    <div className="text-xs text-gray-500">{product.quantity} sản phẩm</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Category Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Hiệu Quả Theo Danh Mục</h3>
            <div className="space-y-4">
              {Object.entries(categoryRevenue)
                .sort(([,a], [,b]) => b - a)
                .map(([category, revenue], index) => {
                  const percentage = (revenue / totalRevenue * 100)
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{category}</span>
                        <span className="text-sm text-green-600 font-semibold">
                          {revenue.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        {percentage.toFixed(1)}% tổng doanh thu
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Thông Tin Chi Tiết</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-green-600">🏆</div>
                  <div className="font-semibold text-green-800">Ngày Bán Tốt Nhất</div>
                </div>
                <div className="text-sm text-green-700">
                  {new Date(getBestSellingDay().date).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit'
                  })} - {getBestSellingDay().revenue.toLocaleString('vi-VN')} ₫
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-blue-600">📈</div>
                  <div className="font-semibold text-blue-800">Tỷ Suất Lợi Nhuận</div>
                </div>
                <div className="text-sm text-blue-700">
                  {profitMargin.toFixed(1)}% - {profitMargin > 35 ? 'Xuất sắc' : profitMargin > 25 ? 'Tốt' : 'Cần cải thiện'}
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-purple-600">🛒</div>
                  <div className="font-semibold text-purple-800">Sản Phẩm/Giao Dịch</div>
                </div>
                <div className="text-sm text-purple-700">
                  Trung bình {(totalItems / totalTransactions).toFixed(1)} sản phẩm mỗi đơn hàng
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-orange-600">⏰</div>
                  <div className="font-semibold text-orange-800">Xu Hướng</div>
                </div>
                <div className="text-sm text-orange-700">
                  {getGrowthRate() > 0 ? 'Doanh thu đang tăng trưởng tích cực' : 'Cần xem xét chiến lược bán hàng'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Biểu Đồ Doanh Thu & Lợi Nhuận</h3>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500 font-medium">Biểu đồ sẽ hiển thị ở đây</p>
              <p className="text-sm text-gray-400">Tích hợp Chart.js hoặc D3.js</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
