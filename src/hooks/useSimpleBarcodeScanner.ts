'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'

interface SimpleBarcodeScanner {
  onProductFound: (product: any) => void
  onError?: (error: string) => void
}

export function useSimpleBarcodeScanner({ onProductFound, onError }: SimpleBarcodeScanner) {
  const { products, addProduct } = useStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const scanBarcode = useCallback(async (barcode: string) => {
    if (!barcode || barcode.trim().length < 3) {
      onError?.('Mã vạch không hợp lệ')
      return
    }

    setIsProcessing(true)

    try {
      // Tìm sản phẩm trong store trước
      let product = products.find(p => p.barcode === barcode.trim())

      if (product) {
        onProductFound(product)
        setIsProcessing(false)
        return
      }

      // Nếu không tìm thấy, tạo sản phẩm mới với thông tin cơ bản
      const newProduct = {
        id: `product_${Date.now()}`,
        barcode: barcode.trim(),
        name: `Sản phẩm ${barcode.trim()}`,
        price: 10000, // Giá mặc định
        costPrice: 7000,
        stock: 1,
        minStock: 5,
        category: 'Khác',
        supplier: 'Chưa rõ',
        description: `Sản phẩm được quét từ mã vạch ${barcode}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Thêm vào store
      addProduct(newProduct)
      onProductFound(newProduct)

    } catch (error) {
      onError?.(`Lỗi quét mã vạch: ${error}`)
    } finally {
      setIsProcessing(false)
    }
  }, [products, addProduct, onProductFound, onError])

  return {
    scanBarcode,
    isProcessing
  }
}
