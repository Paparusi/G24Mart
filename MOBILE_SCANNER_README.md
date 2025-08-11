# 📱 Mobile Barcode Scanner - G24Mart

## Tính năng mới: Quét mã vạch bằng camera điện thoại

Hệ thống G24Mart đã được nâng cấp với tính năng quét mã vạch bằng camera điện thoại, giúp việc quản lý kho hàng trở nên dễ dàng và tiện lợi hơn.

## 🚀 Cách sử dụng

### 1. Truy cập từ Dashboard
- Mở **Dashboard** → Click vào **"📱 Mobile Scanner"**
- Hoặc truy cập trực tiếp: `/inventory/test`

### 2. Quét mã vạch trên điện thoại
1. **Nhấn nút "📱 Quét Bằng Camera"** (nút màu xanh lớn trên mobile)
2. **Cho phép truy cập camera** khi trình duyệt hỏi
3. **Đặt mã vạch trong khung đỏ** trên màn hình
4. **Camera sẽ tự động phát hiện** và quét mã vạch
5. **Kết quả hiển thị ngay** với thông tin sản phẩm

### 3. Các tính năng hỗ trợ
- **🔄 Chuyển đổi camera**: Có thể chuyển giữa camera trước/sau
- **✏️ Nhập thủ công**: Nếu không thể quét được
- **⌨️ Quét bàn phím**: Cho máy tính/laptop (không dùng camera)
- **🔊 Phản hồi âm thanh**: Tiếng beep khi quét thành công
- **📳 Rung**: Điện thoại sẽ rung khi phát hiện mã vạch

## 📋 Quy trình xử lý

1. **Quét mã vạch** → Camera phát hiện tự động
2. **Tra cứu API** → Tìm thông tin sản phẩm từ nhiều nguồn:
   - GS1 Vietnam (mã vạch Việt Nam)
   - OpenFoodFacts (sản phẩm thực phẩm)
   - BarcodeLookup (cơ sở dữ liệu quốc tế)
   - UPCDatabase (mã vạch UPC/EAN)
3. **Kiểm tra tồn kho** → Xem sản phẩm đã có trong kho chưa
4. **Thêm mới** → Nếu chưa có, cho phép thêm vào kho

## 💡 Mẹo sử dụng hiệu quả

### Để quét chính xác:
- ✅ **Ánh sáng đủ**: Sử dụng ở nơi có ánh sáng tốt
- ✅ **Mã vạch rõ nét**: Không bị mờ, nhăn, rách
- ✅ **Đặt đúng khung**: Mã vạch nằm trong khung đỏ
- ✅ **Giữ ổn định**: Không rung lắc khi quét

### Xử lý khi gặp lỗi:
- ❌ **"Camera không được hỗ trợ"**: Trình duyệt không hỗ trợ camera
- ❌ **"Vui lòng cho phép truy cập camera"**: Click "Allow" khi trình duyệt hỏi
- ❌ **"Không tìm thấy camera"**: Thiết bị không có camera
- ❌ **Không quét được**: Thử chuyển camera hoặc nhập thủ công

## 🔧 Hỗ trợ kỹ thuật

### Trình duyệt hỗ trợ:
- ✅ **Chrome Mobile** (Android/iOS)
- ✅ **Safari Mobile** (iOS)
- ✅ **Firefox Mobile** 
- ✅ **Edge Mobile**
- ⚠️ **Desktop browsers**: Có camera webcam

### Tính năng nâng cao:
- **📊 Thống kê quét**: Theo dõi số lần quét, thời gian xử lý
- **🔍 Multi-API**: Tự động thử nhiều nguồn dữ liệu
- **⚡ Performance Monitor**: Đo đạc hiệu suất quét
- **📱 Mobile Optimized**: Giao diện tối ưu cho điện thoại

## 🚨 Lưu ý quan trọng

1. **Quyền riêng tư**: Hệ thống chỉ sử dụng camera để quét, không lưu trữ hình ảnh
2. **Kết nối mạng**: Cần internet để tra cứu thông tin sản phẩm
3. **HTTPS**: Tính năng camera chỉ hoạt động trên HTTPS (an toàn)
4. **Pin**: Sử dụng camera có thể tiêu tốn pin điện thoại

## 📞 Hỗ trợ

Nếu gặp vấn đề khi sử dụng tính năng này, vui lòng:
1. Kiểm tra các mẹo sử dụng ở trên
2. Thử refresh (F5) trang web
3. Kiểm tra kết nối mạng
4. Thử trình duyệt khác
5. Liên hệ admin nếu vẫn gặp lỗi

---
**Phiên bản**: 1.0  
**Cập nhật**: Tháng 1/2025  
**Tương thích**: Mobile browsers với camera support
