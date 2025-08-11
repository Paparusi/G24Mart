// Sample orders data for testing
export const sampleOrders = [
  {
    id: 'TXN1723306800000',
    orderNumber: 'DH20250810001',
    items: [
      { id: '1', name: 'Mì tôm Hảo Hảo', price: 8000, quantity: 2, total: 16000, barcode: '8934563113567' },
      { id: '2', name: 'Bánh mì sandwich', price: 25000, quantity: 1, total: 25000, barcode: '8936012345678' },
      { id: '3', name: 'Nước suối Aquafina', price: 10000, quantity: 3, total: 30000, barcode: '8934588012345' }
    ],
    subtotal: 71000,
    tax: 7100,
    discount: 0,
    total: 78100,
    paymentMethod: 'cash' as const,
    customerName: 'Nguyễn Văn An',
    customerPhone: '0987654321',
    date: '2025-08-10',
    time: '14:30:25',
    status: 'completed' as const,
    cashier: 'Thu ngân'
  },
  {
    id: 'TXN1723306200000',
    orderNumber: 'DH20250810002',
    items: [
      { id: '4', name: 'Coca Cola 330ml', price: 12000, quantity: 2, total: 24000, barcode: '8934561234567' },
      { id: '5', name: 'Snack Oishi', price: 15000, quantity: 1, total: 15000, barcode: '8936789012345' }
    ],
    subtotal: 39000,
    tax: 3900,
    discount: 2000,
    total: 40900,
    paymentMethod: 'card' as const,
    customerName: undefined,
    customerPhone: undefined,
    date: '2025-08-10',
    time: '14:15:42',
    status: 'completed' as const,
    cashier: 'Thu ngân'
  },
  {
    id: 'TXN1723305600000',
    orderNumber: 'DH20250810003',
    items: [
      { id: '6', name: 'Kẹo Mentos', price: 20000, quantity: 1, total: 20000, barcode: '8934567890123' },
      { id: '7', name: 'Bánh Oreo', price: 35000, quantity: 2, total: 70000, barcode: '8936543210987' },
      { id: '8', name: 'Sữa tươi TH', price: 18000, quantity: 1, total: 18000, barcode: '8934512345678' }
    ],
    subtotal: 108000,
    tax: 10800,
    discount: 5000,
    total: 113800,
    paymentMethod: 'transfer' as const,
    customerName: 'Trần Thị Bình',
    customerPhone: '0901234567',
    date: '2025-08-10',
    time: '13:58:15',
    status: 'completed' as const,
    cashier: 'Thu ngân'
  },
  {
    id: 'TXN1723222800000',
    orderNumber: 'DH20250809001',
    items: [
      { id: '9', name: 'Mì ly Omachi', price: 12000, quantity: 3, total: 36000, barcode: '8934563987654' },
      { id: '10', name: 'Nước ngọt 7Up', price: 15000, quantity: 2, total: 30000, barcode: '8934561111111' }
    ],
    subtotal: 66000,
    tax: 6600,
    discount: 0,
    total: 72600,
    paymentMethod: 'cash' as const,
    customerName: undefined,
    customerPhone: undefined,
    date: '2025-08-09',
    time: '15:20:30',
    status: 'completed' as const,
    cashier: 'Thu ngân'
  },
  {
    id: 'TXN1723219200000',
    orderNumber: 'DH20250809002',
    items: [
      { id: '11', name: 'Bánh quy Cosy', price: 22000, quantity: 1, total: 22000, barcode: '8936789654321' }
    ],
    subtotal: 22000,
    tax: 2200,
    discount: 1000,
    total: 23200,
    paymentMethod: 'card' as const,
    customerName: 'Lê Văn Cường',
    customerPhone: '0912345678',
    date: '2025-08-09',
    time: '14:25:45',
    status: 'refunded' as const,
    cashier: 'Thu ngân'
  },
  {
    id: 'TXN1723136400000',
    orderNumber: 'DH20250808001',
    items: [
      { id: '12', name: 'Kem Cornetto', price: 18000, quantity: 4, total: 72000, barcode: '8934567123456' },
      { id: '13', name: 'Kẹo dẻo Haribo', price: 25000, quantity: 2, total: 50000, barcode: '8936111222333' }
    ],
    subtotal: 122000,
    tax: 12200,
    discount: 10000,
    total: 124200,
    paymentMethod: 'cash' as const,
    customerName: 'Phạm Thị Dung',
    customerPhone: '0987123456',
    date: '2025-08-08',
    time: '16:45:20',
    status: 'partial-refund' as const,
    cashier: 'Thu ngân'
  }
]

// Function to initialize sample data if no orders exist
export const initializeSampleData = () => {
  const existingOrders = localStorage.getItem('g24mart_orders')
  if (!existingOrders) {
    localStorage.setItem('g24mart_orders', JSON.stringify(sampleOrders))
  }
}
