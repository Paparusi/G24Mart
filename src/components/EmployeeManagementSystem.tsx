import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier' | 'stockkeeper';
  permissions: string[];
  status: 'active' | 'inactive';
  hireDate: string;
  salary: number;
  commissionRate: number;
  totalSales: number;
  workingHours: number;
  lastLogin: string;
  avatar?: string;
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime?: string;
  totalSales: number;
  totalTransactions: number;
  cashDrawerStart: number;
  cashDrawerEnd?: number;
  status: 'active' | 'completed' | 'missed';
}

const EmployeeManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'shifts' | 'performance' | 'payroll'>('employees');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Mock employees data
  const [employees] = useState<Employee[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@g24mart.com',
      role: 'admin',
      permissions: ['all'],
      status: 'active',
      hireDate: '2024-01-15',
      salary: 5000,
      commissionRate: 0.02,
      totalSales: 25000,
      workingHours: 160,
      lastLogin: '2025-01-11T09:30:00'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@g24mart.com',
      role: 'manager',
      permissions: ['inventory', 'reports', 'employees'],
      status: 'active',
      hireDate: '2024-03-10',
      salary: 4000,
      commissionRate: 0.015,
      totalSales: 18000,
      workingHours: 150,
      lastLogin: '2025-01-11T08:15:00'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@g24mart.com', 
      role: 'cashier',
      permissions: ['pos', 'customers'],
      status: 'active',
      hireDate: '2024-06-20',
      salary: 2500,
      commissionRate: 0.01,
      totalSales: 12000,
      workingHours: 140,
      lastLogin: '2025-01-10T18:45:00'
    }
  ]);

  const [shifts] = useState<Shift[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'John Doe',
      startTime: '2025-01-11T09:00:00',
      endTime: '2025-01-11T17:00:00',
      totalSales: 1200,
      totalTransactions: 48,
      cashDrawerStart: 500,
      cashDrawerEnd: 480,
      status: 'completed'
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Jane Smith',
      startTime: '2025-01-11T08:00:00',
      totalSales: 800,
      totalTransactions: 32,
      cashDrawerStart: 300,
      status: 'active'
    }
  ]);

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    cashier: 'bg-green-100 text-green-800',
    stockkeeper: 'bg-yellow-100 text-yellow-800'
  };

  const renderEmployees = () => (
    <div className="space-y-6">
      {/* Add Employee Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Employee Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <span>+</span>
          <span>Add Employee</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-500">{employee.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[employee.role]}`}>
                {employee.role}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${employee.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {employee.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sales:</span>
                <span className="font-medium text-gray-900">${employee.totalSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commission:</span>
                <span className="font-medium text-gray-900">{(employee.commissionRate * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Login:</span>
                <span className="font-medium text-gray-900">
                  {new Date(employee.lastLogin).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => setSelectedEmployee(employee)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm hover:bg-gray-200"
              >
                View Details
              </button>
              <button className="bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShifts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Shift Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Start New Shift
        </button>
      </div>

      {/* Active Shifts */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Shifts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {shifts.filter(s => s.status === 'active').map((shift) => (
            <div key={shift.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{shift.employeeName}</h4>
                    <p className="text-sm text-gray-500">
                      Started at {new Date(shift.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-right">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">${shift.totalSales}</p>
                    <p className="text-xs text-gray-500">Total Sales</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{shift.totalTransactions}</p>
                    <p className="text-xs text-gray-500">Transactions</p>
                  </div>
                  <div>
                    <button className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm hover:bg-red-200">
                      End Shift
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Completed Shifts */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Shifts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cash Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shifts.filter(s => s.status === 'completed').map((shift) => {
                const duration = shift.endTime ? 
                  Math.round((new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60)) : 0;
                const cashBalance = (shift.cashDrawerEnd || 0) - shift.cashDrawerStart;
                
                return (
                  <tr key={shift.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {shift.employeeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(shift.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {duration}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${shift.totalSales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`${cashBalance === 0 ? 'text-green-600' : cashBalance > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ${cashBalance > 0 ? '+' : ''}${cashBalance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {employees.map((employee) => {
          const avgSalesPerHour = employee.workingHours > 0 ? employee.totalSales / employee.workingHours : 0;
          const commission = employee.totalSales * employee.commissionRate;
          
          return (
            <div key={employee.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{employee.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[employee.role]}`}>
                    {employee.role}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Sales:</span>
                  <span className="text-sm font-medium text-gray-900">${employee.totalSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg/Hour:</span>
                  <span className="text-sm font-medium text-gray-900">${avgSalesPerHour.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Commission:</span>
                  <span className="text-sm font-medium text-green-600">${commission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hours:</span>
                  <span className="text-sm font-medium text-gray-900">{employee.workingHours}h</span>
                </div>
              </div>
              
              {/* Performance Rating */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Performance</span>
                  <span className="text-xs font-medium text-gray-900">
                    {avgSalesPerHour > 100 ? 'Excellent' : avgSalesPerHour > 75 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${avgSalesPerHour > 100 ? 'bg-green-500' : avgSalesPerHour > 75 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                    style={{ width: `${Math.min((avgSalesPerHour / 150) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPayroll = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Payroll Management</h2>
      
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => {
                const commission = employee.totalSales * employee.commissionRate;
                const totalEarnings = employee.salary + commission;
                
                return (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-semibold text-gray-600">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${employee.salary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      ${commission.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.workingHours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${totalEarnings.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Generate Payslip
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        View History
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Management System</h1>
          <p className="mt-2 text-gray-600">Manage staff, shifts, performance, and payroll</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'employees', label: 'Employees' },
              { id: 'shifts', label: 'Shifts' },
              { id: 'performance', label: 'Performance' },
              { id: 'payroll', label: 'Payroll' }
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
        {activeTab === 'employees' && renderEmployees()}
        {activeTab === 'shifts' && renderShifts()}
        {activeTab === 'performance' && renderPerformance()}
        {activeTab === 'payroll' && renderPayroll()}

        {/* Employee Details Modal */}
        {selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Employee Details</h3>
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <span className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${roleColors[selectedEmployee.role]}`}>
                      {selectedEmployee.role}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedEmployee.hireDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Permissions</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedEmployee.permissions.map((permission) => (
                      <span key={permission} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Base Salary</label>
                    <p className="mt-1 text-sm text-gray-900">${selectedEmployee.salary.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Commission Rate</label>
                    <p className="mt-1 text-sm text-gray-900">{(selectedEmployee.commissionRate * 100)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagementSystem;
