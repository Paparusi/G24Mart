import MultiIndustrySupport from '@/components/MultiIndustrySupport';
import SupplierMarketplace from '@/components/SupplierMarketplace';
import PaymentFinanceIntegration from '@/components/PaymentFinanceIntegration';
import { Store, TrendingUp, Shield, Award } from 'lucide-react';

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Store className="w-16 h-16 mr-4" />
              <h1 className="text-5xl font-bold">G24Mart Enterprise</h1>
            </div>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Giải pháp quản lý bán hàng toàn diện - Vượt trội hơn KiotViet với công nghệ hiện đại
            </p>
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold">300K+</div>
                <div className="text-blue-200">Người dùng tin tưởng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-blue-200">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-blue-200">Hoạt động</div>
              </div>
            </div>
            
            {/* Comparison Banner */}
            <div className="bg-white bg-opacity-10 rounded-lg p-6 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">🚨 KiotViet hiện tại: LỖI 503 - Hệ thống quá tải!</h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-green-300 mb-2">✅ G24Mart - Luôn sẵn sàng</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Hoạt động offline 100%</li>
                    <li>• Không bị downtime</li>
                    <li>• Truy cập ngay lập tức</li>
                    <li>• Miễn phí hoàn toàn</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-300 mb-2">❌ KiotViet - Không ổn định</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Lỗi 503 server quá tải</li>
                    <li>• Phụ thuộc internet</li>
                    <li>• Cần đăng nhập phức tạp</li>
                    <li>• Có phí dịch vụ</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Tính năng vượt trội so với KiotViet
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            G24Mart mang đến trải nghiệm hoàn toàn mới với công nghệ tiên tiến và độ tin cậy cao
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Hiệu Suất Vượt Trội</h3>
            <p className="text-gray-600">
              Next.js 15 + React 18 mang lại trải nghiệm nhanh gấp 3 lần so với KiotViet
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Bảo Mật Tối Đa</h3>
            <p className="text-gray-600">
              Dữ liệu được lưu trữ local, không lo bị hack hay mất mát như cloud-based
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Tùy Chỉnh Linh Hoạt</h3>
            <p className="text-gray-600">
              Open source, có thể tùy chỉnh hoàn toàn theo nhu cầu, không bị giới hạn
            </p>
          </div>
        </div>

        {/* Multi-Industry Support */}
        <div className="mb-16">
          <MultiIndustrySupport />
        </div>

        {/* Supplier Marketplace */}
        <div className="mb-16">
          <SupplierMarketplace />
        </div>

        {/* Payment & Finance Integration */}
        <div className="mb-16">
          <PaymentFinanceIntegration />
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Sẵn sàng thay thế KiotViet?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Trong khi KiotViet gặp sự cố, G24Mart luôn sẵn sàng phục vụ bạn 24/7
          </p>
          <div className="space-x-4">
            <a
              href="/pos"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Bắt Đầu Ngay
            </a>
            <a
              href="https://github.com/Paparusi/G24Mart"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-block"
            >
              Xem Source Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
