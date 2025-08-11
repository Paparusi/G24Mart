import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { HoldOrder, SplitPayment, Transaction, QuickSellItem, CashDrawer, Shift } from '@/types/pos'

interface AdvancedPOSState {
  // Hold Orders
  holdOrders: HoldOrder[]
  addHoldOrder: (order: HoldOrder) => void
  removeHoldOrder: (id: string) => void
  getHoldOrder: (id: string) => HoldOrder | undefined

  // Split Payments
  splitPayments: SplitPayment[]
  addSplitPayment: (payment: SplitPayment) => void
  removeSplitPayment: (index: number) => void
  clearSplitPayments: () => void
  getSplitPaymentTotal: () => number

  // Transactions
  transactions: Transaction[]
  addTransaction: (transaction: Transaction) => void
  refundTransaction: (id: string) => void
  
  // Quick Sell
  quickSellItems: QuickSellItem[]
  setQuickSellItems: (items: QuickSellItem[]) => void
  
  // Cash Drawer
  cashDrawer: CashDrawer
  openCashDrawer: (openingBalance: number) => void
  closeCashDrawer: (closingBalance: number) => void
  addCashTransaction: (type: 'sale' | 'refund' | 'payout' | 'payin', amount: number, reference?: string) => void
  
  // Shift Management
  currentShift: Shift | null
  shifts: Shift[]
  startShift: (cashier: string, openingBalance: number) => void
  endShift: (closingBalance: number) => void
  
  // Settings
  taxRate: number
  setTaxRate: (rate: number) => void
  receiptSettings: {
    storeName: string
    storeAddress: string
    storePhone: string
    taxId: string
    footerMessage: string
  }
  updateReceiptSettings: (settings: Partial<AdvancedPOSState['receiptSettings']>) => void
}

export const useAdvancedPOSStore = create<AdvancedPOSState>()(
  persist(
    (set, get) => ({
      // Hold Orders
      holdOrders: [],
      addHoldOrder: (order) => set((state) => ({ 
        holdOrders: [...state.holdOrders, order] 
      })),
      removeHoldOrder: (id) => set((state) => ({ 
        holdOrders: state.holdOrders.filter(order => order.id !== id) 
      })),
      getHoldOrder: (id) => get().holdOrders.find(order => order.id === id),

      // Split Payments
      splitPayments: [],
      addSplitPayment: (payment) => set((state) => ({ 
        splitPayments: [...state.splitPayments, payment] 
      })),
      removeSplitPayment: (index) => set((state) => ({ 
        splitPayments: state.splitPayments.filter((_, i) => i !== index) 
      })),
      clearSplitPayments: () => set({ splitPayments: [] }),
      getSplitPaymentTotal: () => get().splitPayments.reduce((sum, payment) => sum + payment.amount, 0),

      // Transactions
      transactions: [],
      addTransaction: (transaction) => set((state) => ({ 
        transactions: [transaction, ...state.transactions] 
      })),
      refundTransaction: (id) => set((state) => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, status: 'refunded' } : t
        )
      })),

      // Quick Sell
      quickSellItems: [
        { id: 'qs1', name: 'Coca Cola', price: 15000, color: 'bg-red-500', category: 'Drink' },
        { id: 'qs2', name: 'Bánh mì', price: 25000, color: 'bg-yellow-500', category: 'Food' },
        { id: 'qs3', name: 'Nước suối', price: 8000, color: 'bg-blue-500', category: 'Drink' },
        { id: 'qs4', name: 'Mì tôm', price: 4500, color: 'bg-orange-500', category: 'Food' },
        { id: 'qs5', name: 'Kẹo', price: 12000, color: 'bg-pink-500', category: 'Candy' },
        { id: 'qs6', name: 'Trà sữa', price: 18000, color: 'bg-green-500', category: 'Drink' },
      ],
      setQuickSellItems: (items) => set({ quickSellItems: items }),

      // Cash Drawer
      cashDrawer: {
        isOpen: false,
        openingBalance: 0,
        currentBalance: 0,
        transactions: []
      },
      openCashDrawer: (openingBalance) => set((state) => ({
        cashDrawer: {
          ...state.cashDrawer,
          isOpen: true,
          openingBalance,
          currentBalance: openingBalance
        }
      })),
      closeCashDrawer: (closingBalance) => set((state) => ({
        cashDrawer: {
          ...state.cashDrawer,
          isOpen: false,
          currentBalance: closingBalance
        }
      })),
      addCashTransaction: (type, amount, reference) => set((state) => ({
        cashDrawer: {
          ...state.cashDrawer,
          currentBalance: state.cashDrawer.currentBalance + (type === 'sale' || type === 'payin' ? amount : -amount),
          transactions: [{
            type,
            amount,
            timestamp: new Date().toISOString(),
            reference
          }, ...state.cashDrawer.transactions]
        }
      })),

      // Shift Management
      currentShift: null,
      shifts: [],
      startShift: (cashier, openingBalance) => {
        const newShift: Shift = {
          id: `shift_${Date.now()}`,
          cashier,
          startTime: new Date().toISOString(),
          openingBalance,
          totalSales: 0,
          totalTransactions: 0,
          status: 'active'
        }
        set((state) => ({
          currentShift: newShift,
          shifts: [newShift, ...state.shifts]
        }))
        get().openCashDrawer(openingBalance)
      },
      endShift: (closingBalance) => set((state) => {
        if (!state.currentShift) return state
        
        const updatedShift: Shift = {
          ...state.currentShift,
          endTime: new Date().toISOString(),
          closingBalance,
          status: 'closed'
        }
        
        get().closeCashDrawer(closingBalance)
        
        return {
          currentShift: null,
          shifts: state.shifts.map(shift => 
            shift.id === state.currentShift?.id ? updatedShift : shift
          )
        }
      }),

      // Settings
      taxRate: 0.1,
      setTaxRate: (rate) => set({ taxRate: rate }),
      receiptSettings: {
        storeName: 'G24Mart',
        storeAddress: '123 Đường ABC, Quận 1, TP.HCM',
        storePhone: '0901234567',
        taxId: '0123456789',
        footerMessage: 'Cảm ơn quý khách đã mua hàng!'
      },
      updateReceiptSettings: (settings) => set((state) => ({
        receiptSettings: { ...state.receiptSettings, ...settings }
      }))
    }),
    {
      name: 'advanced-pos-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
