'use client';

import { useState, useEffect } from 'react';
import { QrCode, CreditCard, Smartphone, DollarSign, TrendingUp, Users, Shield } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'qr' | 'card' | 'wallet' | 'bank';
  icon: React.ReactNode;
  fee: number;
  processingTime: string;
  dailyLimit: number;
  isEnabled: boolean;
}

interface LoanOption {
  id: string;
  partner: string;
  logo: string;
  interestRate: number;
  maxAmount: number;
  term: string;
  requirement: string;
  approvalTime: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'qr',
    name: 'QR Code Payment',
    type: 'qr',
    icon: <QrCode className="w-6 h-6" />,
    fee: 0,
    processingTime: 'Tức thì',
    dailyLimit: 50000000,
    isEnabled: true
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    type: 'wallet',
    icon: <Smartphone className="w-6 h-6" />,
    fee: 1.5,
    processingTime: '2-5 phút',
    dailyLimit: 100000000,
    isEnabled: true
  },
  {
    id: 'momo',
    name: 'MoMo',
    type: 'wallet',
    icon: <Smartphone className="w-6 h-6" />,
    fee: 2.0,
    processingTime: '2-5 phút',
    dailyLimit: 20000000,
    isEnabled: true
  },
  {
    id: 'banking',
    name: 'Internet Banking',
    type: 'bank',
    icon: <CreditCard className="w-6 h-6" />,
    fee: 0.5,
    processingTime: '5-15 phút',
    dailyLimit: 500000000,
    isEnabled: true
  }
];

const LOAN_OPTIONS: LoanOption[] = [
  {
    id: 'kbank',
    partner: 'Kasikornbank',
    logo: '🏦',
    interestRate: 12.5,
    maxAmount: 500000000,
    term: '6-36 tháng',
    requirement: 'Doanh thu ≥ 50tr/tháng',
    approvalTime: '24-48 giờ'
  },
  {
    id: 'easy_credit',
    partner: 'Easy Credit',
    logo: '💰',
    interestRate: 15.0,
    maxAmount: 200000000,
    term: '3-24 tháng',
    requirement: 'Hoạt động ≥ 3 tháng',
    approvalTime: '2-4 giờ'
  },
  {
    id: 'vib',
    partner: 'VIB Bank',
    logo: '🏛️',
    interestRate: 11.8,
    maxAmount: 1000000000,
    term: '12-60 tháng',
    requirement: 'Doanh thu ≥ 100tr/tháng',
    approvalTime: '3-5 ngày'
  }
];

export default function PaymentFinanceIntegration() {
  const [activeTab, setActiveTab] = useState<'payment' | 'loan'>('payment');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loanAmount, setLoanAmount] = useState(100000000);
  const [loanTerm, setLoanTerm] = useState(12);

  const calculateMonthlyPayment = (principal: number, rate: number, months: number) => {
    const monthlyRate = rate / 100 / 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  };

  const enablePaymentMethod = (methodId: string) => {
    alert(`Đã kích hoạt phương thức thanh toán: ${PAYMENT_METHODS.find(m => m.id === methodId)?.name}`);
  };

  const applyLoan = (loanId: string) => {
    const loan = LOAN_OPTIONS.find(l => l.id === loanId);
    if (loan) {
      const monthlyPayment = calculateMonthlyPayment(loanAmount, loan.interestRate, loanTerm);
      alert(`Đăng ký vay vốn thành công!
      
Đối tác: ${loan.partner}
Số tiền vay: ${loanAmount.toLocaleString('vi-VN')}đ
Lãi suất: ${loan.interestRate}%/năm
Kỳ hạn: ${loanTerm} tháng
Trả hàng tháng: ${monthlyPayment.toLocaleString('vi-VN')}đ

Chúng tôi sẽ liên hệ trong ${loan.approvalTime} để xác nhận.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          💳 G24Finance - Giải pháp Thanh toán & Vay vốn
        </h2>
        <p className="text-gray-600">
          Tích hợp thanh toán đa dạng và hỗ trợ vay vốn từ các đối tác tài chính uy tín
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'payment'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard className="w-5 h-5 inline mr-2" />
          Thanh toán
        </button>
        <button
          onClick={() => setActiveTab('loan')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'loan'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <DollarSign className="w-5 h-5 inline mr-2" />
          Vay vốn
        </button>
      </div>

      {/* Payment Methods Tab */}
      {activeTab === 'payment' && (
        <div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">98.5%</div>
              <div className="text-sm text-gray-600">Thành công</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">256-bit</div>
              <div className="text-sm text-gray-600">Mã hóa</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">50K+</div>
              <div className="text-sm text-gray-600">Merchant</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <QrCode className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-gray-600">Hỗ trợ</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  method.isEnabled
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{method.name}</h3>
                      <p className="text-sm text-gray-500">
                        Phí: {method.fee}% | {method.processingTime}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    method.isEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {method.isEnabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hạn mức ngày:</span>
                    <span className="font-medium">
                      {method.dailyLimit.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thời gian xử lý:</span>
                    <span className="font-medium">{method.processingTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => enablePaymentMethod(method.id)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    method.isEnabled
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  disabled={method.isEnabled}
                >
                  {method.isEnabled ? 'Đã kích hoạt' : 'Kích hoạt ngay'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loan Options Tab */}
      {activeTab === 'loan' && (
        <div>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">📊 Tính toán khoản vay</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền cần vay
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="10000000"
                  max="1000000000"
                  step="10000000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {loanAmount.toLocaleString('vi-VN')} đồng
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời hạn vay (tháng)
                </label>
                <input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="3"
                  max="60"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {LOAN_OPTIONS.map((loan) => {
              const monthlyPayment = calculateMonthlyPayment(loanAmount, loan.interestRate, loanTerm);
              const isEligible = loanAmount <= loan.maxAmount;

              return (
                <div
                  key={loan.id}
                  className={`border rounded-lg p-6 ${
                    isEligible ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{loan.logo}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {loan.partner}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Lãi suất: <span className="font-semibold text-blue-600">
                            {loan.interestRate}%/năm
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      isEligible 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isEligible ? 'Đủ điều kiện' : 'Vượt hạn mức'}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hạn mức tối đa:</span>
                        <span className="font-semibold">
                          {loan.maxAmount.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời hạn:</span>
                        <span className="font-semibold">{loan.term}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Điều kiện:</span>
                        <span className="font-semibold">{loan.requirement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian duyệt:</span>
                        <span className="font-semibold">{loan.approvalTime}</span>
                      </div>
                    </div>
                    
                    {isEligible && (
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Dự tính thanh toán:
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Số tiền vay:</span>
                            <span className="font-semibold">
                              {loanAmount.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <div className="flex justify-between text-lg">
                            <span className="text-gray-800 font-medium">Trả hàng tháng:</span>
                            <span className="font-bold text-blue-600">
                              {monthlyPayment.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tổng phải trả:</span>
                            <span className="font-semibold text-red-600">
                              {(monthlyPayment * loanTerm).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => applyLoan(loan.id)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isEligible
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                    disabled={!isEligible}
                  >
                    {isEligible ? 'Đăng ký vay ngay' : 'Không đủ điều kiện'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <h3 className="text-xl font-semibold text-center mb-4">
          🚀 Vượt trội hơn KiotViet Finance
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-600 mb-2">✅ G24Finance</h4>
            <ul className="text-sm space-y-1">
              <li>• Truy cập ngay, không cần đăng nhập</li>
              <li>• Tích hợp sẵn trong hệ thống POS</li>
              <li>• Tính toán khoản vay realtime</li>
              <li>• Giao diện thân thiện, dễ hiểu</li>
              <li>• Hoạt động offline, không lo gián đoạn</li>
              <li>• Miễn phí sử dụng</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-600 mb-2">❌ KiotViet Finance</h4>
            <ul className="text-sm space-y-1">
              <li>• Hiện tại lỗi 503, không truy cập được</li>
              <li>• Cần đăng nhập riêng biệt</li>
              <li>• Quy trình phức tạp</li>
              <li>• Phụ thuộc internet và server</li>
              <li>• Có thể có phí dịch vụ</li>
              <li>• Giao diện lỗi thời</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
