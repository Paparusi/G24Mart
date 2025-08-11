# 🔍 HƯỚNG DẪN TÍCH HỢP MÃ VẠCH G24MART

## 📋 Tổng quan

G24Mart đã được tích hợp hệ thống tra cứu mã vạch tự động, giúp bạn thêm sản phẩm vào kho chỉ bằng cách quét mã vạch. Hệ thống sẽ tự động tra cứu thông tin sản phẩm từ các cơ sở dữ liệu quốc tế.

## 🌐 Nguồn dữ liệu mã vạch

### 1. **GS1 Vietnam** (Ưu tiên cao)
- **Website**: https://www.gs1vn.org/
- **Mô tả**: Cơ sở dữ liệu chính thức cho sản phẩm Việt Nam
- **Mã vạch**: Bắt đầu với 893 (mã quốc gia Việt Nam)
- **Liên hệ**: info@gs1vn.org

### 2. **Open Food Facts** (Miễn phí)
- **Website**: https://world.openfoodfacts.org/
- **Mô tả**: Cơ sở dữ liệu mở về thực phẩm toàn cầu
- **Ưu điểm**: Miễn phí, nhiều thông tin dinh dưỡng
- **Hỗ trợ**: Tiếng Việt có sẵn

### 3. **Barcode Lookup** (Trả phí)
- **Website**: https://www.barcodelookup.com/
- **Mô tả**: API tra cứu mã vạch chuyên nghiệp
- **Gói miễn phí**: 100 requests/ngày
- **Ưu điểm**: Độ chính xác cao, cập nhật nhanh

### 4. **UPC Database** (Trả phí)
- **Website**: https://upcdatabase.org/
- **Mô tả**: Cơ sở dữ liệu UPC/EAN lớn
- **Ưu điểm**: Hỗ trợ nhiều loại mã vạch

## 🚀 Cách sử dụng

### **Bước 1: Cấu hình API Keys**

1. Tạo file `.env.local` trong thư mục gốc:
```bash
cp .env.example .env.local
```

2. Cập nhật các API keys:
```env
NEXT_PUBLIC_BARCODE_LOOKUP_API_KEY=your_api_key_here
NEXT_PUBLIC_UPC_DATABASE_API_KEY=your_api_key_here
NEXT_PUBLIC_GS1_VIETNAM_API_KEY=your_api_key_here
```

### **Bước 2: Quét mã vạch trong Inventory**

1. Vào **Quản Lý Kho Hàng**
2. Nhấn nút **"Quét Mã Vạch"**
3. Sử dụng một trong các cách:
   - **Barcode Scanner**: Quét trực tiếp với máy quét
   - **Keyboard Input**: Nhập mã số trực tiếp
   - **Copy/Paste**: Dán mã vạch từ clipboard

### **Bước 3: Xử lý thông tin sản phẩm**

1. Hệ thống tự động tra cứu thông tin
2. Hiển thị dialog với:
   - Thông tin từ API (tên, thương hiệu, mô tả, hình ảnh)
   - Form nhập giá bán và giá vốn
   - Tùy chọn số lượng và danh mục

3. Nhấn **"Thêm vào kho"** để hoàn tất

## 🔧 Tính năng nâng cao

### **Performance Monitoring**
- Theo dõi thời gian tra cứu API
- Cache kết quả để tăng tốc độ
- Hiển thị nguồn dữ liệu

### **Error Handling**
- Tự động fallback giữa các API
- Tạo sản phẩm mặc định khi không tìm thấy
- Thông báo lỗi thân thiện

### **Data Enrichment**
- Thông tin dinh dưỡng (từ Open Food Facts)
- Hình ảnh sản phẩm
- Thông tin nhà sản xuất
- Xuất xứ sản phẩm

## 📊 Các loại mã vạch hỗ trợ

### **EAN-13** (13 chữ số)
- Mã vạch tiêu chuẩn quốc tế
- Ví dụ: `8934673001234`
- Hỗ trợ đầy đủ

### **EAN-8** (8 chữ số)
- Mã vạch ngắn cho sản phẩm nhỏ
- Ví dụ: `12345678`
- Hỗ trợ đầy đủ

### **UPC-A** (12 chữ số)
- Mã vạch Bắc Mỹ
- Ví dụ: `123456789012`
- Hỗ trợ đầy đủ

### **Code 128**
- Mã vạch tùy chỉnh
- Hỗ trợ cơ bản

## 🇻🇳 Đặc biệt cho Việt Nam

### **Mã vạch Việt Nam**
- Prefix: `893` (mã quốc gia)
- Ví dụ: `8934673001234`
- Tự động nhận diện và ưu tiên GS1 Vietnam

### **Sản phẩm địa phương**
- Tự động đặt xuất xứ là "Việt Nam"
- Hỗ trợ tiếng Việt trong tên sản phẩm
- Tích hợp với quy chuẩn TCVN

## 🔐 Bảo mật và Quyền riêng tư

### **API Keys**
- Sử dụng environment variables
- Không lưu trữ trong code
- Client-side encryption

### **Dữ liệu người dùng**
- Cache local để giảm API calls
- Không lưu trữ thông tin nhạy cảm
- Tuân thủ GDPR

## 🛠️ Troubleshooting

### **Lỗi "Không tìm thấy sản phẩm"**
- Kiểm tra mã vạch có đúng định dạng
- Thử nhập thủ công
- Sản phẩm có thể chưa được đăng ký

### **Lỗi API Key**
- Kiểm tra file `.env.local`
- Verify API keys từ providers
- Kiểm tra quota còn lại

### **Quét mã vạch không hoạt động**
- Đảm bảo scanner được cấu hình đúng
- Kiểm tra USB connection
- Thử sử dụng keyboard input

## 📈 Analytics và Reporting

### **Thống kê tra cứu**
```typescript
import { barcodeApiService } from '@/services/BarcodeApiService'

// Xem thống kê cache
const stats = barcodeApiService.getCacheStats()
console.log(`Cache size: ${stats.size}, Hit rate: ${stats.hitRate}%`)
```

### **Performance Metrics**
- Thời gian tra cứu trung bình
- Tỷ lệ thành công theo API
- Top sản phẩm được quét nhiều nhất

## 🚀 Roadmap

### **Version 2.0**
- [ ] Hỗ trợ QR Code
- [ ] Bulk barcode import
- [ ] Advanced product matching
- [ ] Inventory forecasting

### **Version 2.1**
- [ ] Mobile app integration
- [ ] Voice commands
- [ ] AR product preview
- [ ] Blockchain verification

## 📞 Hỗ trợ

### **Kỹ thuật**
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Email: support@g24mart.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)

### **Đăng ký API**
- **GS1 Vietnam**: info@gs1vn.org
- **Barcode Lookup**: support@barcodelookup.com
- **UPC Database**: support@upcdatabase.org

---

**Lưu ý**: Việc sử dụng API của bên thứ ba có thể phát sinh chi phí. Hãy kiểm tra pricing từ các providers và chọn gói phù hợp với nhu cầu của bạn.
