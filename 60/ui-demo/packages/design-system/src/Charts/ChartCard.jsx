/**
 * ChartCard - 统一图表卡片组件
 * 结构：Header(56px) + Body(图表区) + Insight(洞察区) + Footer(可选)
 *
 * 按图表类型固定容器高度：
 * - donut / barHorizontal / progressRing: 180px
 * - line / areaLine: 260px
 */

import { useState, useMemo, useCallback } from 'react'
import EChartBase from './EChartBase'
import LegendList from './LegendList'
import buildChartOption from './buildChartOption'
import chartTheme, { getPaletteColors } from './chartTheme'
import './ChartCard.css'

// 各图表类型的容器高度
const CHART_HEIGHT = {
  donut: 300,
  donutCallout: 420,
  pie: 300,
  barHorizontal: 260,
  progressRing: 260,
  line: 300,
  areaLine: 300,
  barVertical: 260,
  rankBar: 240,
  radar: 300,
}

// 默认高度
const DEFAULT_HEIGHT = 260

function ChartHeader({ title }) {
  if (!title) return null
  return (
    <header className="ds-chart-card__header">
      <h3 className="ds-chart-card__title">{title}</h3>
    </header>
  )
}

/**
 * donut/pie 专用布局：图表 + 图例左右布局
 */
function DonutLayout({ chartOption, data, total, unit, height, palette }) {
  const colors = useMemo(() => {
    return getPaletteColors(palette || 'blue', (data || []).length)
  }, [data, palette])

  if (!data || data.length === 0) return null

  return (
    <div className="chart-donut-layout">
      <div
        className="chart-donut-canvas"
        style={{ width: height, height: height }}
      >
        <EChartBase
          option={chartOption}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <LegendList data={data} colors={colors} total={total} unit={unit} />
    </div>
  )
}

/**
 * CalloutLegend - 顶部横向图例（用于 donutCallout）
 * 每项：色点 + 名称，横向排列，gap: 24px
 */
function CalloutLegend({ data, palette }) {
  const colors = useMemo(() => {
    return getPaletteColors(palette || 'blue', (data || []).length)
  }, [data, palette])

  if (!data || data.length === 0) return null

  return (
    <div className="chart-callout-legend">
      {data.map((item, index) => {
        const color = item.color || colors[index]
        return (
          <div key={item.name || index} className="chart-callout-legend__item">
            <span
              className="chart-callout-legend__dot"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="chart-callout-legend__name">{item.name}</span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * donutCallout 专用布局：顶部图例 + 图表
 */
function CalloutLayout({ chartOption, data, palette, total }) {
  if (!data || data.length === 0) return null

  return (
    <div className="chart-callout-layout">
      <CalloutLegend data={data} palette={palette} />
      <div className="chart-callout-canvas">
        <EChartBase
          option={chartOption}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  )
}

function ChartInsight({ insight }) {
  if (!insight) return null

  return (
    <div className="ds-chart-card__insight">
      <span className="ds-chart-card__insight-icon" aria-hidden="true">💡</span>
      <span className="ds-chart-card__insight-text">{insight}</span>
    </div>
  )
}

function ChartFooter({ footer, source, detailLink, onDetailClick }) {
  if (!footer && !source && !detailLink) return null

  return (
    <footer className="ds-chart-card__footer">
      {footer ? <div className="ds-chart-card__footer-content">{footer}</div> : null}
      {source ? (
        <span className="ds-chart-card__source">数据来源: {source}</span>
      ) : null}
      {detailLink ? (
        <button
          className="ds-chart-card__detail-link"
          onClick={onDetailClick}
          type="button"
        >
          查看详情
        </button>
      ) : null}
    </footer>
  )
}

function EmptyState({ message, subMessage }) {
  return (
    <div className="ds-chart-card__empty">
      <div className="ds-chart-card__empty-icon" aria-hidden="true">📊</div>
      <p className="ds-chart-card__empty-message">{message || '暂无可展示数据'}</p>
      {subMessage ? (
        <p className="ds-chart-card__empty-sub">{subMessage}</p>
      ) : null}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="ds-chart-card__loading">
      <div className="ds-chart-card__loading-skeleton">
        <div className="ds-chart-card__skeleton-line" />
        <div className="ds-chart-card__skeleton-block" />
        <div className="ds-chart-card__skeleton-line" />
      </div>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="ds-chart-card__error">
      <div className="ds-chart-card__error-icon" aria-hidden="true">⚠️</div>
      <p className="ds-chart-card__error-message">{message || '图表加载失败'}</p>
    </div>
  )
}

export default function ChartCard({
  // 图表配置
  id,
  title,
  type,
  size = 'medium',
  data,
  total,
  totalLabel,
  unit,
  insight,
  xAxisData,
  indicators,
  top,
  palette = 'blue',

  // 卡片配置
  className,
  style,
  chartHeight,

  // 状态
  loading = false,
  error = null,
  emptyMessage,
  emptySubMessage,

  // 页脚：自定义内容 / 数据来源 / 查看详情
  footer,
  source,
  detailLink,
  onDetailClick,

  // 其他
  onChartReady,
  ...restProps
}) {
  const [chartInstance, setChartInstance] = useState(null)

  // 计算图表高度：优先使用传入值，否则按 type 设定
  const calculatedHeight = useMemo(() => {
    if (chartHeight) return chartHeight
    return CHART_HEIGHT[type] || DEFAULT_HEIGHT
  }, [type, chartHeight])

  // 构建 ECharts option
  const chartOption = useMemo(() => {
    if (loading || error || !data || data.length === 0) {
      return null
    }

    return buildChartOption({
      type,
      data,
      total,
      totalLabel,
      unit,
      xAxisData,
      indicators,
      top,
      palette,
    })
  }, [type, data, total, totalLabel, unit, xAxisData, indicators, top, palette, loading, error])

  // 处理图表实例
  const handleChartReady = useCallback((instance) => {
    setChartInstance(instance)
    if (onChartReady) {
      onChartReady(instance)
    }
  }, [onChartReady])

  // 判断是否为空状态
  const isEmpty = !loading && !error && (!data || data.length === 0)

  // 卡片尺寸类
  const sizeClass = `ds-chart-card--${size}`

  // 是否为 donut/pie 类型（使用左右布局 + LegendList）
  const isPieOrDonut = (type === 'donut' || type === 'pie') && !loading && !error && !isEmpty

  // 是否为 donutCallout（顶部图例 + 引导线环形图，布局自定，不套固定高度）
  const isCallout = type === 'donutCallout' && !loading && !error && !isEmpty

  return (
    <section
      className={['ds-chart-card', sizeClass, className].filter(Boolean).join(' ')}
      style={style}
      aria-labelledby={id}
      {...restProps}
    >
      <ChartHeader title={title} />

      <div
        className="ds-chart-card__body"
        style={isCallout ? undefined : { height: calculatedHeight }}
      >
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : isEmpty ? (
          <EmptyState message={emptyMessage} subMessage={emptySubMessage} />
        ) : isCallout ? (
          <CalloutLayout chartOption={chartOption} data={data} palette={palette} total={total} />
        ) : isPieOrDonut ? (
          <DonutLayout
            chartOption={chartOption}
            data={data}
            total={total}
            unit={unit}
            height={calculatedHeight}
            palette={palette}
          />
        ) : (
          <EChartBase
            option={chartOption}
            onChartReady={handleChartReady}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

      <ChartInsight insight={insight} />
      <ChartFooter footer={footer} source={source} detailLink={detailLink} onDetailClick={onDetailClick} />
    </section>
  )
}

// 导出子组件供高级用法
export {
  ChartHeader,
  ChartInsight,
  EmptyState,
  LoadingState,
  ErrorState,
}