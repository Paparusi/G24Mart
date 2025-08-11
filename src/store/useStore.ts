import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Core Data Types
export interface Product {
  id: string
  name: string
  barcode: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  maxStock?: number
  category: string
  supplier: string
  description?: string
  imageUrl?: string
  expiryDate?: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  loyaltyPoints: number
  totalSpent: number
  visitCount: number
  lastVisit: string
  memberSince: string
  tier: 'Đồng' | 'Bạc' | 'Vàng' | 'Platinum'
}

export interface CartItem {
  id: string
  name: string
  barcode: string
  price: number
  quantity: number
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'card' | 'transfer'
  customerName?: string
  customerPhone?: string
  date: string
  time: string
  status: 'completed' | 'refunded' | 'partial-refund'
  cashier: string
}

export interface StoreSettings {
  storeName: string
  address: string
  phone: string
  email: string
  taxNumber: string
  currency: string
  taxRate: number
  enableTax: boolean
}

// Store State Interface
interface StoreState {
  // Products
  products: Product[]
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  updateStock: (id: string, quantity: number) => void
  getLowStockProducts: () => Product[]
  
  // Customers  
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id' | 'memberSince'>) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  findCustomerByPhone: (phone: string) => Customer | undefined
  
  // Orders
  orders: Order[]
  addOrder: (order: Omit<Order, 'id' | 'orderNumber'>) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  getOrdersByDateRange: (startDate: string, endDate: string) => Order[]
  
  // Settings
  storeSettings: StoreSettings
  updateStoreSettings: (updates: Partial<StoreSettings>) => void
  
  // Utilities
  clearAllData: () => void
  exportData: () => string
  importData: (data: string) => void
  getSystemStats: () => {
    totalProducts: number
    totalCustomers: number
    totalOrders: number
    lowStockCount: number
    todayRevenue: number
  }
}

// Default Initial Data
const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Mì tôm Hảo Hảo',
    barcode: '8934563113567',
    price: 8000,
    costPrice: 6000,
    stock: 50,
    minStock: 10,
    maxStock: 100,
    category: 'Thực Phẩm Khô',
    supplier: 'Công ty ACECOOK',
    description: 'Mì tôm ăn liền hương vị truyền thống',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Coca Cola 330ml',
    barcode: '8934561234567',
    price: 12000,
    costPrice: 9000,
    stock: 30,
    minStock: 15,
    maxStock: 60,
    category: 'Nước Giải Khát',
    supplier: 'Coca Cola Vietnam',
    description: 'Nước ngọt có gas',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Bánh mì sandwich',
    barcode: '8936012345678',
    price: 25000,
    costPrice: 18000,
    stock: 20,
    minStock: 5,
    maxStock: 30,
    category: 'Thực Phẩm Tươi Sống',
    supplier: 'Kinh Đô',
    description: 'Bánh mì sandwich tươi',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

const defaultCustomers: Customer[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    phone: '0123456789',
    email: 'an.nguyen@email.com',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    loyaltyPoints: 1250,
    totalSpent: 2500000,
    visitCount: 45,
    lastVisit: '2025-01-10',
    memberSince: '2024-12-15',
    tier: 'Vàng'
  }
]

const defaultStoreSettings: StoreSettings = {
  storeName: 'G24Mart - Cửa hàng tiện lợi',
  address: '123 Đường ABC, Quận XYZ, TP.HCM',
  phone: '0123456789',
  email: 'contact@g24mart.vn',
  taxNumber: '0123456789',
  currency: 'VND',
  taxRate: 10,
  enableTax: true
}

// Create the store with persistence
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Products state and actions
      products: defaultProducts,
      
      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        set((state) => ({
          products: [...state.products, newProduct]
        }))
      },
      
      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map(product =>
            product.id === id
              ? { ...product, ...updates, updatedAt: new Date().toISOString() }
              : product
          )
        }))
      },
      
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter(product => product.id !== id)
        }))
      },
      
      updateStock: (id, quantity) => {
        set((state) => ({
          products: state.products.map(product =>
            product.id === id
              ? { 
                  ...product, 
                  stock: Math.max(0, product.stock + quantity),
                  updatedAt: new Date().toISOString()
                }
              : product
          )
        }))
      },
      
      getLowStockProducts: () => {
        return get().products.filter(product => product.stock <= product.minStock)
      },
      
      // Customers state and actions
      customers: defaultCustomers,
      
      addCustomer: (customerData) => {
        const newCustomer: Customer = {
          ...customerData,
          id: Date.now().toString(),
          memberSince: new Date().toISOString().split('T')[0]
        }
        
        set((state) => ({
          customers: [...state.customers, newCustomer]
        }))
      },
      
      updateCustomer: (id, updates) => {
        set((state) => ({
          customers: state.customers.map(customer =>
            customer.id === id ? { ...customer, ...updates } : customer
          )
        }))
      },
      
      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter(customer => customer.id !== id)
        }))
      },
      
      findCustomerByPhone: (phone) => {
        return get().customers.find(customer => customer.phone === phone)
      },
      
      // Orders state and actions
      orders: [],
      
      addOrder: (orderData) => {
        const orderNumber = `DH${new Date().toISOString().split('T')[0].replace(/-/g, '')}${String(get().orders.length + 1).padStart(3, '0')}`
        const newOrder: Order = {
          ...orderData,
          id: Date.now().toString(),
          orderNumber
        }
        
        // Update customer stats if customer exists
        if (orderData.customerPhone) {
          const customer = get().findCustomerByPhone(orderData.customerPhone)
          if (customer) {
            get().updateCustomer(customer.id, {
              totalSpent: customer.totalSpent + orderData.total,
              visitCount: customer.visitCount + 1,
              lastVisit: orderData.date,
              loyaltyPoints: customer.loyaltyPoints + Math.floor(orderData.total / 1000)
            })
          }
        }
        
        // Update product stock
        orderData.items.forEach(item => {
          const product = get().products.find(p => p.id === item.id)
          if (product) {
            get().updateStock(item.id, -item.quantity)
          }
        })
        
        set((state) => ({
          orders: [...state.orders, newOrder]
        }))
      },
      
      updateOrder: (id, updates) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === id ? { ...order, ...updates } : order
          )
        }))
      },
      
      getOrdersByDateRange: (startDate, endDate) => {
        return get().orders.filter(order => 
          order.date >= startDate && order.date <= endDate
        )
      },
      
      // Store settings
      storeSettings: defaultStoreSettings,
      
      updateStoreSettings: (updates) => {
        set((state) => ({
          storeSettings: { ...state.storeSettings, ...updates }
        }))
      },
      
      // Utilities
      clearAllData: () => {
        set(() => ({
          products: [],
          customers: [],
          orders: [],
          storeSettings: defaultStoreSettings
        }))
      },
      
      exportData: () => {
        const state = get()
        const exportData = {
          products: state.products,
          customers: state.customers,
          orders: state.orders,
          storeSettings: state.storeSettings,
          exportedAt: new Date().toISOString()
        }
        return JSON.stringify(exportData, null, 2)
      },
      
      importData: (jsonData) => {
        try {
          const data = JSON.parse(jsonData)
          set(() => ({
            products: data.products || [],
            customers: data.customers || [],
            orders: data.orders || [],
            storeSettings: data.storeSettings || defaultStoreSettings
          }))
        } catch (error) {
          
          throw new Error('Invalid JSON data format')
        }
      },
      
      getSystemStats: () => {
        const state = get()
        const today = new Date().toISOString().split('T')[0]
        const todayOrders = state.orders.filter(order => order.date === today)
        
        return {
          totalProducts: state.products.length,
          totalCustomers: state.customers.length,
          totalOrders: state.orders.length,
          lowStockCount: state.getLowStockProducts().length,
          todayRevenue: todayOrders.reduce((sum, order) => sum + order.total, 0)
        }
      }
    }),
    {
      name: 'g24mart-store', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      // Optionally specify which parts to persist
      partialize: (state) => ({
        products: state.products,
        customers: state.customers,
        orders: state.orders,
        storeSettings: state.storeSettings
      }),
    }
  )
)

// Utility hooks for common operations
export const useProducts = () => {
  const products = useStore((state) => state.products)
  const addProduct = useStore((state) => state.addProduct)
  const updateProduct = useStore((state) => state.updateProduct)
  const deleteProduct = useStore((state) => state.deleteProduct)
  const updateStock = useStore((state) => state.updateStock)
  const getLowStockProducts = useStore((state) => state.getLowStockProducts)
  
  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getLowStockProducts
  }
}

export const useCustomers = () => {
  const customers = useStore((state) => state.customers)
  const addCustomer = useStore((state) => state.addCustomer)
  const updateCustomer = useStore((state) => state.updateCustomer)
  const deleteCustomer = useStore((state) => state.deleteCustomer)
  const findCustomerByPhone = useStore((state) => state.findCustomerByPhone)
  
  return {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    findCustomerByPhone
  }
}

export const useOrders = () => {
  const orders = useStore((state) => state.orders)
  const addOrder = useStore((state) => state.addOrder)
  const updateOrder = useStore((state) => state.updateOrder)
  const getOrdersByDateRange = useStore((state) => state.getOrdersByDateRange)
  
  return {
    orders,
    addOrder,
    updateOrder,
    getOrdersByDateRange
  }
}
