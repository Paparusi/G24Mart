'use client';

import { useState, useEffect, useRef } from 'react';
import { Scan, Camera, Keyboard, Package, Zap, AlertCircle } from 'lucide-react';
import { useProducts } from '@/store/useStore';

interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  stock: number;
  category: string;
}

interface BarcodeInputProps {
  onProductScanned: (product: Product) => void;
  products?: Product[];
}

// Demo products for fallback
const DEMO_PRODUCTS = [
  { id: 'demo1', name: 'Coca Cola 330ml', price: 15000, barcode: '8934673001234', stock: 45, category: 'Nước Giải Khát' },
  { id: 'demo2', name: 'Bánh mì sandwich', price: 25000, barcode: '8934673001235', stock: 8, category: 'Thực Phẩm' },
  { id: 'demo3', name: 'Nước suối Lavie 500ml', price: 8000, barcode: '8934673001236', stock: 120, category: 'Nước Giải Khát' },
  { id: 'demo4', name: 'Mì tôm Hảo Hảo', price: 4500, barcode: '8934673001237', stock: 2, category: 'Thực Phẩm Khô' },
];

export default function POSBarcodeInput({ onProductScanned, products: propProducts = [] }: BarcodeInputProps) {
  const [inputMode, setInputMode] = useState<'manual' | 'camera'>('manual');
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get products from global store
  const { products: storeProducts } = useProducts();

  // Combine all available products
  const allProducts = [
    ...storeProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      barcode: p.barcode,
      stock: p.stock,
      category: p.category
    })),
    ...propProducts,
    ...DEMO_PRODUCTS
  ];

  // Remove duplicates based on barcode
  const uniqueProducts = allProducts.filter((product, index, self) => 
    index === self.findIndex(p => p.barcode === product.barcode)
  );

  // Focus input when component mounts
  useEffect(() => {
    if (inputMode === 'manual' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputMode]);

  // Search products as user types
  useEffect(() => {
    if (manualBarcode.length >= 2) {
      const results = uniqueProducts.filter(p => 
        p.barcode.includes(manualBarcode) || 
        p.name.toLowerCase().includes(manualBarcode.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, [manualBarcode, uniqueProducts]);

  // Handle barcode processing
  const processBarcode = (barcode: string) => {
    if (!barcode.trim()) return;

    const trimmedBarcode = barcode.trim();
    
    // Add to scan history
    setScanHistory(prev => [trimmedBarcode, ...prev.slice(0, 4)]);

    // Find product
    const product = uniqueProducts.find(p => p.barcode === trimmedBarcode);

    if (product) {
      if (product.stock > 0) {
        onProductScanned(product);
        setManualBarcode('');
        setShowSuggestions(false);
        
        // Success feedback
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+nrwmwhBj2U3v3YeiwFL4vb8d2TRwsUV7Tu6qVTEgmJ2vLegCIFOHfH8M2RQAoUW7Du6qJOEAmO3PTDciUFLIHO8tuTRwsUV7Tu6qVUFQmO3PTDciUFLIHO8tuTRwsUV7Tu6qVUFQm');
        audio.play().catch(() => {});

        // Vibrate if supported
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
      } else {
        alert(`⚠️ Sản phẩm "${product.name}" đã hết hàng (Tồn kho: 0)`);
      }
    } else {
      alert(`❌ Không tìm thấy sản phẩm với mã: ${trimmedBarcode}\n\nGợi ý: Kiểm tra lại mã vạch hoặc thêm sản phẩm vào kho trước khi quét.`);
    }
  };

  const handleManualInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        processBarcode(searchResults[0].barcode);
      } else {
        processBarcode(manualBarcode);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setManualBarcode(product.barcode);
    processBarcode(product.barcode);
  };

  const handleQuickScan = (barcode: string) => {
    setManualBarcode(barcode);
    processBarcode(barcode);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      alert('Không thể truy cập camera. Vui lòng sử dụng chế độ nhập thủ công.');
      setInputMode('manual');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (inputMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [inputMode]);

  // Simulate barcode detection for demo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning) {
      interval = setInterval(() => {
        if (Math.random() > 0.98) { // 2% chance
          const availableProducts = uniqueProducts.filter(p => p.stock > 0);
          if (availableProducts.length > 0) {
            const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
            processBarcode(randomProduct.barcode);
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, uniqueProducts]);

  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Scan className="w-5 h-5 text-blue-600" />
          Quét mã vạch
          <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {uniqueProducts.length} sản phẩm
          </span>
        </h3>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setInputMode('manual')}
            className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
              inputMode === 'manual'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Thủ công
          </button>
          <button
            onClick={() => setInputMode('camera')}
            className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
              inputMode === 'camera'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            Camera
          </button>
        </div>
      </div>

      {inputMode === 'manual' ? (
        <div className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyPress={handleManualInput}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
              placeholder="Quét mã vạch hoặc tên sản phẩm..."
              autoFocus
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Scan className="w-5 h-5 text-gray-400" />
            </div>

            {/* Search Suggestions */}
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 font-mono">{product.barcode}</div>
                        <div className="text-sm text-blue-600">{product.price.toLocaleString('vi-VN')}đ</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Tồn: {product.stock}
                        </div>
                        <div className="text-xs text-gray-500">{product.category}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Hướng dẫn:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Nhập mã vạch hoặc tên sản phẩm để tìm kiếm</li>
              <li>Nhấn Enter để thêm sản phẩm đầu tiên trong gợi ý</li>
              <li>Click vào gợi ý để chọn sản phẩm cụ thể</li>
            </ul>
          </div>

          {/* Quick scan buttons for demo */}
          {DEMO_PRODUCTS.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Quét nhanh (Demo):</span>
              {DEMO_PRODUCTS.slice(0, 4).map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleQuickScan(product.barcode)}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  title={product.name}
                >
                  {product.name.slice(0, 10)}...
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            className="relative bg-black rounded-lg overflow-hidden"
            style={{ aspectRatio: '16/9', maxHeight: '200px' }}
          >
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-green-500 bg-green-500 bg-opacity-20 w-48 h-20 relative">
                    <div className="absolute inset-0 border border-green-400 border-dashed animate-pulse"></div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-green-400 text-xs whitespace-nowrap">
                      Đưa mã vạch vào khung này
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">Đang khởi động camera...</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={() => setInputMode('manual')}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Chuyển về nhập thủ công
            </button>
          </div>
        </div>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Lịch sử quét gần đây:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {scanHistory.map((barcode, index) => (
              <button
                key={index}
                onClick={() => processBarcode(barcode)}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors font-mono"
              >
                {barcode}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600">
              Quét thông minh - {uniqueProducts.length} sản phẩm có sẵn
            </span>
          </div>
          <a
            href="/barcode-scanner"
            target="_blank"
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Mở scanner chuyên dụng
          </a>
        </div>
      </div>
    </div>
  );
}
