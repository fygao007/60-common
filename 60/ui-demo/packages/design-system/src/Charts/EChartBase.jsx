/**
 * EChartBase - 底层图表实例组件
 * 负责 ECharts 初始化、setOption、resize、dispose
 * 只处理图表实例，不处理业务标题、图例、卡片布局
 */

import { useEffect, useRef, useCallback } from 'react'
import * as echarts from 'echarts'

function EChartBase({
  option,
  style,
  className,
  onChartReady,
  resizeDebounce = 200,
  theme = 'default',
  ...restProps
}) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const resizeTimerRef = useRef(null)

  // 初始化图表
  const initChart = useCallback(() => {
    if (!containerRef.current) return

    // 销毁旧实例
    if (chartRef.current) {
      chartRef.current.dispose()
    }

    // 创建新实例
    chartRef.current = echarts.init(containerRef.current, theme)

    // 设置配置
    if (option) {
      chartRef.current.setOption(option, true)
    }

    // 回调
    if (onChartReady) {
      onChartReady(chartRef.current)
    }
  }, [option, theme, onChartReady])

  // 更新配置
  const updateOption = useCallback((newOption) => {
    if (chartRef.current && newOption) {
      chartRef.current.setOption(newOption, true)
    }
  }, [])

  // 调整尺寸
  const resizeChart = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.resize()
    }
  }, [])

  // 初始化
  useEffect(() => {
    initChart()

    // 清理
    return () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current)
      }
      if (chartRef.current) {
        chartRef.current.dispose()
        chartRef.current = null
      }
    }
  }, [initChart])

  // 监听 option 变化
  useEffect(() => {
    updateOption(option)
  }, [option, updateOption])

  // 监听窗口 resize
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current)
      }
      resizeTimerRef.current = setTimeout(() => {
        resizeChart()
      }, resizeDebounce)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current)
      }
    }
  }, [resizeChart, resizeDebounce])

  // 监听容器尺寸变化（使用 ResizeObserver）
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      resizeChart()
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [resizeChart])

  return (
    <div
      ref={containerRef}
      className={['ds-echart-base', className].filter(Boolean).join(' ')}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
      {...restProps}
    />
  )
}

export default EChartBase