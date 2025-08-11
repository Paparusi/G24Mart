import { useEffect, useRef, useCallback } from 'react'

interface BarcodeOptions {
  onScan: (barcode: string) => void
  onError?: (error: string) => void
  minLength?: number
  maxLength?: number
  timeout?: number
  scanKey?: string // Phím kết thúc scan (thường là Enter)
}

export function useBarcodeScanner({
  onScan,
  onError,
  minLength = 8,
  maxLength = 20,
  timeout = 100,
  scanKey = 'Enter'
}: BarcodeOptions) {
  const barcodeRef = useRef('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isShiftPressed = useRef(false)

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const { key, shiftKey, ctrlKey, altKey, metaKey } = event

    // Bỏ qua nếu có phím modifier (trừ Shift cho một số máy quét)
    if (ctrlKey || altKey || metaKey) return

    // Theo dõi trạng thái Shift
    if (key === 'Shift') {
      isShiftPressed.current = shiftKey
      return
    }

    // Reset timeout mỗi khi có ký tự mới
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Xử lý phím Enter (kết thúc scan)
    if (key === scanKey) {
      const barcode = barcodeRef.current.trim()
      
      if (barcode.length >= minLength && barcode.length <= maxLength) {
        // Kiểm tra định dạng mã vạch (chỉ chấp nhận số và một số ký tự đặc biệt)
        const barcodePattern = /^[0-9A-Za-z\-_.]+$/
        if (barcodePattern.test(barcode)) {
          onScan(barcode)
        } else {
          onError?.(`Mã vạch không hợp lệ: ${barcode}`)
        }
      } else if (barcode.length > 0) {
        onError?.(`Độ dài mã vạch không hợp lệ: ${barcode} (${barcode.length} ký tự)`)
      }
      
      barcodeRef.current = ''
      return
    }

    // Thêm ký tự vào chuỗi mã vạch
    if (key.length === 1) {
      barcodeRef.current += key
      
      // Đặt timeout để reset nếu không có ký tự mới
      timeoutRef.current = setTimeout(() => {
        if (barcodeRef.current.length > 0) {
          // Nếu có dữ liệu nhưng không kết thúc bằng Enter, có thể là nhập tay
          const barcode = barcodeRef.current.trim()
          if (barcode.length >= minLength) {
            onScan(barcode)
          }
          barcodeRef.current = ''
        }
      }, timeout)
    }
  }, [onScan, onError, minLength, maxLength, timeout, scanKey])

  useEffect(() => {
    // Thêm event listener
    document.addEventListener('keydown', handleKeyPress)
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleKeyPress])

  // Hàm reset thủ công
  const resetScanner = useCallback(() => {
    barcodeRef.current = ''
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return { resetScanner }
}

// Hook để kết nối USB Barcode Scanner qua Web USB API (nếu hỗ trợ)
export function useUSBBarcodeScanner(onScan: (barcode: string) => void) {
  const deviceRef = useRef<USBDevice | null>(null)

  const connectUSBScanner = useCallback(async () => {
    if (!('usb' in navigator)) {
      throw new Error('Trình duyệt không hỗ trợ Web USB API')
    }

    try {
      // Yêu cầu người dùng chọn thiết bị USB
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          // Một số vendor ID phổ biến cho máy quét mã vạch
          { vendorId: 0x05e0 }, // Symbol
          { vendorId: 0x0c2e }, // Honeywell
          { vendorId: 0x1a86 }, // QinHeng Electronics
          { vendorId: 0x0483 }, // STMicroelectronics
        ]
      })

      await device.open()
      await device.selectConfiguration(1)
      await device.claimInterface(0)

      deviceRef.current = device

      // Bắt đầu lắng nghe dữ liệu
      const readData = async () => {
        if (!device) return

        try {
          const result = await device.transferIn(1, 64) // endpoint 1, 64 bytes
          if (result.data) {
            const decoder = new TextDecoder()
            const text = decoder.decode(result.data)
            const cleanText = text.replace(/\0/g, '').trim()
            if (cleanText) {
              onScan(cleanText)
            }
          }
          // Tiếp tục đọc
          readData()
        } catch (error) {
          
        }
      }

      readData()
      return device

    } catch (error) {
      throw new Error(`Không thể kết nối máy quét USB: ${error}`)
    }
  }, [onScan])

  const disconnectUSBScanner = useCallback(async () => {
    if (deviceRef.current) {
      try {
        await deviceRef.current.releaseInterface(0)
        await deviceRef.current.close()
        deviceRef.current = null
      } catch (error) {
        
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      disconnectUSBScanner()
    }
  }, [disconnectUSBScanner])

  return {
    connectUSBScanner,
    disconnectUSBScanner,
    isConnected: !!deviceRef.current
  }
}

// Hook cho Serial API (cho máy quét RS232/COM port)
export function useSerialBarcodeScanner(onScan: (barcode: string) => void) {
  const portRef = useRef<SerialPort | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null)

  const connectSerialScanner = useCallback(async () => {
    if (!('serial' in navigator)) {
      throw new Error('Trình duyệt không hỗ trợ Web Serial API')
    }

    try {
      // @ts-ignore - Web Serial API
      const port = await navigator.serial.requestPort()
      await port.open({
        baudRate: 9600, // Tốc độ baud phổ biến
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: 'none'
      })

      portRef.current = port
      const textDecoder = new TextDecoderStream()
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable)
      const reader = textDecoder.readable.getReader()
      readerRef.current = reader

      // Đọc dữ liệu
      const readData = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            
            const cleanValue = value.trim()
            if (cleanValue) {
              onScan(cleanValue)
            }
          }
        } catch (error) {
          
        }
      }

      readData()
      return port

    } catch (error) {
      throw new Error(`Không thể kết nối máy quét Serial: ${error}`)
    }
  }, [onScan])

  const disconnectSerialScanner = useCallback(async () => {
    if (readerRef.current) {
      await readerRef.current.cancel()
      readerRef.current = null
    }
    if (portRef.current) {
      await portRef.current.close()
      portRef.current = null
    }
  }, [])

  return {
    connectSerialScanner,
    disconnectSerialScanner,
    isConnected: !!portRef.current
  }
}
