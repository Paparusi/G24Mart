'use client';

import { useState } from 'react';
import { Book, Search, Tag, Info, ArrowRight } from 'lucide-react';

interface WikiTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms: string[];
  examples?: string[];
}

const WIKI_CATEGORIES = [
  'POS & Bán hàng',
  'Kho hàng & Tồn kho',
  'Báo cáo & Phân tích',
  'Khách hàng',
  'Nhân viên',
  'Hệ thống',
  'Tài chính'
];

const WIKI_TERMS: WikiTerm[] = [
  {
    id: '1',
    term: 'POS (Point of Sale)',
    definition: 'Điểm bán hàng - hệ thống được sử dụng để thực hiện các giao dịch bán hàng, tính tiền và in hóa đơn cho khách hàng.',
    category: 'POS & Bán hàng',
    relatedTerms: ['Hóa đơn', 'Thanh toán', 'Máy quét mã vạch'],
    examples: [
      'Thu ngân sử dụng POS để tính tiền cho khách hàng',
      'Hệ thống POS tự động cập nhật tồn kho sau mỗi giao dịch'
    ]
  },
  {
    id: '2',
    term: 'SKU (Stock Keeping Unit)',
    definition: 'Đơn vị lưu kho - mã định danh duy nhất cho mỗi sản phẩm cụ thể, giúp theo dõi và quản lý hàng tồn kho.',
    category: 'Kho hàng & Tồn kho',
    relatedTerms: ['Mã vạch', 'Tồn kho', 'Sản phẩm'],
    examples: [
      'SKU: "TEA-GRN-500G" cho trà xanh 500g',
      'Mỗi size và màu sắc khác nhau sẽ có SKU riêng'
    ]
  },
  {
    id: '3',
    term: 'Hóa đơn',
    definition: 'Chứng từ kế toán ghi nhận giao dịch bán hàng, bao gồm thông tin sản phẩm, số lượng, giá bán và tổng tiền.',
    category: 'POS & Bán hàng',
    relatedTerms: ['POS', 'Thanh toán', 'Doanh thu'],
    examples: [
      'Hóa đơn bán hàng cho khách lẻ',
      'Hóa đơn VAT cho doanh nghiệp'
    ]
  },
  {
    id: '4',
    term: 'Tồn kho',
    definition: 'Số lượng hàng hóa hiện có trong kho tại một thời điểm nhất định, được cập nhật liên tục khi có giao dịch nhập/xuất.',
    category: 'Kho hàng & Tồn kho',
    relatedTerms: ['SKU', 'Nhập kho', 'Xuất kho'],
    examples: [
      'Tồn kho hiện tại: 150 chai nước ngọt',
      'Cảnh báo khi tồn kho dưới mức tối thiểu'
    ]
  },
  {
    id: '5',
    term: 'Báo cáo doanh thu',
    definition: 'Báo cáo tổng hợp doanh thu bán hàng theo ngày, tháng, quý hoặc năm, giúp đánh giá hiệu quả kinh doanh.',
    category: 'Báo cáo & Phân tích',
    relatedTerms: ['Doanh thu', 'Lợi nhuận', 'Thống kê'],
    examples: [
      'Báo cáo doanh thu tháng 8: 150.000.000đ',
      'So sánh doanh thu theo từng sản phẩm'
    ]
  },
  {
    id: '6',
    term: 'Khách hàng thân thiết',
    definition: 'Nhóm khách hàng được phân loại dựa trên tần suất mua hàng và giá trị giao dịch, thường được áp dụng chính sách ưu đãi.',
    category: 'Khách hàng',
    relatedTerms: ['Điểm tích lũy', 'Ưu đãi', 'CRM'],
    examples: [
      'Khách VIP được giảm 10% mọi đơn hàng',
      'Tích điểm 1% giá trị đơn hàng'
    ]
  },
  {
    id: '7',
    term: 'Ca làm việc',
    definition: 'Khoảng thời gian làm việc của một nhân viên cụ thể, giúp theo dõi giờ làm việc và doanh thu theo ca.',
    category: 'Nhân viên',
    relatedTerms: ['Nhân viên', 'Doanh thu theo ca', 'Chấm công'],
    examples: [
      'Ca sáng: 6:00 - 14:00',
      'Ca chiều: 14:00 - 22:00'
    ]
  },
  {
    id: '8',
    term: 'Backup dữ liệu',
    definition: 'Quá trình sao lưu dữ liệu hệ thống định kỳ để đảm bảo an toàn thông tin và có thể phục hồi khi cần thiết.',
    category: 'Hệ thống',
    relatedTerms: ['Sao lưu', 'Phục hồi', 'An toàn dữ liệu'],
    examples: [
      'Backup tự động hàng ngày lúc 2:00 sáng',
      'Lưu trữ backup trên cloud và ổ cứng ngoài'
    ]
  },
  {
    id: '9',
    term: 'Giá vốn',
    definition: 'Chi phí mua vào hoặc sản xuất ra sản phẩm, được sử dụng để tính toán lợi nhuận và định giá bán.',
    category: 'Tài chính',
    relatedTerms: ['Giá bán', 'Lợi nhuận', 'Tỷ suất lợi nhuận'],
    examples: [
      'Giá vốn: 15.000đ, giá bán: 20.000đ',
      'Lợi nhuận: 5.000đ (25%)'
    ]
  },
  {
    id: '10',
    term: 'Mã vạch',
    definition: 'Mã định danh sản phẩm dưới dạng các vạch đen trắng, có thể quét bằng máy quét để nhập thông tin sản phẩm nhanh chóng.',
    category: 'POS & Bán hàng',
    relatedTerms: ['SKU', 'Máy quét', 'Sản phẩm'],
    examples: [
      'Mã vạch 13 số theo chuẩn EAN-13',
      'Quét mã vạch để thêm sản phẩm vào đơn hàng'
    ]
  }
];

export default function WikiG24Mart() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState<WikiTerm | null>(null);

  const filteredTerms = WIKI_TERMS.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'POS & Bán hàng': 'bg-blue-100 text-blue-800',
      'Kho hàng & Tồn kho': 'bg-green-100 text-green-800',
      'Báo cáo & Phân tích': 'bg-purple-100 text-purple-800',
      'Khách hàng': 'bg-pink-100 text-pink-800',
      'Nhân viên': 'bg-orange-100 text-orange-800',
      'Hệ thống': 'bg-gray-100 text-gray-800',
      'Tài chính': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Book className="w-12 h-12 text-blue-600 mr-4" />
          <h2 className="text-4xl font-bold text-gray-800">Wiki G24Mart</h2>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Từ điển thuật ngữ toàn diện cho hệ thống quản lý bán hàng - Hiểu rõ mọi khái niệm để sử dụng hiệu quả nhất
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm thuật ngữ hoặc định nghĩa..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Tất cả danh mục</option>
          {WIKI_CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{WIKI_TERMS.length}</div>
          <div className="text-sm text-gray-600">Tổng thuật ngữ</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{WIKI_CATEGORIES.length}</div>
          <div className="text-sm text-gray-600">Danh mục</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{filteredTerms.length}</div>
          <div className="text-sm text-gray-600">Kết quả tìm kiếm</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">100%</div>
          <div className="text-sm text-gray-600">Miễn phí</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Terms List */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4">📚 Danh sách thuật ngữ</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredTerms.map((term) => (
              <div
                key={term.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTerm?.id === term.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedTerm(term)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">{term.term}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(term.category)}`}>
                    {term.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {term.definition}
                </p>
                <div className="flex items-center text-blue-600 text-sm">
                  Xem chi tiết <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Term Details */}
        <div className="lg:col-span-1">
          {selectedTerm ? (
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="flex items-center mb-4">
                <Info className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold">Chi tiết thuật ngữ</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedTerm.term}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedTerm.category)}`}>
                    {selectedTerm.category}
                  </span>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">📝 Định nghĩa:</h5>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedTerm.definition}
                  </p>
                </div>

                {selectedTerm.examples && selectedTerm.examples.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">💡 Ví dụ:</h5>
                    <ul className="space-y-2">
                      {selectedTerm.examples.map((example, index) => (
                        <li key={index} className="text-gray-600 text-sm flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">🔗 Thuật ngữ liên quan:</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedTerm.relatedTerms.map((relatedTerm, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white text-blue-600 border border-blue-200 rounded-full text-sm cursor-pointer hover:bg-blue-50"
                        onClick={() => {
                          const found = WIKI_TERMS.find(t => t.term === relatedTerm);
                          if (found) setSelectedTerm(found);
                        }}
                      >
                        {relatedTerm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-6 bg-gray-50 text-center">
              <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">
                Chọn thuật ngữ để xem chi tiết
              </h4>
              <p className="text-gray-500">
                Click vào bất kỳ thuật ngữ nào bên trái để xem định nghĩa và ví dụ chi tiết
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Categories */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">🏷️ Danh mục nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {WIKI_CATEGORIES.map((category) => {
            const termCount = WIKI_TERMS.filter(t => t.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-4 rounded-lg text-center border transition-all hover:shadow-md ${
                  selectedCategory === category
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Tag className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <div className="text-sm font-medium text-gray-800">{category}</div>
                <div className="text-xs text-gray-500">{termCount} thuật ngữ</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison */}
      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <h3 className="text-xl font-semibold text-center mb-4">🚀 Vượt trội hơn KiotViet Wiki</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-600 mb-2">✅ Wiki G24Mart</h4>
            <ul className="text-sm space-y-1">
              <li>• Truy cập tức thì, không cần đăng nhập</li>
              <li>• Tìm kiếm nhanh và chính xác</li>
              <li>• Giao diện thân thiện, dễ hiểu</li>
              <li>• Ví dụ thực tế và thuật ngữ liên quan</li>
              <li>• Hoạt động offline hoàn toàn</li>
              <li>• Cập nhật liên tục, miễn phí</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-600 mb-2">❌ KiotViet Wiki</h4>
            <ul className="text-sm space-y-1">
              <li>• Hiện tại lỗi 503, không truy cập được</li>
              <li>• Cần đăng nhập để xem</li>
              <li>• Tìm kiếm hạn chế</li>
              <li>• Thiếu ví dụ thực tế</li>
              <li>• Phụ thuộc internet</li>
              <li>• Nội dung ít, cập nhật chậm</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
