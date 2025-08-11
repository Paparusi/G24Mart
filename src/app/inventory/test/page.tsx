'use client'

import { useState } from 'react'
import Link from 'next/link'
import MobileBarcodeIntegration from '@/components/MobileBarcodeIntegration'
import { ScannedProductData } from '@/hooks/useEnhancedBarcodeScanner'

// Demo inventory data
const mockInventory = [
  {
    id: '1',
    name: 'Coca Cola 330ml',
    barcode: '8934673001234',
    price: 15000,
    costPrice: 12000,
    stock: 45,
    minStock: 20,
    category: 'Nước Giải Khát',
    supplier: 'Coca Cola Việt Nam',
    description: 'Nước ngọt có gas hương cola'
  },
  {
    id: '2',
    name: 'Bánh mì sandwich',
    barcode: '8934673001235',
    price: 25000,
    costPrice: 18000,
    stock: 8,
    minStock: 15,
    category: 'Thực Phẩm Tươi Sống',
    supplier: 'Tiệm bánh địa phương',
    expiryDate: '2025-08-12',
    description: 'Bánh mì sandwich thịt nguội'
  }
]

export default function InventoryTestPage() {
  const [inventory, setInventory] = useState(mockInventory)
  const [scannedProducts, setScannedProducts] = useState<ScannedProductData[]>([])

  const handleProductScanned = (productData: ScannedProductData) => {
    
    // Add to scanned products list
    setScannedProducts(prev => [productData, ...prev].slice(0, 10)) // Keep last 10
    
    // Check if product exists in inventory
    const existingProduct = inventory.find(p => p.barcode === productData.barcode)
    if (existingProduct) {
      alert(`✅ Sản phẩm "${existingProduct.name}" đã tồn tại trong kho!\n` +
            `Số lượng hiện tại: ${existingProduct.stock}\n` +
            `Phương pháp quét: ${productData.scanMethod || 'không xác định'}`)
    } else {
      if (confirm(`🆕 Sản phẩm mới: ${productData.productInfo?.name || productData.barcode}\n` +
                  `Bạn có muốn thêm vào kho không?`)) {
        // Add new product logic here
        const newProduct = {
          id: Date.now().toString(),
          name: productData.productInfo?.name || 'Sản phẩm mới',
          barcode: productData.barcode,
          price: 0,
          costPrice: 0,
          stock: 0,
          minStock: 10,
          category: productData.productInfo?.category || 'Chưa phân loại',
          supplier: productData.productInfo?.brand || 'Chưa xác định',
          description: productData.productInfo?.description || ''
        }
        setInventory(prev => [newProduct, ...prev])
        alert(`✅ Đã thêm sản phẩm "${newProduct.name}" vào kho`)
      }
    }
  }

  const handleError = (error: string) => {
    
    alert(`❌ Lỗi: ${error}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Về Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">📱 Test Mobile Barcode Scanner</h1>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Mobile Barcode Scanner */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 Quét Mã Vạch</h2>
          <MobileBarcodeIntegration
            onProductScanned={handleProductScanned}
            onError={handleError}
          />
        </div>

        {/* Recently Scanned */}
        {scannedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Sản Phẩm Vừa Quét</h2>
            <div className="space-y-3">
              {scannedProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {product.productInfo?.name || `Mã vạch: ${product.barcode}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      Barcode: {product.barcode} • 
                      Phương pháp: {product.scanMethod === 'camera' && '📱 Camera'}
                      {product.scanMethod === 'keyboard' && '⌨️ Bàn phím'}
                      {product.scanMethod === 'manual' && '✏️ Thủ công'}
                      {!product.scanMethod && '❓ Không rõ'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(product.scanTimestamp).toLocaleString('vi-VN')} • 
                      Xử lý trong {product.processingTime}ms
                    </div>
                  </div>
                  <div className="text-2xl">
                    {product.scanMethod === 'camera' && '📱'}
                    {product.scanMethod === 'keyboard' && '⌨️'}
                    {product.scanMethod === 'manual' && '✏️'}
                    {!product.scanMethod && '❓'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Inventory */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📦 Kho Hàng Hiện Tại ({inventory.length} sản phẩm)</h2>
          <div className="space-y-2">
            {inventory.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    Barcode: {product.barcode} • Stock: {product.stock} • Category: {product.category}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">{product.price.toLocaleString('vi-VN')} ₫</div>
                  <div className="text-gray-500">Cost: {product.costPrice.toLocaleString('vi-VN')} ₫</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">📖 Hướng Dẫn Sử Dụng</h2>
          <div className="space-y-2 text-blue-800">
            <p><strong>📱 Trên điện thoại:</strong> Nhấn "Quét Bằng Camera" để sử dụng camera quét mã vạch</p>
            <p><strong>💻 Trên máy tính:</strong> Nhấn "Quét Bằng Bàn Phím" hoặc "Nhập Thủ Công"</p>
            <p><strong>🔍 Camera Scanner:</strong> Đặt mã vạch trong khung đỏ, camera sẽ tự động phát hiện</p>
            <p><strong>🔄 Chuyển camera:</strong> Có thể chuyển đổi giữa camera trước/sau</p>
            <p><strong>⚡ Tự động:</strong> Sau khi quét thành công, camera sẽ tự động đóng</p>
          </div>
        </div>
      </div>
    </div>
  )
}
