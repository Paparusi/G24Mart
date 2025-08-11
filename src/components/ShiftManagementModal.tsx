'use client'

import { useState } from 'react'
import { X, User, Clock, DollarSign, RotateCcw } from 'lucide-react'
import { useAdvancedPOSStore } from '@/stores/useAdvancedPOSStore'

interface ShiftManagementModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShiftManagementModal({ isOpen, onClose }: ShiftManagementModalProps) {
  const { 
    currentShift, 
    shifts, 
    startShift, 
    endShift, 
    cashDrawer,
    transactions 
  } = useAdvancedPOSStore()
  
  const [cashierName, setCashierName] = useState('')
  const [openingBalance, setOpeningBalance] = useState('')
  const [closingBalance, setClosingBalance] = useState('')

  const handleStartShift = () => {
    if (cashierName && openingBalance) {
      startShift(cashierName, parseFloat(openingBalance))
      setCashierName('')
      setOpeningBalance('')
    }
  }

  const handleEndShift = () => {
    if (closingBalance) {
      endShift(parseFloat(closingBalance))
      setClosingBalance('')
    }
  }

  const todayTransactions = transactions.filter(t => {
    const today = new Date().toDateString()
    const transactionDate = new Date(t.timestamp).toDateString()
    return today === transactionDate
  })

  const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Quản Lý Ca Làm</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!currentShift ? (
          // Start Shift
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Bắt Đầu Ca Làm</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Tên nhân viên
                </label>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập tên nhân viên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Số tiền mở ca
                </label>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập số tiền mở ca"
                />
              </div>

              <button
                onClick={handleStartShift}
                disabled={!cashierName || !openingBalance}
                className={`w-full py-3 px-4 rounded-md font-medium ${
                  cashierName && openingBalance
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Bắt Đầu Ca Làm
              </button>
            </div>
          </div>
        ) : (
          // Current Shift Info
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Ca Làm Hiện Tại</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Nhân viên</p>
                  <p className="font-semibold">{currentShift.cashier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bắt đầu</p>
                  <p className="font-semibold">
                    {new Date(currentShift.startTime).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tiền mở ca</p>
                  <p className="font-semibold">
                    {currentShift.openingBalance.toLocaleString('vi-VN')}₫
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tiền hiện tại</p>
                  <p className="font-semibold">
                    {cashDrawer.currentBalance.toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded border mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Thống kê ca làm</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tổng giao dịch</p>
                    <p className="font-semibold">{todayTransactions.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tổng doanh thu</p>
                    <p className="font-semibold text-green-600">
                      {todaySales.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Số tiền đóng ca (thực tế trong ngăn kéo)
                  </label>
                  <input
                    type="number"
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số tiền thực tế"
                  />
                </div>

                <button
                  onClick={handleEndShift}
                  disabled={!closingBalance}
                  className={`w-full py-3 px-4 rounded-md font-medium ${
                    closingBalance
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  Kết Thúc Ca Làm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Shifts */}
        {shifts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lịch Sử Ca Làm</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {shifts.slice(0, 5).map((shift) => (
                <div key={shift.id} className="bg-gray-50 p-4 rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{shift.cashier}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(shift.startTime).toLocaleString('vi-VN')}
                        {shift.endTime && ` - ${new Date(shift.endTime).toLocaleTimeString('vi-VN')}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {shift.openingBalance.toLocaleString('vi-VN')}₫
                        {shift.closingBalance && ` → ${shift.closingBalance.toLocaleString('vi-VN')}₫`}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        shift.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {shift.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
