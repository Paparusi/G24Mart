'use client'

import { useState } from 'react'
import { useEnhancedBarcodeScanner, ScannedProductData } from '@/hooks/useEnhancedBarcodeScanner'
import MobileBarcodeCamera from '@/components/MobileBarcodeCamera'

interface MobileBarcodeIntegrationProps {
  onProductScanned: (productData: ScannedProductData) => void
  onError?: (error: string) => void
}

export default function MobileBarcodeIntegration({
  onProductScanned,
  onError
}: MobileBarcodeIntegrationProps) {
  const [showCameraButton, setShowCameraButton] = useState(true)

  const scanner = useEnhancedBarcodeScanner({
    onProductFound: (productData) => {
      onProductScanned(productData)
    },
    onError: (error) => {
      onError?.(error)
    },
    showApiProgress: true
  })

  // Kiểm tra xem có phải thiết bị mobile không
  const isMobile = () => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Kiểm tra camera support
  const isCameraSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  if (!isCameraSupported()) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600">⚠️</span>
          <span className="text-yellow-800">Camera không được hỗ trợ trên thiết bị này</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Scanner Controls */}
      <div className="flex flex-wrap gap-2">
        {/* Camera Button - Visible on all devices but optimized for mobile */}
        <button
          onClick={scanner.startCameraScanning}
          disabled={scanner.isProcessing || scanner.isCameraActive}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            isMobile() 
              ? 'bg-blue-600 hover:bg-blue-700 text-white flex-1 min-w-[200px]' 
              : 'bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="text-lg">📱</span>
          <span>{isMobile() ? 'Quét Bằng Camera' : 'Quét Bằng Camera (Mobile)'}</span>
        </button>

        {/* Keyboard Scanner - Desktop focused */}
        {!isMobile() && (
          <button
            onClick={scanner.startKeyboardScanning}
            disabled={scanner.isProcessing || scanner.isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>⌨️</span>
            <span>Quét Bằng Bàn Phím</span>
          </button>
        )}

        {/* Manual Input */}
        <button
          onClick={() => {
            const barcode = prompt('Nhập mã vạch:')
            if (barcode && barcode.trim()) {
              scanner.manualScan(barcode.trim())
            }
          }}
          disabled={scanner.isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>✏️</span>
          <span>Nhập Thủ Công</span>
        </button>
      </div>

      {/* Scanner Status */}
      {scanner.isScanning && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">⌨️</span>
              <span className="text-blue-800 font-medium">Đang chờ quét bằng bàn phím...</span>
            </div>
            <button
              onClick={scanner.stopScanning}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md"
            >
              Dừng
            </button>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Quét mã vạch hoặc nhập số bằng bàn phím và nhấn Enter
          </p>
        </div>
      )}

      {/* API Progress */}
      {scanner.apiProgress.isLoading && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
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

      {/* Processing Status */}
      {scanner.isProcessing && !scanner.apiProgress.isLoading && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">Đang xử lý kết quả quét...</span>
          </div>
        </div>
      )}

      {/* Last Scanned Product */}
      {scanner.lastScannedProduct && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-green-800 mb-2">✅ Sản phẩm vừa quét</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Mã vạch:</span> {scanner.lastScannedProduct.barcode}</p>
                <p><span className="font-medium">Tên:</span> {scanner.lastScannedProduct.productInfo?.name || 'Chưa xác định'}</p>
                <p><span className="font-medium">Phương pháp:</span> 
                  {scanner.lastScannedProduct.scanMethod === 'camera' && '📱 Camera'}
                  {scanner.lastScannedProduct.scanMethod === 'keyboard' && '⌨️ Bàn phím'}
                  {scanner.lastScannedProduct.scanMethod === 'manual' && '✏️ Thủ công'}
                </p>
                <p><span className="font-medium">Thời gian xử lý:</span> {scanner.lastScannedProduct.processingTime}ms</p>
              </div>
            </div>
            <span className="text-2xl">
              {scanner.lastScannedProduct.scanMethod === 'camera' && '📱'}
              {scanner.lastScannedProduct.scanMethod === 'keyboard' && '⌨️'}
              {scanner.lastScannedProduct.scanMethod === 'manual' && '✏️'}
            </span>
          </div>
        </div>
      )}

      {/* Mobile Camera Component */}
      <MobileBarcodeCamera
        isActive={scanner.isCameraActive}
        onBarcodeDetected={scanner.handleCameraScan}
        onClose={scanner.stopCameraScanning}
      />

      {/* Mobile Tips */}
      {isMobile() && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Mẹo sử dụng trên di động</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Nhấn "Quét Bằng Camera" để sử dụng camera của điện thoại</li>
            <li>• Đặt mã vạch trong khung đỏ để quét tự động</li>
            <li>• Đảm bảo ánh sáng đủ và mã vạch rõ nét</li>
            <li>• Có thể chuyển đổi giữa camera trước/sau</li>
          </ul>
        </div>
      )}
    </div>
  )
}
