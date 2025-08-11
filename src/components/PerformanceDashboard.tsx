'use client'
import React from 'react'
import { usePerformance } from '@/providers/PerformanceProvider'

interface PerformanceDashboardProps {
  isOpen: boolean
  onClose: () => void
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { metrics, getReport } = usePerformance()
  const [report, setReport] = React.useState<any>(null)
  const [autoRefresh, setAutoRefresh] = React.useState(true)

  React.useEffect(() => {
    if (isOpen && autoRefresh) {
      const interval = setInterval(() => {
        setReport(getReport())
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isOpen, autoRefresh, getReport])

  React.useEffect(() => {
    if (isOpen) {
      setReport(getReport())
    }
  }, [isOpen, getReport])

  if (!isOpen) return null

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 75) return 'text-yellow-600 bg-yellow-100'
    if (score >= 60) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const formatValue = (value: any, unit = 'ms') => {
    if (typeof value === 'number') {
      return value < 1000 ? `${Math.round(value)}${unit}` : `${(value / 1000).toFixed(1)}s`
    }
    return 'N/A'
  }

  const getCoreWebVitalsStatus = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 }
    }

    const threshold = thresholds[metric]
    if (!threshold) return 'unknown'
    
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[var(--z-modal)] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">Performance Dashboard</h2>
            <p className="text-blue-100 text-sm">Giám sát hiệu suất thời gian thực</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Tự động làm mới</span>
            </label>
            <button
              onClick={() => setReport(getReport())}
              className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm hover:bg-opacity-30 transition-colors"
            >
              Làm mới
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {report ? (
            <div className="space-y-6">
              {/* Overall Performance Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                  <div className="card-body text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold mb-3 ${getScoreColor(report.rating?.score || 0)}`}>
                      {report.rating?.score || 0}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Điểm tổng thể</h3>
                    <p className="text-gray-600">Xếp hạng: {report.rating?.grade || 'N/A'}</p>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin chung</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-medium">
                          {report.timestamp ? new Date(report.timestamp).toLocaleTimeString('vi-VN') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">URL:</span>
                        <span className="font-medium truncate ml-2" title={report.url}>
                          {report.url ? new URL(report.url).pathname : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Bộ nhớ</h3>
                    {metrics.memory ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Đã sử dụng:</span>
                          <span className="font-medium">{metrics.memory.used}MB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tổng cộng:</span>
                          <span className="font-medium">{metrics.memory.total}MB</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((metrics.memory.used / metrics.memory.total) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Không có dữ liệu bộ nhớ</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Core Web Vitals */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-xl font-semibold">Core Web Vitals</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { key: 'LCP', name: 'Largest Contentful Paint', unit: 'ms' },
                      { key: 'FID', name: 'First Input Delay', unit: 'ms' },
                      { key: 'CLS', name: 'Cumulative Layout Shift', unit: '' }
                    ].map(({ key, name, unit }) => {
                      const value = metrics[key] || 0
                      const status = getCoreWebVitalsStatus(key, value)
                      const statusText = {
                        'good': 'Tốt',
                        'needs-improvement': 'Cần cải thiện',
                        'poor': 'Kém',
                        'unknown': 'Không xác định'
                      }[status]

                      return (
                        <div key={key} className="text-center">
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            {key === 'CLS' ? (value || 0).toFixed(3) : formatValue(value, unit)}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{name}</div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {statusText}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold">Các chỉ số khác</h3>
                  </div>
                  <div className="card-body">
                    <div className="space-y-3">
                      {Object.entries(metrics).map(([key, value]) => {
                        if (['LCP', 'FID', 'CLS', 'memory', 'LCP_detailed', 'FID_detailed', 'CLS_detailed'].includes(key)) {
                          return null
                        }
                        
                        return (
                          <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-gray-600 text-sm">{key}:</span>
                            <span className="font-medium text-sm">
                              {typeof value === 'number' ? formatValue(value) : String(value)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold">Khuyến nghị</h3>
                  </div>
                  <div className="card-body">
                    {report.recommendations && report.recommendations.length > 0 ? (
                      <ul className="space-y-2">
                        {report.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">Hiệu suất tốt! Không có khuyến nghị nào.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Metrics (if available) */}
              {(metrics.LCP_detailed || metrics.FID_detailed || metrics.CLS_detailed) && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold">Chi tiết kỹ thuật</h3>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {metrics.LCP_detailed && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">LCP Chi tiết</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Thời gian: {formatValue(metrics.LCP_detailed.value)}</div>
                            <div>Element: {metrics.LCP_detailed.element}</div>
                            {metrics.LCP_detailed.url && <div>URL: {metrics.LCP_detailed.url}</div>}
                          </div>
                        </div>
                      )}
                      
                      {metrics.FID_detailed && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">FID Chi tiết</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Độ trễ: {formatValue(metrics.FID_detailed.value)}</div>
                            <div>Event: {metrics.FID_detailed.name}</div>
                            <div>Target: {metrics.FID_detailed.target}</div>
                          </div>
                        </div>
                      )}
                      
                      {metrics.CLS_detailed && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">CLS Chi tiết</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Score: {metrics.CLS_detailed.value}</div>
                            <div>Entries: {metrics.CLS_detailed.entries?.length || 0}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang thu thập dữ liệu hiệu suất...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook để sử dụng Performance Dashboard
export const usePerformanceDashboard = () => {
  const [isOpen, setIsOpen] = React.useState(false)

  const openDashboard = React.useCallback(() => setIsOpen(true), [])
  const closeDashboard = React.useCallback(() => setIsOpen(false), [])

  return {
    isOpen,
    openDashboard,
    closeDashboard,
    PerformanceDashboard: React.useCallback((props: Omit<PerformanceDashboardProps, 'isOpen' | 'onClose'>) => (
      <PerformanceDashboard {...props} isOpen={isOpen} onClose={closeDashboard} />
    ), [isOpen, closeDashboard])
  }
}

export default PerformanceDashboard
