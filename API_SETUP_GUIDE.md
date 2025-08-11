# 🛡️ G24MART API CONFIGURATION GUIDE

## 🔑 Required API Keys

### 1. **Barcode Lookup API**

**Đăng ký tại**: https://www.barcodelookup.com/api

**Các bước**:
1. Tạo tài khoản tại website
2. Verify email
3. Vào Dashboard → API Keys
4. Copy API key vào `.env.local`

**Gói miễn phí**: 100 requests/ngày
**Gói trả phí**: Từ $9.99/tháng (5,000 requests)

### 2. **UPC Database API**

**Đăng ký tại**: https://upcdatabase.org/api

**Các bước**:
1. Tạo tài khoản
2. Purchase credits hoặc subscription
3. Get API key từ dashboard
4. Configure trong `.env.local`

**Pricing**: $0.005/request hoặc $29/tháng (unlimited)

### 3. **GS1 Vietnam API**

**Liên hệ**: info@gs1vn.org
**Website**: https://www.gs1vn.org/

**Thông tin cần thiết**:
- Giấy phép kinh doanh
- Đăng ký doanh nghiệp
- Phí thành viên GS1

**Lưu ý**: Cần là thành viên GS1 Vietnam để sử dụng API

### 4. **Open Food Facts** (Miễn phí)

**Website**: https://world.openfoodfacts.org/

**Không cần API key** - Hoàn toàn miễn phí!

Chỉ cần set user agent trong request headers.

## 📁 File cấu hình

### `.env.local` (Tạo mới)
```env
# ===========================================
# G24MART BARCODE API CONFIGURATION
# ===========================================

# Barcode Lookup (Required for best results)
NEXT_PUBLIC_BARCODE_LOOKUP_API_KEY=your_barcode_lookup_api_key_here

# UPC Database (Optional - fallback)
NEXT_PUBLIC_UPC_DATABASE_API_KEY=your_upc_database_api_key_here

# GS1 Vietnam (Optional - for Vietnamese products)
NEXT_PUBLIC_GS1_VIETNAM_API_KEY=your_gs1_vietnam_api_key_here

# ===========================================
# ADVANCED CONFIGURATION (Optional)
# ===========================================

# Cache duration in milliseconds (default: 1 hour)
NEXT_PUBLIC_BARCODE_CACHE_DURATION=3600000

# Maximum concurrent API requests (default: 3)
NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS=3

# Enable debug logging (default: false)
NEXT_PUBLIC_BARCODE_DEBUG=true

# ===========================================
# PERFORMANCE TUNING (Optional)
# ===========================================

# API timeout in milliseconds (default: 5000)
NEXT_PUBLIC_API_TIMEOUT=5000

# Retry attempts (default: 2)
NEXT_PUBLIC_API_RETRY_ATTEMPTS=2

# Rate limiting per minute (default: 100)
NEXT_PUBLIC_RATE_LIMIT_PER_MINUTE=100
```

### `.env.example` (Reference)
```env
# Copy this file to .env.local and fill in your API keys

# ===========================================
# REQUIRED FOR BARCODE INTEGRATION
# ===========================================

NEXT_PUBLIC_BARCODE_LOOKUP_API_KEY=
NEXT_PUBLIC_UPC_DATABASE_API_KEY=
NEXT_PUBLIC_GS1_VIETNAM_API_KEY=

# ===========================================
# OPTIONAL CONFIGURATION
# ===========================================

NEXT_PUBLIC_BARCODE_CACHE_DURATION=3600000
NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS=3
NEXT_PUBLIC_BARCODE_DEBUG=false
NEXT_PUBLIC_API_TIMEOUT=5000
NEXT_PUBLIC_API_RETRY_ATTEMPTS=2
NEXT_PUBLIC_RATE_LIMIT_PER_MINUTE=100
```

## 🚀 Quick Setup

### **Bước 1**: Copy environment file
```bash
# Windows PowerShell
cp .env.example .env.local

# Command Prompt
copy .env.example .env.local
```

### **Bước 2**: Chỉnh sửa `.env.local`
```bash
# Sử dụng editor bạn muốn
notepad .env.local
# hoặc
code .env.local
```

### **Bước 3**: Khởi động lại ứng dụng
```bash
npm run dev
# hoặc
yarn dev
```

## 🧪 Testing API Keys

### **Test Script** (tạo file `test-barcode-api.js`)
```javascript
// test-barcode-api.js
const testBarcodeApi = async () => {
  const testBarcode = '8901030837511'; // Maggi noodles
  
  console.log('🔍 Testing Barcode APIs...');
  console.log('Barcode:', testBarcode);
  
  // Test Barcode Lookup
  try {
    const response = await fetch(`https://api.barcodelookup.com/v3/products?barcode=${testBarcode}&formatted=y&key=${process.env.NEXT_PUBLIC_BARCODE_LOOKUP_API_KEY}`);
    const data = await response.json();
    console.log('✅ Barcode Lookup API:', data.products?.[0]?.title || 'No product found');
  } catch (error) {
    console.log('❌ Barcode Lookup API:', error.message);
  }
  
  // Test Open Food Facts
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${testBarcode}.json`);
    const data = await response.json();
    console.log('✅ Open Food Facts:', data.product?.product_name || 'No product found');
  } catch (error) {
    console.log('❌ Open Food Facts:', error.message);
  }
};

testBarcodeApi();
```

Chạy test:
```bash
node test-barcode-api.js
```

## 🏢 Production Setup

### **Environment Variables cho Production**

**Vercel**:
```bash
vercel env add NEXT_PUBLIC_BARCODE_LOOKUP_API_KEY
vercel env add NEXT_PUBLIC_UPC_DATABASE_API_KEY
vercel env add NEXT_PUBLIC_GS1_VIETNAM_API_KEY
```

**Railway**:
1. Vào dashboard
2. Environment → Add Variable
3. Thêm từng API key

**Netlify**:
1. Site settings → Build & deploy
2. Environment variables
3. Add variables

## 🔍 API Limits và Monitoring

### **Rate Limits**
| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Barcode Lookup | 100/day | 5,000-50,000/month |
| UPC Database | None | Custom pricing |
| Open Food Facts | Unlimited | Unlimited |
| GS1 Vietnam | Custom | Custom |

### **Monitoring Usage**
```javascript
// Thêm vào component
import { barcodeApiService } from '@/services/BarcodeApiService'

const checkApiUsage = () => {
  const stats = barcodeApiService.getUsageStats()
  console.log('API Usage:', {
    totalRequests: stats.total,
    successfulRequests: stats.successful,
    failedRequests: stats.failed,
    cacheHitRate: stats.cacheHitRate
  })
}
```

## ⚠️ Security Best Practices

### **API Key Security**
1. ❌ **KHÔNG** commit `.env.local` vào Git
2. ✅ Sử dụng environment variables
3. ✅ Rotate keys định kỳ
4. ✅ Monitor usage patterns

### **GitIgnore Configuration**
Đảm bảo `.gitignore` có:
```gitignore
# Environment variables
.env.local
.env.production
.env.development
.env

# API keys and secrets
*.key
secrets/
```

## 🆘 Troubleshooting

### **"API key not found" Error**
```bash
# Kiểm tra file .env.local có tồn tại
ls -la .env.local

# Kiểm tra nội dung
cat .env.local

# Restart development server
npm run dev
```

### **"Rate limit exceeded" Error**
1. Kiểm tra usage dashboard của provider
2. Upgrade plan nếu cần
3. Implement caching để giảm requests
4. Sử dụng multiple API keys (round-robin)

### **CORS Errors**
- API calls từ client-side có thể bị CORS
- Consider sử dụng API routes (`/pages/api/` hoặc `/app/api/`)
- Hoặc proxy requests qua server

## 📞 Support

### **Technical Issues**
- GitHub Issues: Create ticket với logs
- Email: support@g24mart.com
- Discord: [Community Server](https://discord.gg/g24mart)

### **API Provider Support**
- **Barcode Lookup**: support@barcodelookup.com
- **UPC Database**: support@upcdatabase.org
- **GS1 Vietnam**: info@gs1vn.org
- **Open Food Facts**: slack.openfoodfacts.org

---

**Lưu ý**: Hãy đọc Terms of Service của từng API provider trước khi sử dụng trong production.
