'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'

const DashboardCard = ({ title, value, icon, change, color = 'text-gray-900' }: {
  title: string
  value: string
  icon: string
  change?: string
  color?: string
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-semibold ${color}`}>{value}</p>
        {change && (
          <p className="text-sm text-green-600 font-medium">{change}</p>
        )}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
)

const QuickActionCard = ({ href, icon, title, description, bgColor }: {
  href: string
  icon: string
  title: string
  description: string
  bgColor: string
}) => (
  <Link href={href} className={`flex flex-col items-center p-6 ${bgColor} rounded-lg hover:opacity-90 transition-opacity`}>
    <div className="text-3xl mb-3">{icon}</div>
    <span className="font-semibold text-gray-800 mb-1">{title}</span>
    <span className="text-sm text-gray-600 text-center">{description}</span>
  </Link>
)

export default function DashboardReal() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()
  
  // Store data
  const { getSystemStats, orders, products, customers, getLowStockProducts } = useStore()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockCount: 0,
    todayRevenue: 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Update stats when data changes
    const systemStats = getSystemStats()
    setStats(systemStats)
  }, [getSystemStats, orders, products, customers])

  // Function to handle transaction click
  const handleTransactionClick = (transactionId: string) => {
    router.push(`/orders?search=${transactionId}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount)
  }

  // Get recent orders
  const recentOrders = orders
    .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
    .slice(0, 5)

  // Get low stock items
  const lowStockItems = getLowStockProducts().slice(0, 5)

  // Calculate performance metrics
  const today = new Date().toISOString().split('T')[0]
  const todayOrders = orders.filter(order => order.date === today)
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
  const todayTransactions = todayOrders.length
  const todayItems = todayOrders.reduce((sum, order) => sum + order.items.length, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard - G24Mart</h1>
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} - {currentTime.toLocaleTimeString('vi-VN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Tổng quan hệ thống</p>
              <p className="text-lg font-semibold text-blue-600">Real-time data</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Doanh Thu Hôm Nay"
            value={formatCurrency(todayRevenue)}
            icon="💰"
            change={`${todayTransactions} giao dịch`}
            color="text-green-600"
          />
          <DashboardCard
            title="Tổng Đơn Hàng"
            value={stats.totalOrders.toString()}
            icon="📋"
            change={`${todayTransactions} hôm nay`}
          />
          <DashboardCard
            title="Sản Phẩm Trong Kho"
            value={stats.totalProducts.toString()}
            icon="📦"
            change={`${stats.lowStockCount} sắp hết`}
            color={stats.lowStockCount > 0 ? "text-orange-600" : "text-green-600"}
          />
          <DashboardCard
            title="Khách Hàng"
            value={stats.totalCustomers.toString()}
            icon="👥"
            change="Tích cực"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao Tác Nhanh</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <QuickActionCard
              href="/pos"
              icon="🛒"
              title="Bán Hàng"
              description="POS System"
              bgColor="bg-blue-100"
            />
            <QuickActionCard
              href="/inventory"
              icon="📦"
              title="Kho Hàng"
              description="Quản lý sản phẩm"
              bgColor="bg-green-100"
            />
            <QuickActionCard
              href="/orders"
              icon="📋"
              title="Đơn Hàng"
              description="Theo dõi giao dịch"
              bgColor="bg-yellow-100"
            />
            <QuickActionCard
              href="/customers"
              icon="👥"
              title="Khách Hàng"
              description="Quản lý khách hàng"
              bgColor="bg-purple-100"
            />
            <QuickActionCard
              href="/reports"
              icon="📊"
              title="Báo Cáo"
              description="Phân tích doanh thu"
              bgColor="bg-pink-100"
            />
            <QuickActionCard
              href="/settings"
              icon="⚙️"
              title="Cài Đặt"
              description="Cấu hình hệ thống"
              bgColor="bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Giao Dịch Gần Đây</h3>
                <Link href="/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Xem tất cả →
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có giao dịch nào hôm nay
                  </div>
                ) : (
                  recentOrders.map((order, index) => (
                    <div key={order.id} 
                         className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                         onClick={() => handleTransactionClick(order.orderNumber)}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">
                            {order.time} • {order.items.length} sản phẩm
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                        <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Cảnh Báo Tồn Kho ({stats.lowStockCount})
                </h3>
                <Link href="/inventory" className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                  Quản lý kho →
                </Link>
              </div>
              
              <div className="space-y-3">
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">✅</div>
                    <p>Tất cả sản phẩm đều đủ số lượng</p>
                  </div>
                ) : (
                  lowStockItems.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600">
                          {product.stock}/{product.minStock}
                        </p>
                        <p className="text-xs text-orange-600">Cần nhập thêm</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu Suất Hôm Nay</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{todayTransactions}</div>
                <div className="text-sm text-gray-600">Giao dịch</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{todayItems}</div>
                <div className="text-sm text-gray-600">Sản phẩm bán</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {todayTransactions > 0 ? formatCurrency(todayRevenue / todayTransactions) : '0₫'}
                </div>
                <div className="text-sm text-gray-600">Trung bình/đơn</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {products.filter(p => p.stock > 0).length}
                </div>
                <div className="text-sm text-gray-600">SP còn hàng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
