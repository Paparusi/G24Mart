'use client'

import { useState } from 'react'
import { X, CreditCard, DollarSign, Banknote, Smartphone } from 'lucide-react'
import { useAdvancedPOSStore } from '@/stores/useAdvancedPOSStore'
import { SplitPayment } from '@/types/pos'

interface SplitPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (payments: SplitPayment[]) => void
  totalAmount: number
  paymentMethods: Array<{
    id: string
    name: string
    icon: string
    description: string
  }>
}

export default function SplitPaymentModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  totalAmount,
  paymentMethods 
}: SplitPaymentModalProps) {
  const { splitPayments, addSplitPayment, removeSplitPayment, clearSplitPayments, getSplitPaymentTotal } = useAdvancedPOSStore()
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]?.id || 'cash')
  const [amount, setAmount] = useState('')

  const remainingAmount = totalAmount - getSplitPaymentTotal()
  const canAddPayment = parseFloat(amount) > 0 && parseFloat(amount) <= remainingAmount
  const isComplete = Math.abs(remainingAmount) < 0.01

  const handleAddPayment = () => {
    if (!canAddPayment) return

    const paymentAmount = parseFloat(amount)
    const method = paymentMethods.find(m => m.id === selectedMethod)
    
    if (method) {
      addSplitPayment({
        method: method.name,
        amount: paymentAmount
      })
      setAmount('')
    }
  }

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = Math.min(remainingAmount, totalAmount * percentage)
    setAmount(quickAmount.toString())
  }

  const handleComplete = () => {
    if (isComplete) {
      onComplete(splitPayments)
      clearSplitPayments()
      onClose()
    }
  }

  const handleClose = () => {
    clearSplitPayments()
    onClose()
  }

  const getPaymentIcon = (methodId: string) => {
    switch(methodId) {
      case 'cash': return <DollarSign className="w-4 h-4" />
      case 'card': return <CreditCard className="w-4 h-4" />
      case 'transfer': return <Banknote className="w-4 h-4" />
      default: return <Smartphone className="w-4 h-4" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Thanh Toán Kết Hợp</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Input */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thêm Thanh Toán</h3>
            
            {/* Payment Method Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{method.icon}</span>
                      <span className="text-sm font-medium">{method.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền (còn lại: {remainingAmount.toLocaleString('vi-VN')}₫)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập số tiền"
                max={remainingAmount}
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn nhanh
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleQuickAmount(0.25)}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  25%
                </button>
                <button
                  onClick={() => handleQuickAmount(0.5)}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  50%
                </button>
                <button
                  onClick={() => handleQuickAmount(0.75)}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  75%
                </button>
                <button
                  onClick={() => setAmount(remainingAmount.toString())}
                  className="py-2 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm"
                >
                  Tất cả
                </button>
              </div>
            </div>

            <button
              onClick={handleAddPayment}
              disabled={!canAddPayment}
              className={`w-full py-3 px-4 rounded-md font-medium ${
                canAddPayment
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Thêm Thanh Toán
            </button>
          </div>

          {/* Payment Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tổng Kết Thanh Toán</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Tổng hóa đơn:</span>
                <span className="font-semibold">{totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Đã thanh toán:</span>
                <span className="font-semibold text-green-600">
                  {getSplitPaymentTotal().toLocaleString('vi-VN')}₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Còn lại:</span>
                <span className={`font-semibold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {remainingAmount.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            {/* Payment List */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {splitPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex items-center">
                    {getPaymentIcon(payment.method.toLowerCase())}
                    <span className="ml-2 font-medium">{payment.method}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">
                      {payment.amount.toLocaleString('vi-VN')}₫
                    </span>
                    <button
                      onClick={() => removeSplitPayment(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {splitPayments.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Chưa có thanh toán nào
              </div>
            )}

            <button
              onClick={handleComplete}
              disabled={!isComplete}
              className={`w-full py-3 px-4 rounded-md font-medium ${
                isComplete
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isComplete ? 'Hoàn Tất Thanh Toán' : `Còn thiếu ${remainingAmount.toLocaleString('vi-VN')}₫`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
