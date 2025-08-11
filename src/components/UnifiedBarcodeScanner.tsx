'use client'

import { useState, useRef, useEffect } from 'react'
import { useEnhancedBarcodeScanner, ScannedProductData } from '@/hooks/useEnhancedBarcodeScanner'
import MobileBarcodeCamera from '@/components/MobileBarcodeCamera'

interface UnifiedBarcodeScannerProps {
  onProductScanned: (productData: ScannedProductData) => void
  onError?: (error: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export default function UnifiedBarcodeScanner({
  onProductScanned,
  onError,
  placeholder = "Nhập mã vạch hoặc click quét bằng camera...",
  autoFocus = false
}: UnifiedBarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState('')
  const [isManualMode, setIsManualMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const scanner = useEnhancedBarcodeScanner({
    onProductFound: (productData) => {
      onProductScanned(productData)
      setManualBarcode('') // Clear input after successful scan
    },
    onError: (error) => {
      onError?.(error)
    },
    showApiProgress: true
  })

  // Auto-focus when manual mode is enabled
  useEffect(() => {
    if (isManualMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isManualMode])

  // Handle manual barcode submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      scanner.manualScan(manualBarcode.trim())
    }
  }

  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && manualBarcode.trim()) {
      scanner.manualScan(manualBarcode.trim())
    }
  }

  // Detect if device is mobile
  const isMobile = () => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768
  }

  // Check camera support
  const isCameraSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  return (
    <div className="space-y-4">
      {/* Unified Input/Scanner Interface */}
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsManualMode(true)}
                onBlur={() => setIsManualMode(false)}
                placeholder={placeholder}
                className="w-full px-4 py-3 text-lg font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus={autoFocus}
                disabled={scanner.isProcessing}
              />
              
              {/* Input Status Indicator */}
              {scanner.isProcessing && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={!manualBarcode.trim() || scanner.isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              <span>🔍</span>
              <span className="hidden sm:inline">Tìm kiếm</span>
            </button>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-2 justify-center">
            {/* Camera Scanner Button - Prominent on mobile */}
            {isCameraSupported() && (
              <button
                type="button"
                onClick={scanner.startCameraScanning}
                disabled={scanner.isProcessing || scanner.isCameraActive}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isMobile() 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white flex-grow min-w-0' 
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-lg">📱</span>
                <span>Camera</span>
              </button>
            )}

            {/* Keyboard Scanner - Desktop focused */}
            {!isMobile() && (
              <button
                type="button"
                onClick={scanner.startKeyboardScanning}
                disabled={scanner.isProcessing || scanner.isScanning}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>⌨️</span>
                <span>Bàn phím</span>
              </button>
            )}

            {/* Clear Button */}
            {manualBarcode && (
              <button
                type="button"
                onClick={() => setManualBarcode('')}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm"
              >
                <span>✕</span>
                <span>Xóa</span>
              </button>
            )}

            {/* Stop Scanner Button */}
            {(scanner.isScanning || scanner.isCameraActive) && (
              <button
                type="button"
                onClick={() => {
                  scanner.stopScanning()
                  scanner.stopCameraScanning()
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 rounded-lg font-medium"
              >
                <span>⏹️</span>
                <span>Dừng</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Status Messages */}
      {scanner.isScanning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-800 font-medium">Đang quét bằng bàn phím... (Nhập số và nhấn Enter)</span>
          </div>
        </div>
      )}

      {scanner.apiProgress.isLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
            <span className="text-yellow-800 font-medium">
              {scanner.apiProgress.stage === 'scanning' && 'Đang xử lý mã vạch...'}
              {scanner.apiProgress.stage === 'looking-up' && 'Đang tra cứu thông tin sản phẩm...'}
            </span>
          </div>
          <p className="text-sm text-yellow-600 mt-1">
            Nguồn: {scanner.apiProgress.source}
          </p>
        </div>
      )}

      {scanner.isProcessing && !scanner.apiProgress.isLoading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">Đang xử lý kết quả...</span>
          </div>
        </div>
      )}

      {/* Last Scanned Result */}
      {scanner.lastScannedProduct && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <span>✅</span>
                <span>Kết quả quét thành công</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium text-gray-600">Mã vạch:</span>
                    <div className="font-mono bg-white px-2 py-1 rounded border">
                      {scanner.lastScannedProduct.barcode}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Phương pháp:</span>
                    <div className="flex items-center gap-1 mt-1">
                      {scanner.lastScannedProduct.scanMethod === 'camera' && <>📱 Camera</>}
                      {scanner.lastScannedProduct.scanMethod === 'keyboard' && <>⌨️ Bàn phím</>}
                      {scanner.lastScannedProduct.scanMethod === 'manual' && <>✏️ Nhập tay</>}
                      {!scanner.lastScannedProduct.scanMethod && <>❓ Không rõ</>}
                    </div>
                  </div>
                </div>
                
                {scanner.lastScannedProduct.productInfo && (
                  <div>
                    <span className="font-medium text-gray-600">Tên sản phẩm:</span>
                    <div className="text-gray-800 mt-1">
                      {scanner.lastScannedProduct.productInfo.name}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Xử lý trong {scanner.lastScannedProduct.processingTime}ms • 
                  {new Date(scanner.lastScannedProduct.scanTimestamp).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
            
            <button
              onClick={scanner.resetScanner}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Đóng"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Cách sử dụng</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li><strong>• Nhập tay:</strong> Gõ mã vạch vào ô trên và nhấn Enter hoặc click Tìm kiếm</li>
          {isCameraSupported() && <li><strong>• Camera:</strong> Click nút "📱 Camera" để quét bằng camera {isMobile() ? 'điện thoại' : 'máy tính'}</li>}
          {!isMobile() && <li><strong>• Bàn phím:</strong> Click "⌨️ Bàn phím" để quét bằng máy quét mã vạch USB</li>}
          <li><strong>• Tự động:</strong> Hệ thống sẽ tự động tra cứu thông tin sản phẩm từ nhiều nguồn</li>
        </ul>
      </div>

      {/* Mobile Camera Component */}
      <MobileBarcodeCamera
        isActive={scanner.isCameraActive}
        onBarcodeDetected={scanner.handleCameraScan}
        onClose={scanner.stopCameraScanning}
      />
    </div>
  )
}
