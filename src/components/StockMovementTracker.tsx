'use client'

import { useState, useEffect } from 'react'
import { 
  StockMovement, 
  InventoryProduct, 
  advancedInventoryService 
} from '@/services/AdvancedInventoryService'

interface StockMovementTrackerProps {
  products: InventoryProduct[]
  onStockAdjustment: (productId: string, adjustment: number, reason: string) => void
  onClose: () => void
}

interface MovementForm {
  productId: string
  type: StockMovement['type']
  quantity: number
  reason: string
  reference: string
  notes: string
}

const MOVEMENT_TYPES = [
  { value: 'IN', label: '📥 Nhập kho', color: 'text-green-600 bg-green-100' },
  { value: 'OUT', label: '📤 Xuất kho', color: 'text-red-600 bg-red-100' },
  { value: 'ADJUSTMENT', label: '⚖️ Điều chỉnh', color: 'text-blue-600 bg-blue-100' },
  { value: 'EXPIRED', label: '⏰ Hết hạn', color: 'text-gray-600 bg-gray-100' },
  { value: 'DAMAGED', label: '🔧 Hỏng hóc', color: 'text-orange-600 bg-orange-100' },
  { value: 'TRANSFER', label: '🔄 Chuyển kho', color: 'text-purple-600 bg-purple-100' }
] as const

const COMMON_REASONS = {
  IN: [
    'Nhập hàng từ nhà cung cấp',
    'Trả hàng từ khách',
    'Chuyển từ kho khác',
    'Kiểm kê tăng',
    'Lý do khác'
  ],
  OUT: [
    'Bán hàng',
    'Xuất trả nhà cung cấp',
    'Chuyển sang kho khác',
    'Mẫu sản phẩm',
    'Lý do khác'
  ],
  ADJUSTMENT: [
    'Kiểm kê định kỳ',
    'Sai sót nhập liệu',
    'Điều chỉnh hệ thống',
    'Cân đối tồn kho',
    'Lý do khác'
  ],
  EXPIRED: [
    'Hết hạn sử dụng',
    'Gần hết hạn - thanh lý',
    'Kiểm tra chất lượng',
    'Lý do khác'
  ],
  DAMAGED: [
    'Hư hỏng trong vận chuyển',
    'Hư hỏng do bảo quản',
    'Lỗi sản xuất',
    'Tai nạn kho bãi',
    'Lý do khác'
  ],
  TRANSFER: [
    'Chuyển giữa các chi nhánh',
    'Tái phân bổ tồn kho',
    'Cân bằng lưu kho',
    'Lý do khác'
  ]
}

export default function StockMovementTracker({ 
  products, 
  onStockAdjustment, 
  onClose 
}: StockMovementTrackerProps) {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'history' | 'add' | 'batch'>('history')
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [filterType, setFilterType] = useState<StockMovement['type'] | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  // Single movement form
  const [movementForm, setMovementForm] = useState<MovementForm>({
    productId: '',
    type: 'ADJUSTMENT',
    quantity: 0,
    reason: '',
    reference: '',
    notes: ''
  })

  // Batch movements
  const [batchMovements, setBatchMovements] = useState<MovementForm[]>([])
  const [showBatchAdd, setShowBatchAdd] = useState(false)

  useEffect(() => {
    loadMovements()
  }, [dateRange, filterType])

  const loadMovements = async () => {
    setLoading(true)
    try {
      const allMovements = await advancedInventoryService.getStockMovements()
      
      let filteredMovements = allMovements
      
      // Filter by date range
      const fromDate = new Date(dateRange.from)
      const toDate = new Date(dateRange.to)
      filteredMovements = filteredMovements.filter(m => {
        const movementDate = new Date(m.timestamp)
        return movementDate >= fromDate && movementDate <= toDate
      })
      
      // Filter by type
      if (filterType !== 'ALL') {
        filteredMovements = filteredMovements.filter(m => m.type === filterType)
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filteredMovements = filteredMovements.filter(m => {
          const product = products.find(p => p.id === m.productId)
          return product?.name.toLowerCase().includes(searchLower) ||
                 product?.barcode.includes(searchTerm) ||
                 m.reason.toLowerCase().includes(searchLower) ||
                 m.reference?.toLowerCase().includes(searchLower)
        })
      }
      
      setMovements(filteredMovements)
    } catch (error) {
      
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitMovement = async () => {
    if (!movementForm.productId || !movementForm.quantity || !movementForm.reason) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    try {
      const quantity = movementForm.type === 'OUT' || movementForm.type === 'EXPIRED' || movementForm.type === 'DAMAGED'
        ? -Math.abs(movementForm.quantity)
        : Math.abs(movementForm.quantity)

      await advancedInventoryService.addStockMovement({
        productId: movementForm.productId,
        type: movementForm.type,
        quantity,
        reason: movementForm.reason,
        reference: movementForm.reference || undefined,
        timestamp: new Date().toISOString(),
        notes: movementForm.notes || undefined
      })

      onStockAdjustment(movementForm.productId, quantity, movementForm.reason)
      
      // Reset form
      setMovementForm({
        productId: '',
        type: 'ADJUSTMENT',
        quantity: 0,
        reason: '',
        reference: '',
        notes: ''
      })
      
      // Reload movements
      await loadMovements()
      
      alert('Đã ghi nhận giao dịch kho!')
      
    } catch (error) {
      
      alert('Lỗi khi ghi nhận giao dịch!')
    }
  }

  const handleBatchSubmit = async () => {
    if (batchMovements.length === 0) {
      alert('Chưa có giao dịch nào để xử lý!')
      return
    }

    try {
      for (const movement of batchMovements) {
        if (!movement.productId || !movement.quantity || !movement.reason) continue

        const quantity = movement.type === 'OUT' || movement.type === 'EXPIRED' || movement.type === 'DAMAGED'
          ? -Math.abs(movement.quantity)
          : Math.abs(movement.quantity)

        await advancedInventoryService.addStockMovement({
          productId: movement.productId,
          type: movement.type,
          quantity,
          reason: movement.reason,
          reference: movement.reference || undefined,
          timestamp: new Date().toISOString(),
          notes: movement.notes || undefined
        })

        onStockAdjustment(movement.productId, quantity, movement.reason)
      }

      setBatchMovements([])
      await loadMovements()
      
      alert(`Đã xử lý ${batchMovements.length} giao dịch kho!`)
      
    } catch (error) {
      
      alert('Lỗi khi xử lý giao dịch hàng loạt!')
    }
  }

  const addToBatch = () => {
    setBatchMovements([...batchMovements, { ...movementForm }])
    setMovementForm({
      productId: '',
      type: 'ADJUSTMENT',
      quantity: 0,
      reason: '',
      reference: '',
      notes: ''
    })
  }

  const removFromBatch = (index: number) => {
    setBatchMovements(batchMovements.filter((_, i) => i !== index))
  }

  const getMovementTypeInfo = (type: StockMovement['type']) => {
    return MOVEMENT_TYPES.find(t => t.value === type) || MOVEMENT_TYPES[0]
  }

  const getTotalsByType = () => {
    const totals = movements.reduce((acc, movement) => {
      if (!acc[movement.type]) {
        acc[movement.type] = { count: 0, quantity: 0 }
      }
      acc[movement.type].count++
      acc[movement.type].quantity += Math.abs(movement.quantity)
      return acc
    }, {} as Record<StockMovement['type'], { count: number, quantity: number }>)

    return totals
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount)
  }

  const totals = getTotalsByType()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">📊 Theo Dõi Xuất Nhập Kho</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'history', label: '📋 Lịch Sử', icon: '📋' },
              { id: 'add', label: '➕ Thêm Giao Dịch', icon: '➕' },
              { id: 'batch', label: '📦 Xử Lý Hàng Loạt', icon: '📦' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'history' && (
            <div className="p-6 h-full flex flex-col">
              {/* Filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tất cả loại</option>
                  {MOVEMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Summary Cards */}
              <div className="mb-6 grid grid-cols-2 md:grid-cols-6 gap-4">
                {MOVEMENT_TYPES.map(type => {
                  const total = totals[type.value] || { count: 0, quantity: 0 }
                  return (
                    <div key={type.value} className="bg-gray-50 rounded-lg p-3">
                      <div className={`text-xs font-medium mb-1 px-2 py-1 rounded ${type.color}`}>
                        {type.label}
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{total.count} lần</div>
                      <div className="text-xs text-gray-500">{total.quantity} SP</div>
                    </div>
                  )
                })}
              </div>

              {/* Movements Table */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tham chiếu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {movements.map(movement => {
                        const product = products.find(p => p.id === movement.productId)
                        const typeInfo = getMovementTypeInfo(movement.type)
                        
                        return (
                          <tr key={movement.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(movement.timestamp).toLocaleString('vi-VN')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {product?.name || 'Sản phẩm không tồn tại'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product?.barcode}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {movement.reason}
                            </td>
                            <td className="px-4 py-3 text-sm text-blue-600">
                              {movement.reference || '-'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold mb-6">➕ Thêm Giao Dịch Mới</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sản phẩm *
                      </label>
                      <select
                        value={movementForm.productId}
                        onChange={(e) => setMovementForm({...movementForm, productId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn sản phẩm</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} (Tồn: {product.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại giao dịch *
                      </label>
                      <select
                        value={movementForm.type}
                        onChange={(e) => setMovementForm({...movementForm, type: e.target.value as StockMovement['type'], reason: ''})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {MOVEMENT_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số lượng *
                      </label>
                      <input
                        type="number"
                        value={movementForm.quantity || ''}
                        onChange={(e) => setMovementForm({...movementForm, quantity: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập số lượng..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lý do *
                      </label>
                      <select
                        value={movementForm.reason}
                        onChange={(e) => setMovementForm({...movementForm, reason: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn lý do</option>
                        {COMMON_REASONS[movementForm.type].map(reason => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tham chiếu (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={movementForm.reference}
                      onChange={(e) => setMovementForm({...movementForm, reference: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Số hóa đơn, PO, etc..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      value={movementForm.notes}
                      onChange={(e) => setMovementForm({...movementForm, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Ghi chú thêm..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSubmitMovement}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      ✓ Ghi Nhận Giao Dịch
                    </button>
                    
                    <button
                      onClick={addToBatch}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      📦 Thêm vào Batch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'batch' && (
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">📦 Xử Lý Hàng Loạt ({batchMovements.length} giao dịch)</h3>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setBatchMovements([])}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={batchMovements.length === 0}
                  >
                    🗑️ Xóa Tất Cả
                  </button>
                  
                  <button
                    onClick={handleBatchSubmit}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    disabled={batchMovements.length === 0}
                  >
                    ✓ Xử Lý Tất Cả
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                {batchMovements.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📦</div>
                      <p>Chưa có giao dịch nào</p>
                      <p className="text-sm">Chuyển sang tab "Thêm Giao Dịch" để bắt đầu</p>
                    </div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {batchMovements.map((movement, index) => {
                        const product = products.find(p => p.id === movement.productId)
                        const typeInfo = getMovementTypeInfo(movement.type)
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {product?.name || 'Sản phẩm không tồn tại'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              {movement.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {movement.reason}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removFromBatch(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                🗑️ Xóa
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
