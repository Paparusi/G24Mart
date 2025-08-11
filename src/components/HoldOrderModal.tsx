'use client'

import { useState } from 'react'
import { X, Clock, User, Phone, FileText, Trash2 } from 'lucide-react'
import { useAdvancedPOSStore } from '@/stores/useAdvancedPOSStore'
import { HoldOrder } from '@/types/pos'

interface HoldOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onHoldOrder: () => void
  currentCart: any[]
  currentTotal: number
}

export default function HoldOrderModal({ 
  isOpen, 
  onClose, 
  onHoldOrder, 
  currentCart, 
  currentTotal 
}: HoldOrderModalProps) {
  const { holdOrders, addHoldOrder, removeHoldOrder } = useAdvancedPOSStore()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')

  const handleHoldOrder = () => {
    const holdOrder: HoldOrder = {
      id: `hold_${Date.now()}`,
      items: currentCart.map(item => ({...item, total: item.price * item.quantity})),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      timestamp: new Date().toISOString(),
      total: currentTotal,
      notes: notes || undefined
    }

    addHoldOrder(holdOrder)
    setCustomerName('')
    setCustomerPhone('')
    setNotes('')
    onHoldOrder()
    onClose()
  }

  const handleRetrieveOrder = (order: HoldOrder) => {
    // This would be handled by parent component
    console.log('Retrieve order:', order)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Quản Lý Đơn Hàng Tạm Giữ</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hold Current Order */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Giữ Đơn Hàng Hiện Tại</h3>
            
            {currentCart.length > 0 ? (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    {currentCart.length} sản phẩm - Tổng: {currentTotal.toLocaleString('vi-VN')}₫
                  </p>
                  <div className="max-h-32 overflow-y-auto mt-2">
                    {currentCart.map((item) => (
                      <div key={item.id} className="text-xs text-gray-500 py-1">
                        {item.name} x{item.quantity}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Tên khách hàng
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên khách hàng (tùy chọn)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập số điện thoại (tùy chọn)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Ghi chú
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Ghi chú thêm (tùy chọn)"
                    />
                  </div>

                  <button
                    onClick={handleHoldOrder}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Giữ Đơn Hàng
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Giỏ hàng trống. Thêm sản phẩm để giữ đơn hàng.
              </p>
            )}
          </div>

          {/* Held Orders List */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Đơn Hàng Đã Giữ ({holdOrders.length})</h3>
            
            {holdOrders.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {holdOrders.map((order) => (
                  <div key={order.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {order.customerName || 'Khách hàng'}
                        </p>
                        {order.customerPhone && (
                          <p className="text-sm text-gray-600">{order.customerPhone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          {order.total.toLocaleString('vi-VN')}₫
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.timestamp).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      {order.items.length} sản phẩm
                    </div>

                    {order.notes && (
                      <p className="text-sm text-gray-600 mb-3 italic">"{order.notes}"</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRetrieveOrder(order)}
                        className="flex-1 bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Lấy Đơn
                      </button>
                      <button
                        onClick={() => removeHoldOrder(order.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Chưa có đơn hàng tạm giữ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
