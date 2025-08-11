'use client'

import { useAdvancedPOSStore } from '@/stores/useAdvancedPOSStore'

interface QuickSellPanelProps {
  onAddToCart: (item: any) => void
}

export default function QuickSellPanel({ onAddToCart }: QuickSellPanelProps) {
  const { quickSellItems } = useAdvancedPOSStore()

  const handleQuickSell = (item: any) => {
    const product = {
      id: item.id,
      name: item.name,
      price: item.price,
      barcode: `QS${item.id}`,
      stock: 999, // Quick sell items always in stock
      category: item.category
    }
    onAddToCart(product)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Bán Nhanh</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickSellItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleQuickSell(item)}
            className={`${item.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity shadow-md active:scale-95 transform transition-transform`}
          >
            <div className="text-center">
              <div className="font-semibold text-sm mb-1">{item.name}</div>
              <div className="text-xs opacity-90">
                {item.price.toLocaleString('vi-VN')}₫
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
