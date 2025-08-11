'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Users, TrendingUp, DollarSign, Target } from 'lucide-react';

interface SupplierProduct {
  id: string;
  name: string;
  supplier: string;
  price: number;
  wholesalePrice: number;
  category: string;
  stock: number;
  rating: number;
  location: string;
  minOrder: number;
}

const MOCK_PRODUCTS: SupplierProduct[] = [
  {
    id: '1',
    name: 'Nước ngọt Coca Cola 330ml',
    supplier: 'Công ty TNHH Coca Cola Việt Nam',
    price: 12000,
    wholesalePrice: 9500,
    category: 'Đồ uống',
    stock: 10000,
    rating: 4.8,
    location: 'TP.HCM',
    minOrder: 100
  },
  {
    id: '2',
    name: 'Mì tôm Hảo Hảo gói',
    supplier: 'Tập đoàn Acecook Việt Nam',
    price: 4500,
    wholesalePrice: 3200,
    category: 'Thực phẩm khô',
    stock: 50000,
    rating: 4.9,
    location: 'Hà Nội',
    minOrder: 200
  },
  {
    id: '3',
    name: 'Sữa tươi TH True Milk 1L',
    supplier: 'Công ty TH True Milk',
    price: 28000,
    wholesalePrice: 22000,
    category: 'Sữa & Sản phẩm sữa',
    stock: 5000,
    rating: 4.7,
    location: 'Nghệ An',
    minOrder: 50
  },
  {
    id: '4',
    name: 'Bánh quy Oreo 137g',
    supplier: 'Mondelez Kinh Đô',
    price: 18000,
    wholesalePrice: 14500,
    category: 'Bánh kẹo',
    stock: 8000,
    rating: 4.6,
    location: 'Đồng Nai',
    minOrder: 80
  }
];

export default function SupplierMarketplace() {
  const [products, setProducts] = useState<SupplierProduct[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [showOrderModal, setShowOrderModal] = useState(false);

  const categories = ['all', 'Đồ uống', 'Thực phẩm khô', 'Sữa & Sản phẩm sữa', 'Bánh kẹo'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (productId: string, quantity: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }));
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const getTotalValue = () => {
    return Object.entries(cart).reduce((sum, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return sum + (product?.wholesalePrice || 0) * quantity;
    }, 0);
  };

  const placeOrder = () => {
    alert(`Đặt hàng thành công! 
Tổng số sản phẩm: ${getTotalItems()}
Tổng giá trị: ${getTotalValue().toLocaleString('vi-VN')}đ

Nhà cung cấp sẽ liên hệ trong 24h để xác nhận đơn hàng.`);
    setCart({});
    setShowOrderModal(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🏪 Sàn kết nối nguồn hàng G24Connect
        </h2>
        <p className="text-gray-600">
          Kết nối với 1,000+ nhà cung cấp uy tín trên toàn quốc - Giá tốt nhất thị trường
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">40,000+</div>
          <div className="text-sm text-gray-600">Sản phẩm</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">1,000+</div>
          <div className="text-sm text-gray-600">Nhà cung cấp</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-600">95%</div>
          <div className="text-sm text-gray-600">Hài lòng</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">24h</div>
          <div className="text-sm text-gray-600">Giao hàng</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, nhà cung cấp..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'Tất cả danh mục' : category}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowOrderModal(true)}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Giỏ hàng ({getTotalItems()})
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
              {product.name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-2">
              {product.supplier}
            </p>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {product.category}
              </span>
              <span className="text-xs text-gray-500">
                ⭐ {product.rating}
              </span>
            </div>
            
            <div className="space-y-1 mb-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Giá lẻ:</span>
                <span className="text-sm line-through text-gray-400">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Giá sỉ:</span>
                <span className="text-lg font-bold text-green-600">
                  {product.wholesalePrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Tối thiểu: {product.minOrder} sản phẩm
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => addToCart(product.id, product.minOrder)}
                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                Thêm vào giỏ
              </button>
              <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-xl font-semibold mb-4">Giỏ hàng của bạn</h3>
            
            {Object.keys(cart).length === 0 ? (
              <p className="text-gray-500 text-center py-4">Giỏ hàng trống</p>
            ) : (
              <div className="space-y-3 mb-4">
                {Object.entries(cart).map(([productId, quantity]) => {
                  const product = products.find(p => p.id === productId);
                  if (!product) return null;
                  
                  return (
                    <div key={productId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.wholesalePrice.toLocaleString('vi-VN')}đ x {quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {(product.wholesalePrice * quantity).toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">
                      {getTotalValue().toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
              {Object.keys(cart).length > 0 && (
                <button
                  onClick={placeOrder}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Đặt hàng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison */}
      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <h3 className="text-xl font-semibold text-center mb-4">🚀 Vượt trội hơn KiotViet Connect</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-600 mb-2">✅ G24Connect</h4>
            <ul className="text-sm space-y-1">
              <li>• Truy cập ngay không cần đăng nhập</li>
              <li>• Hoạt động offline, không lo bị gián đoạn</li>
              <li>• Miễn phí hoàn toàn</li>
              <li>• Tích hợp sẵn trong hệ thống POS</li>
              <li>• Giao diện hiện đại, dễ sử dụng</li>
              <li>• Thanh toán linh hoạt</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-600 mb-2">❌ KiotViet Connect</h4>
            <ul className="text-sm space-y-1">
              <li>• Hiện tại lỗi 503, không truy cập được</li>
              <li>• Phụ thuộc internet và server</li>
              <li>• Có thể có phí giao dịch</li>
              <li>• Cần đăng nhập riêng</li>
              <li>• Giao diện phức tạp</li>
              <li>• Quy trình thanh toán dài</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
