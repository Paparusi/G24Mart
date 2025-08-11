'use client';

import { useState } from 'react';
import { Store, Settings, Users, Shield, HelpCircle, Globe, Phone, Mail } from 'lucide-react';

interface StoreSetup {
  storeName: string;
  storeType: string;
  address: string;
  phone: string;
  email: string;
  taxCode: string;
  currency: string;
  timezone: string;
  language: string;
}

const STORE_TYPES = [
  'Tạp hóa & Siêu thị',
  'Thời trang',
  'Điện thoại & Điện máy', 
  'Mỹ phẩm',
  'Nhà hàng - Café',
  'Vật liệu xây dựng',
  'Nông sản & Thực phẩm',
  'Nhà thuốc',
  'Cửa hàng sách',
  'Cửa hàng khác'
];

export default function StoreInitialization() {
  const [currentStep, setCurrentStep] = useState(1);
  const [storeData, setStoreData] = useState<StoreSetup>({
    storeName: '',
    storeType: '',
    address: '',
    phone: '',
    email: '',
    taxCode: '',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi'
  });

  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const handleInputChange = (field: keyof StoreSetup, value: string) => {
    setStoreData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeSetup = () => {
    // Save store configuration
    localStorage.setItem('g24mart_store_config', JSON.stringify(storeData));
    setIsSetupComplete(true);
    
    setTimeout(() => {
      window.location.href = '/pos';
    }, 3000);
  };

  if (isSetupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-12 text-center max-w-md">
          <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎉 Thiết lập hoàn tất!
          </h2>
          <p className="text-gray-600 mb-6">
            Cửa hàng "{storeData.storeName}" đã được khởi tạo thành công. Bạn sẽ được chuyển đến POS trong giây lát...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Store className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Khởi tạo cửa hàng G24Mart</h1>
            </div>
            <div className="text-sm text-gray-500">
              Bước {currentStep} / 4
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1">
                <div className={`h-1 ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cơ bản</h2>
                <p className="text-gray-600">Điền thông tin cơ bản về cửa hàng của bạn</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên cửa hàng *
                  </label>
                  <input
                    type="text"
                    value={storeData.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ví dụ: Cửa hàng tiện lợi ABC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại hình kinh doanh *
                  </label>
                  <select
                    value={storeData.storeType}
                    onChange={(e) => handleInputChange('storeType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn loại hình kinh doanh</option>
                    {STORE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ *
                  </label>
                  <textarea
                    value={storeData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thông tin liên hệ</h2>
                <p className="text-gray-600">Thông tin liên hệ sẽ hiển thị trên hóa đơn</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={storeData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={storeData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="shop@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã số thuế
                  </label>
                  <input
                    type="text"
                    value={storeData.taxCode}
                    onChange={(e) => handleInputChange('taxCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0123456789"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Chỉ cần thiết khi muốn xuất hóa đơn VAT
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: System Configuration */}
          {currentStep === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Cấu hình hệ thống</h2>
                <p className="text-gray-600">Thiết lập tùy chọn hệ thống cơ bản</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn vị tiền tệ
                  </label>
                  <select
                    value={storeData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="VND">Việt Nam Đồng (VND)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Múi giờ
                  </label>
                  <select
                    value={storeData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                    <option value="Asia/Bangkok">Thailand (GMT+7)</option>
                    <option value="Asia/Singapore">Singapore (GMT+8)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngôn ngữ
                  </label>
                  <select
                    value={storeData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận thông tin</h2>
                <p className="text-gray-600">Kiểm tra lại thông tin trước khi hoàn tất</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Tên cửa hàng:</span>
                    <p className="text-gray-900 font-medium">{storeData.storeName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Loại hình:</span>
                    <p className="text-gray-900">{storeData.storeType}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Số điện thoại:</span>
                    <p className="text-gray-900">{storeData.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-gray-900">{storeData.email || 'Không có'}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Địa chỉ:</span>
                  <p className="text-gray-900">{storeData.address}</p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  🚀 G24Mart vs KiotViet
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">✅ G24Mart</h4>
                    <ul className="space-y-1">
                      <li>• Khởi tạo nhanh chóng (dưới 2 phút)</li>
                      <li>• Không cần tài khoản</li>
                      <li>• Hoạt động offline</li>
                      <li>• Miễn phí vĩnh viễn</li>
                      <li>• Tùy chỉnh không giới hạn</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">❌ KiotViet</h4>
                    <ul className="space-y-1">
                      <li>• Quy trình phức tạp</li>
                      <li>• Cần đăng ký tài khoản</li>
                      <li>• Lỗi 503 thường xuyên</li>
                      <li>• Phí từ 8,000đ/ngày</li>
                      <li>• Bị hạn chế tính năng</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Quay lại
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && (!storeData.storeName || !storeData.storeType || !storeData.address)) ||
                  (currentStep === 2 && !storeData.phone)
                }
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Tiếp tục
              </button>
            ) : (
              <button
                onClick={completeSetup}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
              >
                Hoàn tất thiết lập
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
