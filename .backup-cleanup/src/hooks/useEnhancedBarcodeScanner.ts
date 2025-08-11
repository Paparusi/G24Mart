'use client'
import { useState, useCallback, useRef } from 'react'
import { barcodeApiService, BarcodeProduct, BarcodeApiResponse } from '@/services/BarcodeApiService'
import { performanceMonitor } from '@/services/PerformanceMonitor'

export interface ScannedProductData {
  barcode: string
  productInfo: BarcodeProduct | null
  isFromApi: boolean
  apiResponse?: BarcodeApiResponse
  scanTimestamp: string
  processingTime: number
  scanMethod?: 'keyboard' | 'camera' | 'manual'
}

export interface EnhancedBarcodeHookOptions {
  onProductFound: (productData: ScannedProductData) => void
  onError?: (error: string) => void
  autoAddToInventory?: boolean
  showApiProgress?: boolean
}

export function useEnhancedBarcodeScanner(options: EnhancedBarcodeHookOptions) {
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [lastScannedProduct, setLastScannedProduct] = useState<ScannedProductData | null>(null)
  const [apiProgress, setApiProgress] = useState<{
    stage: string
    source: string
    isLoading: boolean
  }>({ stage: 'idle', source: '', isLoading: false })
  
  const scannerRef = useRef<HTMLDivElement>(null)
  const processingRef = useRef<boolean>(false)

  // Xử lý mã vạch đã quét
  const processScannedBarcode = useCallback(async (barcode: string, scanMethod: 'keyboard' | 'camera' | 'manual' = 'manual') => {
    if (processingRef.current) return
    processingRef.current = true

    const startTime = Date.now()
    const markStart = `barcode_scan_${barcode}_start`
    
    try {
      setIsProcessing(true)
      performanceMonitor.mark(markStart)

      if (options.showApiProgress) {
        setApiProgress({ stage: 'scanning', source: 'local', isLoading: true })
      }

      // Bước 1: Validate mã vạch
      if (!barcode || barcode.length < 8) {
        throw new Error('Mã vạch không hợp lệ')
      }

      if (options.showApiProgress) {
        setApiProgress({ stage: 'looking-up', source: 'api', isLoading: true })
      }

      // Bước 2: Tra cứu thông tin sản phẩm từ API
      const apiResponse = await barcodeApiService.lookupBarcode(barcode)
      
      const processingTime = Date.now() - startTime
      const markEnd = `barcode_scan_${barcode}_end`
      performanceMonitor.mark(markEnd)
      performanceMonitor.measure(`barcode_scan_${barcode}`, markStart, markEnd)

      // Bước 3: Tạo dữ liệu sản phẩm đã quét
      const scannedData: ScannedProductData = {
        barcode: barcode,
        productInfo: apiResponse.product || null,
        isFromApi: apiResponse.success && apiResponse.source !== 'Generated',
        apiResponse: apiResponse,
        scanTimestamp: new Date().toISOString(),
        processingTime: processingTime,
        scanMethod: scanMethod
      }

      setLastScannedProduct(scannedData)

      if (options.showApiProgress) {
        setApiProgress({ 
          stage: apiResponse.success ? 'success' : 'fallback', 
          source: apiResponse.source, 
          isLoading: false 
        })
      }

      // Callback với dữ liệu sản phẩm
      options.onProductFound(scannedData)

      // Log performance
      console.log(`Barcode scan completed in ${processingTime}ms from ${apiResponse.source}`)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định'
      
      if (options.showApiProgress) {
        setApiProgress({ stage: 'error', source: 'error', isLoading: false })
      }

      options.onError?.(errorMessage)
      console.error('Barcode processing error:', error)

    } finally {
      setIsProcessing(false)
      processingRef.current = false
      
      // Reset progress sau 2s
      setTimeout(() => {
        setApiProgress({ stage: 'idle', source: '', isLoading: false })
      }, 2000)
    }
  }, [options])

  // Bắt đầu quét mã vạch (keyboard input)
  const startKeyboardScanning = useCallback(() => {
    if (isScanning) return

    setIsScanning(true)
    let barcodeBuffer = ''
    let lastKeyTime = Date.now()

    const handleKeydown = (event: KeyboardEvent) => {
      const currentTime = Date.now()
      
      // Reset buffer nếu quá lâu không nhập (>100ms)
      if (currentTime - lastKeyTime > 100) {
        barcodeBuffer = ''
      }
      
      lastKeyTime = currentTime

      if (event.key === 'Enter') {
        event.preventDefault()
        
        if (barcodeBuffer.length >= 8) {
          processScannedBarcode(barcodeBuffer, 'keyboard')
          barcodeBuffer = ''
        }
      } else if (event.key.length === 1 && /[0-9]/.test(event.key)) {
        event.preventDefault()
        barcodeBuffer += event.key
        
        // Auto-submit nếu đủ độ dài mã vạch
        if (barcodeBuffer.length === 13 || barcodeBuffer.length === 12) {
          setTimeout(() => {
            if (barcodeBuffer.length >= 12) {
              processScannedBarcode(barcodeBuffer, 'keyboard')
              barcodeBuffer = ''
            }
          }, 50)
        }
      }
    }

    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('keydown', handleKeydown)
      setIsScanning(false)
    }
  }, [isScanning, processScannedBarcode])

  // Dừng quét
  const stopScanning = useCallback(() => {
    setIsScanning(false)
  }, [])

  // Quét thủ công
  const manualScan = useCallback((barcode: string) => {
    processScannedBarcode(barcode, 'manual')
  }, [processScannedBarcode])

  // Quét bằng camera (mobile)
  const startCameraScanning = useCallback(() => {
    setIsCameraActive(true)
  }, [])

  // Dừng camera
  const stopCameraScanning = useCallback(() => {
    setIsCameraActive(false)
  }, [])

  // Xử lý kết quả từ camera
  const handleCameraScan = useCallback((barcode: string) => {
    processScannedBarcode(barcode, 'camera')
    // Auto close camera sau khi quét thành công
    setTimeout(() => setIsCameraActive(false), 1000)
  }, [processScannedBarcode])

  // Reset trạng thái
  const resetScanner = useCallback(() => {
    setIsScanning(false)
    setIsProcessing(false)
    setIsCameraActive(false)
    setLastScannedProduct(null)
    setApiProgress({ stage: 'idle', source: '', isLoading: false })
    processingRef.current = false
  }, [])

  // Lấy thông tin sản phẩm từ mã vạch (không quét)
  const getProductInfo = useCallback(async (barcode: string): Promise<BarcodeApiResponse> => {
    return await barcodeApiService.lookupBarcode(barcode)
  }, [])

  return {
    // States
    isScanning,
    isProcessing,
    isCameraActive,
    lastScannedProduct,
    apiProgress,
    
    // Actions
    startKeyboardScanning,
    stopScanning,
    startCameraScanning,
    stopCameraScanning,
    handleCameraScan,
    manualScan,
    resetScanner,
    getProductInfo,
    
    // Data
    scannerRef
  }
}

// Hook riêng để quản lý inventory với barcode
export function useBarcodeInventoryManager() {
  const [pendingProducts, setPendingProducts] = useState<ScannedProductData[]>([])
  const [inventoryItems, setInventoryItems] = useState<any[]>([])

  const addPendingProduct = useCallback((productData: ScannedProductData) => {
    setPendingProducts(prev => [productData, ...prev])
  }, [])

  const removePendingProduct = useCallback((barcode: string) => {
    setPendingProducts(prev => prev.filter(p => p.barcode !== barcode))
  }, [])

  const confirmAddToInventory = useCallback((
    productData: ScannedProductData, 
    customData: {
      name?: string
      price: number
      cost: number
      quantity: number
      category?: string
      description?: string
    }
  ) => {
    const inventoryItem = {
      id: Date.now().toString(),
      barcode: productData.barcode,
      name: customData.name || productData.productInfo?.name || 'Sản phẩm mới',
      price: customData.price,
      cost: customData.cost,
      quantity: customData.quantity,
      category: customData.category || productData.productInfo?.category || 'Khác',
      description: customData.description || productData.productInfo?.description || '',
      brand: productData.productInfo?.brand || 'Không xác định',
      images: productData.productInfo?.images || [],
      isFromApi: productData.isFromApi,
      apiSource: productData.apiResponse?.source || 'manual',
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }

    setInventoryItems(prev => [inventoryItem, ...prev])
    removePendingProduct(productData.barcode)

    return inventoryItem
  }, [removePendingProduct])

  const clearPendingProducts = useCallback(() => {
    setPendingProducts([])
  }, [])

  return {
    pendingProducts,
    inventoryItems,
    addPendingProduct,
    removePendingProduct,
    confirmAddToInventory,
    clearPendingProducts
  }
}
