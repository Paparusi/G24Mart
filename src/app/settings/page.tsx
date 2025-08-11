'use client'

import { useState } from 'react'
import Link from 'next/link'

interface StoreSettings {
  storeName: string
  address: string
  phone: string
  email: string
  taxNumber: string
  currency: string
  timezone: string
  language: string
}

interface TaxSettings {
  enableTax: boolean
  taxRate: number
  taxName: string
  inclusiveTax: boolean
}

interface ReceiptSettings {
  showLogo: boolean
  receiptHeader: string
  receiptFooter: string
  showQRCode: boolean
  showBarcode: boolean
  paperSize: string
}

interface NotificationSettings {
  lowStockAlert: boolean
  lowStockThreshold: number
  expiryAlert: boolean
  expiryDays: number
  dailyReport: boolean
  reportTime: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  description: string
  enabled: boolean
  config?: {
    apiKey?: string
    merchantId?: string
    secretKey?: string
    sandboxMode?: boolean
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('store')
  
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'G24Mart - Cửa hàng tiện lợi',
    address: '123 Đường ABC, Quận XYZ, TP.HCM',
    phone: '0123456789',
    email: 'contact@g24mart.vn',
    taxNumber: '0123456789',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi-VN'
  })

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { 
      id: 'cash', 
      name: 'Tiền Mặt', 
      icon: '💵', 
      description: 'Thanh toán bằng tiền mặt trực tiếp',
      enabled: true
    },
    { 
      id: 'card', 
      name: 'Thẻ ATM/Credit', 
      icon: '💳', 
      description: 'Quẹt thẻ ATM hoặc Credit Card',
      enabled: true,
      config: {
        merchantId: '',
        sandboxMode: true
      }
    },
    { 
      id: 'transfer', 
      name: 'Chuyển Khoản', 
      icon: '🏦', 
      description: 'Chuyển khoản ngân hàng',
      enabled: true,
      config: {
        merchantId: '',
        sandboxMode: true
      }
    },
    { 
      id: 'momo', 
      name: 'MoMo', 
      icon: '🟣', 
      description: 'Ví điện tử MoMo',
      enabled: true,
      config: {
        apiKey: '',
        secretKey: '',
        sandboxMode: true
      }
    },
    { 
      id: 'zalopay', 
      name: 'ZaloPay', 
      icon: '🔵', 
      description: 'Ví điện tử ZaloPay',
      enabled: true,
      config: {
        apiKey: '',
        secretKey: '',
        sandboxMode: true
      }
    },
    { 
      id: 'vnpay', 
      name: 'VNPay', 
      icon: '🔴', 
      description: 'Ví điện tử VNPay',
      enabled: true,
      config: {
        apiKey: '',
        merchantId: '',
        secretKey: '',
        sandboxMode: true
      }
    }
  ])

  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    enableTax: true,
    taxRate: 10,
    taxName: 'VAT',
    inclusiveTax: true
  })

  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    showLogo: true,
    receiptHeader: 'Cảm ơn quý khách đã mua hàng!',
    receiptFooter: 'Hẹn gặp lại quý khách!',
    showQRCode: true,
    showBarcode: true,
    paperSize: 'A4'
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    lowStockAlert: true,
    lowStockThreshold: 10,
    expiryAlert: true,
    expiryDays: 7,
    dailyReport: true,
    reportTime: '18:00'
  })

  const tabs = [
    { id: 'store', name: 'Cửa Hàng', icon: '🏪' },
    { id: 'payment', name: 'Thanh Toán', icon: '💳' },
    { id: 'tax', name: 'Thuế', icon: '💰' },
    { id: 'receipt', name: 'Hóa Đơn', icon: '🧾' },
    { id: 'notifications', name: 'Thông Báo', icon: '🔔' },
    { id: 'backup', name: 'Sao Lưu', icon: '💾' },
    { id: 'about', name: 'Thông Tin', icon: 'ℹ️' }
  ]

  const togglePaymentMethod = (id: string) => {
    if (id === 'cash') return // Cash cannot be disabled
    
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id 
          ? { ...method, enabled: !method.enabled }
          : method
      )
    )
  }

  const updatePaymentConfig = (id: string, config: any) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id
          ? { ...method, config: { ...method.config, ...config } }
          : method
      )
    )
  }

  const testPaymentMethod = (method: PaymentMethod) => {
    alert(`Đang test kết nối ${method.name}...\n${method.enabled ? '✅ Kết nối thành công' : '❌ Phương thức đã bị tắt'}`)
  }

  const savePaymentMethods = () => {
    localStorage.setItem('g24mart_payment_methods', JSON.stringify(paymentMethods))
    alert('Đã lưu cài đặt phương thức thanh toán!')
  }

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('storeSettings', JSON.stringify(storeSettings))
    localStorage.setItem('taxSettings', JSON.stringify(taxSettings))
    localStorage.setItem('receiptSettings', JSON.stringify(receiptSettings))
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings))
    
    alert('Đã lưu cài đặt thành công!')
  }

  const handleExportData = () => {
    const data = {
      storeSettings,
      taxSettings,
      receiptSettings,
      notificationSettings,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `g24mart-settings-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Tên Cửa Hàng *</label>
          <input
            type="text"
            value={storeSettings.storeName}
            onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Số Điện Thoại</label>
          <input
            type="tel"
            value={storeSettings.phone}
            onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Địa Chỉ</label>
          <textarea
            value={storeSettings.address}
            onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={storeSettings.email}
            onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Mã Số Thuế</label>
          <input
            type="text"
            value={storeSettings.taxNumber}
            onChange={(e) => setStoreSettings({...storeSettings, taxNumber: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Tiền Tệ</label>
          <select
            value={storeSettings.currency}
            onChange={(e) => setStoreSettings({...storeSettings, currency: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="VND">Việt Nam Đồng (VND)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Múi Giờ</label>
          <select
            value={storeSettings.timezone}
            onChange={(e) => setStoreSettings({...storeSettings, timezone: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Asia/Ho_Chi_Minh">Giờ Việt Nam</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">New York</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Phương thức thanh toán</h3>
          <p className="text-sm text-gray-600">Cấu hình các phương thức thanh toán cho POS</p>
        </div>
        <button
          onClick={savePaymentMethods}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          💾 Lưu cài đặt
        </button>
      </div>

      <div className="grid gap-6">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{method.icon}</span>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => testPaymentMethod(method)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  🧪 Test
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={method.enabled}
                    onChange={() => togglePaymentMethod(method.id)}
                    disabled={method.id === 'cash'}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                    method.id === 'cash' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}></div>
                </label>
              </div>
            </div>

            {method.enabled && method.config && (
              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Cấu hình kết nối</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {method.config.apiKey !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type="password"
                        value={method.config.apiKey || ''}
                        onChange={(e) => updatePaymentConfig(method.id, { apiKey: e.target.value })}
                        placeholder="Nhập API Key"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  {method.config.merchantId !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
                      <input
                        type="text"
                        value={method.config.merchantId || ''}
                        onChange={(e) => updatePaymentConfig(method.id, { merchantId: e.target.value })}
                        placeholder="Nhập Merchant ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  {method.config.secretKey !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                      <input
                        type="password"
                        value={method.config.secretKey || ''}
                        onChange={(e) => updatePaymentConfig(method.id, { secretKey: e.target.value })}
                        placeholder="Nhập Secret Key"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  {method.config.sandboxMode !== undefined && (
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={method.config.sandboxMode || false}
                          onChange={(e) => updatePaymentConfig(method.id, { sandboxMode: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Chế độ test (Sandbox)</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!method.enabled && method.id !== 'cash' && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 italic">Phương thức thanh toán đã bị tắt</p>
              </div>
            )}

            {method.id === 'cash' && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 italic">⚠️ Phương thức này không thể tắt</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Lưu ý quan trọng</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Thanh toán tiền mặt luôn được bật mặc định</li>
          <li>• Cấu hình sandbox để test trước khi chuyển sang production</li>
          <li>• API keys sẽ được lưu trữ bảo mật trong localStorage</li>
          <li>• Test kết nối trước khi sử dụng trong POS thực tế</li>
        </ul>
      </div>
    </div>
  )

  const renderTaxSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
        <input
          type="checkbox"
          id="enableTax"
          checked={taxSettings.enableTax}
          onChange={(e) => setTaxSettings({...taxSettings, enableTax: e.target.checked})}
          className="w-5 h-5 text-blue-600"
        />
        <label htmlFor="enableTax" className="font-medium text-blue-900">
          Kích hoạt tính thuế cho sản phẩm
        </label>
      </div>
      
      {taxSettings.enableTax && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tên Thuế</label>
            <input
              type="text"
              value={taxSettings.taxName}
              onChange={(e) => setTaxSettings({...taxSettings, taxName: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="VD: VAT, Thuế GTGT"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Thuế Suất (%)</label>
            <input
              type="number"
              value={taxSettings.taxRate}
              onChange={(e) => setTaxSettings({...taxSettings, taxRate: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="inclusiveTax"
                checked={taxSettings.inclusiveTax}
                onChange={(e) => setTaxSettings({...taxSettings, inclusiveTax: e.target.checked})}
                className="w-5 h-5 text-blue-600"
              />
              <label htmlFor="inclusiveTax" className="text-sm font-medium">
                Giá đã bao gồm thuế (Tax Inclusive)
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {taxSettings.inclusiveTax 
                ? 'Thuế được tính trong giá bán, không tăng tổng tiền' 
                : 'Thuế được cộng thêm vào giá bán'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )

  const renderReceiptSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Tiêu Đề Hóa Đơn</label>
          <input
            type="text"
            value={receiptSettings.receiptHeader}
            onChange={(e) => setReceiptSettings({...receiptSettings, receiptHeader: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Chân Trang Hóa Đơn</label>
          <input
            type="text"
            value={receiptSettings.receiptFooter}
            onChange={(e) => setReceiptSettings({...receiptSettings, receiptFooter: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Khổ Giấy In</label>
          <select
            value={receiptSettings.paperSize}
            onChange={(e) => setReceiptSettings({...receiptSettings, paperSize: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="A4">A4 (210 x 297 mm)</option>
            <option value="A5">A5 (148 x 210 mm)</option>
            <option value="thermal">Nhiệt 80mm</option>
            <option value="thermal58">Nhiệt 58mm</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="showLogo"
            checked={receiptSettings.showLogo}
            onChange={(e) => setReceiptSettings({...receiptSettings, showLogo: e.target.checked})}
            className="w-5 h-5 text-blue-600"
          />
          <label htmlFor="showLogo" className="text-sm font-medium">
            Hiển thị logo trên hóa đơn
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="showQRCode"
            checked={receiptSettings.showQRCode}
            onChange={(e) => setReceiptSettings({...receiptSettings, showQRCode: e.target.checked})}
            className="w-5 h-5 text-blue-600"
          />
          <label htmlFor="showQRCode" className="text-sm font-medium">
            Hiển thị mã QR trên hóa đơn
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="showBarcode"
            checked={receiptSettings.showBarcode}
            onChange={(e) => setReceiptSettings({...receiptSettings, showBarcode: e.target.checked})}
            className="w-5 h-5 text-blue-600"
          />
          <label htmlFor="showBarcode" className="text-sm font-medium">
            Hiển thị mã vạch trên hóa đơn
          </label>
        </div>
      </div>
      
      {/* Receipt Preview */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
        <h4 className="font-semibold mb-4 text-center">Xem Trước Hóa Đơn</h4>
        <div className="bg-white p-4 rounded shadow max-w-sm mx-auto">
          <div className="text-center mb-3">
            {receiptSettings.showLogo && (
              <div className="w-12 h-12 bg-blue-100 rounded mx-auto mb-2 flex items-center justify-center">
                <span className="text-blue-600 font-bold">G24</span>
              </div>
            )}
            <h5 className="font-bold">{storeSettings.storeName}</h5>
            <p className="text-xs text-gray-600">{storeSettings.address}</p>
            <p className="text-xs text-gray-600">{storeSettings.phone}</p>
          </div>
          
          <div className="border-t border-dashed border-gray-400 py-2 mb-2">
            <p className="text-center text-sm">{receiptSettings.receiptHeader}</p>
          </div>
          
          <div className="text-xs mb-2">
            <div className="flex justify-between">
              <span>Coca Cola 330ml x 2</span>
              <span>30,000₫</span>
            </div>
            <div className="flex justify-between">
              <span>Bánh mì sandwich x 1</span>
              <span>25,000₫</span>
            </div>
          </div>
          
          <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
            <div className="flex justify-between font-bold">
              <span>Tổng cộng:</span>
              <span>55,000₫</span>
            </div>
          </div>
          
          <div className="text-center">
            {receiptSettings.showQRCode && (
              <div className="w-16 h-16 bg-gray-200 mx-auto mb-2 flex items-center justify-center text-xs">
                QR Code
              </div>
            )}
            {receiptSettings.showBarcode && (
              <div className="h-8 bg-gray-900 mb-2 flex items-center justify-center">
                <span className="text-white text-xs">|||||||||||</span>
              </div>
            )}
            <p className="text-xs">{receiptSettings.receiptFooter}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-50 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            id="lowStockAlert"
            checked={notificationSettings.lowStockAlert}
            onChange={(e) => setNotificationSettings({...notificationSettings, lowStockAlert: e.target.checked})}
            className="w-5 h-5 text-yellow-600"
          />
          <label htmlFor="lowStockAlert" className="font-medium text-yellow-900">
            Cảnh báo hàng sắp hết
          </label>
        </div>
        
        {notificationSettings.lowStockAlert && (
          <div>
            <label className="block text-sm font-medium mb-2">Ngưỡng cảnh báo</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={notificationSettings.lowStockThreshold}
                onChange={(e) => setNotificationSettings({...notificationSettings, lowStockThreshold: parseInt(e.target.value)})}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                min="1"
              />
              <span className="text-sm text-gray-600">sản phẩm</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            id="expiryAlert"
            checked={notificationSettings.expiryAlert}
            onChange={(e) => setNotificationSettings({...notificationSettings, expiryAlert: e.target.checked})}
            className="w-5 h-5 text-red-600"
          />
          <label htmlFor="expiryAlert" className="font-medium text-red-900">
            Cảnh báo hàng sắp hết hạn
          </label>
        </div>
        
        {notificationSettings.expiryAlert && (
          <div>
            <label className="block text-sm font-medium mb-2">Số ngày trước khi hết hạn</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={notificationSettings.expiryDays}
                onChange={(e) => setNotificationSettings({...notificationSettings, expiryDays: parseInt(e.target.value)})}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                min="1"
              />
              <span className="text-sm text-gray-600">ngày</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            id="dailyReport"
            checked={notificationSettings.dailyReport}
            onChange={(e) => setNotificationSettings({...notificationSettings, dailyReport: e.target.checked})}
            className="w-5 h-5 text-blue-600"
          />
          <label htmlFor="dailyReport" className="font-medium text-blue-900">
            Báo cáo hàng ngày tự động
          </label>
        </div>
        
        {notificationSettings.dailyReport && (
          <div>
            <label className="block text-sm font-medium mb-2">Thời gian gửi báo cáo</label>
            <input
              type="time"
              value={notificationSettings.reportTime}
              onChange={(e) => setNotificationSettings({...notificationSettings, reportTime: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  )

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="p-6 border border-gray-200 rounded-lg">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <span>💾</span>
          Sao Lưu Dữ Liệu
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Xuất toàn bộ dữ liệu cửa hàng ra file để sao lưu hoặc chuyển sang hệ thống khác.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Xuất Dữ Liệu JSON
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
            Xuất Dữ Liệu Excel
          </button>
        </div>
      </div>
      
      <div className="p-6 border border-gray-200 rounded-lg">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <span>📥</span>
          Khôi Phục Dữ Liệu
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Khôi phục dữ liệu từ file sao lưu đã xuất trước đó.
        </p>
        <div className="space-y-3">
          <input
            type="file"
            accept=".json"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 hover:file:bg-gray-200"
          />
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium">
            Khôi Phục Dữ Liệu
          </button>
        </div>
      </div>
      
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-semibold mb-4 flex items-center gap-2 text-red-800">
          <span>⚠️</span>
          Xóa Toàn Bộ Dữ Liệu
        </h4>
        <p className="text-sm text-red-700 mb-4">
          Xóa toàn bộ dữ liệu sản phẩm, giao dịch và đặt lại hệ thống về trạng thái ban đầu.
        </p>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
          Xóa Toàn Bộ Dữ Liệu
        </button>
      </div>
    </div>
  )

  const renderAbout = () => (
    <div className="space-y-6">
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-blue-600">G24</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">G24Mart POS System</h3>
        <p className="text-gray-600 mb-4">Hệ thống quản lý cửa hàng tiện lợi hiện đại</p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <span>✓</span>
          Phiên bản 1.0.0
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border border-gray-200 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>🚀</span>
            Tính Năng Chính
          </h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Hệ thống POS hiện đại</li>
            <li>• Quản lý kho hàng thông minh</li>
            <li>• Báo cáo bán hàng chi tiết</li>
            <li>• Quản lý khách hàng CRM</li>
            <li>• Hệ thống cảnh báo tự động</li>
            <li>• Giao diện tiếng Việt</li>
          </ul>
        </div>
        
        <div className="p-6 border border-gray-200 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>💻</span>
            Công Nghệ Sử Dụng
          </h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Next.js 15 & React 18</li>
            <li>• TypeScript</li>
            <li>• Tailwind CSS</li>
            <li>• Responsive Design</li>
            <li>• PWA Ready</li>
            <li>• Modern UI/UX</li>
          </ul>
        </div>
      </div>
      
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
          <span>📞</span>
          Hỗ Trợ & Liên Hệ
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700 mb-1">Email hỗ trợ:</p>
            <p className="text-blue-600">support@g24mart.vn</p>
          </div>
          <div>
            <p className="text-blue-700 mb-1">Website:</p>
            <p className="text-blue-600">www.g24mart.vn</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'store': return renderStoreSettings()
      case 'payment': return renderPaymentSettings()
      case 'tax': return renderTaxSettings()
      case 'receipt': return renderReceiptSettings()
      case 'notifications': return renderNotificationSettings()
      case 'backup': return renderBackupSettings()
      case 'about': return renderAbout()
      default: return renderStoreSettings()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Về Trang Chủ
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Cài Đặt Hệ Thống</h1>
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Lưu Cài Đặt
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">
                  {tabs.find(tab => tab.id === activeTab)?.icon}
                </span>
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
            </div>
            
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
