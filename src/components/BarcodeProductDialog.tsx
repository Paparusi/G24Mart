'use client'
import React, { useState } from 'react'
import { ScannedProductData } from '@/hooks/useEnhancedBarcodeScanner'

interface BarcodeProductDialogProps {
  isOpen: boolean
  productData: ScannedProductData | null
  onClose: () => void
  onConfirm: (productData: ScannedProductData, customData: {
    name?: string
    price: number
    cost: number
    quantity: number
    category?: string
    description?: string
  }) => void
}

const BarcodeProductDialog: React.FC<BarcodeProductDialogProps> = ({
  isOpen,
  productData,
  onClose,
  onConfirm
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    cost: '',
    quantity: '1',
    category: '',
    description: ''
  })

  React.useEffect(() => {
    if (productData?.productInfo) {
      setFormData({
        name: productData.productInfo.name || '',
        price: productData.productInfo.price?.suggestedRetail?.toString() || '',
        cost: '',
        quantity: '1',
        category: productData.productInfo.category || '',
        description: productData.productInfo.description || ''
      })
    }
  }, [productData])

  if (!isOpen || !productData) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.price || !formData.cost) {
      alert('Vui lòng nhập giá bán và giá vốn')
      return
    }

    onConfirm(productData, {
      name: formData.name,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      quantity: parseInt(formData.quantity),
      category: formData.category,
      description: formData.description
    })

    onClose()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getApiSourceInfo = () => {
    if (!productData.apiResponse) return { color: 'gray', text: 'Không xác định' }
    
    const sourceMap: Record<string, { color: string; text: string }> = {
      'GS1Vietnam': { color: 'green', text: 'GS1 Việt Nam' },
      'OpenFoodFacts': { color: 'blue', text: 'Open Food Facts' },
      'BarcodeLookup': { color: 'purple', text: 'Barcode Lookup' },
      'UPCDatabase': { color: 'orange', text: 'UPC Database' },
      'Generated': { color: 'gray', text: 'Tạo mặc định' },
      'Cache': { color: 'indigo', text: 'Cache' }
    }
    
    return sourceMap[productData.apiResponse.source] || { color: 'gray', text: productData.apiResponse.source }
  }

  const sourceInfo = getApiSourceInfo()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold">Thông tin sản phẩm từ mã vạch</h2>
            <p className="text-blue-100 text-sm">Mã vạch: {productData.barcode}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium bg-${sourceInfo.color}-100 text-${sourceInfo.color}-800`}>
              📡 {sourceInfo.text}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Thông tin API */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Thông tin từ cơ sở dữ liệu
                </h3>
                
                {/* Hình ảnh sản phẩm */}
                {productData.productInfo?.images && productData.productInfo.images.length > 0 && (
                  <div className="mb-4">
                    <img
                      src={productData.productInfo.images[0]}
                      alt={productData.productInfo.name}
                      className="w-full h-48 object-contain bg-gray-100 rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tên sản phẩm</label>
                      <p className="text-gray-900 font-medium">{productData.productInfo?.name || 'Không xác định'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Thương hiệu</label>
                      <p className="text-gray-900">{productData.productInfo?.brand || 'Không xác định'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Danh mục</label>
                    <p className="text-gray-900">{productData.productInfo?.category || 'Không xác định'}</p>
                  </div>

                  {productData.productInfo?.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mô tả</label>
                      <p className="text-gray-900 text-sm">{productData.productInfo.description}</p>
                    </div>
                  )}

                  {productData.productInfo?.manufacturer && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nhà sản xuất</label>
                        <p className="text-gray-900 text-sm">{productData.productInfo.manufacturer.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Xuất xứ</label>
                        <p className="text-gray-900 text-sm">{productData.productInfo.manufacturer.country}</p>
                      </div>
                    </div>
                  )}

                  {productData.productInfo?.packaging && (
                    <div className="grid grid-cols-2 gap-4">
                      {productData.productInfo.packaging.weight && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Trọng lượng</label>
                          <p className="text-gray-900 text-sm">{productData.productInfo.packaging.weight}</p>
                        </div>
                      )}
                      {productData.productInfo.packaging.volume && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Thể tích</label>
                          <p className="text-gray-900 text-sm">{productData.productInfo.packaging.volume}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {productData.productInfo?.price?.suggestedRetail && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Giá đề xuất</label>
                      <p className="text-green-600 font-semibold">
                        {formatCurrency(productData.productInfo.price.suggestedRetail)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Performance Info */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Thông tin tra cứu</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Thời gian xử lý:</span>
                      <span className="ml-2 font-medium">{productData.processingTime}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Nguồn dữ liệu:</span>
                      <span className="ml-2 font-medium">{sourceInfo.text}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-600 text-sm">Thời gian quét:</span>
                    <span className="ml-2 text-sm">
                      {new Date(productData.scanTimestamp).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form nhập thông tin */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Thêm vào kho hàng
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input w-full"
                    placeholder="Nhập tên sản phẩm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá bán *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="form-input w-full"
                      placeholder="0"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá vốn *
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                      className="form-input w-full"
                      placeholder="0"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lượng
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="form-input w-full"
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="form-select w-full"
                    >
                      <option value="">Chọn danh mục</option>
                      <option value="Đồ uống">Đồ uống</option>
                      <option value="Thực phẩm">Thực phẩm</option>
                      <option value="Bánh kẹo">Bánh kẹo</option>
                      <option value="Gia vị">Gia vị</option>
                      <option value="Hóa mỹ phẩm">Hóa mỹ phẩm</option>
                      <option value="Văn phòng phẩm">Văn phòng phẩm</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="form-input w-full resize-none"
                    rows={3}
                    placeholder="Mô tả chi tiết sản phẩm"
                  />
                </div>

                {/* Profit calculation */}
                {formData.price && formData.cost && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Tính toán lợi nhuận</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">Lợi nhuận/sản phẩm:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(parseFloat(formData.price) - parseFloat(formData.cost))}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-700">Tỷ suất lợi nhuận:</span>
                        <span className="ml-2 font-medium">
                          {(((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.cost)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Thêm vào kho
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BarcodeProductDialog
