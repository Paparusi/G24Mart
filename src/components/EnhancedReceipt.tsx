'use client'

import React, { forwardRef, useRef } from 'react'
import { useStore } from '@/store/useStore'

interface ReceiptItem {
  id: string
  name: string
  price: number
  quantity: number
  total: number
  barcode?: string
}

interface EnhancedReceiptProps {
  orderNumber: string
  items: ReceiptItem[]
  subtotal: number
  tax?: number
  discount: number
  total: number
  paymentMethod: string
  received?: number
  change?: number
  customer?: string
  phone?: string
  date: string
  time?: string
  cashier: string
  onPrint?: () => void
  printMode?: boolean
}

const EnhancedReceipt = forwardRef<HTMLDivElement, EnhancedReceiptProps>(({
  orderNumber,
  items,
  subtotal,
  tax = 0,
  discount,
  total,
  paymentMethod,
  received,
  change,
  customer,
  phone,
  date,
  time,
  cashier,
  onPrint,
  printMode = false
}, ref) => {
  const { storeSettings } = useStore()
  const printRef = useRef<HTMLDivElement>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount)
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      const printContent = printRef.current?.innerHTML
      if (printContent) {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Hóa đơn - ${orderNumber}</title>
              <meta charset="utf-8">
              <style>
                @media print {
                  @page { 
                    size: 80mm auto; 
                    margin: 0; 
                  }
                  body {
                    margin: 0;
                    padding: 8px;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.3;
                  }
                }
                body {
                  margin: 0;
                  padding: 8px;
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.3;
                  width: 80mm;
                  max-width: 80mm;
                }
                .receipt-container {
                  width: 100%;
                  max-width: 300px;
                  margin: 0 auto;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .border-t { border-top: 1px dashed #000; }
                .border-b { border-bottom: 1px dashed #000; }
                .mt-2 { margin-top: 8px; }
                .mb-2 { margin-bottom: 8px; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .w-full { width: 100%; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 2px 0; vertical-align: top; }
                .item-name { width: 60%; }
                .item-qty { width: 15%; text-align: center; }
                .item-price { width: 25%; text-align: right; }
                .no-print { display: none !important; }
                .qr-code {
                  width: 60px;
                  height: 60px;
                  margin: 8px auto;
                  background: #f0f0f0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 8px;
                  border: 1px solid #ccc;
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${printContent}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  }
                }
              </script>
            </body>
            </html>
          `)
          printWindow.document.close()
        }
      }
    }
    onPrint?.()
  }

  return (
    <div className={`bg-white ${!printMode ? 'p-6 rounded-lg shadow-lg' : ''} max-w-sm mx-auto`}>
      <div ref={printMode ? ref : printRef} className="receipt-content">
        {/* Store Header */}
        <div className="text-center mb-4 border-b border-dashed border-gray-400 pb-4">
          <h1 className="text-lg font-bold">{storeSettings.storeName}</h1>
          <p className="text-sm">{storeSettings.address}</p>
          <p className="text-sm">
            ĐT: {storeSettings.phone} | Email: {storeSettings.email}
          </p>
          <p className="text-sm">MST: {storeSettings.taxNumber}</p>
        </div>

        {/* Receipt Title */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">HÓA ĐƠN BÁN HÀNG</h2>
          <p className="text-sm">Số: {orderNumber}</p>
        </div>

        {/* Receipt Info */}
        <div className="mb-4 text-sm border-b border-dashed border-gray-400 pb-4">
          <div className="flex justify-between">
            <span>Ngày:</span>
            <span>{new Date(date).toLocaleDateString('vi-VN')} {time || ''}</span>
          </div>
          <div className="flex justify-between">
            <span>Thu ngân:</span>
            <span>{cashier}</span>
          </div>
          {customer && (
            <div className="flex justify-between">
              <span>Khách hàng:</span>
              <span>{customer}</span>
            </div>
          )}
          {phone && (
            <div className="flex justify-between">
              <span>SĐT:</span>
              <span>{phone}</span>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dashed">
                <td className="font-bold">Sản phẩm</td>
                <td className="font-bold text-center">SL</td>
                <td className="font-bold text-right">Thành tiền</td>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  <tr>
                    <td className="item-name">
                      {item.name}
                      {item.barcode && (
                        <div className="text-xs text-gray-600">
                          ({item.barcode})
                        </div>
                      )}
                    </td>
                    <td className="item-qty">{item.quantity}</td>
                    <td className="item-price">{formatCurrency(item.total)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="text-xs text-gray-600">
                      {formatCurrency(item.price)} x {item.quantity}
                    </td>
                    <td></td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-dashed border-gray-400 pt-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Tạm tính:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Thuế VAT ({storeSettings.taxRate}%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          
          {discount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Giảm giá:</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-base font-bold border-t border-dashed border-gray-400 pt-2 mt-2">
            <span>TỔNG CỘNG:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="border-t border-dashed border-gray-400 pt-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span>Thanh toán:</span>
            <span>{paymentMethod}</span>
          </div>
          
          {paymentMethod === 'Tiền Mặt' && received && (
            <>
              <div className="flex justify-between">
                <span>Tiền nhận:</span>
                <span>{formatCurrency(received)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tiền thừa:</span>
                <span>{formatCurrency(change || 0)}</span>
              </div>
            </>
          )}
        </div>

        {/* QR Code Placeholder */}
        <div className="text-center mb-4">
          <div className="qr-code mx-auto">
            <div className="text-center">
              <div className="text-xs">QR Code</div>
              <div className="text-xs">Review</div>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            Quét mã để đánh giá dịch vụ
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs border-t border-dashed border-gray-400 pt-4">
          <p className="mb-1">★★★ CẢM ƠN QUÝ KHÁCH ★★★</p>
          <p className="mb-1">Hẹn gặp lại!</p>
          <p className="text-gray-600">
            Hotline: {storeSettings.phone}
          </p>
          <p className="text-gray-600 mt-2">
            In lúc: {new Date().toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Print Actions */}
      {!printMode && (
        <div className="mt-6 flex space-x-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
          >
            🖨️ In Hóa Đơn
          </button>
          <button
            onClick={() => {
              // Share or email functionality
              if (navigator.share) {
                navigator.share({
                  title: `Hóa đơn ${orderNumber}`,
                  text: `Hóa đơn từ ${storeSettings.storeName}\nTổng: ${formatCurrency(total)}`,
                })
              }
            }}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
          >
            📱 Chia Sẻ
          </button>
        </div>
      )}
    </div>
  )
})

EnhancedReceipt.displayName = 'EnhancedReceipt'

export default EnhancedReceipt
