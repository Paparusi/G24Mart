'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Scan, Package, Plus, Search, Zap, Settings, Info } from 'lucide-react';

interface BarcodeResult {
  code: string;
  format: string;
  timestamp: Date;
}

interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  category: string;
  supplier: string;
  image?: string;
}

const MOCK_BARCODE_DATABASE = [
  {
    barcode: '8934673123456',
    name: 'Nước ngọt Coca Cola 330ml',
    price: 12000,
    costPrice: 9000,
    stock: 150,
    category: 'Đồ uống',
    supplier: 'Coca Cola Vietnam',
    image: '🥤'
  },
  {
    barcode: '8934673234567',
    name: 'Mì tôm Hảo Hảo gói',
    price: 4500,
    costPrice: 3200,
    stock: 200,
    category: 'Thực phẩm',
    supplier: 'Acecook Vietnam',
    image: '🍜'
  },
  {
    barcode: '8934673345678',
    name: 'Bánh quy Oreo 137g',
    price: 18000,
    costPrice: 14000,
    stock: 80,
    category: 'Bánh kẹo',
    supplier: 'Mondelez Kinh Đô',
    image: '🍪'
  },
  {
    barcode: '8934673456789',
    name: 'Sữa tươi TH True Milk 1L',
    price: 28000,
    costPrice: 22000,
    stock: 45,
    category: 'Sữa',
    supplier: 'TH True Milk',
    image: '🥛'
  }
];

export default function AdvancedBarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProducts, setScannedProducts] = useState<Product[]>([]);
  const [scanHistory, setScanHistory] = useState<BarcodeResult[]>([]);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanMode, setScanMode] = useState<'single' | 'batch'>('single');
  const [showSettings, setShowSettings] = useState(false);
  const [scannerSettings, setScannerSettings] = useState({
    autoAddToCart: true,
    soundEnabled: true,
    vibrationEnabled: true,
    duplicateWarning: true
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulate barcode scanning with camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Cannot access camera:', error);
      alert('Không thể truy cập camera. Vui lòng sử dụng chế độ nhập thủ công.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // Simulate barcode detection
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning) {
      interval = setInterval(() => {
        // Simulate random barcode detection for demo
        if (Math.random() > 0.95) { // 5% chance per interval
          const randomBarcode = MOCK_BARCODE_DATABASE[Math.floor(Math.random() * MOCK_BARCODE_DATABASE.length)];
          processBarcode(randomBarcode.barcode);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning]);

  const processBarcode = async (barcode: string) => {
    if (!barcode.trim()) return;

    const result: BarcodeResult = {
      code: barcode.trim(),
      format: 'EAN-13',
      timestamp: new Date()
    };

    // Add to scan history
    setScanHistory(prev => [result, ...prev.slice(0, 49)]);

    // Play sound if enabled
    if (scannerSettings.soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+nrwmwhBj2U3v3YeiwFL4vb8d2TRwsUV7Tu6qVTEgmJ2vLegCIFOHfH8M2RQAoUW7Du6qJOEAmO3PTDciUFLIHO8tuTRwsUV7Tu6qVUFQmO3PTDciUFLIHO8tuTRwsUV7Tu6qVUFQm');
      audio.play().catch(() => {}); // Ignore errors
    }

    // Vibrate if supported and enabled
    if (scannerSettings.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }

    // Find product in database
    const foundProduct = MOCK_BARCODE_DATABASE.find(p => p.barcode === barcode.trim());
    
    if (foundProduct) {
      const product: Product = {
        id: `prod_${Date.now()}`,
        barcode: foundProduct.barcode,
        name: foundProduct.name,
        price: foundProduct.price,
        costPrice: foundProduct.costPrice,
        stock: foundProduct.stock,
        category: foundProduct.category,
        supplier: foundProduct.supplier,
        image: foundProduct.image
      };

      // Check for duplicates
      if (scannerSettings.duplicateWarning) {
        const isDuplicate = scannedProducts.some(p => p.barcode === product.barcode);
        if (isDuplicate) {
          alert(`Sản phẩm ${product.name} đã được quét trước đó!`);
          return;
        }
      }

      setScannedProducts(prev => [...prev, product]);
      
      if (scanMode === 'single') {
        stopCamera();
      }
    } else {
      // Product not found - create new product entry
      const newProduct: Product = {
        id: `prod_${Date.now()}`,
        barcode: barcode.trim(),
        name: `Sản phẩm mới ${barcode.trim()}`,
        price: 0,
        costPrice: 0,
        stock: 0,
        category: 'Chưa phân loại',
        supplier: 'Chưa rõ'
      };
      
      setScannedProducts(prev => [...prev, newProduct]);
      alert(`Sản phẩm mới được tìm thấy! Vui lòng cập nhật thông tin.`);
    }
  };

  const handleManualScan = () => {
    if (manualBarcode.trim()) {
      processBarcode(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const clearResults = () => {
    setScannedProducts([]);
    setScanHistory([]);
  };

  const removeProduct = (index: number) => {
    setScannedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const getBarcodeFormat = (barcode: string) => {
    const length = barcode.length;
    if (length === 13) return 'EAN-13';
    if (length === 12) return 'UPC-A';
    if (length === 8) return 'EAN-8';
    if (length >= 6 && length <= 18) return 'Code-128';
    return 'Unknown';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            📱 Quét mã vạch G24Scanner
          </h2>
          <p className="text-gray-600">
            Hệ thống quét mã vạch chuyên nghiệp với camera và nhập thủ công
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Scanner Controls */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Quét bằng camera
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scanMode"
                  value="single"
                  checked={scanMode === 'single'}
                  onChange={(e) => setScanMode(e.target.value as 'single')}
                  className="mr-2"
                />
                Quét đơn lẻ
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scanMode"
                  value="batch"
                  checked={scanMode === 'batch'}
                  onChange={(e) => setScanMode(e.target.value as 'batch')}
                  className="mr-2"
                />
                Quét hàng loạt
              </label>
            </div>

            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {isScanning ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Camera chưa được kích hoạt</p>
                  </div>
                </div>
              )}
              
              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-green-500 bg-green-500 bg-opacity-10 w-64 h-32 relative">
                    <div className="absolute inset-0 border border-green-400 border-dashed animate-pulse"></div>
                    <div className="absolute top-2 left-2 text-green-400 text-xs">
                      Đưa mã vạch vào khung này
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isScanning ? (
                <button
                  onClick={startCamera}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Scan className="w-5 h-5" />
                  Bắt đầu quét
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Dừng quét
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Nhập thủ công
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã vạch
              </label>
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mã vạch hoặc quét bằng súng quét"
              />
            </div>
            
            <button
              onClick={handleManualScan}
              disabled={!manualBarcode.trim()}
              className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm sản phẩm
            </button>

            {/* Quick scan buttons */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Quét nhanh (Demo):</p>
              <div className="grid grid-cols-2 gap-2">
                {MOCK_BARCODE_DATABASE.slice(0, 4).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => processBarcode(item.barcode)}
                    className="text-xs bg-blue-100 text-blue-800 px-3 py-2 rounded hover:bg-blue-200 transition-colors"
                  >
                    {item.image} {item.barcode.slice(-4)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{scannedProducts.length}</div>
          <div className="text-sm text-gray-600">Sản phẩm đã quét</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{scanHistory.length}</div>
          <div className="text-sm text-gray-600">Lịch sử quét</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {scannedProducts.filter(p => p.price > 0).length}
          </div>
          <div className="text-sm text-gray-600">Có giá bán</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">
            {scannedProducts.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString('vi-VN')}đ
          </div>
          <div className="text-sm text-gray-600">Tổng giá trị</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scanned Products */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">📦 Sản phẩm đã quét</h3>
            {scannedProducts.length > 0 && (
              <button
                onClick={clearResults}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scannedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có sản phẩm nào được quét</p>
              </div>
            ) : (
              scannedProducts.map((product, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{product.image || '📦'}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">{product.name}</h4>
                        <p className="text-sm text-gray-600">
                          Mã: {product.barcode} • {getBarcodeFormat(product.barcode)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeProduct(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Giá bán:</span>
                      <span className="font-medium ml-2">
                        {product.price > 0 ? `${product.price.toLocaleString('vi-VN')}đ` : 'Chưa có'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tồn kho:</span>
                      <span className="font-medium ml-2">
                        {product.stock > 0 ? `${product.stock}` : 'Hết hàng'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Danh mục:</span>
                      <span className="font-medium ml-2">{product.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Nhà cung cấp:</span>
                      <span className="font-medium ml-2">{product.supplier}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scan History */}
        <div>
          <h3 className="text-xl font-semibold mb-4">📜 Lịch sử quét</h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {scanHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Scan className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có lịch sử quét</p>
              </div>
            ) : (
              scanHistory.map((scan, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                        {scan.code}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {scan.format}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {scan.timestamp.toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-xl font-semibold mb-4">⚙️ Cài đặt quét</h3>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={scannerSettings.autoAddToCart}
                  onChange={(e) => setScannerSettings(prev => ({
                    ...prev,
                    autoAddToCart: e.target.checked
                  }))}
                  className="mr-3"
                />
                Tự động thêm vào giỏ hàng
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={scannerSettings.soundEnabled}
                  onChange={(e) => setScannerSettings(prev => ({
                    ...prev,
                    soundEnabled: e.target.checked
                  }))}
                  className="mr-3"
                />
                Bật âm thanh khi quét
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={scannerSettings.vibrationEnabled}
                  onChange={(e) => setScannerSettings(prev => ({
                    ...prev,
                    vibrationEnabled: e.target.checked
                  }))}
                  className="mr-3"
                />
                Rung khi quét thành công
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={scannerSettings.duplicateWarning}
                  onChange={(e) => setScannerSettings(prev => ({
                    ...prev,
                    duplicateWarning: e.target.checked
                  }))}
                  className="mr-3"
                />
                Cảnh báo sản phẩm trùng lặp
              </label>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        <h3 className="text-xl font-semibold text-center mb-4">🚀 Vượt trội hơn KiotViet Barcode Scanner</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-600 mb-2">✅ G24Scanner</h4>
            <ul className="text-sm space-y-1">
              <li>• Camera quét real-time với overlay</li>
              <li>• Nhập thủ công và súng quét</li>
              <li>• Quét đơn lẻ và hàng loạt</li>
              <li>• Lịch sử quét chi tiết</li>
              <li>• Cài đặt âm thanh và rung</li>
              <li>• Hoạt động offline hoàn toàn</li>
              <li>• Giao diện hiện đại, trực quan</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-600 mb-2">❌ KiotViet Scanner</h4>
            <ul className="text-sm space-y-1">
              <li>• Hiện tại lỗi 503, không dùng được</li>
              <li>• Giao diện cũ, khó sử dụng</li>
              <li>• Phụ thuộc internet để tra cứu</li>
              <li>• Hạn chế tính năng</li>
              <li>• Không có cài đặt chi tiết</li>
              <li>• Thiếu lịch sử quét</li>
              <li>• Chậm và hay lỗi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
