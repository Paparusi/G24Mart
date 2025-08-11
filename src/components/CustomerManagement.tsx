'use client'

import { useState } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar,
  Award,
  TrendingUp,
  Gift,
  Edit3,
  Trash2,
  Star
} from 'lucide-react'
import { useAnalyticsStore, Customer } from '@/stores/useAnalyticsStore'

interface CustomerFormData {
  name: string
  phone: string
  email: string
  address: string
  birthDate: string
  preferences: string[]
}

export default function CustomerManagement() {
  const { 
    customers, 
    addCustomer, 
    updateCustomer, 
    getCustomerTierColor, 
    addCustomerPoints 
  } = useAnalyticsStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    birthDate: '',
    preferences: []
  })

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        ...formData,
        preferences: formData.preferences.length > 0 ? formData.preferences : undefined
      })
      setEditingCustomer(null)
    } else {
      addCustomer({
        ...formData,
        tier: 'Bronze',
        points: 0,
        totalSpent: 0,
        visits: 0,
        preferences: formData.preferences.length > 0 ? formData.preferences : undefined
      })
    }
    
    setShowAddModal(false)
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      birthDate: '',
      preferences: []
    })
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      birthDate: customer.birthDate || '',
      preferences: customer.preferences || []
    })
    setShowAddModal(true)
  }

  const handleAddPoints = (customerId: string, points: number) => {
    addCustomerPoints(customerId, points, 0)
  }

  const getCustomerStats = () => {
    return {
      total: customers.length,
      bronze: customers.filter(c => c.tier === 'Bronze').length,
      silver: customers.filter(c => c.tier === 'Silver').length,
      gold: customers.filter(c => c.tier === 'Gold').length,
      platinum: customers.filter(c => c.tier === 'Platinum').length,
      totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      averageSpent: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0
    }
  }

  const stats = getCustomerStats()

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Quản Lý Khách Hàng</h1>
        <p className="text-gray-600">Quản lý thông tin và chương trình khách hàng thân thiết</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Khách Hàng</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Chi Tiêu</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalSpent.toLocaleString('vi-VN')}₫
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">TB Chi Tiêu/KH</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.averageSpent.toLocaleString('vi-VN')}₫
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Khách VIP</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.gold + stats.platinum}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                  {stats.gold} Gold
                </span>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                  {stats.platinum} Platinum
                </span>
              </div>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm Khách Hàng
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách Hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hạng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm Tích Lũy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng Chi Tiêu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lần Cuối
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </span>
                        {customer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerTierColor(customer.tier)}`}>
                      {customer.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.points.toLocaleString('vi-VN')}</div>
                    <div className="text-sm text-gray-500">{customer.visits} lần mua</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.totalSpent.toLocaleString('vi-VN')}₫
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.lastVisit).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAddPoints(customer.id, 100)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Tặng 100 điểm"
                      >
                        <Gift className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingCustomer ? 'Chỉnh Sửa Khách Hàng' : 'Thêm Khách Hàng Mới'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khách hàng *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingCustomer(null)
                    setFormData({
                      name: '',
                      phone: '',
                      email: '',
                      address: '',
                      birthDate: '',
                      preferences: []
                    })
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {editingCustomer ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
