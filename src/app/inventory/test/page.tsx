'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MobileBarcodeIntegration from '@/components/MobileBarcodeIntegration'
import { ScannedProductData } from '@/hooks/useEnhancedBarcodeScanner'
import { useProducts } from '@/store/useStore'

export default function InventoryTestPage() {
  const [scannedProducts, setScannedProducts] = useState<ScannedProductData[]>([])
  const { products, addProduct } = useProducts()

  // Add test products if inventory is empty
  useEffect(() => {
    if (products.length === 0) {
      const testProducts = [
        {
          name: 'Coca Cola 330ml (Store)',
          barcode: '8934673001234',
          price: 15000,
          costPrice: 12000,
          stock: 45,
          minStock: 20,
          category: 'Nước Giải Khát',
          supplier: 'Coca Cola Việt Nam',
          description: 'Nước ngọt có gas hương cola (từ inventory store)'
        },
        {
          name: 'Bánh mì sandwich (Store)',
          barcode: '8934673001235',
          price: 25000,
          costPrice: 18000,
          stock: 8,
          minStock: 15,
          category: 'Thực Phẩm Tươi Sống',
          supplier: 'Tiệm bánh địa phương',
          description: 'Bánh mì sandwich thịt nguội (từ inventory store)'
        },
        {
          name: 'Nước suối Lavie 500ml (Store)',
          barcode: '8934673001236',
          price: 8000,
          costPrice: 6000,
          stock: 120,
          minStock: 50,
          category: 'Nước Giải Khát',
          supplier: 'Lavie Việt Nam',
          description: 'Nước suối thiên nhiên Lavie chai 500ml'
        },
        {
          name: 'Mì tôm Hảo Hảo (Store)',
          barcode: '8934673001237',
          price: 4500,
          costPrice: 3500,
          stock: 2,
          minStock: 10,
          category: 'Thực Phẩm Khô',
          supplier: 'ACECOOK Việt Nam',
          description: 'Mì tôm chua cay Hảo Hảo gói 75g'
        }
      ]

      testProducts.forEach(product => {
        addProduct(product)
      })
    }
  }, [products.length, addProduct])

  const handleProductScanned = (productData: ScannedProductData) => {
    // Add to scanned products list
    setScannedProducts(prev => [productData, ...prev].slice(0, 10)) // Keep last 10
    
    // Check if product exists in inventory
    const existingProduct = products.find(p => p.barcode === productData.barcode)
    if (existingProduct) {
      alert(`✅ Sản phẩm "${existingProduct.name}" đã tồn tại trong kho!\n` +
            `Số lượng hiện tại: ${existingProduct.stock}\n` +
            `Phương pháp quét: ${productData.scanMethod || 'không xác định'}`)
    } else {
      if (confirm(`🆕 Sản phẩm mới: ${productData.productInfo?.name || productData.barcode}\n` +
                 `Bạn có muốn thêm vào kho không?`)) {
        const newProduct = {
          name: productData.productInfo?.name || 'Sản phẩm mới',
          barcode: productData.barcode,
          price: 0,
          costPrice: 0,
          stock: 1,
          minStock: 5,
          category: productData.productInfo?.category || 'Chưa phân loại',
          supplier: productData.productInfo?.brand || 'Chưa xác định',
          description: productData.productInfo?.description || ''
        }
        addProduct(newProduct)
        alert('✅ Đã thêm sản phẩm vào kho!')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                📦 Test Inventory & Barcode Scanner
              </h1>
              <Link
                href="/pos"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🛒 Đi POS Test
              </Link>
            </div>

            {/* Inventory Products */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                📋 Sản phẩm trong kho ({products.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.stock > product.minStock ? 'bg-green-100 text-green-800' : 
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        Tồn: {product.stock}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã vạch:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                          {product.barcode}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá bán:</span>
                        <span className="font-semibold text-blue-600">
                          {product.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Danh mục:</span>
                        <span className="text-gray-800">{product.category}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nhà cung cấp:</span>
                        <span className="text-gray-800">{product.supplier}</span>
                      </div>
                    </div>
                    
                    {product.description && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        {product.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Barcode Scanner Integration */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">📸 Mobile Barcode Scanner</h2>
              <div className="mb-4">
                <MobileBarcodeIntegration 
                  onProductScanned={handleProductScanned}
                />
              </div>
            </div>

            {/* Scanned Products History */}
            {scannedProducts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  🔍 Lịch sử quét ({scannedProducts.length})
                </h2>
                
                <div className="space-y-3">
                  {scannedProducts.map((product, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">
                            {product.productInfo?.name || 'Chưa xác định'}
                          </div>
                          <div className="text-sm text-gray-600 font-mono">
                            Mã vạch: {product.barcode}
                          </div>
                          <div className="text-sm text-blue-600">
                            Phương pháp: {product.scanMethod || 'Thủ công'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date().toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">📋 Hướng dẫn test:</h3>
              <ol className="list-decimal list-inside text-blue-800 space-y-2">
                <li>Kiểm tra danh sách sản phẩm trong kho ở trên</li>
                <li>Sử dụng Mobile Scanner để quét mã vạch sản phẩm</li>
                <li>Copy mã vạch và test trên trang POS</li>
                <li>Kiểm tra tính năng tìm kiếm thông minh trong POS</li>
              </ol>
              
              <div className="mt-4 p-4 bg-white rounded border-l-4 border-green-500">
                <h4 className="font-semibold text-green-800 mb-2">✅ Mã vạch có sẵn để test:</h4>
                <div className="space-y-1 text-sm">
                  {products.slice(0, 4).map(product => (
                    <div key={product.id} className="font-mono bg-gray-100 p-2 rounded">
                      <strong>{product.barcode}</strong> - {product.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <Link
                  href="/pos"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🛒 Test POS Scanner
                </Link>
                <Link
                  href="/inventory"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  📦 Quản lý Inventory
                </Link>
                <Link
                  href="/barcode-scanner"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  📷 Advanced Scanner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
