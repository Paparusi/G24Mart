'use client'

import { useState } from 'react'
import { InventoryProduct } from '@/services/AdvancedInventoryService'

interface InventoryGridViewProps {
  products: InventoryProduct[]
  selectedProducts: Set<string>
  onToggleSelect: (productId: string) => void
  onSelectAll: () => void
  onEditProduct: (product: InventoryProduct) => void
  searchTerm: string
  categoryFilter: string
  supplierFilter: string
  lowStockOnly: boolean
}

export default function InventoryGridView({
  products,
  selectedProducts,
  onToggleSelect,
  onSelectAll,
  onEditProduct,
  searchTerm,
  categoryFilter,
  supplierFilter,
  lowStockOnly
}: InventoryGridViewProps) {
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price' | 'category'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const filteredProducts = products
    .filter(product => {
      if (!product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !product.barcode.includes(searchTerm)) return false
      if (categoryFilter && product.category !== categoryFilter) return false
      if (supplierFilter && product.supplier !== supplierFilter) return false
      if (lowStockOnly && product.stock > product.minStock) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'stock':
          comparison = a.stock - b.stock
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const getStockStatus = (product: InventoryProduct) => {
    if (product.stock === 0) return { label: 'Hết hàng', color: 'bg-red-100 text-red-800' }
    if (product.stock <= product.minStock) return { label: 'Sắp hết', color: 'bg-yellow-100 text-yellow-800' }
    if (product.stock >= product.maxStock) return { label: 'Dư thừa', color: 'bg-purple-100 text-purple-800' }
    return { label: 'Bình thường', color: 'bg-green-100 text-green-800' }
  }

  const isExpiringSoon = (product: InventoryProduct) => {
    if (!product.expiryDate) return false
    const expiryDate = new Date(product.expiryDate)
    const warningDate = new Date()
    warningDate.setDate(warningDate.getDate() + 30) // 30 days warning
    return expiryDate <= warningDate
  }

  return (
    <div className="space-y-6">
      {/* Grid Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Sắp xếp theo:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Tên sản phẩm</option>
              <option value="stock">Số lượng tồn</option>
              <option value="price">Giá bán</option>
              <option value="category">Danh mục</option>
            </select>
            
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1 text-gray-600 hover:text-gray-900"
              title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            >
              {sortOrder === 'asc' ? '↗️' : '↘️'}
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Hiển thị {filteredProducts.length} / {products.length} sản phẩm
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product)
          const expiringSoon = isExpiringSoon(product)
          
          return (
            <div
              key={product.id}
              className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                selectedProducts.has(product.id) ? 'ring-2 ring-blue-500 border-blue-300' : ''
              }`}
            >
              {/* Product Image & Selection */}
              <div className="relative">
                <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <span className="text-6xl">📦</span>
                  )}
                </div>
                
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => onToggleSelect(product.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>

                {/* Status Badges */}
                <div className="absolute top-2 right-2 space-y-1">
                  {expiringSoon && (
                    <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                      ⏰ Sắp hết hạn
                    </div>
                  )}
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${stockStatus.color}`}>
                    {stockStatus.label}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                  <p className="text-xs text-gray-500 font-mono">{product.barcode}</p>
                </div>

                {/* Price & Stock */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Giá bán:</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tồn kho:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        product.stock <= product.minStock ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {product.stock}
                      </span>
                      <span className="text-xs text-gray-500">
                        (Min: {product.minStock})
                      </span>
                    </div>
                  </div>

                  {/* Warehouse Location */}
                  {product.location && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Vị trí:</span>
                      <span className="text-sm font-mono text-gray-900">
                        {product.location.zone}-{product.location.aisle}-{product.location.shelf}-{product.location.position}
                      </span>
                    </div>
                  )}
                </div>

                {/* Supplier & Expiry */}
                <div className="space-y-1 pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Nhà cung cấp:</span>
                    <span className="text-gray-700 truncate ml-2">{product.supplier}</span>
                  </div>
                  
                  {product.expiryDate && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Hết hạn:</span>
                      <span className={`${expiringSoon ? 'text-orange-600' : 'text-gray-700'}`}>
                        {new Date(product.expiryDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded font-medium transition-colors"
                    >
                      ✏️ Sửa
                    </button>
                    
                    <button
                      onClick={() => {/* Quick stock update */}}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-3 rounded font-medium transition-colors"
                      title="Cập nhật nhanh"
                    >
                      🔢
                    </button>
                    
                    <button
                      onClick={() => {/* View details */}}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-3 rounded font-medium transition-colors"
                      title="Xem chi tiết"
                    >
                      👁️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h3>
          <p className="text-gray-600 mb-4">
            Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
          <button
            onClick={() => {/* Reset filters */}}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  )
}
