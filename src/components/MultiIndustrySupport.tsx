'use client';

import { useState } from 'react';
import { Store, Coffee, Scissors, Hotel, ShoppingCart, Car } from 'lucide-react';

interface IndustryConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  templates: string[];
}

const INDUSTRIES: IndustryConfig[] = [
  {
    id: 'retail',
    name: 'Bán lẻ tổng hợp',
    icon: <Store className="w-8 h-8" />,
    color: 'bg-blue-500',
    features: ['Quản lý kho', 'POS', 'Khuyến mãi', 'Đa kênh bán hàng'],
    templates: ['Siêu thị mini', 'Cửa hàng tiện lợi', 'Cửa hàng tạp hóa']
  },
  {
    id: 'fnb',
    name: 'Nhà hàng - Café',
    icon: <Coffee className="w-8 h-8" />,
    color: 'bg-orange-500',
    features: ['Quản lý bàn', 'Đặt món', 'Bếp thông minh', 'Giao hàng'],
    templates: ['Nhà hàng', 'Café', 'Fast food', 'Quán ăn']
  },
  {
    id: 'beauty',
    name: 'Làm đẹp - Spa',
    icon: <Scissors className="w-8 h-8" />,
    color: 'bg-pink-500',
    features: ['Đặt lịch', 'Quản lý dịch vụ', 'Chăm sóc khách hàng', 'Gói liệu trình'],
    templates: ['Salon tóc', 'Spa', 'Nail', 'Thẩm mỹ viện']
  },
  {
    id: 'hotel',
    name: 'Khách sạn - Du lịch',
    icon: <Hotel className="w-8 h-8" />,
    color: 'bg-purple-500',
    features: ['Đặt phòng', 'Check-in/out', 'Quản lý phòng', 'Dịch vụ'],
    templates: ['Khách sạn', 'Homestay', 'Resort', 'Motel']
  },
  {
    id: 'ecommerce',
    name: 'Thương mại điện tử',
    icon: <ShoppingCart className="w-8 h-8" />,
    color: 'bg-green-500',
    features: ['Website bán hàng', 'Tích hợp sàn TMDT', 'Livestream', 'Digital Marketing'],
    templates: ['Shop online', 'Dropshipping', 'B2B', 'Marketplace']
  },
  {
    id: 'automotive',
    name: 'Ô tô - Xe máy',
    icon: <Car className="w-8 h-8" />,
    color: 'bg-gray-500',
    features: ['Quản lý xe', 'Bảo dưỡng', 'Phụ tùng', 'Bảo hành'],
    templates: ['Đại lý xe', 'Garage', 'Cửa hàng phụ tùng', 'Rửa xe']
  }
];

export default function MultiIndustrySupport() {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryConfig | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const configureIndustry = (industry: IndustryConfig) => {
    setSelectedIndustry(industry);
    setIsConfiguring(true);
    
    // Simulate configuration process
    setTimeout(() => {
      setIsConfiguring(false);
      alert(`Đã cấu hình thành công cho ngành ${industry.name}! 🎉`);
    }, 2000);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🏢 Giải pháp đa ngành hàng
        </h2>
        <p className="text-gray-600">
          G24Mart hỗ trợ 20+ ngành hàng với tính năng chuyên biệt cho từng lĩnh vực
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INDUSTRIES.map((industry) => (
          <div
            key={industry.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => configureIndustry(industry)}
          >
            <div className={`${industry.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4 mx-auto`}>
              {industry.icon}
            </div>
            
            <h3 className="text-xl font-semibold text-center mb-3">
              {industry.name}
            </h3>
            
            <div className="space-y-2 mb-4">
              <h4 className="font-medium text-gray-700">Tính năng chính:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {industry.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Mẫu có sẵn:</h4>
              <div className="flex flex-wrap gap-1">
                {industry.templates.map((template, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                  >
                    {template}
                  </span>
                ))}
              </div>
            </div>
            
            <button className={`w-full mt-4 ${industry.color} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity`}>
              Cấu hình ngành này
            </button>
          </div>
        ))}
      </div>

      {isConfiguring && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Đang cấu hình...</h3>
              <p className="text-gray-600">
                Đang tùy chỉnh giao diện và tính năng cho ngành {selectedIndustry?.name}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">🚀 Vượt trội hơn KiotViet</h3>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="text-left">
              <h4 className="font-medium text-green-600 mb-2">✅ G24Mart</h4>
              <ul className="text-sm space-y-1">
                <li>• Không cần đăng nhập phức tạp</li>
                <li>• Hoạt động offline 100%</li>
                <li>• Không bị downtime</li>
                <li>• Miễn phí hoàn toàn</li>
                <li>• Tùy chỉnh không giới hạn</li>
              </ul>
            </div>
            <div className="text-left">
              <h4 className="font-medium text-red-600 mb-2">❌ KiotViet</h4>
              <ul className="text-sm space-y-1">
                <li>• Cần đăng nhập, có thể quên mật khẩu</li>
                <li>• Phụ thuộc internet</li>
                <li>• Hay bị lỗi 503 (như hiện tại)</li>
                <li>• Có phí dịch vụ hàng tháng</li>
                <li>• Hạn chế tùy chỉnh</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
