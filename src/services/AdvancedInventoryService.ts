/**
 * Advanced Inventory Management Service
 * Provides sophisticated inventory operations, analytics, and automation
 */

export interface InventoryProduct {
  id: string
  name: string
  barcode: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  maxStock: number
  category: string
  subcategory?: string
  supplier: string
  supplierCode?: string
  brand?: string
  sku?: string
  expiryDate?: string
  manufactureDate?: string
  location?: WarehouseLocation
  description?: string
  images?: string[]
  weight?: number
  dimensions?: ProductDimensions
  tags?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastRestockDate?: string
  lastSoldDate?: string
}

export interface WarehouseLocation {
  zone: string      // A, B, C
  aisle: string     // 01, 02, 03
  shelf: string     // A, B, C, D
  position: string  // 1, 2, 3, 4
}

export interface ProductDimensions {
  length: number // cm
  width: number  // cm
  height: number // cm
}

export interface StockMovement {
  id: string
  productId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'EXPIRED' | 'DAMAGED' | 'TRANSFER'
  quantity: number
  reason: string
  reference?: string // PO number, invoice number, etc.
  timestamp: string
  userId?: string
  cost?: number
  notes?: string
  location?: WarehouseLocation
}

export interface InventoryAlert {
  id: string
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING' | 'EXPIRED' | 'OVERSTOCK' | 'PRICE_CHANGE'
  productId: string
  productName: string
  message: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isRead: boolean
  createdAt: string
  actionRequired?: string
  autoResolve?: boolean
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplierName: string
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED'
  items: PurchaseOrderItem[]
  totalAmount: number
  orderDate: string
  expectedDate?: string
  receivedDate?: string
  notes?: string
  createdBy: string
}

export interface PurchaseOrderItem {
  productId: string
  productName: string
  barcode: string
  quantityOrdered: number
  quantityReceived?: number
  unitCost: number
  totalCost: number
}

export interface InventoryAnalytics {
  totalProducts: number
  totalValue: number
  totalCostValue: number
  averageTurnover: number
  stockouts: number
  lowStockItems: number
  expiringItems: number
  topSellingProducts: ProductPerformance[]
  slowMovingProducts: ProductPerformance[]
  categoryBreakdown: CategoryAnalytics[]
  supplierPerformance: SupplierAnalytics[]
  monthlyTrends: MonthlyTrend[]
}

export interface ProductPerformance {
  productId: string
  productName: string
  category: string
  unitsSold: number
  revenue: number
  profit: number
  turnoverRate: number
  stockLevel: number
  daysInStock: number
}

export interface CategoryAnalytics {
  category: string
  productCount: number
  totalValue: number
  averageMargin: number
  turnoverRate: number
}

export interface SupplierAnalytics {
  supplierId: string
  supplierName: string
  productCount: number
  totalOrderValue: number
  averageLeadTime: number
  onTimeDelivery: number // percentage
  qualityRating: number
}

export interface MonthlyTrend {
  month: string
  totalValue: number
  costValue: number
  profit: number
  turnover: number
  newProducts: number
}

export interface InventoryForecast {
  productId: string
  productName: string
  currentStock: number
  predictedDemand: number
  recommendedReorderPoint: number
  recommendedOrderQuantity: number
  forecastAccuracy: number
  seasonalFactor: number
}

export interface BulkOperation {
  id: string
  type: 'PRICE_UPDATE' | 'CATEGORY_CHANGE' | 'SUPPLIER_CHANGE' | 'STOCK_ADJUSTMENT'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  totalItems: number
  processedItems: number
  failedItems: number
  startedAt: string
  completedAt?: string
  errors?: string[]
}

class AdvancedInventoryService {
  private products: InventoryProduct[] = []
  private stockMovements: StockMovement[] = []
  private alerts: InventoryAlert[] = []
  private purchaseOrders: PurchaseOrder[] = []
  private bulkOperations: BulkOperation[] = []

  // Product Management
  async getProducts(filters?: {
    category?: string
    supplier?: string
    lowStock?: boolean
    expiring?: boolean
    search?: string
    location?: string
    isActive?: boolean
  }): Promise<InventoryProduct[]> {
    let filtered = this.products

    if (filters) {
      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category)
      }
      if (filters.supplier) {
        filtered = filtered.filter(p => p.supplier === filters.supplier)
      }
      if (filters.lowStock) {
        filtered = filtered.filter(p => p.stock <= p.minStock)
      }
      if (filters.expiring) {
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(p => 
          p.expiryDate && new Date(p.expiryDate) <= sevenDaysFromNow
        )
      }
      if (filters.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(search) ||
          p.barcode.includes(search) ||
          p.sku?.toLowerCase().includes(search) ||
          p.tags?.some(tag => tag.toLowerCase().includes(search))
        )
      }
      if (filters.location) {
        filtered = filtered.filter(p => 
          p.location && 
          `${p.location.zone}-${p.location.aisle}-${p.location.shelf}-${p.location.position}`
            .includes(filters.location!)
        )
      }
      if (filters.isActive !== undefined) {
        filtered = filtered.filter(p => p.isActive === filters.isActive)
      }
    }

    return filtered
  }

  async addProduct(product: Omit<InventoryProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryProduct> {
    const newProduct: InventoryProduct = {
      ...product,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.products.push(newProduct)
    
    // Create stock movement
    await this.addStockMovement({
      productId: newProduct.id,
      type: 'IN',
      quantity: product.stock,
      reason: 'Initial stock',
      reference: 'INITIAL',
      timestamp: new Date().toISOString()
    })

    return newProduct
  }

  async updateProduct(id: string, updates: Partial<InventoryProduct>): Promise<InventoryProduct> {
    const index = this.products.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Product not found')
    }

    const currentProduct = this.products[index]
    const updatedProduct = {
      ...currentProduct,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.products[index] = updatedProduct
    return updatedProduct
  }

  async bulkUpdateProducts(productIds: string[], updates: Partial<InventoryProduct>): Promise<BulkOperation> {
    const bulkOp: BulkOperation = {
      id: this.generateId(),
      type: 'PRICE_UPDATE',
      status: 'PROCESSING',
      totalItems: productIds.length,
      processedItems: 0,
      failedItems: 0,
      startedAt: new Date().toISOString(),
      errors: []
    }

    this.bulkOperations.push(bulkOp)

    // Simulate bulk processing
    setTimeout(async () => {
      for (const productId of productIds) {
        try {
          await this.updateProduct(productId, updates)
          bulkOp.processedItems++
        } catch (error) {
          bulkOp.failedItems++
          bulkOp.errors?.push(`${productId}: ${error}`)
        }
      }

      bulkOp.status = bulkOp.failedItems > 0 ? 'FAILED' : 'COMPLETED'
      bulkOp.completedAt = new Date().toISOString()
    }, 1000)

    return bulkOp
  }

  // Stock Movement Management
  async addStockMovement(movement: Omit<StockMovement, 'id'>): Promise<StockMovement> {
    const newMovement: StockMovement = {
      ...movement,
      id: this.generateId()
    }

    this.stockMovements.push(newMovement)

    // Update product stock
    const product = this.products.find(p => p.id === movement.productId)
    if (product) {
      switch (movement.type) {
        case 'IN':
          product.stock += movement.quantity
          product.lastRestockDate = movement.timestamp
          break
        case 'OUT':
          product.stock -= movement.quantity
          product.lastSoldDate = movement.timestamp
          break
        case 'ADJUSTMENT':
        case 'EXPIRED':
        case 'DAMAGED':
          product.stock += movement.quantity // quantity can be negative
          break
      }
      product.updatedAt = new Date().toISOString()

      // Check for alerts
      this.checkProductAlerts(product)
    }

    return newMovement
  }

  async getStockMovements(productId?: string, type?: StockMovement['type'], limit?: number): Promise<StockMovement[]> {
    let movements = this.stockMovements

    if (productId) {
      movements = movements.filter(m => m.productId === productId)
    }

    if (type) {
      movements = movements.filter(m => m.type === type)
    }

    // Sort by timestamp descending
    movements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (limit) {
      movements = movements.slice(0, limit)
    }

    return movements
  }

  // Alert Management
  async getAlerts(unreadOnly?: boolean, priority?: InventoryAlert['priority']): Promise<InventoryAlert[]> {
    let alerts = this.alerts

    if (unreadOnly) {
      alerts = alerts.filter(a => !a.isRead)
    }

    if (priority) {
      alerts = alerts.filter(a => a.priority === priority)
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.isRead = true
    }
  }

  private async checkProductAlerts(product: InventoryProduct): Promise<void> {
    // Low stock alert
    if (product.stock <= product.minStock && product.stock > 0) {
      this.createAlert({
        type: 'LOW_STOCK',
        productId: product.id,
        productName: product.name,
        message: `${product.name} sắp hết hàng (còn ${product.stock} sản phẩm)`,
        priority: product.stock <= product.minStock * 0.5 ? 'HIGH' : 'MEDIUM',
        actionRequired: 'Cần đặt hàng bổ sung'
      })
    }

    // Out of stock alert
    if (product.stock === 0) {
      this.createAlert({
        type: 'OUT_OF_STOCK',
        productId: product.id,
        productName: product.name,
        message: `${product.name} đã hết hàng`,
        priority: 'CRITICAL',
        actionRequired: 'Đặt hàng khẩn cấp'
      })
    }

    // Expiring products alert
    if (product.expiryDate) {
      const expiryDate = new Date(product.expiryDate)
      const now = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        this.createAlert({
          type: 'EXPIRING',
          productId: product.id,
          productName: product.name,
          message: `${product.name} sẽ hết hạn trong ${daysUntilExpiry} ngày`,
          priority: daysUntilExpiry <= 3 ? 'HIGH' : 'MEDIUM',
          actionRequired: 'Khuyến mãi để bán nhanh'
        })
      } else if (daysUntilExpiry <= 0) {
        this.createAlert({
          type: 'EXPIRED',
          productId: product.id,
          productName: product.name,
          message: `${product.name} đã hết hạn`,
          priority: 'CRITICAL',
          actionRequired: 'Loại bỏ khỏi kho'
        })
      }
    }

    // Overstock alert
    if (product.maxStock && product.stock > product.maxStock) {
      this.createAlert({
        type: 'OVERSTOCK',
        productId: product.id,
        productName: product.name,
        message: `${product.name} tồn kho quá mức (${product.stock}/${product.maxStock})`,
        priority: 'LOW',
        actionRequired: 'Xem xét khuyến mãi'
      })
    }
  }

  private async createAlert(alert: Omit<InventoryAlert, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find(a => 
      a.type === alert.type && 
      a.productId === alert.productId && 
      !a.isRead
    )

    if (!existingAlert) {
      this.alerts.push({
        ...alert,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        isRead: false
      })
    }
  }

  // Purchase Order Management
  async createPurchaseOrder(supplierId: string, supplierName: string, items: PurchaseOrderItem[]): Promise<PurchaseOrder> {
    const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0)

    const po: PurchaseOrder = {
      id: this.generateId(),
      orderNumber: this.generateOrderNumber(),
      supplierId,
      supplierName,
      status: 'DRAFT',
      items,
      totalAmount,
      orderDate: new Date().toISOString(),
      createdBy: 'current-user' 
    }

    this.purchaseOrders.push(po)
    return po
  }

  async generateAutoReorders(): Promise<PurchaseOrder[]> {
    const lowStockProducts = await this.getProducts({ lowStock: true })
    const supplierGroups = this.groupProductsBySupplier(lowStockProducts)

    const autoOrders: PurchaseOrder[] = []

    for (const [supplierId, products] of Object.entries(supplierGroups)) {
      const supplier = products[0].supplier
      const items: PurchaseOrderItem[] = products.map(product => ({
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        quantityOrdered: Math.max(product.minStock * 2, 50),
        unitCost: product.costPrice,
        totalCost: product.costPrice * Math.max(product.minStock * 2, 50)
      }))

      const po = await this.createPurchaseOrder(supplierId, supplier, items)
      autoOrders.push(po)
    }

    return autoOrders
  }

  // Analytics and Reporting
  async getInventoryAnalytics(): Promise<InventoryAnalytics> {
    const products = this.products
    const movements = this.stockMovements

    const totalProducts = products.length
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    const totalCostValue = products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0)

    const stockouts = products.filter(p => p.stock === 0).length
    const lowStockItems = products.filter(p => p.stock <= p.minStock && p.stock > 0).length
    const expiringItems = products.filter(p => {
      if (!p.expiryDate) return false
      const expiryDate = new Date(p.expiryDate)
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      return expiryDate <= sevenDaysFromNow
    }).length

    return {
      totalProducts,
      totalValue,
      totalCostValue,
      averageTurnover: this.calculateAverageTurnover(),
      stockouts,
      lowStockItems,
      expiringItems,
      topSellingProducts: await this.getTopSellingProducts(),
      slowMovingProducts: await this.getSlowMovingProducts(),
      categoryBreakdown: await this.getCategoryBreakdown(),
      supplierPerformance: await this.getSupplierPerformance(),
      monthlyTrends: await this.getMonthlyTrends()
    }
  }

  async getInventoryForecasts(): Promise<InventoryForecast[]> {
    // Simplified forecasting - in reality, this would use machine learning
    const products = this.products
    const forecasts: InventoryForecast[] = []

    for (const product of products) {
      const recentMovements = await this.getStockMovements(product.id, 'OUT', 30)
      const avgDailyDemand = recentMovements.reduce((sum, m) => sum + m.quantity, 0) / 30

      const forecast: InventoryForecast = {
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        predictedDemand: Math.ceil(avgDailyDemand * 7), // 7 days forecast
        recommendedReorderPoint: Math.max(product.minStock, Math.ceil(avgDailyDemand * 5)),
        recommendedOrderQuantity: Math.max(50, Math.ceil(avgDailyDemand * 14)),
        forecastAccuracy: 0.85, 
        seasonalFactor: 1.0 
      }

      forecasts.push(forecast)
    }

    return forecasts
  }

  // Helper Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private generateOrderNumber(): string {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const sequence = (this.purchaseOrders.length + 1).toString().padStart(3, '0')
    return `PO${dateStr}${sequence}`
  }

  private groupProductsBySupplier(products: InventoryProduct[]): { [supplierId: string]: InventoryProduct[] } {
    return products.reduce((groups, product) => {
      const supplierId = product.supplier
      if (!groups[supplierId]) {
        groups[supplierId] = []
      }
      groups[supplierId].push(product)
      return groups
    }, {} as { [supplierId: string]: InventoryProduct[] })
  }

  private calculateAverageTurnover(): number {
    
    return 0.25 // 25% monthly turnover
  }

  private async getTopSellingProducts(limit = 10): Promise<ProductPerformance[]> {
    
    return this.products.slice(0, limit).map(product => ({
      productId: product.id,
      productName: product.name,
      category: product.category,
      unitsSold: Math.floor(Math.random() * 100),
      revenue: Math.floor(Math.random() * 1000000),
      profit: Math.floor(Math.random() * 500000),
      turnoverRate: Math.random(),
      stockLevel: product.stock,
      daysInStock: Math.floor(Math.random() * 30)
    }))
  }

  private async getSlowMovingProducts(limit = 10): Promise<ProductPerformance[]> {
    
    return this.products.slice(-limit).map(product => ({
      productId: product.id,
      productName: product.name,
      category: product.category,
      unitsSold: Math.floor(Math.random() * 10),
      revenue: Math.floor(Math.random() * 50000),
      profit: Math.floor(Math.random() * 25000),
      turnoverRate: Math.random() * 0.1,
      stockLevel: product.stock,
      daysInStock: Math.floor(Math.random() * 90) + 30
    }))
  }

  private async getCategoryBreakdown(): Promise<CategoryAnalytics[]> {
    const categories = [...new Set(this.products.map(p => p.category))]
    
    return categories.map(category => {
      const categoryProducts = this.products.filter(p => p.category === category)
      const productCount = categoryProducts.length
      const totalValue = categoryProducts.reduce((sum, p) => sum + (p.price * p.stock), 0)
      const averageMargin = categoryProducts.reduce((sum, p) => 
        sum + ((p.price - p.costPrice) / p.price * 100), 0) / productCount

      return {
        category,
        productCount,
        totalValue,
        averageMargin,
        turnoverRate: Math.random() * 0.5 
      }
    })
  }

  private async getSupplierPerformance(): Promise<SupplierAnalytics[]> {
    const suppliers = [...new Set(this.products.map(p => p.supplier))]
    
    return suppliers.map(supplier => ({
      supplierId: supplier,
      supplierName: supplier,
      productCount: this.products.filter(p => p.supplier === supplier).length,
      totalOrderValue: Math.floor(Math.random() * 10000000),
      averageLeadTime: Math.floor(Math.random() * 14) + 1,
      onTimeDelivery: Math.floor(Math.random() * 40) + 60,
      qualityRating: Math.floor(Math.random() * 2) + 3.5
    }))
  }

  private async getMonthlyTrends(): Promise<MonthlyTrend[]> {
    
    const months = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      
      months.push({
        month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        totalValue: Math.floor(Math.random() * 50000000) + 10000000,
        costValue: Math.floor(Math.random() * 30000000) + 5000000,
        profit: Math.floor(Math.random() * 20000000) + 5000000,
        turnover: Math.random() * 0.3 + 0.1,
        newProducts: Math.floor(Math.random() * 20) + 5
      })
    }
    
    return months
  }

  // Helper methods for analytics
  private async getProductPerformance(): Promise<ProductPerformance[]> {
    return this.products.map(product => ({
      productId: product.id,
      productName: product.name,
      category: product.category,
      unitsSold: Math.floor(Math.random() * 100) + 10,
      revenue: Math.floor(Math.random() * 1000000) + 100000,
      profit: Math.floor(Math.random() * 500000) + 50000,
      turnoverRate: Math.random() * 0.5 + 0.1,
      stockLevel: product.stock,
      daysInStock: Math.floor(Math.random() * 30) + 1
    })).sort((a, b) => b.revenue - a.revenue)
  }

  private async getCategoryAnalytics(): Promise<CategoryAnalytics[]> {
    const categories = [...new Set(this.products.map(p => p.category))]
    
    return categories.map(category => {
      const categoryProducts = this.products.filter(p => p.category === category)
      const totalValue = categoryProducts.reduce((sum, p) => sum + (p.price * p.stock), 0)
      
      return {
        category,
        productCount: categoryProducts.length,
        totalValue,
        averageMargin: Math.random() * 0.5 + 0.2,
        turnoverRate: Math.random() * 0.5 
      }
    })
  }

  // Public methods for analytics dashboard
  async getAnalytics(): Promise<InventoryAnalytics> {
    const [products, categories, suppliers, trends] = await Promise.all([
      this.getProductPerformance(),
      this.getCategoryAnalytics(), 
      this.getSupplierPerformance(),
      this.getMonthlyTrends()
    ])

    const totalValue = this.products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    const totalCostValue = this.products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0)

    return {
      totalProducts: this.products.length,
      totalValue,
      totalCostValue,
      averageTurnover: 0.25,
      stockouts: this.products.filter(p => p.stock === 0).length,
      lowStockItems: this.products.filter(p => p.stock <= p.minStock && p.stock > 0).length,
      expiringItems: this.products.filter(p => p.expiryDate && new Date(p.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length,
      topSellingProducts: products.slice(0, 10),
      slowMovingProducts: products.slice(-5),
      categoryBreakdown: categories,
      supplierPerformance: suppliers,
      monthlyTrends: trends
    }
  }

  async getForecast(days: number): Promise<InventoryForecast[]> {
    // Generate mock forecast data
    return this.products.slice(0, 20).map(product => ({
      productId: product.id,
      productName: product.name,
      currentStock: product.stock,
      predictedDemand: Math.floor(Math.random() * 50) + 10,
      recommendedReorderPoint: product.minStock,
      recommendedOrderQuantity: Math.floor(Math.random() * 100) + 20,
      forecastAccuracy: Math.random() * 0.4 + 0.6,
      seasonalFactor: Math.random() * 0.5 + 0.75
    }))
  }

  async getAutomatedOrders(): Promise<PurchaseOrder[]> {
    // Generate mock automated orders
    const orders: PurchaseOrder[] = []
    const lowStockProducts = this.products.filter(p => p.stock <= p.minStock)

    for (const product of lowStockProducts.slice(0, 5)) {
      const orderId = `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      const quantity = Math.max(product.maxStock - product.stock, 50)
      
      orders.push({
        id: orderId,
        orderNumber: orderId,
        supplierId: product.supplier,
        supplierName: product.supplier,
        items: [{
          productId: product.id,
          productName: product.name,
          barcode: product.barcode,
          quantityOrdered: quantity,
          unitCost: product.costPrice,
          totalCost: quantity * product.costPrice
        }],
        totalAmount: quantity * product.costPrice,
        status: 'PENDING',
        orderDate: new Date().toISOString(),
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: `Tự động tạo đơn hàng cho sản phẩm sắp hết: ${product.name}`,
        createdBy: 'SYSTEM'
      })
    }

    return orders
  }

  async executeAutomatedOrder(orderId: string): Promise<void> {
    
    
    // Update order status, create stock movement, etc.
  }
}

export const advancedInventoryService = new AdvancedInventoryService()
