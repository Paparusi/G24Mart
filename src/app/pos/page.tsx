'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Receipt from '@/components/Receipt'
import POSBarcodeInput from '@/components/POSBarcodeInput'
import HoldOrderModal from '@/components/HoldOrderModal'
import SplitPaymentModal from '@/components/SplitPaymentModal'
import QuickSellPanel from '@/components/QuickSellPanel'
import ShiftManagementModal from '@/components/ShiftManagementModal'
import { useAdvancedPOSStore } from '@/stores/useAdvancedPOSStore'
import { CartItem, Product, SplitPayment } from '@/types/pos'
import { Clock, Users, Calculator, Settings, Pause, CreditCard, ArrowLeftRight, RotateCcw, AlertTriangle } from 'lucide-react'

const mockProducts: Product[] = [
  { id: '1', name: 'Coca Cola 330ml', price: 15000, barcode: '8934673001234', stock: 45, category: 'Nước Giải Khát' },
  { id: '2', name: 'Bánh mì sandwich', price: 25000, barcode: '8934673001235', stock: 8, category: 'Thực Phẩm' },
  { id: '3', name: 'Nước suối Lavie 500ml', price: 8000, barcode: '8934673001236', stock: 120, category: 'Nước Giải Khát' },
  { id: '4', name: 'Mì tôm Hảo Hảo', price: 4500, barcode: '8934673001237', stock: 2, category: 'Thực Phẩm Khô' },
  { id: '5', name: 'Kẹo Mentos', price: 12000, barcode: '8934673001238', stock: 30, category: 'Kẹo' },
  { id: '6', name: 'Trà sữa C2', price: 18000, barcode: '8934673001239', stock: 25, category: 'Nước Giải Khát' },
  { id: '7', name: 'Bánh quy Oreo', price: 22000, barcode: '8934673001240', stock: 15, category: 'Bánh Kẹo' },
  { id: '8', name: 'Sữa tươi TH True Milk', price: 32000, barcode: '8934673001241', stock: 40, category: 'Sữa' },
]

const paymentMethods = [
  { id: 'cash', name: 'Tiền Mặt', icon: '💵', description: 'Thanh toán bằng tiền mặt' },
  { id: 'card', name: 'Thẻ ATM/Credit', icon: '💳', description: 'Quẹt thẻ ATM hoặc Credit Card' },
  { id: 'transfer', name: 'Chuyển Khoản', icon: '🏦', description: 'Chuyển khoản ngân hàng' },
  { id: 'momo', name: 'MoMo', icon: '🟣', description: 'Ví điện tử MoMo' },
  { id: 'zalopay', name: 'ZaloPay', icon: '🔵', description: 'Ví điện tử ZaloPay' },
  { id: 'vnpay', name: 'VNPay', icon: '🔴', description: 'Ví điện tử VNPay' },
]

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSplitPaymentModal, setShowSplitPaymentModal] = useState(false)
  const [showHoldOrderModal, setShowHoldOrderModal] = useState(false)
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('cash')
  const [receivedAmount, setReceivedAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [discount, setDiscount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [paymentError, setPaymentError] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [currentReceipt, setCurrentReceipt] = useState<any>(null)
  const [scannerMessage, setScannerMessage] = useState('')
  
  // Advanced POS store
  const { 
    addTransaction, 
    currentShift, 
    addCashTransaction,
    taxRate,
    receiptSettings 
  } = useAdvancedPOSStore()
  
  const categories = ['Tất Cả', ...Array.from(new Set(mockProducts.map(p => p.category)))]

  // Handle barcode scanner results  
  const handleBarcodeResult = (product: any) => {
    if (product && product.stock > 0) {
      addToCart(product)
      setScannerMessage(`✅ Thêm "${product.name}" vào giỏ hàng`)
    } else if (product && product.stock === 0) {
      setScannerMessage(`⚠️ Sản phẩm "${product.name}" đã hết hàng`)
    } else {
      setScannerMessage(`❌ Không tìm thấy sản phẩm`)
    }
    
    // Auto clear message after 3 seconds
    setTimeout(() => setScannerMessage(''), 3000)
  }

  const handleScanError = (error: string) => {
    setScannerMessage(`⚠️ Lỗi: ${error}`)
    setTimeout(() => setScannerMessage(''), 5000)
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ))
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        barcode: product.barcode,
        total: product.price
      }])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      ))
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm)
    const matchesCategory = selectedCategory === 'Tất Cả' || product.category === selectedCategory
    return matchesSearch && matchesCategory && product.stock > 0
  })

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * taxRate
  const discountAmount = subtotal * (discount / 100)
  const total = subtotal + tax - discountAmount

  const processPayment = async (splitPayments?: SplitPayment[]) => {
    if (cart.length === 0) return
    
    setIsProcessing(true)
    setPaymentStatus('processing')
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create transaction
      const transactionId = `TX${Date.now()}`
      const payments = splitPayments || [{ 
        method: paymentMethods.find(p => p.id === selectedPayment)?.name || 'Cash', 
        amount: total 
      }]
      
      const transaction = {
        id: transactionId,
        items: cart,
        subtotal,
        tax,
        discount: discountAmount,
        total,
        payments,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        timestamp: new Date().toISOString(),
        cashier: currentShift?.cashier || 'Unknown',
        status: 'completed' as const,
        receiptNumber: `RC${Date.now()}`
      }
      
      // Add to transactions store
      addTransaction(transaction)
      
      // Add cash transaction if cash payment
      if (payments.some(p => p.method.toLowerCase().includes('cash') || p.method.toLowerCase().includes('tiền mặt'))) {
        const cashAmount = payments.filter(p => p.method.toLowerCase().includes('cash') || p.method.toLowerCase().includes('tiền mặt'))
                                   .reduce((sum, p) => sum + p.amount, 0)
        if (cashAmount > 0) {
          addCashTransaction('sale', cashAmount, transactionId)
        }
      }

      // Create receipt  
      const receipt = {
        ...transaction,
        receivedAmount: parseFloat(receivedAmount) || total,
        change: parseFloat(receivedAmount) > total ? parseFloat(receivedAmount) - total : 0,
        storeInfo: receiptSettings
      }

      setPaymentStatus('success')
      setCurrentReceipt(receipt)
      setShowReceipt(true)
      setShowPaymentModal(false)
      
      // Reset form
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      setReceivedAmount('')
      setDiscount(0)
      setSelectedPayment('cash')
      setScannerMessage('✅ Thanh toán thành công!')
      
      // Auto clear success message
      setTimeout(() => setScannerMessage(''), 3000)

    } catch (error) {
      setPaymentStatus('error')
      setPaymentError(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định')
      
    } finally {
      setIsProcessing(false)
    }
  }

  const handleHoldOrder = () => {
    setCart([])
    setScannerMessage('✅ Đơn hàng đã được giữ thành công!')
    setTimeout(() => setScannerMessage(''), 3000)
  }

  const handleSplitPayment = (payments: SplitPayment[]) => {
    processPayment(payments)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Về Trang Chủ
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">🛒 Hệ Thống Bán Hàng (POS)</h1>
            {!currentShift && (
              <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                <AlertTriangle className="w-4 h-4" />
                Chưa mở ca làm
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            {/* Advanced Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowHoldOrderModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                title="Giữ đơn hàng"
              >
                <Pause className="w-4 h-4" />
                Giữ Đơn
              </button>
              
              <button
                onClick={() => setShowSplitPaymentModal(true)}
                disabled={cart.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Thanh toán kết hợp"
              >
                <ArrowLeftRight className="w-4 h-4" />
                TT Kết Hợp
              </button>
              
              <button
                onClick={() => setShowShiftModal(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  currentShift 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                title="Quản lý ca làm"
              >
                <Clock className="w-4 h-4" />
                {currentShift ? 'Ca Đang Hoạt Động' : 'Mở Ca Làm'}
              </button>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">Tổng tiền</div>
              <div className="text-2xl font-bold text-blue-600">
                {total.toLocaleString('vi-VN')} ₫
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Quick Sell Panel */}
        <QuickSellPanel onAddToCart={addToCart} />
        
        <div className="flex flex-col xl:flex-row gap-6 h-full">
          {/* Left Panel - Products */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Scanner Message */}
              {scannerMessage && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-blue-800">{scannerMessage}</div>
                </div>
              )}
            </div>

            {/* Barcode Scanner */}
            <POSBarcodeInput
              onProductScanned={handleBarcodeResult}
              products={filteredProducts}
            />

            {/* Products Grid */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">📦</div>
                      <h3 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h3>
                      <p className="text-blue-600 font-semibold">{product.price.toLocaleString('vi-VN')} ₫</p>
                      <p className="text-xs text-gray-500">Còn: {product.stock}</p>
                      <p className="text-xs text-gray-400 font-mono">{product.barcode}</p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <p>Không tìm thấy sản phẩm</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className="w-full lg:w-96 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Giỏ Hàng ({cart.length})</h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">🛒</div>
                  <p>Giỏ hàng trống</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm flex-1">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded-l-lg flex items-center justify-center hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="w-12 h-8 bg-white border-t border-b border-gray-300 flex items-center justify-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded-r-lg flex items-center justify-center hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.price.toLocaleString('vi-VN')} ₫ / cái
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                {/* Discount */}
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-sm text-gray-600">Giảm giá (%):</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                    max="100"
                  />
                </div>

                {/* Summary */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính:</span>
                    <span>{subtotal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Giảm giá ({discount}%):</span>
                      <span>-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{total.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
                >
                  <span>💳</span>
                  <span>Thanh Toán</span>
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Modals */}
      <HoldOrderModal
        isOpen={showHoldOrderModal}
        onClose={() => setShowHoldOrderModal(false)}
        onHoldOrder={handleHoldOrder}
        currentCart={cart}
        currentTotal={total}
      />

      <SplitPaymentModal
        isOpen={showSplitPaymentModal}
        onClose={() => setShowSplitPaymentModal(false)}
        onComplete={handleSplitPayment}
        totalAmount={total}
        paymentMethods={paymentMethods}
      />

      <ShiftManagementModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
      />

      {/* Receipt Modal */}
      {showReceipt && currentReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <Receipt 
              orderNumber={currentReceipt.receiptNumber || currentReceipt.id}
              items={currentReceipt.items}
              subtotal={currentReceipt.subtotal}
              discount={currentReceipt.discount || 0}
              total={currentReceipt.total}
              paymentMethod={currentReceipt.paymentMethod || currentReceipt.payments?.[0]?.method || 'Cash'}
              received={currentReceipt.receivedAmount}
              change={currentReceipt.change}
              customer={currentReceipt.customerName || 'Khách lẻ'}
              phone={currentReceipt.customerPhone}
              date={new Date(currentReceipt.timestamp).toLocaleDateString('vi-VN')}
              cashier={currentReceipt.cashier}
            />
            <button
              onClick={() => setShowReceipt(false)}
              className="w-full mt-4 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal - Basic version for single payments */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Thanh Toán</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán
                </label>
                <select
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {paymentMethods.map(method => (
                    <option key={method.id} value={method.id}>{method.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khách hàng (tùy chọn)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Nhập tên khách hàng"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại (tùy chọn)
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              {selectedPayment === 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiền khách đưa
                  </label>
                  <input
                    type="number"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder={`Tối thiểu: ${total.toLocaleString('vi-VN')} ₫`}
                  />
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  onClick={() => processPayment()}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Đang xử lý...' : 'Thanh Toán'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
