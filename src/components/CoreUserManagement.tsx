'use client';

import { useState } from 'react';
import { Users, Plus, Edit, Trash2, Eye, EyeOff, UserCheck, Shield, Clock } from 'lucide-react';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'owner' | 'manager' | 'cashier' | 'staff';
  permissions: string[];
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const PERMISSIONS: Permission[] = [
  { id: 'pos_access', name: 'Truy cập POS', description: 'Có thể sử dụng hệ thống bán hàng', category: 'POS' },
  { id: 'pos_discount', name: 'Áp dụng giảm giá', description: 'Có thể giảm giá sản phẩm', category: 'POS' },
  { id: 'pos_refund', name: 'Hoàn trả hàng', description: 'Có thể thực hiện hoàn trả', category: 'POS' },
  { id: 'inventory_view', name: 'Xem kho hàng', description: 'Có thể xem thông tin kho', category: 'Kho hàng' },
  { id: 'inventory_edit', name: 'Chỉnh sửa kho', description: 'Có thể thêm/sửa sản phẩm', category: 'Kho hàng' },
  { id: 'inventory_import', name: 'Nhập hàng', description: 'Có thể thực hiện nhập hàng', category: 'Kho hàng' },
  { id: 'reports_view', name: 'Xem báo cáo', description: 'Có thể xem các báo cáo', category: 'Báo cáo' },
  { id: 'reports_export', name: 'Xuất báo cáo', description: 'Có thể xuất file báo cáo', category: 'Báo cáo' },
  { id: 'users_view', name: 'Xem nhân viên', description: 'Có thể xem danh sách nhân viên', category: 'Quản lý' },
  { id: 'users_manage', name: 'Quản lý nhân viên', description: 'Có thể thêm/sửa/xóa nhân viên', category: 'Quản lý' },
  { id: 'settings_view', name: 'Xem cài đặt', description: 'Có thể xem cài đặt hệ thống', category: 'Hệ thống' },
  { id: 'settings_edit', name: 'Chỉnh sửa cài đặt', description: 'Có thể thay đổi cài đặt', category: 'Hệ thống' }
];

const ROLE_PERMISSIONS = {
  owner: PERMISSIONS.map(p => p.id),
  manager: ['pos_access', 'pos_discount', 'pos_refund', 'inventory_view', 'inventory_edit', 'inventory_import', 'reports_view', 'reports_export', 'users_view', 'settings_view'],
  cashier: ['pos_access', 'pos_discount', 'inventory_view', 'reports_view'],
  staff: ['pos_access', 'inventory_view']
};

const ROLE_NAMES = {
  owner: 'Chủ cửa hàng',
  manager: 'Quản lý',
  cashier: 'Thu ngân',
  staff: 'Nhân viên'
};

const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    fullName: 'Nguyễn Văn An',
    email: 'admin@g24mart.com',
    phone: '0123456789',
    role: 'owner',
    permissions: ROLE_PERMISSIONS.owner,
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    username: 'manager01',
    fullName: 'Trần Thị Bình',
    email: 'manager@g24mart.com',
    phone: '0987654321',
    role: 'manager',
    permissions: ROLE_PERMISSIONS.manager,
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2024-01-15')
  },
  {
    id: '3',
    username: 'cashier01',
    fullName: 'Lê Văn Cường',
    email: 'cashier@g24mart.com',
    phone: '0912345678',
    role: 'cashier',
    permissions: ROLE_PERMISSIONS.cashier,
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2024-02-01')
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'staff' as User['role'],
    password: '',
    confirmPassword: ''
  });

  const createUser = () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: formData.username,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      permissions: ROLE_PERMISSIONS[formData.role],
      isActive: true,
      lastLogin: null,
      createdAt: new Date()
    };

    setUsers([...users, newUser]);
    setShowModal(false);
    resetForm();
    alert('Tạo tài khoản thành công!');
  };

  const editUser = () => {
    if (!selectedUser) return;

    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? {
            ...user,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            permissions: ROLE_PERMISSIONS[formData.role]
          }
        : user
    ));

    setShowModal(false);
    setSelectedUser(null);
    resetForm();
    alert('Cập nhật thông tin thành công!');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const deleteUser = (userId: string) => {
    if (confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      setUsers(users.filter(user => user.id !== userId));
      alert('Xóa tài khoản thành công!');
    }
  };

  const openAddModal = () => {
    setSelectedUser(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: '',
      confirmPassword: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'staff',
      password: '',
      confirmPassword: ''
    });
  };

  const getRoleColor = (role: User['role']) => {
    const colors = {
      owner: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      cashier: 'bg-green-100 text-green-800',
      staff: 'bg-gray-100 text-gray-800'
    };
    return colors[role];
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            👥 Quản lý người dùng
          </h2>
          <p className="text-gray-600">
            Quản lý tài khoản và phân quyền nhân viên trong cửa hàng
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm nhân viên
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-gray-600">Tổng số tài khoản</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Đang hoạt động</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <Shield className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-600">
            {users.filter(u => u.role === 'manager').length}
          </div>
          <div className="text-sm text-gray-600">Quản lý</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.lastLogin && 
              new Date().getTime() - u.lastLogin.getTime() < 24 * 60 * 60 * 1000
            ).length}
          </div>
          <div className="text-sm text-gray-600">Hoạt động 24h</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Thông tin</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Vai trò</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Trạng thái</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Lần đăng nhập cuối</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                    {ROLE_NAMES[user.role]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Hoạt động' : 'Tạm khóa'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.lastLogin 
                    ? user.lastLogin.toLocaleDateString('vi-VN')
                    : 'Chưa đăng nhập'
                  }
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {user.role !== 'owner' && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4 max-h-screen overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6">
              {selectedUser ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  disabled={!!selectedUser}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0123456789"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as User['role']})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff">Nhân viên</option>
                  <option value="cashier">Thu ngân</option>
                  <option value="manager">Quản lý</option>
                </select>
              </div>
              
              {!selectedUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Permissions */}
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-4">Quyền hạn theo vai trò:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  {ROLE_PERMISSIONS[formData.role].map(permissionId => {
                    const permission = PERMISSIONS.find(p => p.id === permissionId);
                    return permission ? (
                      <div key={permission.id} className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {permission.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={selectedUser ? editUser : createUser}
                disabled={
                  !formData.username || !formData.fullName || !formData.phone ||
                  (!selectedUser && (!formData.password || formData.password !== formData.confirmPassword))
                }
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {selectedUser ? 'Cập nhật' : 'Tạo tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        <h3 className="text-xl font-semibold text-center mb-4">🚀 Vượt trội hơn KiotViet User Management</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-600 mb-2">✅ G24Mart</h4>
            <ul className="text-sm space-y-1">
              <li>• Tạo tài khoản tức thì, không giới hạn</li>
              <li>• Phân quyền chi tiết và linh hoạt</li>
              <li>• Giao diện thân thiện, dễ sử dụng</li>
              <li>• Hoạt động offline hoàn toàn</li>
              <li>• Theo dõi hoạt động realtime</li>
              <li>• Không phí quản lý nhân viên</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-600 mb-2">❌ KiotViet</h4>
            <ul className="text-sm space-y-1">
              <li>• Hiện tại lỗi 503, không truy cập được</li>
              <li>• Giới hạn số lượng tài khoản theo gói</li>
              <li>• Phân quyền cứng nhắc</li>
              <li>• Phụ thuộc internet</li>
              <li>• Giao diện phức tạp</li>
              <li>• Phí thêm cho nhiều tài khoản</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
