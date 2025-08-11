// Barcode API Service - Tích hợp với các dịch vụ tra cứu mã vạch
export interface BarcodeProduct {
  barcode: string
  name: string
  brand: string
  description?: string
  category: string
  images: string[]
  nutritionFacts?: {
    calories?: number
    fat?: string
    carbs?: string
    protein?: string
    ingredients?: string[]
  }
  packaging?: {
    weight?: string
    volume?: string
    unit?: string
  }
  manufacturer?: {
    name: string
    country: string
  }
  price?: {
    suggestedRetail?: number
    currency: string
  }
  certifications?: string[]
  allergens?: string[]
  sourceApi: string
  lastUpdated: string
}

export interface BarcodeApiResponse {
  success: boolean
  product?: BarcodeProduct
  error?: string
  source: string
}

class BarcodeApiService {
  private static instance: BarcodeApiService
  private cache = new Map<string, BarcodeProduct>()
  private cacheExpiry = new Map<string, number>()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  static getInstance(): BarcodeApiService {
    if (!BarcodeApiService.instance) {
      BarcodeApiService.instance = new BarcodeApiService()
    }
    return BarcodeApiService.instance
  }

  // API keys - trong thực tế sẽ lưu trong environment variables
  private readonly API_KEYS = {
    BARCODE_LOOKUP: process.env.NEXT_PUBLIC_BARCODE_LOOKUP_API_KEY || '',
    OPEN_FOOD_FACTS: '', // Không cần key
    UPC_DATABASE: process.env.NEXT_PUBLIC_UPC_DATABASE_API_KEY || '',
    GS1_VIETNAM: process.env.NEXT_PUBLIC_GS1_VIETNAM_API_KEY || ''
  }

  // Kiểm tra cache
  private getCachedProduct(barcode: string): BarcodeProduct | null {
    const cached = this.cache.get(barcode)
    const expiry = this.cacheExpiry.get(barcode)
    
    if (cached && expiry && Date.now() < expiry) {
      return cached
    }
    
    // Xóa cache hết hạn
    this.cache.delete(barcode)
    this.cacheExpiry.delete(barcode)
    return null
  }

  // Lưu vào cache
  private setCachedProduct(barcode: string, product: BarcodeProduct): void {
    this.cache.set(barcode, product)
    this.cacheExpiry.set(barcode, Date.now() + this.CACHE_DURATION)
  }

  // API 1: Barcode Lookup (barcodelookup.com)
  private async fetchFromBarcodeLookup(barcode: string): Promise<BarcodeApiResponse> {
    try {
      const response = await fetch(
        `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=${this.API_KEYS.BARCODE_LOOKUP}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.products && data.products.length > 0) {
        const product = data.products[0]
        const barcodeProduct: BarcodeProduct = {
          barcode: barcode,
          name: product.title || product.product_name || 'Sản phẩm không tên',
          brand: product.brand || product.manufacturer || 'Không xác định',
          description: product.description || '',
          category: product.category || 'Khác',
          images: product.images || [],
          packaging: {
            weight: product.weight,
            volume: product.size,
            unit: product.unit
          },
          manufacturer: {
            name: product.manufacturer || 'Không xác định',
            country: product.country || 'Không xác định'
          },
          price: {
            suggestedRetail: parseFloat(product.msrp) || undefined,
            currency: 'VND'
          },
          sourceApi: 'BarcodeLookup',
          lastUpdated: new Date().toISOString()
        }
        
        return { success: true, product: barcodeProduct, source: 'BarcodeLookup' }
      }
    } catch (error) {
      
    }
    
    return { success: false, error: 'Không tìm thấy sản phẩm', source: 'BarcodeLookup' }
  }

  // API 2: Open Food Facts (miễn phí)
  private async fetchFromOpenFoodFacts(barcode: string): Promise<BarcodeApiResponse> {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status === 1 && data.product) {
        const product = data.product
        const barcodeProduct: BarcodeProduct = {
          barcode: barcode,
          name: product.product_name_vi || product.product_name || 'Sản phẩm không tên',
          brand: product.brands || 'Không xác định',
          description: product.generic_name || '',
          category: product.categories || 'Thực phẩm',
          images: product.image_url ? [product.image_url] : [],
          nutritionFacts: {
            calories: product.nutriments?.['energy-kcal_100g'],
            fat: product.nutriments?.fat_100g ? `${product.nutriments.fat_100g}g` : undefined,
            carbs: product.nutriments?.carbohydrates_100g ? `${product.nutriments.carbohydrates_100g}g` : undefined,
            protein: product.nutriments?.proteins_100g ? `${product.nutriments.proteins_100g}g` : undefined,
            ingredients: product.ingredients_text_vi?.split(',') || product.ingredients_text?.split(',')
          },
          packaging: {
            weight: product.quantity,
            unit: product.serving_size
          },
          manufacturer: {
            name: product.manufacturing_places || product.brands || 'Không xác định',
            country: product.countries || 'Không xác định'
          },
          allergens: product.allergens_tags || [],
          certifications: product.labels_tags || [],
          sourceApi: 'OpenFoodFacts',
          lastUpdated: new Date().toISOString()
        }
        
        return { success: true, product: barcodeProduct, source: 'OpenFoodFacts' }
      }
    } catch (error) {
      
    }
    
    return { success: false, error: 'Không tìm thấy sản phẩm', source: 'OpenFoodFacts' }
  }

  // API 3: UPC Database
  private async fetchFromUPCDatabase(barcode: string): Promise<BarcodeApiResponse> {
    try {
      const response = await fetch(
        `https://api.upcdatabase.org/product/${barcode}/${this.API_KEYS.UPC_DATABASE}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        const barcodeProduct: BarcodeProduct = {
          barcode: barcode,
          name: data.title || 'Sản phẩm không tên',
          brand: data.brand || 'Không xác định',
          description: data.description || '',
          category: data.category || 'Khác',
          images: data.image_url ? [data.image_url] : [],
          packaging: {
            weight: data.size,
            unit: data.unit
          },
          manufacturer: {
            name: data.brand || 'Không xác định',
            country: 'Không xác định'
          },
          sourceApi: 'UPCDatabase',
          lastUpdated: new Date().toISOString()
        }
        
        return { success: true, product: barcodeProduct, source: 'UPCDatabase' }
      }
    } catch (error) {
      
    }
    
    return { success: false, error: 'Không tìm thấy sản phẩm', source: 'UPCDatabase' }
  }

  // API 4: GS1 Vietnam (giả định)
  private async fetchFromGS1Vietnam(barcode: string): Promise<BarcodeApiResponse> {
    try {
      // Đây là API giả định cho GS1 Vietnam
      // Trong thực tế cần liên hệ GS1 Vietnam để có API chính thức
      const response = await fetch(
        `https://api.gs1vietnam.org/products/${barcode}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEYS.GS1_VIETNAM}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.product) {
        const product = data.product
        const barcodeProduct: BarcodeProduct = {
          barcode: barcode,
          name: product.productName || 'Sản phẩm không tên',
          brand: product.brandName || 'Không xác định',
          description: product.description || '',
          category: product.categoryName || 'Khác',
          images: product.images || [],
          manufacturer: {
            name: product.manufacturerName || 'Không xác định',
            country: product.countryOfOrigin || 'Việt Nam'
          },
          certifications: product.certifications || [],
          sourceApi: 'GS1Vietnam',
          lastUpdated: new Date().toISOString()
        }
        
        return { success: true, product: barcodeProduct, source: 'GS1Vietnam' }
      }
    } catch (error) {
      
    }
    
    return { success: false, error: 'Không tìm thấy sản phẩm', source: 'GS1Vietnam' }
  }

  // Tạo sản phẩm từ mã vạch Việt Nam
  private createVietnameseProduct(barcode: string): BarcodeProduct {
    // Phân tích mã vạch Việt Nam (893 prefix)
    const isVietnamese = barcode.startsWith('893')
    
    return {
      barcode: barcode,
      name: `Sản phẩm ${barcode}`,
      brand: 'Chưa xác định',
      description: 'Sản phẩm cần cập nhật thông tin',
      category: 'Chưa phân loại',
      images: [],
      manufacturer: {
        name: 'Chưa xác định',
        country: isVietnamese ? 'Việt Nam' : 'Chưa xác định'
      },
      price: {
        suggestedRetail: 0,
        currency: 'VND'
      },
      sourceApi: 'LocalGenerated',
      lastUpdated: new Date().toISOString()
    }
  }

  // Hàm chính để tra cứu mã vạch
  public async lookupBarcode(barcode: string): Promise<BarcodeApiResponse> {
    // Kiểm tra định dạng mã vạch
    if (!barcode || barcode.length < 8) {
      return { success: false, error: 'Mã vạch không hợp lệ', source: 'Validation' }
    }

    // Kiểm tra cache
    const cached = this.getCachedProduct(barcode)
    if (cached) {
      return { success: true, product: cached, source: 'Cache' }
    }

    // Thử các API theo thứ tự ưu tiên
    const apis = [
      () => this.fetchFromGS1Vietnam(barcode),    // Ưu tiên cho sản phẩm Việt Nam
      () => this.fetchFromOpenFoodFacts(barcode), // Miễn phí và có nhiều sản phẩm
      () => this.fetchFromBarcodeLookup(barcode), // API trả phí nhưng chính xác
      () => this.fetchFromUPCDatabase(barcode)    // API backup
    ]

    for (const apiCall of apis) {
      try {
        const result = await apiCall()
        if (result.success && result.product) {
          // Lưu vào cache
          this.setCachedProduct(barcode, result.product)
          return result
        }
      } catch (error) {
        
        continue
      }
    }

    // Nếu không tìm thấy từ API nào, tạo sản phẩm mặc định
    const defaultProduct = this.createVietnameseProduct(barcode)
    this.setCachedProduct(barcode, defaultProduct)
    
    return { 
      success: true, 
      product: defaultProduct, 
      source: 'Generated',
      error: 'Không tìm thấy thông tin từ cơ sở dữ liệu, đã tạo sản phẩm mặc định'
    }
  }

  // Làm mới cache
  public clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  // Lấy thống kê cache
  public getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Có thể implement hit rate tracking
    }
  }
}

export const barcodeApiService = BarcodeApiService.getInstance()
