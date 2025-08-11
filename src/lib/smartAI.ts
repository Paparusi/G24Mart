// Lightweight Smart AI Assistant - Browser Compatible
// import natural from 'natural' // Removed - causes browser compatibility issues
// import compromise from 'compromise' // Removed - too heavy for browser

export interface SystemData {
  inventory: {
    products: Array<{
      id: string
      name: string
      price: number
      stock: number
      minStock: number
      category: string
    }>
    lowStockAlerts: Array<any>
    stockMovements: Array<any>
    reorderPoints: Array<any>
  }
  orders: {
    todayOrders: Array<any>
    paymentMethods: Array<any>
  }
  customers: {
    vipCustomers: Array<any>
  }
  system: {
    uptime: number
  }
}

export interface AIIntent {
  action: 'query' | 'create' | 'update' | 'analyze' | 'help'
  entity: 'product' | 'order' | 'customer' | 'report' | 'system' | 'inventory'
  parameters: Record<string, any>
  confidence: number
}

export class SmartAIAssistant {
  // Lightweight tokenizer thay thế natural.js
  private simpleTokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\sáàảãạâấầẩẫậăắằẳẵặéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0)
  }

  // Simple Vietnamese NLP patterns
  private getVietnamesePatterns() {
    return {
      queryWords: ['có', 'còn', 'kiểm', 'tra', 'xem', 'tìm', 'hỏi'],
      createWords: ['thêm', 'tạo', 'nhập', 'làm', 'add', 'new'],
      updateWords: ['cập', 'nhật', 'sửa', 'đổi', 'thay', 'update'],
      analyzeWords: ['phân', 'tích', 'báo', 'cáo', 'thống', 'kê'],
      productWords: ['sản', 'phẩm', 'hàng', 'pepsi', 'coca', 'sprite'],
      orderWords: ['đơn', 'hàng', 'order', 'giao', 'dịch'],
      inventoryWords: ['kho', 'tồn', 'stock', 'inventory'],
      customerWords: ['khách', 'hàng', 'customer', 'client']
    }
  }

  // Phân tích ý định với lightweight NLP
  analyzeIntent(message: string): AIIntent {
    const tokens = this.simpleTokenize(message)
    const patterns = this.getVietnamesePatterns()
    
    let action: AIIntent['action'] = 'query'
    let entity: AIIntent['entity'] = 'system'
    let parameters: Record<string, any> = {}
    let confidence = 0.5

    // Detect action based on word patterns
    const hasQueryWords = this.hasAnyWords(tokens, patterns.queryWords)
    const hasCreateWords = this.hasAnyWords(tokens, patterns.createWords)
    const hasUpdateWords = this.hasAnyWords(tokens, patterns.updateWords)
    const hasAnalyzeWords = this.hasAnyWords(tokens, patterns.analyzeWords)

    // Detect entity
    const hasProductWords = this.hasAnyWords(tokens, patterns.productWords)
    const hasOrderWords = this.hasAnyWords(tokens, patterns.orderWords)
    const hasInventoryWords = this.hasAnyWords(tokens, patterns.inventoryWords)
    const hasCustomerWords = this.hasAnyWords(tokens, patterns.customerWords)

    // Smart intent classification
    if (hasQueryWords && hasProductWords) {
      action = 'query'
      entity = 'product'
      confidence = 0.85
      parameters.productName = this.extractProductName(message)
    }
    else if (hasCreateWords && hasProductWords) {
      action = 'create'
      entity = 'product'
      confidence = 0.9
      parameters.productName = this.extractProductName(message)
    }
    else if (hasCreateWords && hasOrderWords) {
      action = 'create'
      entity = 'order'
      confidence = 0.8
    }
    else if (hasUpdateWords && hasProductWords) {
      action = 'update'
      entity = 'product'
      confidence = 0.8
    }
    else if (hasAnalyzeWords) {
      action = 'analyze'
      if (hasOrderWords) entity = 'order'
      else if (hasCustomerWords) entity = 'customer'
      confidence = 0.75
    }
    else if (hasInventoryWords) {
      action = 'query'
      entity = 'inventory'
      confidence = 0.7
    }

    // Boost confidence for clear patterns
    if (this.hasExactPhrase(message, ['trong kho có', 'kho có'])) {
      action = 'query'
      entity = 'product'
      confidence = 0.95
    }
    
    if (this.hasExactPhrase(message, ['thêm sản phẩm', 'add sản phẩm'])) {
      action = 'create'
      entity = 'product'  
      confidence = 0.95
    }

    return {
      action,
      entity,
      parameters,
      confidence: Math.min(confidence, 1.0)
    }
  }

  // Helper: Check if tokens contain any of the pattern words
  private hasAnyWords(tokens: string[], patternWords: string[]): boolean {
    return tokens.some(token => 
      patternWords.some(pattern => 
        token.includes(pattern) || pattern.includes(token)
      )
    )
  }

  // Helper: Check for exact phrases
  private hasExactPhrase(message: string, phrases: string[]): boolean {
    const lowerMessage = message.toLowerCase()
    return phrases.some(phrase => lowerMessage.includes(phrase))
  }

  // Extract product name from message
  private extractProductName(message: string): string {
    const products = ['pepsi', 'coca cola', 'coca', 'sprite', 'bánh mì', 'nước', 'kẹo']
    
    for (const product of products) {
      if (message.toLowerCase().includes(product)) {
        return product
      }
    }
    
    // Extract potential product names (nouns after "sản phẩm")
    const match = message.match(/sản phẩm\s+(\w+)/i)
    return match ? match[1] : 'unknown'
  }

  // Tạo response thông minh dựa trên intent và data
  generateSmartResponse(intent: AIIntent, systemData: SystemData | null): string {
    const { action, entity, parameters, confidence } = intent

    if (confidence < 0.3) {
      return this.generateFallbackResponse(intent)
    }

    // Query Actions
    if (action === 'query' && entity === 'product') {
      return this.handleProductQuery(parameters.productName, systemData)
    }
    
    if (action === 'query' && entity === 'inventory') {
      return this.handleInventoryQuery(systemData)
    }

    // Create Actions  
    if (action === 'create' && entity === 'product') {
      return this.handleProductCreation(parameters.productName)
    }
    
    if (action === 'create' && entity === 'order') {
      return this.handleOrderCreation(systemData)
    }

    // Update Actions
    if (action === 'update' && entity === 'product') {
      return this.handleProductUpdate(parameters)
    }

    // Analyze Actions
    if (action === 'analyze' && entity === 'order') {
      return this.handleRevenueAnalysis(systemData)
    }

    return this.generateFallbackResponse(intent)
  }

  // Xử lý truy vấn sản phẩm
  private handleProductQuery(productName: string, systemData: SystemData | null): string {
    if (!systemData) {
      return `⏳ **Đang kết nối với cơ sở dữ liệu...**\n\nVui lòng thử lại sau vài giây!`
    }

    const product = systemData.inventory.products.find(p => 
      p.name.toLowerCase().includes(productName?.toLowerCase() || '')
    )

    if (product) {
      if (product.stock > 0) {
        return `✅ **CÓ ${productName.toUpperCase()} TRONG KHO!**

📦 **Chi tiết sản phẩm:**
• **Tên:** ${product.name}
• **Số lượng:** ${product.stock} sản phẩm
• **Giá bán:** ${product.price.toLocaleString('vi-VN')} ₫
• **Trạng thái:** ${product.stock > product.minStock ? '✅ Đủ hàng' : '⚠️ Sắp hết'}

💰 **Giá trị tồn kho:** ${(product.price * product.stock).toLocaleString('vi-VN')} ₫
🛒 **Có thể bán ngay tại POS!**`
      } else {
        return `❌ **${productName.toUpperCase()} ĐÃ HẾT HÀNG!**

📦 **Tình trạng:**
• **Sản phẩm:** ${product.name}
• **Số lượng:** 0 sản phẩm
• **Trạng thái:** 🔴 Hết hàng

💡 **Gợi ý:** Nói "Thêm sản phẩm ${productName}" để nhập hàng mới!`
      }
    } else {
      return `🔍 **KHÔNG TÌM THẤY ${productName.toUpperCase()}!**

Sản phẩm này chưa có trong hệ thống.
💡 **Muốn thêm mới?** Nói: "Thêm sản phẩm ${productName} vào kho"`
    }
  }

  // Xử lý truy vấn kho hàng
  private handleInventoryQuery(systemData: SystemData | null): string {
    if (!systemData) {
      return `⏳ Đang tải dữ liệu kho hàng...`
    }

    const totalProducts = systemData.inventory.products.length
    const totalValue = systemData.inventory.products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    const lowStock = systemData.inventory.lowStockAlerts.length

    return `📦 **TỔNG QUAN KHO HÀNG**

📊 **Thống kê:**
• **Tổng sản phẩm:** ${totalProducts} loại
• **Giá trị kho:** ${totalValue.toLocaleString('vi-VN')} ₫
• **Cảnh báo tồn kho:** ${lowStock} sản phẩm

🏆 **Top 5 sản phẩm:**
${systemData.inventory.products.slice(0, 5).map((p, i) => 
  `${i + 1}. ${p.name}: ${p.stock} sản phẩm (${p.price.toLocaleString('vi-VN')} ₫)`
).join('\n')}`
  }

  // Xử lý tạo sản phẩm mới  
  private handleProductCreation(productName: string): string {
    // Logic tạo sản phẩm thực sự sẽ được implement ở component
    return `✅ **CHUẨN BỊ THÊM ${productName?.toUpperCase()} VÀO KHO**

🤖 **AI Assistant sẽ:**
• Tạo sản phẩm mới với thông tin chuẩn
• Cập nhật vào cơ sở dữ liệu  
• Đồng bộ với POS System
• Thiết lập cảnh báo tồn kho

⏳ **Đang xử lý...**`
  }

  // Xử lý tạo đơn hàng
  private handleOrderCreation(systemData: SystemData | null): string {
    return `✅ **CHUẨN BỊ TẠO ĐƠN HÀNG MỚI**

🤖 **AI sẽ tạo đơn hàng mẫu với:**
• Sản phẩm phổ biến nhất
• Khách hàng VIP
• Phương thức thanh toán phù hợp

⏳ **Đang xử lý...**`
  }

  // Xử lý cập nhật sản phẩm
  private handleProductUpdate(parameters: Record<string, any>): string {
    return `✅ **CHUẨN BỊ CẬP NHẬT SẢN PHẨM**

🔧 **Loại cập nhật:** ${parameters.updateType || 'general'}
⏳ **Đang xử lý...**`
  }

  // Phân tích doanh thu
  private handleRevenueAnalysis(systemData: SystemData | null): string {
    if (!systemData) {
      return `⏳ Đang tải dữ liệu doanh thu...`
    }

    const todayRevenue = systemData.orders.todayOrders.reduce((sum: number, order: any) => sum + order.total, 0)
    const orderCount = systemData.orders.todayOrders.length

    return `📊 **PHÂN TÍCH DOANH THU HÔM NAY**

💰 **Kết quả:**
• **Tổng doanh thu:** ${todayRevenue.toLocaleString('vi-VN')} ₫
• **Số đơn hàng:** ${orderCount}
• **Giá trị TB/đơn:** ${orderCount > 0 ? (todayRevenue / orderCount).toLocaleString('vi-VN') : 0} ₫

📈 **Đánh giá:** ${todayRevenue > 1000000 ? '🟢 Tốt' : '🟡 Trung bình'}`
  }

  // Response dự phòng
  private generateFallbackResponse(intent: AIIntent): string {
    return `🤖 **AI Assistant đã hiểu được:**

📝 **Phân tích ý định:**
• **Hành động:** ${intent.action}
• **Đối tượng:** ${intent.entity}  
• **Độ tin cậy:** ${Math.round(intent.confidence * 100)}%

💡 **Gợi ý:** Hãy nói rõ hơn về những gì bạn muốn làm!

**Ví dụ:**
• "Trong kho có Pepsi không?"
• "Tạo đơn hàng mới"
• "Phân tích doanh thu hôm nay"`
  }
}

export const smartAI = new SmartAIAssistant()
