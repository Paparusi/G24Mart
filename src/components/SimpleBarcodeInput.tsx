'use client'

import { useState, useRef, useEffect } from 'react'
import { useSimpleBarcodeScanner } from '@/hooks/useSimpleBarcodeScanner'

interface SimpleBarcodeInputProps {
  onProductScanned: (product: any) => void
  onError?: (error: string) => void
  placeholder?: string
  className?: string
}

export default function SimpleBarcodeInput({
  onProductScanned,
  onError,
  placeholder = "Quét mã vạch hoặc nhập thủ công...",
  className = ""
}: SimpleBarcodeInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { scanBarcode, isProcessing } = useSimpleBarcodeScanner({
    onProductFound: (product) => {
      onProductScanned(product)
      setInputValue('')
      setIsCameraOpen(false)
    },
    onError: (error) => {
      onError?.(error)
    }
  })

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      scanBarcode(inputValue.trim())
    }
  }

  // Handle keyboard input for barcode scanners
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        scanBarcode(inputValue.trim())
      }
    }
  }

  // Camera-based scanning (simplified)
  const handleCameraToggle = async () => {
    if (isCameraOpen) {
      setIsCameraOpen(false)
      return
    }

    try {
      // Check camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        onError?.('Camera không được hỗ trợ')
        return
      }

      setIsCameraOpen(true)
    } catch (error) {
      onError?.('Không thể mở camera')
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            disabled={isProcessing}
          />
          {isProcessing && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!inputValue.trim() || isProcessing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isProcessing ? 'Đang quét...' : 'Quét'}
        </button>
        
        <button
          type="button"
          onClick={handleCameraToggle}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center space-x-2"
        >
          <span className="text-xl">📷</span>
          <span className="hidden sm:inline">Camera</span>
        </button>
      </form>

      {/* Camera Scanner Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Quét mã vạch bằng Camera</h3>
              <button
                onClick={() => setIsCameraOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-gray-600 mb-4">
                Camera scanner đang được phát triển
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Hiện tại vui lòng sử dụng nhập thủ công hoặc barcode scanner vật lý
              </p>
              
              {/* Manual input in camera mode */}
              <div className="mt-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập mã vạch..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && inputValue.trim()) {
                      scanBarcode(inputValue.trim())
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (inputValue.trim()) {
                      scanBarcode(inputValue.trim())
                    }
                  }}
                  className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={!inputValue.trim()}
                >
                  Xác nhận mã vạch
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => setIsCameraOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setInputValue('1234567890123')
            scanBarcode('1234567890123')
          }}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
        >
          Test: Coca Cola
        </button>
        <button
          onClick={() => {
            setInputValue('9876543210987')
            scanBarcode('9876543210987')
          }}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
        >
          Test: Pepsi
        </button>
        <button
          onClick={() => {
            const randomBarcode = Math.random().toString().substring(2, 15)
            setInputValue(randomBarcode)
            scanBarcode(randomBarcode)
          }}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
        >
          Tạo sản phẩm mới
        </button>
      </div>
    </div>
  )
}
