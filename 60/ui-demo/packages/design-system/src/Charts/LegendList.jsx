/**
 * LegendList - 业务图例组件
 * 不使用 ECharts 内部 legend，统一图例样式
 */

import './LegendList.css'

export default function LegendList({ data, colors, total, unit }) {
  if (!data || data.length === 0) return null

  const totalValue = total || data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="legend-list">
      {data.map((item, index) => {
        const percent = ((item.value / totalValue) * 100).toFixed(1)
        const color = colors[index]

        return (
          <div key={item.name || index} className="legend-item">
            <span
              className="legend-dot"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="legend-name">{item.name}</span>
            <span className="legend-value">
              {item.value}{unit ? ` ${unit}` : ''}
            </span>
            <span className="legend-percent">{percent}%</span>
          </div>
        )
      })}
    </div>
  )
}