import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  ScanLine,
  Warehouse,
  Truck,
  Clock,
  Users
} from 'lucide-react';

interface AdvancedInventoryProps {
  className?: string;
}

interface InventoryLocation {
  id: string;
  name: string;
  address: string;
  type: 'store' | 'warehouse' | 'supplier';
  manager: string;
  capacity: number;
  utilization: number;
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  fromLocation?: string;
  toLocation: string;
  reason: string;
  timestamp: string;
  user: string;
  cost: number;
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  items: Array<{
    productId: string;
    productName: string;
    orderedQty: number;
    receivedQty: number;
    costPrice: number;
  }>;
  totalAmount: number;
  orderDate: string;
  expectedDate: string;
  receivedDate?: string;
}

const AdvancedInventoryModule: React.FC<AdvancedInventoryProps> = ({ className = '' }) => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'locations' | 'movements' | 'orders' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);

  // Mock data for demonstration
  const locations: InventoryLocation[] = [
    {
      id: '1',
      name: 'Main Store',
      address: '123 Main Street',
      type: 'store',
      manager: 'John Doe',
      capacity: 10000,
      utilization: 75
    },
    {
      id: '2', 
      name: 'Warehouse A',
      address: '456 Industrial Blvd',
      type: 'warehouse',
      manager: 'Jane Smith',
      capacity: 50000,
      utilization: 45
    },
    {
      id: '3',
      name: 'Supplier - Coca Cola',
      address: '789 Supplier Ave',
      type: 'supplier',
      manager: 'Bob Johnson',
      capacity: 0,
      utilization: 0
    }
  ];

  const stockMovements: StockMovement[] = [
    {
      id: '1',
      productId: '1',
      productName: 'Coca Cola',
      type: 'in',
      quantity: 100,
      toLocation: 'Main Store',
      reason: 'Purchase Order PO-001',
      timestamp: '2025-01-10T10:30:00',
      user: 'admin',
      cost: 150.00
    },
    {
      id: '2',
      productId: '2', 
      productName: 'Pepsi',
      type: 'out',
      quantity: 25,
      toLocation: 'Main Store',
      reason: 'Customer Sale',
      timestamp: '2025-01-10T14:15:00',
      user: 'cashier1',
      cost: 0
    }
  ];

  const purchaseOrders: PurchaseOrder[] = [
    {
      id: 'PO-001',
      supplierId: '3',
      supplierName: 'Coca Cola',
      status: 'received',
      items: [
        {
          productId: '1',
          productName: 'Coca Cola 330ml',
          orderedQty: 100,
          receivedQty: 100,
          costPrice: 1.50
        }
      ],
      totalAmount: 150.00,
      orderDate: '2025-01-08',
      expectedDate: '2025-01-10',
      receivedDate: '2025-01-10'
    }
  ];

  // Enhanced analytics calculations
  const inventoryAnalytics = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.stock * product.costPrice), 0);
    const lowStockItems = products.filter(product => product.stock <= product.minStock);
    const outOfStockItems = products.filter(product => product.stock === 0);
    
    // Calculate inventory turnover (mock calculation)
    const avgInventoryValue = totalValue;
    const costOfGoodsSold = totalValue * 0.6; // Mock COGS
    const inventoryTurnover = avgInventoryValue > 0 ? costOfGoodsSold / avgInventoryValue : 0;
    
    // ABC Analysis
    const sortedByValue = [...products].sort((a, b) => (b.stock * b.price) - (a.stock * a.price));
    const totalRevenue = sortedByValue.reduce((sum, p) => sum + (p.stock * p.price), 0);
    let runningTotal = 0;
    const abcAnalysis = sortedByValue.map(product => {
      const productValue = product.stock * product.price;
      runningTotal += productValue;
      const percentOfTotal = (runningTotal / totalRevenue) * 100;
      
      let category = 'C';
      if (percentOfTotal <= 80) category = 'A';
      else if (percentOfTotal <= 95) category = 'B';
      
      return { ...product, abcCategory: category, percentOfTotal };
    });

    return {
      totalProducts,
      totalValue,
      lowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockItems.length,
      inventoryTurnover: inventoryTurnover.toFixed(2),
      abcAnalysis
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.barcode.includes(searchTerm);
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      const matchesLowStock = !showLowStock || product.stock <= product.minStock;
      const matchesExpiring = !showExpiringSoon || (product.expiryDate && 
        new Date(product.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      
      return matchesSearch && matchesCategory && matchesLowStock && matchesExpiring;
    });
  }, [products, searchTerm, filterCategory, showLowStock, showExpiringSoon]);

  const categories = [...new Set(products.map(p => p.category))];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{inventoryAnalytics.totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inventory Value</p>
              <p className="text-3xl font-bold text-gray-900">${inventoryAnalytics.totalValue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-red-600">{inventoryAnalytics.lowStockItems}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Turnover Rate</p>
              <p className="text-3xl font-bold text-gray-900">{inventoryAnalytics.inventoryTurnover}x</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <RefreshCw className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Location Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Location Performance
        </h3>
        <div className="space-y-4">
          {locations.map(location => (
            <div key={location.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  location.type === 'store' ? 'bg-blue-100' : 
                  location.type === 'warehouse' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  {location.type === 'store' ? <Package className="h-4 w-4 text-blue-600" /> :
                   location.type === 'warehouse' ? <Warehouse className="h-4 w-4 text-green-600" /> :
                   <Truck className="h-4 w-4 text-orange-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{location.name}</p>
                  <p className="text-sm text-gray-500">{location.address}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {location.utilization}% Utilized
                </p>
                <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${location.utilization}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Stock Movements */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Stock Movements
        </h3>
        <div className="space-y-3">
          {stockMovements.slice(0, 5).map(movement => (
            <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  movement.type === 'in' ? 'bg-green-100' : 
                  movement.type === 'out' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {movement.type === 'in' ? <TrendingUp className="h-4 w-4 text-green-600" /> :
                   movement.type === 'out' ? <TrendingDown className="h-4 w-4 text-red-600" /> :
                   <RefreshCw className="h-4 w-4 text-blue-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{movement.productName}</p>
                  <p className="text-sm text-gray-500">
                    {movement.type.toUpperCase()} • {movement.quantity} units • {movement.reason}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(movement.timestamp).toLocaleDateString()}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  by {movement.user}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`px-3 py-1 rounded-full text-sm ${
                showLowStock ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Low Stock Only
            </button>
            <button
              onClick={() => setShowExpiringSoon(!showExpiringSoon)}
              className={`px-3 py-1 rounded-full text-sm ${
                showExpiringSoon ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Expiring Soon
            </button>
            <button className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.barcode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        product.stock <= product.minStock ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {product.stock}
                      </span>
                      {product.stock <= product.minStock && (
                        <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Min: {product.minStock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${(product.stock * product.costPrice).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Cost: ${product.costPrice}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Inventory Management</h1>
          <p className="mt-2 text-gray-600">Enterprise-grade inventory control and analytics</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'locations', label: 'Locations', icon: MapPin },
              { id: 'movements', label: 'Movements', icon: RefreshCw },
              { id: 'orders', label: 'Purchase Orders', icon: Truck },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'locations' && (
          <div className="text-center py-12">
            <Warehouse className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Location Management - Coming Soon</p>
          </div>
        )}
        {activeTab === 'movements' && (
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Stock Movement Tracking - Coming Soon</p>
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Purchase Order Management - Coming Soon</p>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Advanced Analytics - Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedInventoryModule;
