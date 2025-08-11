// AI Data Integration Service - Collects and analyzes all system data
export interface SystemData {
  // Real-time POS data
  pos: {
    activeSessions: number
    todayTransactions: any[]
    currentCart: any[]
    scannerStatus: string
    lastActivity: Date
  }
  
  // Inventory data
  inventory: {
    products: any[]
    lowStockAlerts: any[]
    reorderPoints: any[]
    stockMovements: any[]
    categories: string[]
  }
  
  // Orders and sales data  
  orders: {
    allOrders: any[]
    todayOrders: any[]
    weeklyTrends: any[]
    topCustomers: any[]
    paymentMethods: any[]
  }
  
  // Customer data
  customers: {
    totalCustomers: number
    vipCustomers: any[]
    frequentBuyers: any[]
    newCustomers: any[]
    loyaltyPrograms: any[]
  }
  
  // System performance
  system: {
    uptime: number
    responseTime: number
    errorLogs: any[]
    userSessions: any[]
    backupStatus: string
  }
  
  // Financial data
  finance: {
    dailyRevenue: Array<{date: string, total: number}>
    monthlyRevenue: Array<{month: string, total: number}>
    profitMargins: any[]
    expenses: any[]
    cashFlow: any
  }
}

export class AIDataService {
  private static instance: AIDataService
  private systemData: SystemData
  
  private constructor() {
    this.systemData = this.initializeEmptyData()
  }
  
  static getInstance(): AIDataService {
    if (!AIDataService.instance) {
      AIDataService.instance = new AIDataService()
    }
    return AIDataService.instance
  }
  
  private initializeEmptyData(): SystemData {
    return {
      pos: {
        activeSessions: 0,
        todayTransactions: [],
        currentCart: [],
        scannerStatus: 'disconnected',
        lastActivity: new Date()
      },
      inventory: {
        products: [],
        lowStockAlerts: [],
        reorderPoints: [],
        stockMovements: [],
        categories: []
      },
      orders: {
        allOrders: [],
        todayOrders: [],
        weeklyTrends: [],
        topCustomers: [],
        paymentMethods: []
      },
      customers: {
        totalCustomers: 0,
        vipCustomers: [],
        frequentBuyers: [],
        newCustomers: [],
        loyaltyPrograms: []
      },
      system: {
        uptime: 0,
        responseTime: 0,
        errorLogs: [],
        userSessions: [],
        backupStatus: 'ok'
      },
      finance: {
        dailyRevenue: [],
        monthlyRevenue: [],
        profitMargins: [],
        expenses: [],
        cashFlow: {}
      }
    }
  }
  
  // Collect data from all system components
  async collectSystemData(): Promise<SystemData> {
    try {
      // Get POS data
      const posData = this.getPOSData()
      
      // Get inventory data
      const inventoryData = this.getInventoryData()
      
      // Get orders data
      const ordersData = this.getOrdersData()
      
      // Get customers data
      const customersData = this.getCustomersData()
      
      // Get system performance data
      const systemPerformanceData = this.getSystemPerformanceData()
      
      // Get financial data
      const financeData = this.getFinanceData()
      
      this.systemData = {
        pos: posData,
        inventory: inventoryData,
        orders: ordersData,
        customers: customersData,
        system: systemPerformanceData,
        finance: financeData
      }
      
      return this.systemData
      
    } catch (error) {
      console.error('Error collecting system data:', error)
      return this.systemData
    }
  }
  
  private getPOSData() {
    try {
      // Get POS session data from localStorage or active sessions
      const scannerSettings = localStorage.getItem('g24mart_scanner_settings')
      const cartData = localStorage.getItem('g24mart_current_cart') 
      
      return {
        activeSessions: 1, // Current session
        todayTransactions: this.getTodayTransactions(),
        currentCart: cartData ? JSON.parse(cartData) : [],
        scannerStatus: scannerSettings ? 'configured' : 'unconfigured',
        lastActivity: new Date()
      }
    } catch (error) {
      console.error('Error getting POS data:', error)
      return this.systemData.pos
    }
  }
  
  private getInventoryData() {
    try {
      // Mock inventory data - in real system would come from database
      const products = [
        { id: '1', name: 'Mì tôm Hảo Hảo', price: 8000, stock: 2, minStock: 10, category: 'Thực phẩm' },
        { id: '2', name: 'Bánh mì sandwich', price: 25000, stock: 8, minStock: 15, category: 'Bánh kẹo' },
        { id: '3', name: 'Nước suối Aquafina', price: 10000, stock: 45, minStock: 20, category: 'Đồ uống' },
        { id: '4', name: 'Coca Cola 330ml', price: 12000, stock: 32, minStock: 25, category: 'Đồ uống' },
        { id: '5', name: 'Kẹo Mentos', price: 20000, stock: 5, minStock: 20, category: 'Bánh kẹo' },
        { id: '6', name: 'Bánh Oreo', price: 35000, stock: 15, minStock: 10, category: 'Bánh kẹo' },
        { id: '7', name: 'Sữa tươi TH', price: 18000, stock: 25, minStock: 15, category: 'Sữa' }
      ]
      
      const lowStockAlerts = products.filter(p => p.stock <= p.minStock)
      const categories = [...new Set(products.map(p => p.category))]
      
      return {
        products,
        lowStockAlerts,
        reorderPoints: lowStockAlerts.map(p => ({
          productId: p.id,
          suggestedOrder: Math.max(p.minStock * 2, 50),
          urgency: p.stock <= p.minStock * 0.5 ? 'high' : 'medium'
        })),
        stockMovements: this.getStockMovements(),
        categories
      }
    } catch (error) {
      console.error('Error getting inventory data:', error)
      return this.systemData.inventory
    }
  }
  
  private getOrdersData() {
    try {
      const allOrders = JSON.parse(localStorage.getItem('g24mart_orders') || '[]')
      const today = new Date().toISOString().split('T')[0]
      const todayOrders = allOrders.filter((order: any) => order.date === today)
      
      return {
        allOrders,
        todayOrders,
        weeklyTrends: this.calculateWeeklyTrends(allOrders),
        topCustomers: this.getTopCustomers(allOrders),
        paymentMethods: this.analyzePaymentMethods(allOrders)
      }
    } catch (error) {
      console.error('Error getting orders data:', error)
      return this.systemData.orders
    }
  }
  
  private getCustomersData() {
    try {
      const orders = JSON.parse(localStorage.getItem('g24mart_orders') || '[]')
      const customers = JSON.parse(localStorage.getItem('g24mart_customers') || '[]')
      
      const customerStats = this.analyzeCustomers(orders, customers)
      
      return {
        totalCustomers: customers.length,
        vipCustomers: customerStats.vip,
        frequentBuyers: customerStats.frequent,
        newCustomers: customerStats.new,
        loyaltyPrograms: customerStats.loyalty
      }
    } catch (error) {
      console.error('Error getting customers data:', error)
      return this.systemData.customers
    }
  }
  
  private getSystemPerformanceData() {
    try {
      const startTime = performance.now()
      const responseTime = Math.random() * 100 + 50 // Simulate response time
      
      return {
        uptime: Date.now() - (new Date().setHours(0,0,0,0)), // Since midnight
        responseTime,
        errorLogs: [], // Would be collected from error tracking
        userSessions: [{ id: 'session1', startTime: new Date(), user: 'admin' }],
        backupStatus: Math.random() > 0.1 ? 'ok' : 'warning'
      }
    } catch (error) {
      console.error('Error getting system data:', error)
      return this.systemData.system
    }
  }
  
  private getFinanceData() {
    try {
      const orders = JSON.parse(localStorage.getItem('g24mart_orders') || '[]')
      const revenue = this.calculateRevenue(orders)
      
      return {
        dailyRevenue: revenue.daily,
        monthlyRevenue: revenue.monthly,
        profitMargins: this.calculateProfitMargins(orders),
        expenses: this.getExpenses(),
        cashFlow: this.calculateCashFlow(orders)
      }
    } catch (error) {
      console.error('Error getting finance data:', error)
      return this.systemData.finance
    }
  }
  
  // Helper methods for data analysis
  private getTodayTransactions() {
    const orders = JSON.parse(localStorage.getItem('g24mart_orders') || '[]')
    const today = new Date().toISOString().split('T')[0]
    return orders.filter((order: any) => order.date === today)
  }
  
  private getStockMovements() {
    // Mock stock movements - would come from transaction logs
    return [
      { productId: '1', type: 'out', quantity: 3, date: new Date(), reason: 'sale' },
      { productId: '2', type: 'in', quantity: 20, date: new Date(), reason: 'restock' },
      { productId: '3', type: 'out', quantity: 8, date: new Date(), reason: 'sale' }
    ]
  }
  
  private calculateWeeklyTrends(orders: any[]) {
    const weeklyData: { [key: string]: number } = {}
    orders.forEach(order => {
      const week = this.getWeekKey(new Date(order.date))
      weeklyData[week] = (weeklyData[week] || 0) + order.total
    })
    return Object.entries(weeklyData).map(([week, total]) => ({ week, total }))
  }
  
  private getTopCustomers(orders: any[]) {
    const customerSpending: { [key: string]: { name: string, total: number, orders: number } } = {}
    
    orders.forEach(order => {
      if (order.customerName) {
        const key = order.customerName
        if (!customerSpending[key]) {
          customerSpending[key] = { name: order.customerName, total: 0, orders: 0 }
        }
        customerSpending[key].total += order.total
        customerSpending[key].orders += 1
      }
    })
    
    return Object.values(customerSpending)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }
  
  private analyzePaymentMethods(orders: any[]) {
    const methods: { [key: string]: { count: number, total: number } } = {}
    
    orders.forEach(order => {
      const method = order.paymentMethod
      if (!methods[method]) {
        methods[method] = { count: 0, total: 0 }
      }
      methods[method].count += 1
      methods[method].total += order.total
    })
    
    return Object.entries(methods).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
      percentage: (data.count / orders.length * 100).toFixed(1)
    }))
  }
  
  private analyzeCustomers(orders: any[], customers: any[]) {
    // Analyze customer behavior patterns
    const customerData = customers.map(customer => {
      const customerOrders = orders.filter(o => o.customerPhone === customer.phone)
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0)
      const avgOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0
      
      return {
        ...customer,
        totalOrders: customerOrders.length,
        totalSpent,
        avgOrderValue,
        lastOrder: customerOrders.length > 0 ? Math.max(...customerOrders.map(o => new Date(o.date).getTime())) : null
      }
    })
    
    return {
      vip: customerData.filter(c => c.totalSpent > 500000).slice(0, 10),
      frequent: customerData.filter(c => c.totalOrders > 5).slice(0, 10),
      new: customerData.filter(c => {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        return c.lastOrder && c.lastOrder > weekAgo
      }),
      loyalty: customerData.filter(c => c.totalOrders > 10)
    }
  }
  
  private calculateRevenue(orders: any[]) {
    const dailyRevenue: { [key: string]: number } = {}
    const monthlyRevenue: { [key: string]: number } = {}
    
    orders.forEach(order => {
      const date = order.date
      const month = date.substring(0, 7) // YYYY-MM
      
      dailyRevenue[date] = (dailyRevenue[date] || 0) + order.total
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.total
    })
    
    return {
      daily: Object.entries(dailyRevenue).map(([date, total]) => ({ date, total })),
      monthly: Object.entries(monthlyRevenue).map(([month, total]) => ({ month, total }))
    }
  }
  
  private calculateProfitMargins(orders: any[]) {
    // Mock profit calculation - would use actual cost data
    return orders.map(order => ({
      orderId: order.id,
      revenue: order.total,
      cost: order.total * 0.7, // Assume 30% profit margin
      profit: order.total * 0.3,
      margin: 30
    }))
  }
  
  private getExpenses() {
    // Mock expenses data
    return [
      { category: 'Tiền thuê', amount: 15000000, date: new Date().toISOString().split('T')[0] },
      { category: 'Điện nước', amount: 2500000, date: new Date().toISOString().split('T')[0] },
      { category: 'Lương nhân viên', amount: 8000000, date: new Date().toISOString().split('T')[0] },
      { category: 'Chi phí khác', amount: 1500000, date: new Date().toISOString().split('T')[0] }
    ]
  }
  
  private calculateCashFlow(orders: any[]) {
    const revenue = orders.reduce((sum, order) => sum + order.total, 0)
    const expenses = this.getExpenses().reduce((sum, expense) => sum + expense.amount, 0)
    
    return {
      revenue,
      expenses,
      netFlow: revenue - expenses,
      projectedMonthly: (revenue - expenses) * 30
    }
  }
  
  private getWeekKey(date: Date): string {
    const year = date.getFullYear()
    const week = Math.ceil((date.getDate()) / 7)
    return `${year}-W${week}`
  }
  
  // Public methods for AI to access data
  getSystemData(): SystemData {
    return this.systemData
  }
  
  async refreshData(): Promise<SystemData> {
    return await this.collectSystemData()
  }
  
  // AI Analysis methods
  generateInsights(): string[] {
    const data = this.systemData
    const insights: string[] = []
    
    // Revenue insights
    if (data.finance.dailyRevenue.length > 0) {
      const today = data.finance.dailyRevenue[data.finance.dailyRevenue.length - 1]
      insights.push(`Doanh thu hôm nay: ${today?.total?.toLocaleString('vi-VN')} ₫`)
    }
    
    // Inventory insights
    if (data.inventory.lowStockAlerts.length > 0) {
      insights.push(`⚠️ ${data.inventory.lowStockAlerts.length} sản phẩm cần nhập hàng gấp`)
    }
    
    // Customer insights
    if (data.customers.vipCustomers.length > 0) {
      insights.push(`👑 ${data.customers.vipCustomers.length} khách VIP đóng góp cao`)
    }
    
    // System insights
    if (data.system.responseTime > 100) {
      insights.push(`⚡ Hệ thống đang chậm (${data.system.responseTime.toFixed(0)}ms)`)
    }
    
    return insights
  }
  
  generateRecommendations(): string[] {
    const data = this.systemData
    const recommendations: string[] = []
    
    // Inventory recommendations
    data.inventory.reorderPoints.forEach(reorder => {
      const product = data.inventory.products.find(p => p.id === reorder.productId)
      if (product && reorder.urgency === 'high') {
        recommendations.push(`🚨 Nhập ngay ${product.name} - còn ${product.stock} sản phẩm`)
      }
    })
    
    // Business recommendations
    if (data.orders.todayOrders.length > 0) {
      const avgOrderValue = data.orders.todayOrders.reduce((sum, o) => sum + o.total, 0) / data.orders.todayOrders.length
      if (avgOrderValue < 50000) {
        recommendations.push(`💡 Tạo combo để tăng giá trị đơn hàng (hiện tại: ${avgOrderValue.toLocaleString('vi-VN')} ₫)`)
      }
    }
    
    // Customer recommendations  
    if (data.customers.vipCustomers.length > 0) {
      recommendations.push(`🎁 Triển khai chương trình ưu đãi cho ${data.customers.vipCustomers.length} khách VIP`)
    }
    
    return recommendations
  }
}

// Export singleton instance
export const aiDataService = AIDataService.getInstance()
