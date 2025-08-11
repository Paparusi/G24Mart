import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            G24Mart
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Hệ thống quản lý cửa hàng tiện lợi toàn diện - Giải pháp POS và quản lý kho hàng thông minh
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <Link href="/pos" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow group">
              <div className="text-3xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">Hệ Thống POS</h3>
              <p className="text-gray-600">Giao diện bán hàng nhanh và trực quan</p>
            </Link>
            
            <Link href="/inventory/advanced" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow group">
              <div className="text-3xl mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">Quản Lý Kho Nâng Cao</h3>
              <p className="text-gray-600">Enterprise inventory với analytics</p>
            </Link>
            
            <Link href="/analytics" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow group">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">Business Intelligence</h3>
              <p className="text-gray-600">Phân tích kinh doanh chuyên sâu</p>
            </Link>
            
            <Link href="/employees" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow group">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">Quản Lý Nhân Viên</h3>
              <p className="text-gray-600">HR system với performance tracking</p>
            </Link>
          </div>
          
          <div className="mt-12 space-y-4">
            <Link 
              href="/dashboard" 
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-block mr-4"
            >
              Bắt Đầu Sử Dụng
            </Link>
            <Link 
              href="/pos" 
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block"
            >
              Mở POS
            </Link>
          </div>
          
          <div className="mt-16 text-left max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Tính Năng Nổi Bật</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-600">🚀 Dễ Sử Dụng</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Giao diện đơn giản, thân thiện</li>
                  <li>• Hỗ trợ quét mã vạch</li>
                  <li>• Thao tác nhanh chóng</li>
                  <li>• Tương thích mọi thiết bị</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-600">📈 Quản Lý Thông Minh</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Cảnh báo hàng sắp hết</li>
                  <li>• Theo dõi hạn sử dụng</li>
                  <li>• Báo cáo doanh thu chi tiết</li>
                  <li>• Phân tích xu hướng bán hàng</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
