'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  loyaltyPoints: number
  totalSpent: number
  visitCount: number
  lastVisit: string
  memberSince: string
  tier: 'Đồng' | 'Bạc' | 'Vàng' | 'Platinum'
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    phone: '0123456789',
    email: 'an.nguyen@email.com',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    loyaltyPoints: 1250,
    totalSpent: 2500000,
    visitCount: 45,
    lastVisit: '2025-08-10',
    memberSince: '2024-12-15',
    tier: 'Vàng'
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    phone: '0987654321',
    email: 'binh.tran@email.com',
    loyaltyPoints: 850,
    totalSpent: 1700000,
    visitCount: 32,
    lastVisit: '2025-08-09',
    memberSince: '2025-01-20',
    tier: 'Bạc'
  },
  {
    id: '3',
    name: 'Lê Văn Cường',
    phone: '0345678901',
    loyaltyPoints: 2100,
    totalSpent: 4200000,
    visitCount: 78,
    lastVisit: '2025-08-10',
    memberSince: '2024-10-05',
    tier: 'Platinum'
  },
  {
    id: '4',
    name: 'Phạm Thị Dung',
    phone: '0567890123',
    email: 'dung.pham@email.com',
    loyaltyPoints: 320,
    totalSpent: 640000,
    visitCount: 15,
    lastVisit: '2025-08-08',
    memberSince: '2025-03-12',
    tier: 'Đồng'
  }
]

const loyaltyTiers = {
  'Đồng': { min: 0, color: 'bg-orange-100 text-orange-800', icon: '🥉' },
  'Bạc': { min: 500000, color: 'bg-gray-100 text-gray-800', icon: '🥈' },
  'Vàng': { min: 2000000, color: 'bg-yellow-100 text-yellow-800', icon: '🥇' },
  'Platinum': { min: 4000000, color: 'bg-purple-100 text-purple-800', icon: '💎' }
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState('Tất Cả')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [sortBy, setSortBy] = useState('name')

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })

  const tiers = ['Tất Cả', 'Đồng', 'Bạc', 'Vàng', 'Platinum']

  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm) ||
                           (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesTier = selectedTier === 'Tất Cả' || customer.tier === selectedTier
      return matchesSearch && matchesTier
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'vi-VN')
        case 'points':
          return b.loyaltyPoints - a.loyaltyPoints
        case 'spent':
          return b.totalSpent - a.totalSpent
        case 'visits':
          return b.visitCount - a.visitCount
        default:
          return 0
      }
    })

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert('Vui lòng nhập tên và số điện thoại!')
      return
    }

    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email || undefined,
      address: newCustomer.address || undefined,
      loyaltyPoints: 0,
      totalSpent: 0,
      visitCount: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      memberSince: new Date().toISOString().split('T')[0],
      tier: 'Đồng'
    }

    setCustomers([...customers, customer])
    setNewCustomer({ name: '', phone: '', email: '', address: '' })
    setShowAddForm(false)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setNewCustomer({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || ''
    })
    setShowAddForm(true)
  }

  const handleUpdateCustomer = () => {
    if (!editingCustomer) return

    setCustomers(customers.map(c => 
      c.id === editingCustomer.id 
        ? { ...c, ...newCustomer }
        : c
    ))
    setEditingCustomer(null)
    setNewCustomer({ name: '', phone: '', email: '', address: '' })
    setShowAddForm(false)
  }

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      setCustomers(customers.filter(c => c.id !== customerId))
    }
  }

  const addLoyaltyPoints = (customerId: string, points: number) => {
    setCustomers(customers.map(c => 
      c.id === customerId 
        ? { ...c, loyaltyPoints: c.loyaltyPoints + points }
        : c
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Về Trang Chủ
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Quản Lý Khách Hàng</h1>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true)
              setEditingCustomer(null)
              setNewCustomer({ name: '', phone: '', email: '', address: '' })
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Thêm Khách Hàng
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Khách Hàng</p>
                <p className="text-2xl font-semibold text-gray-900">{customers.length}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Khách VIP</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {customers.filter(c => c.tier === 'Platinum').length}
                </p>
              </div>
              <div className="text-3xl">💎</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điểm Thưởng</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0).toLocaleString()}
                </p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh Thu Từ KH</p>
                <p className="text-2xl font-semibold text-green-600">
                  {(customers.reduce((sum, c) => sum + c.totalSpent, 0)).toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {tiers.map(tier => (
                <option key={tier} value={tier}>{tier}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="points">Sắp xếp theo điểm</option>
              <option value="spent">Sắp xếp theo chi tiêu</option>
              <option value="visits">Sắp xếp theo lượt mua</option>
            </select>

            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Khách Hàng</th>
                  <th className="text-left py-3 px-4 font-semibold">Hạng</th>
                  <th className="text-left py-3 px-4 font-semibold">Điểm Thưởng</th>
                  <th className="text-left py-3 px-4 font-semibold">Tổng Chi Tiêu</th>
                  <th className="text-left py-3 px-4 font-semibold">Lượt Mua</th>
                  <th className="text-left py-3 px-4 font-semibold">Lần Cuối</th>
                  <th className="text-left py-3 px-4 font-semibold">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.phone}</div>
                        {customer.email && (
                          <div className="text-xs text-gray-500">{customer.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${loyaltyTiers[customer.tier].color}`}>
                        {loyaltyTiers[customer.tier].icon} {customer.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-yellow-600">{customer.loyaltyPoints.toLocaleString()}</div>
                      <button
                        onClick={() => {
                          const points = prompt('Nhập số điểm muốn cộng:')
                          if (points) addLoyaltyPoints(customer.id, parseInt(points))
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        + Cộng điểm
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-green-600">
                        {customer.totalSpent.toLocaleString('vi-VN')} ₫
                      </div>
                    </td>
                    <td className="py-3 px-4">{customer.visitCount} lần</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {new Date(customer.lastVisit).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6">
              {editingCustomer ? 'Sửa Thông Tin Khách Hàng' : 'Thêm Khách Hàng Mới'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên khách hàng *</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingCustomer(null)
                  setNewCustomer({ name: '', phone: '', email: '', address: '' })
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                {editingCustomer ? 'Cập Nhật' : 'Thêm Mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
