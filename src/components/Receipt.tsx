'use client'
import React from 'react'

interface ReceiptItem {
  id: string
  name: string
  price: number
  quantity: number
  total: number
}

interface ReceiptProps {
  orderNumber: string
  items: ReceiptItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  received?: number
  change?: number
  customer: string
  phone?: string
  date: string
  cashier: string
}

const Receipt: React.FC<ReceiptProps> = ({
  orderNumber,
  items,
  subtotal,
  discount,
  total,
  paymentMethod,
  received,
  change,
  customer,
  phone,
  date,
  cashier
}) => {
  const paymentMethodNames: Record<string, string> = {
    cash: 'Tiền mặt',
    card: 'Thẻ ATM/Credit',
    transfer: 'Chuyển khoản',
    momo: 'MoMo',
    zalopay: 'ZaloPay',
    vnpay: 'VNPay'
  }

  const printReceipt = () => {
    const printContent = document.getElementById('receipt-content')?.innerHTML
    if (printContent) {
      const newWindow = window.open('', '_blank')
      newWindow?.document.write(`
        <html>
          <head>
            <title>Hóa đơn ${orderNumber}</title>
            <style>
              body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 20px; }
              .receipt { width: 300px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
              .item-line { display: flex; justify-content: space-between; margin: 5px 0; }
              .total-line { border-top: 1px solid #000; padding-top: 5px; margin-top: 10px; font-weight: bold; }
              .footer { border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="receipt">
              ${printContent}
            </div>
            <script>
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            </script>
          </body>
        </html>
      `)
      newWindow?.document.close()
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
      <div id="receipt-content">
        <div className="text-center border-b border-gray-300 pb-4 mb-4">
          <h2 className="text-xl font-bold">G24MART</h2>
          <p className="text-sm text-gray-600">Cửa hàng tiện lợi 24/7</p>
          <p className="text-xs text-gray-500">123 Đường ABC, Quận XYZ</p>
          <p className="text-xs text-gray-500">Tel: 0123.456.789</p>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm">
            <span>Đơn hàng:</span>
            <span className="font-mono">{orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Ngày giờ:</span>
            <span>{date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Thu ngân:</span>
            <span>{cashier}</span>
          </div>
          {customer && customer !== 'Khách lẻ' && (
            <div className="flex justify-between text-sm">
              <span>Khách hàng:</span>
              <span>{customer}</span>
            </div>
          )}
          {phone && (
            <div className="flex justify-between text-sm">
              <span>Điện thoại:</span>
              <span>{phone}</span>
            </div>
          )}
        </div>

        <div className="border-b border-gray-300 pb-4 mb-4">
          {items.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex-1">{item.name}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{item.quantity} × {item.price.toLocaleString('vi-VN')}₫</span>
                <span>{item.total.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Tạm tính:</span>
            <span>{subtotal.toLocaleString('vi-VN')}₫</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Giảm giá:</span>
              <span>-{discount.toLocaleString('vi-VN')}₫</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t border-gray-300 pt-2">
            <span>Tổng cộng:</span>
            <span>{total.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Thanh toán:</span>
            <span>{paymentMethodNames[paymentMethod] || paymentMethod}</span>
          </div>
          {paymentMethod === 'cash' && received && (
            <>
              <div className="flex justify-between text-sm">
                <span>Tiền nhận:</span>
                <span>{received.toLocaleString('vi-VN')}₫</span>
              </div>
              {change && change > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tiền thừa:</span>
                  <span>{change.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="text-center border-t border-gray-300 pt-4 text-xs text-gray-500">
          <p>Cảm ơn quý khách đã mua hàng!</p>
          <p>Hẹn gặp lại quý khách!</p>
          <p>---***---</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={printReceipt}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm"
        >
          🖨️ In hóa đơn
        </button>
      </div>
    </div>
  )
}

export default Receipt
