// Performance Monitoring Service
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, any> = new Map()
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Initialize performance monitoring
  init() {
    if (typeof window !== 'undefined') {
      this.observeWebVitals()
      this.observeLCP()
      this.observeFID()
      this.observeCLS()
      this.observeMemory()
    }
  }

  // Observe Core Web Vitals
  private observeWebVitals() {
    try {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.set('LCP', Math.round(lastEntry.startTime))
      }).observe({ type: 'largest-contentful-paint', buffered: true })

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          this.metrics.set('FID', Math.round(entry.processingStart - entry.startTime))
        })
      }).observe({ type: 'first-input', buffered: true })

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        let cls = 0
        entryList.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cls += entry.value
          }
        })
        this.metrics.set('CLS', Math.round(cls * 1000) / 1000)
      }).observe({ type: 'layout-shift', buffered: true })

    } catch (error) {
      
    }
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.set('LCP_detailed', {
          value: Math.round(lastEntry.startTime),
          element: (lastEntry as any).element?.tagName || 'unknown',
          url: (lastEntry as any).url || ''
        })
      })
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.push(observer)
    } catch (e) {}
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          this.metrics.set('FID_detailed', {
            value: Math.round(entry.processingStart - entry.startTime),
            name: entry.name,
            target: entry.target?.tagName || 'unknown'
          })
        })
      })
      observer.observe({ type: 'first-input', buffered: true })
      this.observers.push(observer)
    } catch (e) {}
  }

  private observeCLS() {
    let clsValue = 0
    const clsEntries: any[] = []

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            clsEntries.push({
              value: entry.value,
              sources: entry.sources?.map((source: any) => ({
                element: source.node?.tagName || 'unknown',
                previousRect: source.previousRect,
                currentRect: source.currentRect
              }))
            })
          }
        })
        
        this.metrics.set('CLS_detailed', {
          value: Math.round(clsValue * 1000) / 1000,
          entries: clsEntries.slice(-5) // Keep last 5 entries
        })
      })
      observer.observe({ type: 'layout-shift', buffered: true })
      this.observers.push(observer)
    } catch (e) {}
  }

  private observeMemory() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.metrics.set('memory', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        })
      }, 5000)
    }
  }

  // Custom performance marks
  mark(name: string) {
    if (typeof window !== 'undefined' && performance.mark) {
      performance.mark(name)
    }
  }

  measure(name: string, startMark: string, endMark?: string) {
    if (typeof window !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark)
        const measure = performance.getEntriesByName(name, 'measure')[0]
        this.metrics.set(name, Math.round(measure.duration))
        return Math.round(measure.duration)
      } catch (e) {
        
      }
    }
    return 0
  }

  // Get all metrics
  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  // Get specific metric
  getMetric(name: string) {
    return this.metrics.get(name)
  }

  // Performance report
  generateReport() {
    const metrics = this.getMetrics()
    const report = {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      metrics: metrics,
      rating: this.getRating(metrics),
      recommendations: this.getRecommendations(metrics)
    }

    return report
  }

  private getRating(metrics: any) {
    const lcp = metrics.LCP || 0
    const fid = metrics.FID || 0
    const cls = metrics.CLS || 0

    let score = 100

    // LCP scoring (0-2.5s = good, 2.5-4s = needs improvement, >4s = poor)
    if (lcp > 4000) score -= 30
    else if (lcp > 2500) score -= 15

    // FID scoring (0-100ms = good, 100-300ms = needs improvement, >300ms = poor)
    if (fid > 300) score -= 25
    else if (fid > 100) score -= 10

    // CLS scoring (0-0.1 = good, 0.1-0.25 = needs improvement, >0.25 = poor)
    if (cls > 0.25) score -= 25
    else if (cls > 0.1) score -= 10

    return {
      score: Math.max(0, score),
      grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'D'
    }
  }

  private getRecommendations(metrics: any) {
    const recommendations: string[] = []

    if (metrics.LCP > 2500) {
      recommendations.push('Optimize images and lazy loading')
      recommendations.push('Minimize render-blocking resources')
    }

    if (metrics.FID > 100) {
      recommendations.push('Break up long JavaScript tasks')
      recommendations.push('Use web workers for heavy computations')
    }

    if (metrics.CLS > 0.1) {
      recommendations.push('Add size attributes to images')
      recommendations.push('Reserve space for dynamic content')
    }

    if (metrics.memory?.used > 50) {
      recommendations.push('Optimize memory usage')
      recommendations.push('Clean up event listeners')
    }

    return recommendations
  }

  // Cleanup
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()
