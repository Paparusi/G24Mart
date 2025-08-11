import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';

interface AdvancedAnalytics {
  totalRevenue: number;
  totalProfit: number;
  totalTransactions: number;
  averageTransactionValue: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  salesTrends: Array<{
    date: string;
    sales: number;
    transactions: number;
  }>;
  customerAnalytics: {
    totalCustomers: number;
    returningCustomers: number;
    averageLifetimeValue: number;
    loyaltyPointsIssued: number;
  };
  inventoryMetrics: {
    fastMovingItems: number;
    slowMovingItems: number;
    stockValue: number;
    turnoverRate: number;
  };
}

interface ProfitAnalysis {
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
}

const AdvancedBusinessIntelligence: React.FC = () => {
  const { products, orders, customers } = useStore();
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | '90days' | 'year'>('30days');
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'customers' | 'inventory' | 'profit'>('overview');

  // Calculate comprehensive analytics
  const analytics = useMemo((): AdvancedAnalytics => {
    // Mock calculations - in real app would filter by date range
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalProfit = orders.reduce((sum, order) => {
      const cost = order.items.reduce((itemSum, item) => {
        const product = products.find(p => p.id === item.id);
        return itemSum + (product?.costPrice || 0) * item.quantity;
      }, 0);
      return sum + (order.total - cost);
    }, 0);

    const totalTransactions = orders.length;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Top selling products
    const productSales = new Map<string, { name: string; totalSold: number; revenue: number }>();
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
          const existing = productSales.get(item.id) || { name: product.name, totalSold: 0, revenue: 0 };
          existing.totalSold += item.quantity;
          existing.revenue += item.price * item.quantity;
          productSales.set(item.id, existing);
        }
      });
    });

    const topSellingProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    // Sales trends (mock data for demo)
    const salesTrends = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        sales: Math.random() * 1000 + 500,
        transactions: Math.floor(Math.random() * 50) + 20
      };
    });

    const customerAnalytics = {
      totalCustomers: customers.length,
      returningCustomers: customers.filter(c => c.totalSpent > 0).length,
      averageLifetimeValue: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0,
      loyaltyPointsIssued: customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)
    };

    const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
    const inventoryMetrics = {
      fastMovingItems: products.filter(p => p.stock < p.minStock).length,
      slowMovingItems: products.filter(p => p.stock > (p.maxStock || 0)).length,
      stockValue: totalStockValue,
      turnoverRate: totalStockValue > 0 ? (totalRevenue * 0.7) / totalStockValue : 0
    };

    return {
      totalRevenue,
      totalProfit,
      totalTransactions,
      averageTransactionValue,
      topSellingProducts,
      salesTrends,
      customerAnalytics,
      inventoryMetrics
    };
  }, [products, orders, customers, timeRange]);

  const profitAnalysis = useMemo((): ProfitAnalysis => {
    const costOfGoodsSold = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => {
        const product = products.find(p => p.id === item.id);
        return itemSum + (product?.costPrice || 0) * item.quantity;
      }, 0);
    }, 0);

    const grossProfit = analytics.totalRevenue - costOfGoodsSold;
    const operatingExpenses = analytics.totalRevenue * 0.2; // Mock 20% operating expenses
    const netProfit = grossProfit - operatingExpenses;
    const profitMargin = analytics.totalRevenue > 0 ? (netProfit / analytics.totalRevenue) * 100 : 0;

    return {
      grossProfit,
      netProfit,
      profitMargin,
      costOfGoodsSold,
      operatingExpenses
    };
  }, [analytics, products, orders]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
              <p className="text-blue-100 text-xs mt-1">+12.5% vs last period</p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Profit</p>
              <p className="text-3xl font-bold">${analytics.totalProfit.toFixed(2)}</p>
              <p className="text-green-100 text-xs mt-1">Margin: {profitAnalysis.profitMargin.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Transactions</p>
              <p className="text-3xl font-bold">{analytics.totalTransactions}</p>
              <p className="text-purple-100 text-xs mt-1">Avg: ${analytics.averageTransactionValue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
              <span className="text-2xl">🛒</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Customers</p>
              <p className="text-3xl font-bold">{analytics.customerAnalytics.totalCustomers}</p>
              <p className="text-orange-100 text-xs mt-1">
                {((analytics.customerAnalytics.returningCustomers / analytics.customerAnalytics.totalCustomers) * 100).toFixed(1)}% returning
              </p>
            </div>
            <div className="p-3 bg-orange-400 bg-opacity-30 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trends (Last 30 Days)</h3>
        <div className="h-64 flex items-end space-x-1">
          {analytics.salesTrends.slice(-15).map((day, index) => (
            <div
              key={index}
              className="flex-1 bg-blue-500 rounded-t-sm relative group cursor-pointer hover:bg-blue-600 transition-colors"
              style={{ height: `${(day.sales / Math.max(...analytics.salesTrends.map(d => d.sales))) * 100}%` }}
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <div>{new Date(day.date).toLocaleDateString()}</div>
                <div>Sales: ${day.sales.toFixed(0)}</div>
                <div>Orders: {day.transactions}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{analytics.salesTrends[analytics.salesTrends.length - 15]?.date}</span>
          <span>{analytics.salesTrends[analytics.salesTrends.length - 1]?.date}</span>
        </div>
      </div>

      {/* Top Products and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {analytics.topSellingProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.totalSold} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inventory Turnover</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(analytics.inventoryMetrics.turnoverRate * 20, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{analytics.inventoryMetrics.turnoverRate.toFixed(1)}x</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Retention</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(analytics.customerAnalytics.returningCustomers / analytics.customerAnalytics.totalCustomers) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {((analytics.customerAnalytics.returningCustomers / analytics.customerAnalytics.totalCustomers) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profit Margin</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${Math.max(profitAnalysis.profitMargin, 0)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{profitAnalysis.profitMargin.toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stock Health</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${Math.max(100 - (analytics.inventoryMetrics.fastMovingItems * 10), 0)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {analytics.inventoryMetrics.fastMovingItems} low stock
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfitAnalysis = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Profit & Loss Analysis</h2>
      
      {/* P&L Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">${profitAnalysis.grossProfit.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">Gross Profit</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(profitAnalysis.grossProfit / analytics.totalRevenue) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((profitAnalysis.grossProfit / analytics.totalRevenue) * 100).toFixed(1)}% of revenue
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">${profitAnalysis.netProfit.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">Net Profit</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.max(profitAnalysis.profitMargin, 0)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {profitAnalysis.profitMargin.toFixed(1)}% margin
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">${profitAnalysis.operatingExpenses.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">Operating Expenses</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(profitAnalysis.operatingExpenses / analytics.totalRevenue) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((profitAnalysis.operatingExpenses / analytics.totalRevenue) * 100).toFixed(1)}% of revenue
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed P&L Statement */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit & Loss Statement</h3>
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium text-gray-900">Revenue</span>
            <span className="font-medium text-gray-900">${analytics.totalRevenue.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600 pl-4">Cost of Goods Sold</span>
            <span className="text-red-600">-${profitAnalysis.costOfGoodsSold.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-200 font-medium">
            <span className="text-gray-900">Gross Profit</span>
            <span className="text-green-600">${profitAnalysis.grossProfit.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600 pl-4">Operating Expenses</span>
            <span className="text-red-600">-${profitAnalysis.operatingExpenses.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between py-3 border-t-2 border-gray-300 font-bold text-lg">
            <span className="text-gray-900">Net Profit</span>
            <span className={profitAnalysis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
              ${profitAnalysis.netProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
              <p className="mt-2 text-gray-600">Advanced analytics and insights for your business</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex space-x-2">
              {[
                { value: 'today', label: 'Today' },
                { value: '7days', label: '7 Days' },
                { value: '30days', label: '30 Days' },
                { value: '90days', label: '90 Days' },
                { value: 'year', label: '1 Year' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    timeRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sales', label: 'Sales Analysis' },
              { id: 'customers', label: 'Customer Insights' },
              { id: 'inventory', label: 'Inventory Analytics' },
              { id: 'profit', label: 'Profit Analysis' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'profit' && renderProfitAnalysis()}
        {activeTab === 'sales' && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📊</span>
            <p className="text-gray-500">Sales Analysis - Coming Soon</p>
          </div>
        )}
        {activeTab === 'customers' && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">👥</span>
            <p className="text-gray-500">Customer Insights - Coming Soon</p>
          </div>
        )}
        {activeTab === 'inventory' && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📦</span>
            <p className="text-gray-500">Inventory Analytics - Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedBusinessIntelligence;
