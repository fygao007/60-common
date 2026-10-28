import { createRoot } from 'react-dom/client'

export const PAGE_GENERATION_CONTRACT = 'v1'
export const PAGE_TEMPLATE = 'react-business-page'
import { useMemo } from 'react'
import { DSButton, DSCard, DSDashboardGrid, DSDashboardGridItem, DSPageHeader } from '@wisedu/design-system'
import { categoryStats } from './warning-data.js'
import './warning-home.css'

// 首页预警提醒区：按预警事项分类统计数量 + 「查看全部」跳转预警记录页（需求卡确认）
// 页面均位于 admin/ 下，兄弟目录相对路径即页面路由（与 featureRoutes 同源）
const RECORD_HREF = '../warning-record/warning-record.html'

function WarningHomePage() {
  const stats = useMemo(() => categoryStats(), [])
  const totalPending = stats.reduce((sum, item) => sum + item.pending, 0)

  return (
    <main className="wh-page" data-ds-business-page="warning-home">
      <DSPageHeader
        title="预警提醒"
        description={`人事事项到期预警 · 当前未处理预警共 ${totalPending} 条`}
        actions={
          <DSButton variant="primary" onClick={() => { window.location.href = RECORD_HREF }}>
            查看全部预警记录
          </DSButton>
        }
      />

      <DSDashboardGrid columns={4} gap={12}>
        {stats.map((item) => (
          <DSDashboardGridItem key={item.key} size="mini">
            <DSCard layout="long" className="wh-stat-card">
              <span className="wh-stat-label">{item.label}</span>
              <strong className="wh-stat-value">{item.total}</strong>
              <span className="wh-stat-sub">
                <i className={`wh-dot ${item.pending ? 'is-warn' : 'is-done'}`} aria-hidden="true" />
                {item.pending ? `未处理 ${item.pending} 条` : '均已处理'}
              </span>
            </DSCard>
          </DSDashboardGridItem>
        ))}
      </DSDashboardGrid>
    </main>
  )
}

createRoot(document.getElementById('app')).render(<WarningHomePage />)
