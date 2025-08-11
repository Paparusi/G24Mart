'use client'
import React from 'react'
import { performanceMonitor } from '@/services/PerformanceMonitor'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
  retryCount: number
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void; errorId: string }>
  onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void
  maxRetries?: number
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = this.state.errorId || `error_${Date.now()}`
    
    // Log to performance monitor
    performanceMonitor.mark(`error_${errorId}`)
    
    // Enhanced error logging
    const errorData = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
      performance: performanceMonitor.getMetrics()
    }

    console.error('ErrorBoundary caught an error:', errorData)

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId)
    }

    // Send error to monitoring service (if available)
    this.sendErrorReport(errorData)

    this.setState({ errorInfo, errorId })
  }

  private sendErrorReport = async (errorData: any) => {
    try {
      // Here you could send to your error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // })
    } catch (e) {
      console.warn('Failed to send error report:', e)
    }
  }

  private retry = () => {
    const maxRetries = this.props.maxRetries || 3
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }))

      // Add delay before retry
      this.retryTimeoutId = setTimeout(() => {
        performanceMonitor.mark(`retry_${this.state.errorId}_${this.state.retryCount}`)
      }, 1000)
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          retry={this.retry}
          errorId={this.state.errorId || ''}
        />
      )
    }

    return this.props.children
  }
}

// Default fallback component
const DefaultErrorFallback: React.FC<{ 
  error: Error
  retry: () => void
  errorId: string
}> = ({ error, retry, errorId }) => {
  const [showDetails, setShowDetails] = React.useState(false)
  const [reportSent, setReportSent] = React.useState(false)

  const sendReport = async () => {
    try {
      // Simulate sending report
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReportSent(true)
    } catch (e) {
      console.error('Failed to send report:', e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600">Ứng dụng đã gặp phải một lỗi không mong muốn</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={retry}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Tải lại trang
          </button>

          <button
            onClick={sendReport}
            disabled={reportSent}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              reportSent
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
          >
            {reportSent ? 'Đã gửi báo cáo' : 'Báo cáo lỗi'}
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
          >
            {showDetails ? 'Ẩn chi tiết' : 'Hiện chi tiết lỗi'}
          </button>

          {showDetails && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <div className="mb-2">
                <strong>Mã lỗi:</strong> {errorId}
              </div>
              <div className="mb-2">
                <strong>Lỗi:</strong> {error.message}
              </div>
              <div className="mb-2">
                <strong>Thời gian:</strong> {new Date().toLocaleString('vi-VN')}
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  Stack trace
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </details>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Nếu lỗi tiếp tục xảy ra, vui lòng liên hệ bộ phận hỗ trợ
          </p>
        </div>
      </div>
    </div>
  )
}

// Hook for using error boundary
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    
    // Log error
    console.error('useErrorHandler caught error:', error)
    
    // Mark performance
    performanceMonitor.mark(`handled_error_${Date.now()}`)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, resetError }
}

export default ErrorBoundary
