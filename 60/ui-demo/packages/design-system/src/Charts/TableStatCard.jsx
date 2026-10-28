/**
 * TableStatCard - 表格形式统计卡片
 * 用于展示不适合画图、但需要统计汇总的数据
 */

import './TableStatCard.css'

// 状态标签样式（语义色）
const STATUS_STYLES = {
  normal: {
    bg: '#e0e7ff',
    color: '#3d4af5',
    label: '正常',
  },
  attention: {
    bg: '#fef3c7',
    color: '#d97706',
    label: '关注',
  },
  risk: {
    bg: '#fee2e2',
    color: '#dc2626',
    label: '风险',
  },
}

function StatusTag({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.normal
  return (
    <span
      className="table-stat-card__status-tag"
      style={{
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {style.label}
    </span>
  )
}

export default function TableStatCard({
  title,
  columns,
  data,
  className,
  style,
}) {
  if (!data || data.length === 0) return null

  return (
    <section
      className={['table-stat-card', className].filter(Boolean).join(' ')}
      style={style}
    >
      {title ? (
        <header className="table-stat-card__header">
          <h3 className="table-stat-card__title">{title}</h3>
        </header>
      ) : null}

      <div className="table-stat-card__table-wrapper">
        <table className="table-stat-card__table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={col.key || index} className="table-stat-card__th">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="table-stat-card__tr">
                {columns.map((col, colIndex) => (
                  <td key={col.key || colIndex} className="table-stat-card__td">
                    {col.key === 'status' ? (
                      <StatusTag status={row[col.key]} />
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}