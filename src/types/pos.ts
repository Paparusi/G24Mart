export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  barcode?: string
  discount?: number
  total: number
}

export interface Product {
  id: string
  name: string
  price: number
  barcode: string
  stock: number
  category: string
  costPrice?: number
  supplier?: string
}

export interface HoldOrder {
  id: string
  items: CartItem[]
  customerName?: string
  customerPhone?: string
  timestamp: string
  total: number
  notes?: string
}

export interface SplitPayment {
  method: string
  amount: number
}

export interface Transaction {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  payments: SplitPayment[]
  customerName?: string
  customerPhone?: string
  timestamp: string
  cashier: string
  status: 'completed' | 'refunded' | 'exchanged'
  receiptNumber: string
}

export interface QuickSellItem {
  id: string
  name: string
  price: number
  color: string
  category: string
}

export interface PaymentMethod {
  id: string
  name: string
  icon: string
  description: string
  enabled: boolean
}

export interface CashDrawer {
  isOpen: boolean
  openingBalance: number
  currentBalance: number
  transactions: {
    type: 'sale' | 'refund' | 'payout' | 'payin'
    amount: number
    timestamp: string
    reference?: string
  }[]
}

export interface Shift {
  id: string
  cashier: string
  startTime: string
  endTime?: string
  openingBalance: number
  closingBalance?: number
  totalSales: number
  totalTransactions: number
  status: 'active' | 'closed'
}
