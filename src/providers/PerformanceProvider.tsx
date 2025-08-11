'use client'
import React from 'react'
import { performanceMonitor } from '@/services/PerformanceMonitor'

interface PerformanceContextType {
  metrics: Record<string, any>
  getReport: () => any
  markEvent: (name: string) => void
  measureEvent: (name: string, startMark: string, endMark?: string) => number
}

const PerformanceContext = React.createContext<PerformanceContextType | null>(null)

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [metrics, setMetrics] = React.useState<Record<string, any>>({})

  React.useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.init()

    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics())
    }, 5000)

    // Cleanup on unmount
    return () => {
      clearInterval(interval)
      performanceMonitor.cleanup()
    }
  }, [])

  const contextValue: PerformanceContextType = {
    metrics,
    getReport: () => performanceMonitor.generateReport(),
    markEvent: (name: string) => performanceMonitor.mark(name),
    measureEvent: (name: string, startMark: string, endMark?: string) => 
      performanceMonitor.measure(name, startMark, endMark)
  }

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  )
}

export const usePerformance = () => {
  const context = React.useContext(PerformanceContext)
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

// Hook for component performance tracking
export const useComponentPerformance = (componentName: string) => {
  const { markEvent, measureEvent } = usePerformance()
  const mountTime = React.useRef<string>('')
  
  React.useEffect(() => {
    const mountMark = `${componentName}_mount_start`
    const mountedMark = `${componentName}_mount_end`
    
    mountTime.current = mountMark
    markEvent(mountMark)
    
    // Mark mounted
    const timer = setTimeout(() => {
      markEvent(mountedMark)
      measureEvent(`${componentName}_mount_time`, mountMark, mountedMark)
    }, 0)

    return () => {
      clearTimeout(timer)
      const unmountMark = `${componentName}_unmount`
      markEvent(unmountMark)
      if (mountTime.current) {
        measureEvent(`${componentName}_lifecycle`, mountTime.current, unmountMark)
      }
    }
  }, [componentName, markEvent, measureEvent])

  const trackUserAction = React.useCallback((actionName: string) => {
    const actionMark = `${componentName}_${actionName}_${Date.now()}`
    markEvent(actionMark)
    return actionMark
  }, [componentName, markEvent])

  const measureUserAction = React.useCallback((actionName: string, startMark: string) => {
    const endMark = `${componentName}_${actionName}_end_${Date.now()}`
    markEvent(endMark)
    return measureEvent(`${componentName}_${actionName}`, startMark, endMark)
  }, [componentName, markEvent, measureEvent])

  return {
    trackUserAction,
    measureUserAction,
    markEvent: (name: string) => markEvent(`${componentName}_${name}`)
  }
}

// Performance monitoring HOC
export const withPerformanceTracking = <P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component'
  
  const PerformanceTrackedComponent = React.forwardRef<any, P>((props, ref) => {
    useComponentPerformance(displayName)
    
    return <WrappedComponent {...(props as P)} ref={ref} />
  })

  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${displayName})`
  
  return PerformanceTrackedComponent
}

export default PerformanceProvider
