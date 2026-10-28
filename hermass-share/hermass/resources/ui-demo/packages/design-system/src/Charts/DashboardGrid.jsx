/**
 * DashboardGrid - 统一看板布局组件
 * 支持 mini、small、medium、wide、full 等卡片尺寸
 */

import './DashboardGrid.css'

// 尺寸对应的 grid column span
const SIZE_SPANS = {
  mini: 1,
  small: 2,
  medium: 3,
  wide: 4,
  full: 6,
}

// 断点列数配置（12 列网格）
const BREAKPOINT_COLUMNS = {
  default: 6,
}

export default function DashboardGrid({
  children,
  className,
  style,
  gap = 16,
  sectionGap = 24,
  columns = 6,
  display = 'grid',
}) {
  const gridStyle = {
    '--ds-dashboard-grid-gap': `${gap}px`,
    '--ds-dashboard-grid-columns': columns,
  }

  const classes = [
    'ds-dashboard-grid',
    `ds-dashboard-grid--${display}`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      style={{ ...gridStyle, ...style }}
    >
      {children}
    </div>
  )
}

/**
 * DashboardGridItem - 看板项
 * 用于包裹 ChartCard，控制其在网格中的占位
 */
export function DashboardGridItem({
  children,
  size = 'medium',
  span,
  className,
  style,
  ...restProps
}) {
  const computedSpan = span || SIZE_SPANS[size] || 3

  const itemStyle = {
    '--ds-dashboard-grid-item-span': computedSpan,
    ...style,
  }

  return (
    <div
      className={['ds-dashboard-grid__item', className].filter(Boolean).join(' ')}
      style={itemStyle}
      {...restProps}
    >
      {children}
    </div>
  )
}

// 默认尺寸配置
export const DASHBOARD_SIZES = SIZE_SPANS