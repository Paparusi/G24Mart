'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

// Sample data directly in component
const sampleData: Order[] = [
  {
    id: 'TXN1723306800000',
    orderNumber: 'DH20250810001',
    items: [
      { id: '1', name: 'Mì tôm Hảo Hảo', price: 8000, quantity: 2, total: 16000, barcode: '8934563113567' },
      { id: '2', name: 'Bánh mì sandwich', price: 25000, quantity: 1, total: 25000, barcode: '8936012345678' }
    ],
    subtotal: 41000,
    tax: 4100,
    discount: 0,
    total: 45100,
    paymentMethod: 'cash',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0987654321',
    date: '2025-08-10',
    time: '14:30:25',
    status: 'completed',
    cashier: 'Thu ngân'
  },
  {
    id: 'TXN1723306200000',
    orderNumber: 'DH20250810002',
    items: [
      { id: '4', name: 'Coca Cola 330ml', price: 12000, quantity: 2, total: 24000, barcode: '8934561234567' }
    ],
    subtotal: 24000,
    tax: 2400,
    discount: 1000,
    total: 25400,
    paymentMethod: 'card',
    date: '2025-08-10',
    time: '14:15:42',
    status: 'completed',
    cashier: 'Thu ngân'
  }
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  useEffect(() => {
    // Initialize with sample data
    setOrders(sampleData)
    console.log('Orders loaded:', sampleData)
  }, [])

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
    console.log('Button clicked! Order:', order)
    setSelectedOrder(order)
    setShowOrderDetails(true)
    console.log('Modal should show now. showOrderDetails:', true)
  }

  const closeModal = () => {
    console.log('Closing modal')
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  console.log('Render state:', { 
    ordersCount: orders.length, 
    showOrderDetails, 
    selectedOrder: selectedOrder?.orderNumber 
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Đơn Hàng Đã Bán</h1>
            <p className="text-gray-600 mt-2">Quản lý và xem lại các đơn hàng đã hoàn thành</p>
            <p className="text-sm text-blue-600">Debug: {orders.length} đơn hàng loaded</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                console.log('Test button clicked')
                if (orders.length > 0) {
                  viewOrderDetails(orders[0])
                } else {
                  console.log('No orders available')
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🚨 Test Modal (DEBUG)
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

      {/* Simple Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Danh sách đơn hàng</h2>
          {orders.length === 0 ? (
            <p>Không có đơn hàng nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{order.date} {order.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName || 'Khách lẻ'}
                        </div>
                        {order.customerPhone && (
                          <div className="text-sm text-gray-500">{order.customerPhone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Chi tiết button clicked for order:', order.orderNumber)
                            viewOrderDetails(order)
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
        <h3 className="font-semibold">Debug Info:</h3>
        <p>Orders count: {orders.length}</p>
        <p>Show modal: {showOrderDetails ? 'YES' : 'NO'}</p>
        <p>Selected order: {selectedOrder?.orderNumber || 'None'}</p>
      </div>

      {/* Simplified Modal */}
      {showOrderDetails && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
          style={{ zIndex: 10000 }}
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Chi tiết đơn hàng {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold w-10 h-10 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <strong>Khách hàng:</strong> {selectedOrder.customerName || 'Khách lẻ'}
                </div>
                <div>
                  <strong>Ngày giờ:</strong> {selectedOrder.date} {selectedOrder.time}
                </div>
                <div>
                  <strong>Thanh toán:</strong> {getPaymentMethodText(selectedOrder.paymentMethod)}
                </div>
                <div>
                  <strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              <h4 className="text-lg font-semibold mb-4">Sản phẩm:</h4>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left border-b">Tên sản phẩm</th>
                      <th className="px-4 py-2 text-right border-b">Đơn giá</th>
                      <th className="px-4 py-2 text-center border-b">SL</th>
                      <th className="px-4 py-2 text-right border-b">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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
