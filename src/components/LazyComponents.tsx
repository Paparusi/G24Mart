import dynamic from 'next/dynamic'
import React from 'react'

// Loading component with enhanced UX
const LoadingComponent: React.FC<{ text?: string; delay?: boolean }> = ({ 
  text = 'Đang tải...', 
  delay = false 
}) => {
  const [show, setShow] = React.useState(!delay)

  React.useEffect(() => {
    if (delay) {
      const timer = setTimeout(() => setShow(true), 200)
      return () => clearTimeout(timer)
    }
  }, [delay])

  if (!show) return null

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">{text}</p>
      </div>
    </div>
  )
}

// Error fallback for lazy components
const LazyErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Lỗi tải component</h3>
      <p className="text-gray-600 mb-4 text-sm">{error.message}</p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  </div>
)

// Lazy load POS Page
export const LazyPOSPage = dynamic(
  () => import('@/app/pos/page'),
  {
    loading: () => <LoadingComponent text="Đang tải hệ thống POS..." delay={true} />,
    ssr: false
  }
)

// Lazy load Inventory Page
export const LazyInventoryPage = dynamic(
  () => import('@/app/inventory/page'),
  {
    loading: () => <LoadingComponent text="Đang tải quản lý kho..." delay={true} />,
    ssr: false
  }
)

// Lazy load Reports Page
export const LazyReportsPage = dynamic(
  () => import('@/app/reports/page'),
  {
    loading: () => <LoadingComponent text="Đang tải báo cáo bán hàng..." delay={true} />,
    ssr: false
  }
)

// Lazy load Customer Page
export const LazyCustomersPage = dynamic(
  () => import('@/app/customers/page'),
  {
    loading: () => <LoadingComponent text="Đang tải quản lý khách hàng..." delay={true} />,
    ssr: false
  }
)

// Lazy load AI Assistant
export const LazyAIAssistant = dynamic(
  () => import('@/app/ai-assistant/page'),
  {
    loading: () => <LoadingComponent text="Đang tải trợ lý AI..." delay={true} />,
    ssr: false
  }
)

// Lazy load Dashboard
export const LazyDashboard = dynamic(
  () => import('@/app/dashboard/page'),
  {
    loading: () => <LoadingComponent text="Đang tải bảng điều khiển..." delay={true} />,
    ssr: false
  }
)

// Lazy load Orders Page
export const LazyOrdersPage = dynamic(
  () => import('@/app/orders/page'),
  {
    loading: () => <LoadingComponent text="Đang tải quản lý đơn hàng..." delay={true} />,
    ssr: false
  }
)

// Lazy load Settings Page
export const LazySettingsPage = dynamic(
  () => import('@/app/settings/page'),
  {
    loading: () => <LoadingComponent text="Đang tải cài đặt..." delay={true} />,
    ssr: false
  }
)

// Preload utilities
export const preloadComponent = {
  pos: () => import('@/app/pos/page'),
  inventory: () => import('@/app/inventory/page'),
  reports: () => import('@/app/reports/page'),
  customers: () => import('@/app/customers/page'),
  ai: () => import('@/app/ai-assistant/page'),
  dashboard: () => import('@/app/dashboard/page'),
  orders: () => import('@/app/orders/page'),
  settings: () => import('@/app/settings/page')
}

// Route-based preloading hook
export const useRoutePreloader = () => {
  const preloadRoute = React.useCallback((route: keyof typeof preloadComponent) => {
    if (typeof window !== 'undefined') {
      // Preload with low priority
      const timer = setTimeout(() => {
        preloadComponent[route]().catch(() => {
          // Silently handle preload failures
        })
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const preloadOnHover = React.useCallback((route: keyof typeof preloadComponent) => {
    return {
      onMouseEnter: () => preloadRoute(route),
      onFocus: () => preloadRoute(route)
    }
  }, [preloadRoute])

  return { preloadRoute, preloadOnHover }
}

// Intersection Observer for lazy loading optimization
export const useLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '50px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// Higher Order Component for lazy loading with intersection observer
export const withLazyLoad = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  loadingComponent?: React.ComponentType,
  options?: { threshold?: number; rootMargin?: string }
) => {
  return React.forwardRef<HTMLDivElement, P>((props, forwardedRef) => {
    const { ref, isVisible } = useLazyLoad(options?.threshold)
    const LoadingComp = loadingComponent || LoadingComponent

    return (
      <div ref={forwardedRef || ref}>
        {isVisible ? <Component {...(props as P)} /> : <LoadingComp />}
      </div>
    )
  })
}

// Bundle splitting utilities
export const bundlePresets = {
  critical: ['@/components/Navigation', '@/components/Header', '@/components/ErrorBoundary'],
  dashboard: ['@/app/dashboard/page', '@/components/StatsCard', '@/components/Chart'],
  pos: ['@/app/pos/page', '@/components/ProductGrid', '@/components/Cart'],
  management: ['@/app/inventory/page', '@/app/customers/page', '@/app/orders/page'],
  ai: ['@/app/ai-assistant/page', '@/lib/smartAI', '@/services/PerformanceMonitor'],
  reports: ['@/app/reports/page', '@/components/Analytics']
}

export default {
  LazyPOSPage,
  LazyInventoryPage,
  LazyReportsPage,
  LazyCustomersPage,
  LazyAIAssistant,
  LazyDashboard,
  LazyOrdersPage,
  LazySettingsPage,
  preloadComponent,
  useRoutePreloader,
  useLazyLoad,
  withLazyLoad
}
