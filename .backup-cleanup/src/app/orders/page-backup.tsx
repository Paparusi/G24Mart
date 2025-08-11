'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { initializeSampleData } from '@/data/sampleOrders'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  total: number
  barcode?: string
}

interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'card' | 'transfer'
  customerName?: string
  customerPhone?: string
  date: string
  time: string
  status: 'completed' | 'refunded' | 'partial-refund'
  cashier: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'refunded' | 'partial-refund'>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card' | 'transfer'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(10)

  // Load orders from localStorage on component mount
  useEffect(() => {
    // Initialize sample data if no orders exist
    initializeSampleData()
    
    const savedOrders = localStorage.getItem('g24mart_orders')
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders)
      setOrders(parsedOrders)
      setFilteredOrders(parsedOrders)
    }
  }, [])

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = orders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.includes(searchTerm) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(order => order.date === dateFilter)
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentMethod === paymentFilter)
    }

    setFilteredOrders(filtered)
    setCurrentPage(1)
  }, [orders, searchTerm, statusFilter, dateFilter, paymentFilter])

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      refunded: 'bg-red-100 text-red-800', 
      'partial-refund': 'bg-yellow-100 text-yellow-800'
    }
    const labels = {
      completed: 'Hoàn thành',
      refunded: 'Đã hoàn trả',
      'partial-refund': 'Hoàn trả một phần'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getPaymentMethodText = (method: string) => {
    const methods = {
      cash: 'Tiền mặt',
      card: 'Thẻ',
      transfer: 'Chuyển khoản'
    }
    return methods[method as keyof typeof methods] || method
  }

  const viewOrderDetails = (order: Order) => {
    console.log('Viewing order details:', order)
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const printReceipt = (order: Order) => {
    const printWindow = window.open('', '', 'width=300,height=600')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Hóa đơn ${order.orderNumber}</title>
            <style>
              body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
              .header { text-align: center; margin-bottom: 10px; }
              .divider { border-top: 1px dashed #000; margin: 10px 0; }
              .item-row { display: flex; justify-content: space-between; }
              .total { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>G24MART</h2>
              <p>Cửa hàng tiện lợi</p>
              <p>Hóa đơn: ${order.orderNumber}</p>
              <p>${order.date} ${order.time}</p>
            </div>
            <div class="divider"></div>
            ${order.items.map(item => `
              <div class="item-row">
                <span>${item.name} x${item.quantity}</span>
                <span>${formatCurrency(item.total)}</span>
              </div>
            `).join('')}
            <div class="divider"></div>
            <div class="item-row">
              <span>Tạm tính:</span>
              <span>${formatCurrency(order.subtotal)}</span>
            </div>
            <div class="item-row">
              <span>Thuế:</span>
              <span>${formatCurrency(order.tax)}</span>
            </div>
            ${order.discount > 0 ? `
            <div class="item-row">
              <span>Giảm giá:</span>
              <span>-${formatCurrency(order.discount)}</span>
            </div>
            ` : ''}
            <div class="item-row total">
              <span>Tổng cộng:</span>
              <span>${formatCurrency(order.total)}</span>
            </div>
            <div class="divider"></div>
            <div class="item-row">
              <span>Thanh toán:</span>
              <span>${getPaymentMethodText(order.paymentMethod)}</span>
            </div>
            ${order.customerName ? `<p>Khách hàng: ${order.customerName}</p>` : ''}
            <div class="header" style="margin-top: 20px;">
              <p>Cảm ơn quý khách!</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const exportOrders = () => {
    const csvContent = [
      ['Số đơn hàng', 'Ngày', 'Giờ', 'Khách hàng', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Thu ngân'].join(','),
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.date,
        order.time,
        order.customerName || '',
        order.total,
        getPaymentMethodText(order.paymentMethod),
        order.status,
        order.cashier
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `don-hang-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Đơn Hàng Đã Bán</h1>
            <p className="text-gray-600 mt-2">Quản lý và xem lại các đơn hàng đã hoàn thành</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                if (orders.length > 0) {
                  viewOrderDetails(orders[0])
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>🔍</span>
              <span>Test Modal</span>
            </button>
            <button
              onClick={exportOrders}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <span>📊</span>
              <span>Xuất Excel</span>
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Quay lại Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Số đơn, khách hàng, sản phẩm..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="completed">Hoàn thành</option>
              <option value="refunded">Đã hoàn trả</option>
              <option value="partial-refund">Hoàn trả một phần</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thanh toán</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ</option>
              <option value="transfer">Chuyển khoản</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-700">Tổng đơn hàng</h3>
          <p className="text-2xl font-bold text-blue-600">{filteredOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-700">Đơn hoàn thành</h3>
          <p className="text-2xl font-bold text-green-600">
            {filteredOrders.filter(o => o.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-700">Tổng doanh thu</h3>
          <p className="text-xl font-bold text-purple-600">
            {formatCurrency(filteredOrders.reduce((sum, order) => sum + order.total, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-700">Đơn hôm nay</h3>
          <p className="text-2xl font-bold text-orange-600">
            {filteredOrders.filter(o => o.date === new Date().toISOString().split('T')[0]).length}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày giờ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{order.items.length} sản phẩm</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerName || 'Khách lẻ'}
                      </div>
                      {order.customerPhone && (
                        <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.date}</div>
                    <div className="text-sm text-gray-500">{order.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getPaymentMethodText(order.paymentMethod)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => printReceipt(order)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        In lại
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị {indexOfFirstOrder + 1} đến {Math.min(indexOfLastOrder, filteredOrders.length)} của {filteredOrders.length} đơn hàng
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
          style={{ zIndex: 9999 }}
          onClick={(e) => e.target === e.currentTarget && setShowOrderDetails(false)}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chi tiết đơn hàng {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Ngày giờ:</span>
                    <span className="ml-2 text-gray-900">{selectedOrder.date} {selectedOrder.time}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Thu ngân:</span>
                    <span className="ml-2 text-gray-900">{selectedOrder.cashier}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Thanh toán:</span>
                    <span className="ml-2 text-gray-900">{getPaymentMethodText(selectedOrder.paymentMethod)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedOrder.customerName && (
                    <div>
                      <span className="font-medium text-gray-700">Khách hàng:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.customerName}</span>
                    </div>
                  )}
                  {selectedOrder.customerPhone && (
                    <div>
                      <span className="font-medium text-gray-700">Số điện thoại:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.customerPhone}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Trạng thái:</span>
                    <span className="ml-2">{getStatusBadge(selectedOrder.status)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Đơn giá</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Số lượng</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              {item.barcode && (
                                <div className="text-xs text-gray-500">Mã: {item.barcode}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="max-w-md ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Tạm tính:</span>
                    <span className="text-gray-900">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Thuế:</span>
                    <span className="text-gray-900">{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Giảm giá:</span>
                      <span className="text-red-600">-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span className="text-gray-900">Tổng cộng:</span>
                    <span className="text-gray-900">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => printReceipt(selectedOrder)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                In hóa đơn
              </button>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
