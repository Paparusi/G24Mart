'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Receipt from '@/components/Receipt'
import UnifiedBarcodeScanner from '@/components/UnifiedBarcodeScanner'
import { useProducts, useOrders, useCustomers, CartItem } from '@/store/useStore'
import { ScannedProductData } from '@/hooks/useEnhancedBarcodeScanner'

const paymentMethods = [
  { id: 'cash', name: 'Tiền Mặt', icon: '💵', description: 'Thanh toán bằng tiền mặt' },
  { id: 'card', name: 'Thẻ ATM/Credit', icon: '💳', description: 'Quẹt thẻ ATM hoặc Credit Card' },
  { id: 'transfer', name: 'Chuyển Khoản', icon: '🏦', description: 'Chuyển khoản ngân hàng' },
  { id: 'momo', name: 'MoMo', icon: '🟣', description: 'Ví điện tử MoMo' },
  { id: 'zalopay', name: 'ZaloPay', icon: '🔵', description: 'Ví điện tử ZaloPay' },
  { id: 'vnpay', name: 'VNPay', icon: '🔴', description: 'Ví điện tử VNPay' },
]

export default function POSPage() {
  // Store hooks
  const { products, updateStock } = useProducts()
  const { addOrder } = useOrders()
  const { findCustomerByPhone, updateCustomer } = useCustomers()
  
  // Local state
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
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
  
  // Get categories from products
  const categories = ['Tất Cả', ...Array.from(new Set(products.map(p => p.category)))]

  // Auto-find customer when phone is entered
  useEffect(() => {
    if (customerPhone) {
      const customer = findCustomerByPhone(customerPhone)
      if (customer) {
        setCustomerName(customer.name)
        setScannerMessage(`✅ Tìm thấy khách hàng: ${customer.name} (${customer.tier})`)
      } else {
        setCustomerName('')
        setScannerMessage('ℹ️ Khách hàng mới - có thể tạo tài khoản sau thanh toán')
      }
    } else {
      setCustomerName('')
    }
  }, [customerPhone, findCustomerByPhone])

  // Handle unified scanner results
  const handleUnifiedScannerResult = (productData: ScannedProductData) => {
    const product = products.find(p => p.barcode === productData.barcode)
    
    if (product && product.stock > 0) {
      addToCart(product)
      setScannerMessage(`✅ Thêm "${product.name}" vào giỏ hàng`)
    } else if (product && product.stock === 0) {
      setScannerMessage(`⚠️ Sản phẩm "${product.name}" đã hết hàng`)
    } else if (productData.productInfo?.name) {
      // Add scanned product as temporary cart item using API data
      const price = typeof productData.productInfo.price === 'number' 
        ? productData.productInfo.price 
        : productData.productInfo.price?.suggestedRetail || 0
      
      const tempCartItem: CartItem = {
        id: `temp-${Date.now()}`,
        name: productData.productInfo.name,
        barcode: productData.barcode,
        price,
        quantity: 1,
        total: price
      }
      
      setCart(prev => {
        const existingItem = prev.find(item => item.barcode === productData.barcode)
        if (existingItem) {
          return prev.map(item =>
            item.barcode === productData.barcode
              ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
              : item
          )
        }
        return [...prev, tempCartItem]
      })
      
      setScannerMessage(`✅ Thêm sản phẩm quét được: "${productData.productInfo.name}"`)
    } else {
      setScannerMessage(`❌ Không tìm thấy sản phẩm có mã: ${productData.barcode}`)
    }
    
    // Clear message after 3 seconds
    setTimeout(() => setScannerMessage(''), 3000)
  }

  const addToCart = (product: any) => {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      quantity: 1,
      total: product.price
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      }
      return [...prev, cartItem]
    })
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm)
    const matchesCategory = selectedCategory === 'Tất Cả' || product.category === selectedCategory
    return matchesSearch && matchesCategory && product.stock > 0
  })

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = subtotal * (discount / 100)
  const total = subtotal - discountAmount

  const processPayment = async () => {
    if (cart.length === 0) return
    
    setIsProcessing(true)
    setPaymentStatus('processing')
    setPaymentError('')
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create order
      const orderData = {
        items: cart,
        subtotal,
        tax: 0, // Will be calculated based on store settings
        discount: discountAmount,
        total,
        paymentMethod: selectedPayment as 'cash' | 'card' | 'transfer',
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('vi-VN'),
        status: 'completed' as const,
        cashier: 'Admin User'
      }

      // Add order to store
      addOrder(orderData)

      // Create receipt
      const receipt = {
        id: `RC${Date.now()}`,
        items: cart,
        subtotal,
        discount: discountAmount,
        total,
        paymentMethod: paymentMethods.find(p => p.id === selectedPayment)?.name || 'Tiền mặt',
        customerName,
        customerPhone,
        receivedAmount: parseFloat(receivedAmount) || total,
        change: parseFloat(receivedAmount) > total ? parseFloat(receivedAmount) - total : 0,
        timestamp: new Date().toISOString(),
        cashier: 'Admin User'
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
      setScannerMessage(`✅ Thanh toán thành công! Đơn hàng ${orderData.items.length} sản phẩm`)
      
      // Clear success message after 5 seconds
      setTimeout(() => setScannerMessage(''), 5000)
      
    } catch (error) {
      setPaymentStatus('error')
      setPaymentError('Lỗi xử lý thanh toán. Vui lòng thử lại.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Về Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Bán Hàng (POS)</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Tổng sản phẩm: {products.length} | Trong kho: {products.filter(p => p.stock > 0).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn Sản Phẩm</h2>
                  
                  {/* Scanner and Search */}
                  <div className="space-y-4">
                    {/* Unified Barcode Scanner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <UnifiedBarcodeScanner 
                        onProductScanned={handleUnifiedScannerResult}
                        placeholder="Quét mã vạch hoặc nhập mã sản phẩm..."
                      />
                      {scannerMessage && (
                        <div className="mt-2 text-sm text-blue-700 font-medium">
                          {scannerMessage}
                        </div>
                      )}
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Tìm kiếm sản phẩm..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="sm:w-48">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                        {product.name}
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(product.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Còn: {product.stock}
                      </div>
                    </button>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy sản phẩm nào
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart and Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Giỏ Hàng ({cart.length})
                </h2>

                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.price)} x {item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-red-500 text-white text-sm hover:bg-red-600"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-green-500 text-white text-sm hover:bg-green-600"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {cart.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Giỏ hàng trống
                  </div>
                )}

                {/* Cart Summary */}
                {cart.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Tạm tính:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Giảm giá ({discount}%):</span>
                          <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng:</span>
                        <span className="text-blue-600">{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Thanh Toán
                      </button>
                      <button
                        onClick={clearCart}
                        className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                      >
                        Xóa Giỏ Hàng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 1000 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Thanh Toán</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng thanh toán:</span>
                  <span className="text-blue-600">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Thông Tin Khách Hàng</h4>
                <div className="space-y-3">
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Tên khách hàng"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Phương Thức Thanh Toán</h4>
                <div className="space-y-2">
                  {paymentMethods.map(method => (
                    <label key={method.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-xl mr-3">{method.icon}</span>
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cash Payment Details */}
              {selectedPayment === 'cash' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền nhận
                  </label>
                  <input
                    type="number"
                    placeholder="Nhập số tiền khách đưa"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {receivedAmount && parseFloat(receivedAmount) >= total && (
                    <div className="mt-2 text-sm text-green-600">
                      Tiền thừa: {formatCurrency(parseFloat(receivedAmount) - total)}
                    </div>
                  )}
                </div>
              )}

              {/* Discount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giảm giá (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Payment Error */}
              {paymentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {paymentError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300"
                  disabled={isProcessing}
                >
                  Hủy
                </button>
                <button
                  onClick={processPayment}
                  disabled={isProcessing || (selectedPayment === 'cash' && parseFloat(receivedAmount || '0') < total)}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Đang xử lý...' : 'Xác Nhận Thanh Toán'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && currentReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 1001 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Hóa Đơn</h3>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <Receipt 
                orderNumber={currentReceipt.id}
                items={currentReceipt.items}
                subtotal={currentReceipt.subtotal}
                discount={currentReceipt.discount}
                total={currentReceipt.total}
                paymentMethod={currentReceipt.paymentMethod}
                received={currentReceipt.receivedAmount}
                change={currentReceipt.change}
                customer={currentReceipt.customerName || 'Khách lẻ'}
                phone={currentReceipt.customerPhone}
                date={new Date(currentReceipt.timestamp).toLocaleDateString('vi-VN')}
                cashier={currentReceipt.cashier}
              />
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  In Hóa Đơn
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
