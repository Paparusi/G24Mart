# G24Mart - Convenience Store Management System

A comprehensive Point of Sale (POS) and inventory management solution designed specifically for convenience stores. Built with modern web technologies and integrated with real-world barcode databases for seamless product management.

## 🎯 Features

### Core Functionality
- **Point of Sale (POS)** - Fast and intuitive checkout system
- **Inventory Management** - Real-time stock tracking with barcode integration
- **Sales Analytics** - Comprehensive reporting and insights  
- **Dashboard** - Overview of store performance and key metrics
- **Smart AI Assistant** - Intelligent help for store operations

### 🔍 Advanced Barcode Integration
- **Real-world Product Database Lookup** - Automatic product information retrieval
- **Multi-API Support**:
  - 🇻🇳 **GS1 Vietnam** - Official Vietnamese product database
  - 🌍 **Open Food Facts** - Free global food database with nutrition info
  - 💼 **Barcode Lookup** - Commercial high-accuracy database
  - 📊 **UPC Database** - Comprehensive barcode coverage
- **Intelligent Fallback** - Multiple API sources ensure high success rate
- **Vietnamese Product Priority** - Special handling for local products
- **Performance Caching** - Smart caching for faster subsequent lookups

### Key Capabilities
- ✅ **Real-time barcode scanning** with automatic product lookup
- ✅ **Multi-source product data** from international databases
- ✅ Low stock alerts with automatic reorder suggestions
- ✅ Expiry date tracking with automated notifications
- ✅ Sales reporting and analytics with profit calculations
- ✅ Multi-category product management with smart categorization
- ✅ Transaction history with detailed product information
- ✅ Responsive design optimized for barcode scanners
- ✅ **Performance monitoring** with real-time optimization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd G24Mart
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Configure Barcode APIs** (Optional but recommended):
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```
   See [API Setup Guide](./API_SETUP_GUIDE.md) for detailed instructions.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript with strict mode
- **Tailwind CSS** - Utility-first CSS framework

### Barcode Integration
- **Multi-API Service** - Intelligent API switching and fallback
- **Performance Monitoring** - Real-time API performance tracking
- **Smart Caching** - Redis-like caching for faster lookups
- **Error Recovery** - Graceful degradation when APIs fail

### Development Tools
- **ESLint** - Code linting with TypeScript rules
- **PostCSS** - CSS processing with optimization
- **Performance Monitor** - Built-in performance tracking

## 📱 Available Pages

### 1. Home Page (`/`)
- Welcome page with feature overview
- Quick navigation to main sections
- System status indicators

### 2. Dashboard (`/dashboard`)
- Sales overview and key metrics
- Quick action buttons
- Recent transactions list
- Real-time statistics
- AI Assistant integration

### 3. Point of Sale (`/pos`)
- Product selection interface
- Shopping cart management  
- **Enhanced barcode scanning** with real-time product lookup
- Checkout functionality with receipt generation

### 4. **Enhanced Inventory Management (`/inventory`)**
- **Real-time barcode scanning** - Instant product lookup from multiple databases
- Product catalog with advanced search and filters
- **Automatic product information** - Name, brand, images, nutrition facts
- Stock level management with intelligent alerts
- **Smart categorization** - Auto-assign categories based on product data
- Low stock and expiry alerts with reorder suggestions

### 5. Reports & Analytics (`/reports`)
- Daily/weekly/monthly sales reports  
- Revenue and transaction analytics
- Top-selling products analysis
- **Barcode scanning performance metrics**
- Visual charts with real-time data

## 🎨 UI/UX Design

### Design Principles
- **Simplicity** - Clean, intuitive interface
- **Speed** - Fast operations for busy store environments
- **Mobile-First** - Works on tablets and smartphones
- **Accessibility** - Easy to use for all staff members

### Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Danger: Red (#EF4444)

## 📋 Project Structure

```
G24Mart/
├── src/
│   ├── app/
│   │   ├── dashboard/       # Dashboard with AI integration
│   │   ├── inventory/       # Enhanced inventory with barcode scanning
│   │   ├── pos/            # Point of Sale with barcode integration
│   │   ├── reports/        # Analytics with barcode metrics
│   │   ├── globals.css     # Global styles with performance optimizations
│   │   ├── layout.tsx      # Root layout with monitoring
│   │   └── page.tsx        # Home page with feature overview
│   ├── components/
│   │   ├── BarcodeProductDialog.tsx  # Product lookup dialog
│   │   ├── SmartAIAssistant.tsx      # AI assistant component
│   │   └── PerformanceMonitor.tsx    # Performance tracking
│   ├── hooks/
│   │   └── useEnhancedBarcodeScanner.ts  # Advanced barcode scanning
│   ├── services/
│   │   └── BarcodeApiService.ts          # Multi-API barcode service
│   └── types/
│       └── barcode.ts                    # Barcode-related TypeScript interfaces
├── public/                 # Static files
├── .github/               # GitHub configuration
├── .env.example          # Environment variables template
├── API_SETUP_GUIDE.md    # Comprehensive API setup guide
├── BARCODE_INTEGRATION.md # Barcode integration documentation
├── package.json          # Dependencies with barcode APIs
├── tailwind.config.js    # Tailwind with performance optimizations
├── tsconfig.json         # TypeScript configuration
└── next.config.js        # Next.js configuration
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production with optimizations
- `npm start` - Start production server  
- `npm run lint` - Run ESLint with TypeScript rules

### 🔍 Barcode Development Workflow

1. **Setup APIs**: Configure your API keys in `.env.local` (see [API Setup Guide](./API_SETUP_GUIDE.md))
2. **Test Integration**: Use the inventory page to test barcode scanning
3. **Monitor Performance**: Check the browser console for performance metrics
4. **Add Custom Products**: Use the fallback system when products aren't found

### Adding New Features

1. Create new components in `src/components/`
2. Add new pages in `src/app/`
3. Update navigation in relevant layouts
4. Test barcode functionality with real scanners
5. Monitor performance impact

## 🚀 Deployment

### Production Build
```bash
# Build with barcode API integration
npm run build
npm start
```

### Environment Variables for Production
```bash
# Required for barcode functionality
NEXT_PUBLIC_BARCODE_LOOKUP_API_KEY=your_production_api_key
NEXT_PUBLIC_UPC_DATABASE_API_KEY=your_production_api_key
NEXT_PUBLIC_GS1_VIETNAM_API_KEY=your_production_api_key
```

## 📚 Documentation

### Quick Start Guides
- 🔗 [**API Setup Guide**](./API_SETUP_GUIDE.md) - Complete guide to configure barcode APIs
- 🔍 [**Barcode Integration**](./BARCODE_INTEGRATION.md) - How to use the barcode system

### API Documentation  
- **GS1 Vietnam**: Official Vietnamese product database
- **Open Food Facts**: Free global food database (no API key needed)
- **Barcode Lookup**: Commercial barcode API with high accuracy
- **UPC Database**: Comprehensive UPC/EAN database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/barcode-enhancement`
3. Commit changes: `git commit -am 'Add new barcode feature'`
4. Push to branch: `git push origin feature/barcode-enhancement`
5. Create a Pull Request

### Development Standards
- ✅ **TypeScript**: Full type safety required
- ✅ **Performance**: Monitor API response times
- ✅ **Error Handling**: Graceful degradation for API failures
- ✅ **Caching**: Implement smart caching for API responses
- ✅ **Vietnamese Support**: Prioritize GS1 Vietnam for local products

## 🔄 Future Enhancements

### Planned Features  
- [ ] **Advanced Barcode Features**
  - [ ] QR Code support for payments and promotions
  - [ ] Bulk barcode import from CSV/Excel
  - [ ] Custom barcode generation for store products
  - [ ] Barcode printing integration

- [ ] **Enhanced API Integration**
  - [ ] More barcode database providers
  - [ ] Real-time inventory sync with suppliers
  - [ ] Automated reorder based on barcode data
  - [ ] Price comparison across APIs

- [ ] **Mobile & Hardware**
  - [ ] Dedicated mobile app for inventory management
  - [ ] Bluetooth barcode scanner support
  - [ ] Voice commands for hands-free operation
  - [ ] Offline mode with sync capability

- [ ] **Backend & Database**
  - [ ] Full backend API with Express.js/Fastify
  - [ ] PostgreSQL database with barcode indexing  
  - [ ] User authentication and role management
  - [ ] Cloud deployment with auto-scaling

### Performance Improvements
- [ ] **Advanced Caching**
  - [ ] Redis integration for distributed caching
  - [ ] Smart cache invalidation strategies
  - [ ] Predictive barcode prefetching
  
- [ ] **API Optimization**
  - [ ] GraphQL for efficient data fetching
  - [ ] Background API sync jobs
  - [ ] Load balancing across API providers
  - [ ] Advanced error recovery mechanisms

## 🐛 Known Issues & Troubleshooting

### Common Issues

**Barcode Scanner Not Working**
- Ensure scanner is configured in "keyboard wedge" mode
- Check USB connection and drivers
- Try manual barcode entry to test API integration

**API Rate Limits Exceeded** 
- Check your usage dashboard on API provider websites
- Consider upgrading to paid tiers for higher limits
- Implement request queuing for peak usage

**Vietnamese Products Not Found**
- Many Vietnamese products may not be in international databases
- GS1 Vietnam API requires membership - consider joining
- Use the fallback manual entry system

### Performance Tips
- Enable browser caching for better performance
- Use barcode scanner with good read accuracy to reduce re-scans
- Monitor API response times in browser developer tools

## 📞 Support & Community

### Getting Help
- � **Email**: support@g24mart.com  
- 💬 **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)
- 📖 **Documentation**: [Full Documentation](https://github.com/your-repo/wiki)

### API Provider Support
- **GS1 Vietnam**: info@gs1vn.org | +84-28-3824-6060
- **Open Food Facts**: [Community Slack](https://slack.openfoodfacts.org)
- **Barcode Lookup**: support@barcodelookup.com
- **UPC Database**: support@upcdatabase.org

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Open Food Facts** - For providing free access to food data
- **GS1 Vietnam** - For supporting local product identification
- **Tailwind CSS** - For the utility-first CSS framework
- **React Community** - For excellent libraries and tools

---

**Phát triển bởi G24Mart Team** | **Built for Vietnamese Convenience Stores** 🇻🇳

*Hệ thống quản lý cửa hàng tiện lợi hiện đại với tích hợp mã vạch thông minh*
- [ ] User authentication and roles
- [ ] Multi-store support
- [ ] Receipt printing
- [ ] Payment gateway integration
- [ ] Customer loyalty program
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Offline mode support

### Phase 2 Development
- Customer management system
- Supplier management
- Purchase order management
- Advanced reporting features
- Integration with accounting software

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@g24mart.com
- Documentation: [Wiki](link-to-wiki)
- Issues: [GitHub Issues](link-to-issues)

## 🙏 Acknowledgments

- Built with love for small business owners
- Inspired by successful POS systems like KiotViet, Sapo, and POS365
- Designed for the Vietnamese convenience store market

---

**G24Mart** - Empowering convenience stores with modern technology 🏪✨
