'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// Simple barcode detection from camera stream
// Using basic pattern recognition for common barcode types
const detectBarcodeFromImageData = (imageData: ImageData): string | null => {
  const { data, width, height } = imageData
  
  // Convert to grayscale and look for barcode patterns
  const grayscale = new Uint8Array(width * height)
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    grayscale[i / 4] = gray
  }
  
  // Look for vertical line patterns (simplified barcode detection)
  const threshold = 128
  const minLineWidth = 2
  const maxLineWidth = 20
  
  for (let y = Math.floor(height * 0.4); y < Math.floor(height * 0.6); y += 5) {
    let currentRun = 0
    let isBlack = false
    let pattern: number[] = []
    
    for (let x = 0; x < width; x++) {
      const pixel = grayscale[y * width + x]
      const isPixelBlack = pixel < threshold
      
      if (isPixelBlack === isBlack) {
        currentRun++
      } else {
        if (currentRun >= minLineWidth && currentRun <= maxLineWidth) {
          pattern.push(currentRun)
        }
        currentRun = 1
        isBlack = isPixelBlack
      }
      
      if (pattern.length > 20) break
    }
    
    // If we found a reasonable pattern, try to extract a barcode
    if (pattern.length >= 10) {
      // Generate a mock barcode based on pattern
      // In real implementation, you'd use a proper barcode detection library
      const mockBarcode = pattern.slice(0, 13).join('').substring(0, 13)
      if (mockBarcode.length >= 8) {
        return mockBarcode.padEnd(13, '0')
      }
    }
  }
  
  return null
}

interface MobileBarcodeCameraProps {
  onBarcodeDetected: (barcode: string) => void
  onClose: () => void
  isActive: boolean
}

export default function MobileBarcodeCamera({
  onBarcodeDetected,
  onClose,
  isActive
}: MobileBarcodeCameraProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null)
  const [streamActive, setStreamActive] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setStreamActive(false)
    setIsScanning(false)
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setIsScanning(true)

      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera không được hỗ trợ trên thiết bị này')
      }

      // Stop existing stream
      stopCamera()

      // Request camera permission
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setStreamActive(true)

        // Start barcode scanning
        startBarcodeDetection()
      }
    } catch (err: any) {
      
      if (err.name === 'NotAllowedError') {
        setError('Vui lòng cho phép truy cập camera để quét mã vạch')
      } else if (err.name === 'NotFoundError') {
        setError('Không tìm thấy camera trên thiết bị')
      } else {
        setError('Lỗi khởi động camera: ' + err.message)
      }
      setIsScanning(false)
    }
  }, [facingMode, stopCamera])

  const startBarcodeDetection = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !streamActive) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      // Try to detect barcode
      const barcode = detectBarcodeFromImageData(imageData)
      
      if (barcode && barcode !== detectedBarcode) {
        setDetectedBarcode(barcode)
        // Add vibration feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(100)
        }
        // Play beep sound
        playBeepSound()
        onBarcodeDetected(barcode)
      }
    }, 500) // Scan every 500ms
  }, [streamActive, detectedBarcode, onBarcodeDetected])

  const playBeepSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'square'
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      
    }
  }, [])

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }, [])

  const manualBarcodeInput = useCallback(() => {
    const barcode = prompt('Nhập mã vạch thủ công:')
    if (barcode && barcode.trim()) {
      onBarcodeDetected(barcode.trim())
    }
  }, [onBarcodeDetected])

  useEffect(() => {
    if (isActive) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isActive, startCamera, stopCamera])

  useEffect(() => {
    if (isActive && streamActive) {
      startCamera()
    }
  }, [facingMode, isActive, streamActive, startCamera])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg"
          >
            ← Đóng
          </button>
          
          <h1 className="text-lg font-semibold">📱 Quét Mã Vạch</h1>
          
          <button
            onClick={switchCamera}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg"
            disabled={!streamActive}
          >
            🔄 Đổi Camera
          </button>
        </div>

        {detectedBarcode && (
          <div className="mt-2 p-3 bg-green-600 bg-opacity-80 rounded-lg text-center">
            <p className="text-sm">✅ Đã phát hiện mã:</p>
            <p className="text-lg font-mono font-bold">{detectedBarcode}</p>
          </div>
        )}

        {error && (
          <div className="mt-2 p-3 bg-red-600 bg-opacity-80 rounded-lg text-center">
            <p className="text-sm">❌ {error}</p>
          </div>
        )}
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full flex items-center justify-center">
        {streamActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            onLoadedMetadata={() => {
              
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white p-8">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-xl font-semibold mb-2">Đang khởi động camera...</h2>
            <p className="text-sm text-gray-300 text-center mb-6">
              Vui lòng cho phép truy cập camera khi được yêu cầu
            </p>
            
            {error && (
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
              >
                🔄 Thử Lại
              </button>
            )}
          </div>
        )}

        {/* Overlay với khung quét */}
        {streamActive && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning Frame */}
            <div className="absolute inset-x-4 top-1/2 transform -translate-y-1/2">
              <div className="relative h-40 border-2 border-red-500 border-dashed bg-transparent">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500"></div>
                
                {/* Scanning line */}
                <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                  <div className="h-0.5 bg-red-500 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4">
        <div className="flex justify-center gap-4">
          <button
            onClick={manualBarcodeInput}
            className="flex-1 max-w-xs px-4 py-3 bg-gray-600 bg-opacity-80 rounded-lg font-medium"
          >
            ⌨️ Nhập Thủ Công
          </button>
          
          <button
            onClick={startCamera}
            disabled={isScanning}
            className="flex-1 max-w-xs px-4 py-3 bg-blue-600 bg-opacity-80 rounded-lg font-medium disabled:opacity-50"
          >
            {isScanning ? '📷 Đang Quét...' : '📷 Bắt Đầu Quét'}
          </button>
        </div>

        <div className="mt-2 text-center text-xs text-gray-300">
          💡 Đưa mã vạch vào khung đỏ để quét
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  )
}
