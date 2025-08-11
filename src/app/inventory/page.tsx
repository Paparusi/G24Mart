'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useBarcodeInventoryManager } from '@/hooks/useEnhancedBarcodeScanner'
import BarcodeProductDialog from '@/components/BarcodeProductDialog'
import UnifiedBarcodeScanner from '@/components/UnifiedBarcodeScanner'
// import AdvancedInventoryAnalytics from '@/components/AdvancedInventoryAnalytics'
import InventoryGridView from '@/components/InventoryGridView'
import { 
  advancedInventoryService, 
  InventoryProduct,
  InventoryAlert,
  StockMovement,
  WarehouseLocation 
} from '@/services/AdvancedInventoryService'

// Legacy Product interface for compatibility
interface Product {
  id: string
  name: string
  barcode: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  category: string
  supplier: string
  expiryDate?: string
  description?: string
}

// Convert legacy Product to InventoryProduct
const convertToInventoryProduct = (product: Product): InventoryProduct => ({
  ...product,
  maxStock: product.minStock * 4, // Default max stock
  subcategory: undefined,
  supplierCode: undefined,
  brand: product.supplier,
  sku: product.barcode,
  manufactureDate: undefined,
  location: undefined,
  images: [],
  weight: undefined,
  dimensions: undefined,
  tags: [product.category.toLowerCase()],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastRestockDate: undefined,
  lastSoldDate: undefined
})

const mockInventory: Product[] = [
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
  },
  {
    id: '3',
    name: 'Nước suối Lavie 500ml',
    barcode: '8934673001236',
    price: 8000,
    costPrice: 6000,
    stock: 120,
    minStock: 50,
    category: 'Nước Giải Khát',
    supplier: 'Lavie',
    description: 'Nước suối thiên nhiên'
  },
  {
    id: '4',
    name: 'Mì tôm Hảo Hảo',
    barcode: '8934673001237',
    price: 4500,
    costPrice: 3800,
    stock: 2,
    minStock: 30,
    category: 'Thực Phẩm Khô',
    supplier: 'Acecook Việt Nam',
    description: 'Mì ăn liền vị tôm chua cay'
  },
  {
    id: '5',
    name: 'Kẹo Mentos',
    barcode: '8934673001238',
    price: 12000,
    costPrice: 9000,
    stock: 30,
    minStock: 20,
    category: 'Bánh Kẹo',
    supplier: 'Mentos Việt Nam',
    description: 'Kẹo bạc hà'
  },
]

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Product[]>(mockInventory)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [sortBy, setSortBy] = useState('name')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [showExpiringOnly, setShowExpiringOnly] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'analytics'>('table')

  const [newProduct, setNewProduct] = useState({
    name: '',
    barcode: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '',
    category: '',
    supplier: '',
    expiryDate: '',
    description: ''
  })

  // Barcode Scanner Integration
  const {
    pendingProducts,
    addPendingProduct,
    confirmAddToInventory,
    clearPendingProducts
  } = useBarcodeInventoryManager()

  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false)
  const [currentScannedProduct, setCurrentScannedProduct] = useState<any>(null)

  // Load alerts on component mount
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const alertsData = await advancedInventoryService.getAlerts(true) // unread only
        setAlerts(alertsData)
      } catch (error) {
        
      }
    }
    
    loadAlerts()
  }, [])

  // Advanced handlers
  const handleBulkPriceUpdate = useCallback(async (newPrice: number) => {
    if (selectedProducts.length === 0) return
    
    try {
      const updates = { price: newPrice, updatedAt: new Date().toISOString() }
      await advancedInventoryService.bulkUpdateProducts(selectedProducts, updates)
      
      setInventory(prev => prev.map(product => 
        selectedProducts.includes(product.id) 
          ? { ...product, price: newPrice }
          : product
      ))
      
      setSelectedProducts([])
      alert(`Đã cập nhật giá cho ${selectedProducts.length} sản phẩm`)
    } catch (error) {
      
      alert('Lỗi cập nhật hàng loạt')
    }
  }, [selectedProducts])

  const handleStockAdjustment = useCallback(async (productId: string, adjustment: number, reason: string) => {
    try {
      await advancedInventoryService.addStockMovement({
        productId,
        type: 'ADJUSTMENT',
        quantity: adjustment,
        reason,
        timestamp: new Date().toISOString()
      })

      setInventory(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, stock: Math.max(0, product.stock + adjustment) }
          : product
      ))
    } catch (error) {
      
    }
  }, [])

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredInventory.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredInventory.map(p => p.id))
    }
  }

  // Handler để thêm sản phẩm từ barcode vào inventory
  const handleConfirmBarcodeProduct = (productData: any, customData: any) => {
    const inventoryItem = confirmAddToInventory(productData, customData)
    
    // Chuyển đổi sang định dạng Product để thêm vào inventory
    const newInventoryProduct: Product = {
      id: inventoryItem.id,
      name: inventoryItem.name,
      barcode: inventoryItem.barcode,
      price: inventoryItem.price,
      costPrice: inventoryItem.cost,
      stock: inventoryItem.quantity,
      minStock: 10,
      category: inventoryItem.category,
      supplier: inventoryItem.brand || 'API Data',
      description: inventoryItem.description
    }

    setInventory(prev => [newInventoryProduct, ...prev])
    setShowBarcodeDialog(false)
    setCurrentScannedProduct(null)
    
    alert(`Đã thêm sản phẩm "${newInventoryProduct.name}" vào kho thành công!`)
  }

  const categories = ['Tất Cả', ...Array.from(new Set(inventory.map(item => item.category)))]
  
  const filteredInventory = inventory
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.barcode.includes(searchTerm)
      const matchesCategory = selectedCategory === 'Tất Cả' || item.category === selectedCategory
      const matchesLowStock = !showLowStockOnly || item.stock < item.minStock
      const matchesExpiring = !showExpiringOnly || (item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      return matchesSearch && matchesCategory && matchesLowStock && matchesExpiring
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'vi-VN')
        case 'stock':
          return a.stock - b.stock
        case 'price':
          return b.price - a.price
        case 'category':
          return a.category.localeCompare(b.category, 'vi-VN')
        default:
          return 0
      }
    })

  const lowStockItems = inventory.filter(item => item.stock < item.minStock)
  const expiringItems = inventory.filter(item => {
    if (!item.expiryDate) return false
    const expiryDate = new Date(item.expiryDate)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    return expiryDate <= sevenDaysFromNow
  })

  const updateStock = (productId: string, newStock: number) => {
    setInventory(inventory.map(item => 
      item.id === productId 
        ? { ...item, stock: Math.max(0, newStock) }
        : item
    ))
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { text: 'Hết Hàng', color: 'text-red-600 bg-red-100' }
    if (stock < minStock) return { text: 'Sắp Hết', color: 'text-orange-600 bg-orange-100' }
    return { text: 'Còn Hàng', color: 'text-green-600 bg-green-100' }
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.barcode || !newProduct.price) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc!')
      return
    }

    if (inventory.some(p => p.barcode === newProduct.barcode)) {
      alert('Mã vạch đã tồn tại!')
      return
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      barcode: newProduct.barcode,
      price: parseFloat(newProduct.price),
      costPrice: parseFloat(newProduct.costPrice) || 0,
      stock: parseInt(newProduct.stock) || 0,
      minStock: parseInt(newProduct.minStock) || 10,
      category: newProduct.category || 'Khác',
      supplier: newProduct.supplier || 'Chưa xác định',
      expiryDate: newProduct.expiryDate || undefined,
      description: newProduct.description || undefined
    }

    setInventory([...inventory, product])
    resetForm()
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      barcode: product.barcode,
      price: product.price.toString(),
      costPrice: product.costPrice.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      category: product.category,
      supplier: product.supplier,
      expiryDate: product.expiryDate || '',
      description: product.description || ''
    })
    setShowAddForm(true)
  }

  const handleUpdateProduct = () => {
    if (!editingProduct) return

    const updatedProduct: Product = {
      ...editingProduct,
      name: newProduct.name,
      barcode: newProduct.barcode,
      price: parseFloat(newProduct.price),
      costPrice: parseFloat(newProduct.costPrice) || 0,
      stock: parseInt(newProduct.stock) || 0,
      minStock: parseInt(newProduct.minStock) || 10,
      category: newProduct.category || 'Khác',
      supplier: newProduct.supplier || 'Chưa xác định',
      expiryDate: newProduct.expiryDate || undefined,
      description: newProduct.description || undefined
    }

    setInventory(inventory.map(p => p.id === editingProduct.id ? updatedProduct : p))
    resetForm()
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      setInventory(inventory.filter(p => p.id !== productId))
    }
  }

  const resetForm = () => {
    setNewProduct({
      name: '', barcode: '', price: '', costPrice: '', stock: '', minStock: '',
      category: '', supplier: '', expiryDate: '', description: ''
    })
    setEditingProduct(null)
    setShowAddForm(false)
  }

  const totalValue = inventory.reduce((sum, item) => sum + (item.costPrice * item.stock), 0)
  const totalProfit = inventory.reduce((sum, item) => sum + ((item.price - item.costPrice) * item.stock), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Về Trang Chủ
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">📦 Quản Lý Kho Hàng Nâng Cao</h1>
            
            {/* Alerts indicator */}
            {alerts.length > 0 && (
              <div className="relative">
                <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  🚨 {alerts.length} cảnh báo
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Bảng
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔲 Lưới
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewMode === 'analytics' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Phân Tích
              </button>
            </div>

            {/* Advanced Actions */}
            {viewMode === 'table' && (
              <>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    showBulkActions 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  }`}
                >
                  🔧 Thao Tác Hàng Loạt
                </button>
                
                {selectedProducts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Đã chọn: {selectedProducts.length}
                    </span>
                    <button
                      onClick={() => {
                        const newPrice = prompt('Nhập giá mới:')
                        if (newPrice) {
                          handleBulkPriceUpdate(parseFloat(newPrice))
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      💰 Cập Nhật Giá
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Unified Barcode Scanner */}
            {viewMode !== 'analytics' && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">🔍 Quét/Nhập Mã Vạch Để Thêm Sản Phẩm</h3>
                <UnifiedBarcodeScanner
                  onProductScanned={(productData) => {
                    
                    // Kiểm tra xem sản phẩm đã tồn tại trong kho chưa
                    const existingProduct = inventory.find(p => p.barcode === productData.barcode)
                    if (existingProduct) {
                      alert(`Sản phẩm "${existingProduct.name}" đã tồn tại trong kho với ${existingProduct.stock} sản phẩm`)
                      return
                    }

                    setCurrentScannedProduct(productData)
                    setShowBarcodeDialog(true)
                    addPendingProduct(productData)
                  }}
                  onError={(error) => {
                    
                    alert(`Lỗi: ${error}`)
                  }}
                  placeholder="Nhập mã vạch sản phẩm để thêm vào kho..."
                />
              </div>
            )}

            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium">
              📄 Xuất Excel
            </button>
            
            {viewMode !== 'analytics' && (
              <button
                onClick={() => {
                  setShowAddForm(true)
                  setEditingProduct(null)
                  setNewProduct({
                    name: '', barcode: '', price: '', costPrice: '', stock: '', minStock: '',
                    category: '', supplier: '', expiryDate: '', description: ''
                  })
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                ➕ Thêm Sản Phẩm
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Cảnh báo */}
        {(lowStockItems.length > 0 || expiringItems.length > 0) && (
          <div className="mb-6 space-y-3">
            {lowStockItems.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Cảnh Báo Hàng Sắp Hết ({lowStockItems.length} sản phẩm)
                </h3>
                <div className="text-sm text-orange-700 grid md:grid-cols-3 gap-2">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="bg-orange-100 rounded px-2 py-1">
                      {item.name} (Còn {item.stock}/{item.minStock})
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {expiringItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                  <span className="mr-2">🚨</span>
                  Cảnh Báo Hết Hạn ({expiringItems.length} sản phẩm)
                </h3>
                <div className="text-sm text-red-700 grid md:grid-cols-3 gap-2">
                  {expiringItems.map(item => (
                    <div key={item.id} className="bg-red-100 rounded px-2 py-1">
                      {item.name} (HSD: {new Date(item.expiryDate!).toLocaleDateString('vi-VN')})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Sản Phẩm</p>
                <p className="text-2xl font-semibold text-blue-600">{inventory.length}</p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hàng Sắp Hết</p>
                <p className="text-2xl font-semibold text-orange-600">{lowStockItems.length}</p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Giá Trị Kho</p>
                <p className="text-2xl font-semibold text-green-600">
                  {totalValue.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lợi Nhuận Dự Kiến</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {totalProfit.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-5 gap-4 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm hoặc mã vạch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="stock">Sắp xếp theo tồn kho</option>
              <option value="price">Sắp xếp theo giá</option>
              <option value="category">Sắp xếp theo loại</option>
            </select>
            
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                showLowStockOnly ? 'bg-orange-100 border-orange-300 text-orange-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {showLowStockOnly ? '✓' : ''} Chỉ hàng sắp hết
            </button>
            
            <button
              onClick={() => setShowExpiringOnly(!showExpiringOnly)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                showExpiringOnly ? 'bg-red-100 border-red-300 text-red-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {showExpiringOnly ? '✓' : ''} Chỉ hàng sắp hết hạn
            </button>
          </div>
        </div>

        {/* Bảng sản phẩm */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Sản Phẩm</th>
                  <th className="text-left py-3 px-4 font-semibold">Mã Vạch</th>
                  <th className="text-left py-3 px-4 font-semibold">Danh Mục</th>
                  <th className="text-left py-3 px-4 font-semibold">Giá Bán</th>
                  <th className="text-left py-3 px-4 font-semibold">Giá Vốn</th>
                  <th className="text-left py-3 px-4 font-semibold">Tồn Kho</th>
                  <th className="text-left py-3 px-4 font-semibold">Trạng Thái</th>
                  <th className="text-left py-3 px-4 font-semibold">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((product) => {
                  const status = getStockStatus(product.stock, product.minStock)
                  const profit = product.price - product.costPrice
                  const profitMargin = ((profit / product.price) * 100).toFixed(1)
                  
                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.supplier}</div>
                          {product.expiryDate && (
                            <div className="text-xs text-orange-600">
                              HSD: {new Date(product.expiryDate).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{product.barcode}</code>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-green-600">
                          {product.price.toLocaleString('vi-VN')} ₫
                        </div>
                        <div className="text-xs text-gray-500">
                          Lãi: {profitMargin}%
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {product.costPrice.toLocaleString('vi-VN')} ₫
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={() => updateStock(product.id, product.stock - 1)}
                            className="w-6 h-6 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                            disabled={product.stock === 0}
                          >
                            -
                          </button>
                          <span className="font-medium min-w-[3rem] text-center">
                            {product.stock}
                          </span>
                          <button
                            onClick={() => updateStock(product.id, product.stock + 1)}
                            className="w-6 h-6 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          Tối thiểu: {product.minStock}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {filteredInventory.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📦</div>
              <p>Không tìm thấy sản phẩm nào</p>
            </div>
          )}
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <InventoryGridView
            products={inventory.map(p => ({
              ...p,
              maxStock: p.minStock * 5, 
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }))}
            selectedProducts={new Set(selectedProducts)}
            onToggleSelect={(productId) => {
              setSelectedProducts(prev => 
                prev.includes(productId) 
                  ? prev.filter(id => id !== productId)
                  : [...prev, productId]
              )
            }}
            onSelectAll={() => {
              if (selectedProducts.length === inventory.length) {
                setSelectedProducts([])
              } else {
                setSelectedProducts(inventory.map(p => p.id))
              }
            }}
            onEditProduct={(product) => {
              setEditingProduct(product as any) // Type conversion for compatibility
              setShowAddForm(true)
              setNewProduct({
                name: product.name,
                barcode: product.barcode,
                price: product.price.toString(),
                costPrice: product.costPrice.toString(),
                stock: product.stock.toString(),
                minStock: product.minStock.toString(),
                category: product.category,
                supplier: product.supplier,
                expiryDate: product.expiryDate || '',
                description: product.description || ''
              })
            }}
            searchTerm={searchTerm}
            categoryFilter={selectedCategory === 'Tất Cả' ? '' : selectedCategory}
            supplierFilter={''}
            lowStockOnly={showLowStockOnly}
          />
        )}
      </div>

      {/* Form thêm/sửa sản phẩm */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Sửa Thông Tin Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Mã vạch *</label>
                <input
                  type="text"
                  value={newProduct.barcode}
                  onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Giá bán *</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Giá vốn</label>
                <input
                  type="number"
                  value={newProduct.costPrice}
                  onChange={(e) => setNewProduct({...newProduct, costPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Số lượng tồn kho</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tồn kho tối thiểu</label>
                <input
                  type="number"
                  value={newProduct.minStock}
                  onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Danh mục</label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Nước giải khát"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nhà cung cấp</label>
                <input
                  type="text"
                  value={newProduct.supplier}
                  onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Hạn sử dụng</label>
                <input
                  type="date"
                  value={newProduct.expiryDate}
                  onChange={(e) => setNewProduct({...newProduct, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                {editingProduct ? 'Cập Nhật' : 'Thêm Mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Analytics Dashboard */}
      {viewMode === 'analytics' && (
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">🏪 G24Mart Analytics</h1>
              <p className="text-gray-600 mb-6">Phân tích và báo cáo kho hàng thông minh</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="font-semibold text-gray-900">Tổng Quan</h3>
                  <p className="text-sm text-gray-600 mt-2">Xem tổng quan hiệu suất</p>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-4xl mb-3">🚨</div>
                  <h3 className="font-semibold text-gray-900">Cảnh Báo</h3>
                  <p className="text-sm text-gray-600 mt-2">Theo dõi cảnh báo kho</p>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-4xl mb-3">🔮</div>
                  <h3 className="font-semibold text-gray-900">Dự Báo AI</h3>
                  <p className="text-sm text-gray-600 mt-2">Dự báo nhu cầu thông minh</p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={() => setViewMode('table')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  📦 Quay Lại Quản Lý Kho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show advanced modals/dialogs */}
      {/* Barcode Product Dialog */}
      <BarcodeProductDialog
        isOpen={showBarcodeDialog}
        productData={currentScannedProduct}
        onClose={() => {
          setShowBarcodeDialog(false)
          setCurrentScannedProduct(null)
        }}
        onConfirm={handleConfirmBarcodeProduct}
      />
    </div>
  )
}
