import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface SalesSummary {
  totalSales: number
  totalTransactions: number
  averageTransactionValue: number
  topSellingProducts: Array<{
    id: string
    name: string
    quantity: number
    revenue: number
  }>
  salesByHour: Array<{
    hour: number
    sales: number
    transactions: number
  }>
  salesByPaymentMethod: Array<{
    method: string
    amount: number
    count: number
  }>
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  points: number
  totalSpent: number
  visits: number
  lastVisit: string
  dateJoined: string
  birthDate?: string
  preferences?: string[]
}

interface AnalyticsState {
  // Sales Analytics
  todaySummary: SalesSummary
  weeklySummary: SalesSummary
  monthlySummary: SalesSummary
  updateSalesData: (period: 'today' | 'week' | 'month', data: Partial<SalesSummary>) => void
  
  // Customer Management
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id' | 'dateJoined' | 'lastVisit'>) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  findCustomerByPhone: (phone: string) => Customer | undefined
  getCustomerTierColor: (tier: Customer['tier']) => string
  addCustomerPoints: (customerId: string, points: number, spent: number) => void
  
  // Inventory Analytics
  lowStockItems: Array<{
    id: string
    name: string
    currentStock: number
    minimumStock: number
    category: string
  }>
  updateLowStockItems: (items: AnalyticsState['lowStockItems']) => void
  
  // Business Intelligence
  profitMargins: Array<{
    productId: string
    name: string
    costPrice: number
    sellPrice: number
    margin: number
    marginPercent: number
  }>
  updateProfitMargins: (margins: AnalyticsState['profitMargins']) => void
}

const initialSalesSummary: SalesSummary = {
  totalSales: 0,
  totalTransactions: 0,
  averageTransactionValue: 0,
  topSellingProducts: [],
  salesByHour: Array.from({ length: 24 }, (_, i) => ({ hour: i, sales: 0, transactions: 0 })),
  salesByPaymentMethod: []
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      // Sales Analytics
      todaySummary: initialSalesSummary,
      weeklySummary: initialSalesSummary,
      monthlySummary: initialSalesSummary,
      
      updateSalesData: (period, data) => set((state) => ({
        [`${period}Summary`]: { ...state[`${period}Summary` as keyof AnalyticsState] as SalesSummary, ...data }
      })),
      
      // Customer Management
      customers: [
        {
          id: 'cust_001',
          name: 'Nguyễn Văn A',
          phone: '0901234567',
          email: 'nguyenvana@email.com',
          tier: 'Gold',
          points: 1250,
          totalSpent: 2500000,
          visits: 45,
          lastVisit: new Date().toISOString(),
          dateJoined: '2024-01-15',
          preferences: ['Đồ uống', 'Snack']
        },
        {
          id: 'cust_002',
          name: 'Trần Thị B',
          phone: '0912345678',
          tier: 'Silver',
          points: 750,
          totalSpent: 1500000,
          visits: 28,
          lastVisit: new Date(Date.now() - 86400000).toISOString(),
          dateJoined: '2024-02-20',
          preferences: ['Thực phẩm', 'Đồ gia dụng']
        }
      ],
      
      addCustomer: (customerData) => {
        const newCustomer: Customer = {
          ...customerData,
          id: `cust_${Date.now()}`,
          dateJoined: new Date().toISOString(),
          lastVisit: new Date().toISOString()
        }
        set((state) => ({
          customers: [...state.customers, newCustomer]
        }))
      },
      
      updateCustomer: (id, updates) => set((state) => ({
        customers: state.customers.map(customer => 
          customer.id === id ? { ...customer, ...updates } : customer
        )
      })),
      
      findCustomerByPhone: (phone) => get().customers.find(c => c.phone === phone),
      
      getCustomerTierColor: (tier) => {
        const colors = {
          Bronze: 'text-orange-600 bg-orange-100',
          Silver: 'text-gray-600 bg-gray-100',
          Gold: 'text-yellow-600 bg-yellow-100',
          Platinum: 'text-purple-600 bg-purple-100'
        }
        return colors[tier]
      },
      
      addCustomerPoints: (customerId, points, spent) => set((state) => ({
        customers: state.customers.map(customer => {
          if (customer.id === customerId) {
            const newTotalSpent = customer.totalSpent + spent
            const newPoints = customer.points + points
            const newVisits = customer.visits + 1
            
            // Calculate tier based on total spent
            let newTier: Customer['tier'] = 'Bronze'
            if (newTotalSpent >= 5000000) newTier = 'Platinum'
            else if (newTotalSpent >= 2000000) newTier = 'Gold'
            else if (newTotalSpent >= 500000) newTier = 'Silver'
            
            return {
              ...customer,
              points: newPoints,
              totalSpent: newTotalSpent,
              visits: newVisits,
              tier: newTier,
              lastVisit: new Date().toISOString()
            }
          }
          return customer
        })
      })),
      
      // Inventory Analytics
      lowStockItems: [
        { id: '4', name: 'Mì tôm Hảo Hảo', currentStock: 2, minimumStock: 10, category: 'Thực Phẩm Khô' },
        { id: '2', name: 'Bánh mì sandwich', currentStock: 8, minimumStock: 20, category: 'Thực Phẩm' }
      ],
      
      updateLowStockItems: (items) => set({ lowStockItems: items }),
      
      // Business Intelligence
      profitMargins: [
        { productId: '1', name: 'Coca Cola 330ml', costPrice: 12000, sellPrice: 15000, margin: 3000, marginPercent: 20 },
        { productId: '2', name: 'Bánh mì sandwich', costPrice: 18000, sellPrice: 25000, margin: 7000, marginPercent: 28 },
        { productId: '3', name: 'Nước suối Lavie 500ml', costPrice: 6000, sellPrice: 8000, margin: 2000, marginPercent: 25 }
      ],
      
      updateProfitMargins: (margins) => set({ profitMargins: margins })
    }),
    {
      name: 'analytics-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
