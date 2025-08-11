'use client'

import { useState, useEffect } from 'react'
import { WarehouseLocation, InventoryProduct } from '@/services/AdvancedInventoryService'

interface LocationManagerProps {
  products: InventoryProduct[]
  onLocationUpdate: (productId: string, location: WarehouseLocation) => void
  onClose: () => void
}

interface Zone {
  id: string
  name: string
  aisles: Aisle[]
}

interface Aisle {
  id: string
  name: string
  shelves: Shelf[]
}

interface Shelf {
  id: string
  name: string
  positions: Position[]
}

interface Position {
  id: string
  name: string
  occupied: boolean
  productId?: string
  productName?: string
}

const WAREHOUSE_LAYOUT: Zone[] = [
  {
    id: 'A',
    name: 'Khu A - Thực phẩm tươi sống',
    aisles: [
      {
        id: '01',
        name: 'Lối 01',
        shelves: [
          {
            id: 'A',
            name: 'Kệ A - Trên',
            positions: Array.from({ length: 6 }, (_, i) => ({
              id: `${i + 1}`,
              name: `Vị trí ${i + 1}`,
              occupied: false
            }))
          },
          {
            id: 'B',
            name: 'Kệ B - Giữa',
            positions: Array.from({ length: 6 }, (_, i) => ({
              id: `${i + 1}`,
              name: `Vị trí ${i + 1}`,
              occupied: false
            }))
          },
          {
            id: 'C',
            name: 'Kệ C - Dưới',
            positions: Array.from({ length: 6 }, (_, i) => ({
              id: `${i + 1}`,
              name: `Vị trí ${i + 1}`,
              occupied: false
            }))
          }
        ]
      },
      {
        id: '02',
        name: 'Lối 02',
        shelves: [
          {
            id: 'A',
            name: 'Kệ A - Trên',
            positions: Array.from({ length: 6 }, (_, i) => ({
              id: `${i + 1}`,
              name: `Vị trí ${i + 1}`,
              occupied: false
            }))
          },
          {
            id: 'B',
            name: 'Kệ B - Giữa',
            positions: Array.from({ length: 6 }, (_, i) => ({
              id: `${i + 1}`,
              name: `Vị trí ${i + 1}`,
              occupied: false
            }))
          }
        ]
      }
    ]
  },
  {
    id: 'B',
    name: 'Khu B - Nước giải khát & Đồ khô',
    aisles: [
      {
        id: '01',
        name: 'Lối 01',
        shelves: [
          {
            id: 'A',
            name: 'Kệ A - Nước ngọt',
            positions: Array.from({ length: 8 }, (_, i) => ({
              id: `${i + 1}`,
              name: `Vị trí ${i + 1}`,
              occupied: false
            }))
          },
          {
            id: 'B',
            name: 'Kệ B - Nước suối',
            positions: Array.from({ length: 8 }, (_, i) => ({
              id: `${i + 1}`,
              name: `Vị trí ${i + 1}`,
              occupied: false
            }))
          }
        ]
      },
      {
        id: '02',
        name: 'Lối 02',
        shelves: [
          {
            id: 'A',
            name: 'Kệ A - Mì ăn liền',
            positions: Array.from({ length: 8 }, (_, i) => ({
              id: `${i + 1}`,
              name: `Vị trí ${i + 1}`,
              occupied: false
            }))
          },
          {
            id: 'B',
            name: 'Kệ B - Bánh kẹo',
            positions: Array.from({ length: 8 }, (_, i) => ({
              id: `${i + 1}`,
              name: `Vị trí ${i + 1}`,
              occupied: false
            }))
          }
        ]
      }
    ]
  },
  {
    id: 'C',
    name: 'Khu C - Đồ gia dụng & Khác',
    aisles: [
      {
        id: '01',
        name: 'Lối 01',
        shelves: [
          {
            id: 'A',
            name: 'Kệ A',
            positions: Array.from({ length: 4 }, (_, i) => ({
              id: `${i + 1}`,
              name: `Vị trí ${i + 1}`,
              occupied: false
            }))
          }
        ]
      }
    ]
  }
]

export default function WarehouseLocationManager({ products, onLocationUpdate, onClose }: LocationManagerProps) {
  const [warehouseLayout, setWarehouseLayout] = useState<Zone[]>(WAREHOUSE_LAYOUT)
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'assign' | 'overview'>('assign')

  useEffect(() => {
    // Update warehouse layout with current product locations
    const updatedLayout = warehouseLayout.map(zone => ({
      ...zone,
      aisles: zone.aisles.map(aisle => ({
        ...aisle,
        shelves: aisle.shelves.map(shelf => ({
          ...shelf,
          positions: shelf.positions.map(position => {
            const product = products.find(p => 
              p.location &&
              p.location.zone === zone.id &&
              p.location.aisle === aisle.id &&
              p.location.shelf === shelf.id &&
              p.location.position === position.id
            )
            
            return {
              ...position,
              occupied: !!product,
              productId: product?.id,
              productName: product?.name
            }
          })
        }))
      }))
    }))
    
    setWarehouseLayout(updatedLayout)
  }, [products])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const unassignedProducts = products.filter(product => !product.location)

  const handleLocationClick = (zone: string, aisle: string, shelf: string, position: string, occupied: boolean) => {
    if (occupied || !selectedProduct) return

    const location: WarehouseLocation = { zone, aisle, shelf, position }
    setSelectedLocation(location)
  }

  const handleAssignLocation = () => {
    if (!selectedProduct || !selectedLocation) return

    onLocationUpdate(selectedProduct.id, selectedLocation)
    setSelectedProduct(null)
    setSelectedLocation(null)
  }

  const getLocationString = (location: WarehouseLocation) => {
    return `${location.zone}-${location.aisle}-${location.shelf}-${location.position}`
  }

  const getPositionColor = (position: Position, isSelected: boolean) => {
    if (isSelected) return 'bg-blue-500 text-white border-blue-600'
    if (position.occupied) return 'bg-red-100 text-red-600 border-red-200'
    if (selectedProduct) return 'bg-green-100 text-green-600 border-green-200 hover:bg-green-200 cursor-pointer'
    return 'bg-gray-100 text-gray-400 border-gray-200'
  }

  const getOccupancyStats = () => {
    const totalPositions = warehouseLayout.reduce((total, zone) => 
      total + zone.aisles.reduce((aisleTotal, aisle) => 
        aisleTotal + aisle.shelves.reduce((shelfTotal, shelf) => 
          shelfTotal + shelf.positions.length, 0), 0), 0)
    
    const occupiedPositions = warehouseLayout.reduce((total, zone) => 
      total + zone.aisles.reduce((aisleTotal, aisle) => 
        aisleTotal + aisle.shelves.reduce((shelfTotal, shelf) => 
          shelfTotal + shelf.positions.filter(p => p.occupied).length, 0), 0), 0)
    
    return { totalPositions, occupiedPositions, occupancyRate: (occupiedPositions / totalPositions) * 100 }
  }

  const stats = getOccupancyStats()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl h-5/6 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">🏪 Quản Lý Vị Trí Kho</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('assign')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === 'assign' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📍 Phân Bổ Vị Trí
              </button>
              <button
                onClick={() => setViewMode('overview')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === 'overview' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📊 Tổng Quan
              </button>
            </div>
            
            <div className="flex gap-4 text-sm">
              <div className="bg-green-100 text-green-600 px-3 py-1 rounded-lg">
                🟢 Trống: {stats.totalPositions - stats.occupiedPositions}
              </div>
              <div className="bg-red-100 text-red-600 px-3 py-1 rounded-lg">
                🔴 Đã dùng: {stats.occupiedPositions}
              </div>
              <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg">
                📊 Tỷ lệ: {stats.occupancyRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {viewMode === 'assign' && (
            <>
              {/* Product Selection Panel */}
              <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="🔍 Tìm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    📦 Sản phẩm chưa phân bổ ({unassignedProducts.length})
                  </h3>
                  <div className="space-y-2">
                    {unassignedProducts.map(product => (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedProduct?.id === product.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.category}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    🗂️ Tất cả sản phẩm
                  </h3>
                  <div className="space-y-2">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedProduct?.id === product.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>{product.category}</span>
                          {product.location && (
                            <span className="text-blue-600">
                              📍 {getLocationString(product.location)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Warehouse Layout */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-6">
                  {warehouseLayout.map(zone => (
                    <div key={zone.id} className="border border-gray-200 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{zone.name}</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {zone.aisles.map(aisle => (
                          <div key={aisle.id} className="border border-gray-100 rounded-lg p-3">
                            <h4 className="font-semibold text-gray-700 mb-3">{aisle.name}</h4>
                            
                            <div className="space-y-3">
                              {aisle.shelves.map(shelf => (
                                <div key={shelf.id} className="bg-gray-50 rounded-lg p-3">
                                  <h5 className="text-sm font-medium text-gray-600 mb-2">{shelf.name}</h5>
                                  
                                  <div className="grid grid-cols-6 gap-1">
                                    {shelf.positions.map(position => {
                                      const isSelected = selectedLocation?.zone === zone.id &&
                                        selectedLocation?.aisle === aisle.id &&
                                        selectedLocation?.shelf === shelf.id &&
                                        selectedLocation?.position === position.id

                                      return (
                                        <div
                                          key={position.id}
                                          onClick={() => handleLocationClick(zone.id, aisle.id, shelf.id, position.id, position.occupied)}
                                          className={`
                                            p-2 text-xs text-center border rounded transition-all
                                            ${getPositionColor(position, isSelected)}
                                          `}
                                          title={position.occupied ? position.productName : 'Vị trí trống'}
                                        >
                                          {position.id}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assignment Actions */}
                {selectedProduct && selectedLocation && (
                  <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Gán vị trí:</p>
                      <p className="font-semibold">{selectedProduct.name}</p>
                      <p className="text-sm text-blue-600">📍 {getLocationString(selectedLocation)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(null)
                          setSelectedLocation(null)
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleAssignLocation}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        ✓ Xác Nhận
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {viewMode === 'overview' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouseLayout.map(zone => {
                  const zoneProducts = products.filter(p => p.location?.zone === zone.id)
                  const zoneCapacity = zone.aisles.reduce((total, aisle) => 
                    total + aisle.shelves.reduce((shelfTotal, shelf) => 
                      shelfTotal + shelf.positions.length, 0), 0)
                  
                  return (
                    <div key={zone.id} className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{zone.name}</h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Sản phẩm:</p>
                            <p className="font-semibold text-gray-900">{zoneProducts.length}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Công suất:</p>
                            <p className="font-semibold text-gray-900">{zoneCapacity}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-500 text-sm mb-1">Tỷ lệ sử dụng:</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(zoneProducts.length / zoneCapacity) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {((zoneProducts.length / zoneCapacity) * 100).toFixed(1)}%
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-sm mb-2">Top sản phẩm:</p>
                          <div className="space-y-1">
                            {zoneProducts.slice(0, 3).map(product => (
                              <div key={product.id} className="text-xs bg-gray-50 p-2 rounded">
                                <p className="font-medium truncate">{product.name}</p>
                                <p className="text-gray-500">
                                  📍 {getLocationString(product.location!)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
