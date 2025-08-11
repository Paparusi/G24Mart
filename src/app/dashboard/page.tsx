'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Function to handle transaction click
  const handleTransactionClick = (transactionId: string) => {
    // Navigate to orders page with search for this transaction ID
    router.push(`/orders?search=${transactionId}`)
  }

  
  const todayStats = {
    revenue: 2450000,
    transactions: 156,
    products: 1247,
    lowStock: 23,
    customers: 156,
    newCustomers: 8
  }

  const recentTransactions = [
    { id: '001', time: '14:35', items: 3, amount: 85000, payment: 'Thẻ', cashier: 'Hoa' },
    { id: '002', time: '14:28', items: 1, amount: 25000, payment: 'Tiền mặt', cashier: 'Minh' },
    { id: '003', time: '14:15', items: 5, amount: 150000, payment: 'QR Code', cashier: 'Hoa' },
    { id: '004', time: '14:08', items: 2, amount: 45000, payment: 'Thẻ', cashier: 'Nam' },
    { id: '005', time: '13:58', items: 4, amount: 120000, payment: 'Tiền mặt', cashier: 'Hoa' }
  ]

  const lowStockAlerts = [
    { name: 'Mì tôm Hảo Hảo', stock: 2, minStock: 10 },
    { name: 'Bánh mì sandwich', stock: 8, minStock: 15 },
    { name: 'Kẹo Mentos', stock: 5, minStock: 20 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bảng Điều Khiển G24Mart</h1>
            <p className="text-sm text-gray-600">Chào mừng bạn quay trở lại hệ thống quản lý cửa hàng</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {currentTime.toLocaleDateString('vi-VN', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-lg font-semibold text-blue-600">
              {currentTime.toLocaleTimeString('vi-VN')}
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Cảnh báo hàng sắp hết */}
        {lowStockAlerts.length > 0 && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">⚠️</span>
              <h3 className="text-lg font-semibold text-orange-800">
                Cảnh Báo Hàng Sắp Hết ({lowStockAlerts.length} sản phẩm)
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              {lowStockAlerts.map((item, index) => (
                <div key={index} className="bg-orange-100 rounded px-3 py-2">
                  <span className="font-medium text-orange-800">{item.name}</span>
                  <span className="text-orange-700 text-sm ml-2">
                    (Còn {item.stock}/{item.minStock})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Doanh Thu Hôm Nay"
            value={`${todayStats.revenue.toLocaleString('vi-VN')} ₫`}
            icon="💰"
            change="+12% so với hôm qua"
            color="text-green-600"
          />
          <DashboardCard
            title="Số Giao Dịch"
            value={todayStats.transactions.toString()}
            icon="�"
            change="+8 giao dịch mới"
          />
          <DashboardCard
            title="Sản Phẩm Sắp Hết"
            value={todayStats.lowStock.toString()}
            icon="⚠️"
            color="text-orange-600"
          />
          <DashboardCard
            title="Khách Hàng"
            value={todayStats.customers.toString()}
            icon="👥"
            change={`+${todayStats.newCustomers} khách mới`}
          />
        </div>

        {/* AI Insights Widget */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6 mb-8 border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center text-purple-800">
              <span className="mr-2">🤖</span>
              AI Insights & Đề Xuất
            </h2>
            <Link href="/ai-assistant" className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1">
              Chat với AI →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-purple-800 mb-2">💡 Khuyến nghị ngay</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 animate-pulse"></div>
                  <span className="text-sm text-gray-700">
                    <strong>Urgent:</strong> Mì tôm Hảo Hảo chỉ còn 2 sản phẩm, cần nhập ngay
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <span className="text-sm text-gray-700">
                    Tạo combo "Mì + Nước" để tăng 15% doanh thu
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <span className="text-sm text-gray-700">
                    Khuyến mãi giờ vàng 14-16h (35% khách hàng)
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-purple-800 mb-2">📊 Thống kê thông minh</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Thanh toán không tiền mặt</span>
                  <span className="text-sm font-semibold text-green-600">↗ +23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Khách VIP đóng góp</span>
                  <span className="text-sm font-semibold text-blue-600">35% doanh thu</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dự đoán doanh thu tuần</span>
                  <span className="text-sm font-semibold text-purple-600">17.2M ₫</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-purple-200">
            <div className="flex items-center gap-2 text-xs text-purple-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              AI đang phân tích 24/7 - Cập nhật mỗi 5 phút
            </div>
          </div>
        </div>

        {/* Thao tác nhanh */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            Thao Tác Nhanh
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <QuickActionCard
              href="/pos"
              icon="🛒"
              title="Bán Hàng"
              description="Mở POS để bán hàng"
              bgColor="bg-blue-50 hover:bg-blue-100"
            />
            <QuickActionCard
              href="/ai-assistant"
              icon="🤖"
              title="AI Tư Vấn"
              description="Trợ lý AI thông minh"
              bgColor="bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100"
            />
            <QuickActionCard
              href="/orders"
              icon="�"
              title="Đơn Hàng"
              description="Xem đơn đã bán"
              bgColor="bg-indigo-50 hover:bg-indigo-100"
            />
            <QuickActionCard
              href="/inventory"
              icon="�"
              title="Kho Hàng"
              description="Quản lý tồn kho"
              bgColor="bg-green-50 hover:bg-green-100"
            />
            <QuickActionCard
              href="/reports"
              icon="�"
              title="Báo Cáo"
              description="Xem thống kê"
              bgColor="bg-purple-50 hover:bg-purple-100"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <QuickActionCard
              href="/customers"
              icon="👤"
              title="Khách Hàng"
              description="Quản lý khách hàng"
              bgColor="bg-orange-50 hover:bg-orange-100"
            />
            <QuickActionCard
              href="/settings"
              icon="⚙️"
              title="Cài Đặt"
              description="Cấu hình hệ thống"
              bgColor="bg-gray-50 hover:bg-gray-100"
            />
            <QuickActionCard
              href="/inventory/test"
              icon="📱"
              title="Mobile Scanner"
              description="Test quét mã vạch điện thoại"
              bgColor="bg-blue-50 hover:bg-blue-100"
            />
            <div className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm font-semibold">App Mobile</div>
                <div className="text-xs text-gray-600 mt-1">Sắp ra mắt</div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg cursor-pointer transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">🔔</div>
                <div className="text-sm font-semibold">Thông Báo</div>
                <div className="text-xs text-gray-600 mt-1">2 thông báo mới</div>
              </div>
            </div>
            <div className="p-4 bg-pink-50 hover:bg-pink-100 rounded-lg cursor-pointer transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">💡</div>
                <div className="text-sm font-semibold">Hỗ Trợ</div>
                <div className="text-xs text-gray-600 mt-1">Trợ giúp & FAQ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Giao dịch gần đây */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <span className="mr-2">📋</span>
              Giao Dịch Gần Đây
              <span className="ml-2 text-sm text-gray-500 font-normal">(Click để xem chi tiết)</span>
            </h2>
            <Link href="/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Xem tất cả →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold">Mã GD</th>
                  <th className="text-left py-3 px-4 font-semibold">Thời Gian</th>
                  <th className="text-left py-3 px-4 font-semibold">Số Món</th>
                  <th className="text-left py-3 px-4 font-semibold">Thành Tiền</th>
                  <th className="text-left py-3 px-4 font-semibold">Thanh Toán</th>
                  <th className="text-left py-3 px-4 font-semibold">Thu Ngân</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className="border-b hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => handleTransactionClick(transaction.id)}
                    title={`Click để xem chi tiết đơn hàng #${transaction.id}`}
                  >
                    <td className="py-3 px-4 font-mono text-sm text-blue-600 font-semibold">#{transaction.id}</td>
                    <td className="py-3 px-4">{transaction.time}</td>
                    <td className="py-3 px-4">{transaction.items} món</td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      {transaction.amount.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.payment === 'Tiền mặt' ? 'bg-green-100 text-green-800' :
                        transaction.payment === 'Thẻ' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {transaction.payment}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex items-center">
                      <span>{transaction.cashier}</span>
                      <span className="ml-2 text-blue-400 group-hover:text-blue-600">→</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
