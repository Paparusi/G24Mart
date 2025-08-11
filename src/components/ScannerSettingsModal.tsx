'use client'

import { useState, useEffect } from 'react'

interface ScannerSettings {
  minLength: number
  maxLength: number
  timeout: number
  beepOnScan: boolean
  autoAdd: boolean
  showHistory: boolean
  scanKey: string
}

interface ScannerSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: ScannerSettings) => void
  currentSettings: ScannerSettings
}

export default function ScannerSettingsModal({ isOpen, onClose, onSave, currentSettings }: ScannerSettingsModalProps) {
  const [settings, setSettings] = useState<ScannerSettings>(currentSettings)

  useEffect(() => {
    setSettings(currentSettings)
  }, [currentSettings])

  const handleSave = () => {
    onSave(settings)
    onClose()
  }

  const testScannerSound = () => {
    if ('speechSynthesis' in window) {
      // Tạo âm thanh "beep" đơn giản
      const utterance = new SpeechSynthesisUtterance('beep')
      utterance.rate = 10
      utterance.pitch = 2
      utterance.volume = 0.3
      speechSynthesis.speak(utterance)
    } else if ('AudioContext' in window || 'webkitAudioContext' in window) {
      // Fallback: sử dụng Audio API
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioCtx()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>⚙️</span>
            Cài Đặt Máy Quét Mã Vạch
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Barcode Length */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Độ dài tối thiểu</label>
              <input
                type="number"
                value={settings.minLength}
                onChange={(e) => setSettings({...settings, minLength: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Độ dài tối đa</label>
              <input
                type="number"
                value={settings.maxLength}
                onChange={(e) => setSettings({...settings, maxLength: parseInt(e.target.value) || 50})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                max="100"
              />
            </div>
          </div>

          {/* Timeout */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Thời gian chờ giữa các ký tự (ms)
            </label>
            <input
              type="number"
              value={settings.timeout}
              onChange={(e) => setSettings({...settings, timeout: parseInt(e.target.value) || 100})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="50"
              max="1000"
              step="50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Càng thấp càng nhạy với máy quét nhanh
            </p>
          </div>

          {/* Scan Key */}
          <div>
            <label className="block text-sm font-medium mb-2">Phím kết thúc quét</label>
            <select
              value={settings.scanKey}
              onChange={(e) => setSettings({...settings, scanKey: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Enter">Enter</option>
              <option value="Tab">Tab</option>
              <option value=" ">Space</option>
            </select>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="beepOnScan"
                checked={settings.beepOnScan}
                onChange={(e) => setSettings({...settings, beepOnScan: e.target.checked})}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="beepOnScan" className="text-sm font-medium flex-1">
                Phát âm thanh khi quét thành công
              </label>
              <button
                onClick={testScannerSound}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
              >
                Test
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoAdd"
                checked={settings.autoAdd}
                onChange={(e) => setSettings({...settings, autoAdd: e.target.checked})}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="autoAdd" className="text-sm font-medium">
                Tự động thêm vào giỏ hàng khi quét
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showHistory"
                checked={settings.showHistory}
                onChange={(e) => setSettings({...settings, showHistory: e.target.checked})}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="showHistory" className="text-sm font-medium">
                Hiển thị lịch sử quét
              </label>
            </div>
          </div>

          {/* Common Barcode Formats */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Định dạng mã vạch phổ biến:</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <div>• EAN-13: 13 ký tự số (8934673001234)</div>
              <div>• EAN-8: 8 ký tự số (12345678)</div>
              <div>• UPC-A: 12 ký tự số (123456789012)</div>
              <div>• Code 128: 6-20 ký tự (ABC123def)</div>
              <div>• QR Code: Tùy thuộc nội dung</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Lưu Cài Đặt
          </button>
        </div>
      </div>
    </div>
  )
}
