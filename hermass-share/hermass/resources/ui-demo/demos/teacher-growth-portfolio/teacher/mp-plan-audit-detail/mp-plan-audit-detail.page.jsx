import { createRoot } from 'react-dom/client'

export const PAGE_GENERATION_CONTRACT = 'v1'
export const PAGE_TEMPLATE = 'react-business-page'

import { useMemo, useState } from 'react'
import {
  DSAlert,
  DSButtonGroup,
  DSEmptyState,
  DSDrawer,
  DSProcessDynamics,
  DSSubPageHeader,
  DSTabs,
} from '@wisedu/design-system'
import {
  AUDIT_CURRENT_PERSON,
  auditDetail,
  auditEvents,
  auditRows,
  businessStatusOf,
  canDecide,
  personName,
} from '../../shared/growth-plan-store.js'
import {
  AuditDetailBody,
  AuditStatusDot,
  auditListHref,
  businessTone,
  useAuditDecisionModals,
} from '../../shared/mp-audit-views.jsx'
import './mp-plan-audit-detail.css'

// M07-1 方案确认详情（列表页 M07 的详情页）
// 依据：《管理侧学校发展与师资队伍建设详细设计》M07（audit / custom 模式）
//  - 原实现把详情放在 DSAuditDetailDrawer 抽屉里，与 M02/M04/M06 的二级页形态不一致，
//    且抽屉宽度不足以承载六个分区，故改为独立页面：标题 + 提交与责任信息 + 六段详情 + 决定动作。
//  - 详情六段、状态指示、三个决定弹窗与列表页共用 shared/mp-audit-views.jsx（单一来源）。
//  - 确认人查看的是**冻结提交版本**，提交者的新草稿不覆盖本次审查内容。
//  - 退回必须填写意见并可标记问题位置；确认通过后固定配置版本与生效日期。
//  - 本页为只读审查页，不修改任何配置字段。

function readQuery() {
  const params = new URLSearchParams(window.location.search)
  const planId = params.get('planId') || ''
  if (planId) return { planId }
  // 已提升为左侧菜单正式项，支持无参数直接进入：缺省展示确认队列首条方案
  const first = auditRows()[0]
  return { planId: first ? first.planId : '' }
}

function PlanAuditDetailPage() {
  const query = useMemo(() => readQuery(), [])
  const [revision, setRevision] = useState(0)
  const [toast, setToast] = useState('')
  const [processOpen, setProcessOpen] = useState(false)
  const [processTab, setProcessTab] = useState('timeline')

  const row = useMemo(
    () => (query.planId ? auditRows().find((item) => item.planId === query.planId) || null : null),
    [query.planId, revision],
  )
  const detail = useMemo(() => (query.planId ? auditDetail(query.planId) : null), [query.planId, revision])
  const history = useMemo(() => (query.planId ? auditEvents(query.planId) : []), [query.planId, revision])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  function refresh() {
    setRevision((value) => value + 1)
  }

  function goBack() {
    window.location.href = auditListHref()
  }

  const { begin, modals } = useAuditDecisionModals({ refresh, notify })

  if (!row || !detail) {
    return (
      <main className="mpad-page" data-ds-business-page="mp-plan-audit-detail">
        <DSSubPageHeader title="方案确认详情" onBack={goBack} />
        <DSEmptyState
          type="search"
          title="未找到该方案提交"
          description="方案提交可能已被提交人撤回，或链接中的方案标识无效。请返回确认队列重新选择。"
          actionText="返回确认队列"
          onAction={goBack}
        />
      </main>
    )
  }

  const check = canDecide(row.planId)
  const canDecideNow = row.auditState === 'pending' && check.ok
  const processItems = [
    ...(row.auditState === 'pending' ? [{
      id: `current-${row.planId}`,
      title: '校级审核',
      status: '待审核',
      operator: personName(row.submittedBy),
      time: row.submittedAt,
      timeLabel: '提交时间',
      current: true,
    }] : []),
    ...history.map((event, index) => ({ ...event, current: row.auditState !== 'pending' && index === 0 })),
  ]

  const headerActions = []
  if (canDecideNow) {
    headerActions.push({ key: 'pass', label: '确认通过并发布', variant: 'primary', onClick: () => begin(row, 'pass') })
    headerActions.push({ key: 'return', label: '退回修改', onClick: () => begin(row, 'return') })
  }
  if (row.analysisStatus === 'failed') {
    headerActions.push({
      key: 'retry',
      label: '重试分析',
      variant: canDecideNow ? 'default' : 'primary',
      onClick: () => begin(row, 'retry'),
    })
  }

  return (
    <main className="mpad-page" data-ds-business-page="mp-plan-audit-detail">
      <DSSubPageHeader
        title={detail.plan.planName}
        onBack={goBack}
        actions={headerActions.length ? <DSButtonGroup items={headerActions} /> : null}
      >
        <AuditStatusDot value={businessStatusOf(row)} tone={businessTone(row)} />
        <span className="mpad-meta">
          {`${row.planCode} · ${row.schemeVersion} · 实际提交 ${row.submittedAt}`}
        </span>
      </DSSubPageHeader>

      {row.auditState === 'pending' && !canDecideNow ? (
        <div className="mpad-note">{check.reason}</div>
      ) : null}

      {row.analysisStatus === 'failed' ? (
        <DSAlert tone="danger" title="初次分析失败（配置保持有效）">
          已按提交版本配置与数据快照完成发布，但初次分析未成功。可使用同一配置与数据快照重试，发布记录不会丢失。
        </DSAlert>
      ) : null}

      <div className="mpad-workspace">
        <AuditDetailBody detail={detail} row={row} history={history} />
        <aside className="mpad-process-panel">
          <DSProcessDynamics
            items={processItems}
            onViewGraph={() => {
              setProcessTab('graph')
              setProcessOpen(true)
            }}
            emptyDescription="该方案暂无提交与发布记录。"
          />
        </aside>
      </div>

      <div className="mpad-footer">
        <span className="mpad-footer__hint">
          {`提交版本已冻结 · 当前确认人：${personName(AUDIT_CURRENT_PERSON)}`}
        </span>
        <DSButtonGroup items={[{ key: 'back', label: '返回确认队列', onClick: goBack }]} />
      </div>

      {modals}
      <DSDrawer
        open={processOpen}
        title="流程动态"
        description={`${detail.plan.planName} · ${row.schemeVersion}`}
        width={680}
        showFooter={false}
        onClose={() => setProcessOpen(false)}
      >
        <div className="mpad-process-drawer">
          <DSTabs
            variant="section"
            size="small"
            items={[{ key: 'timeline', label: '流程动态' }, { key: 'graph', label: '流程图' }]}
            activeKey={processTab}
            onChange={setProcessTab}
          />
          <DSProcessDynamics
            showHeader={false}
            view={processTab === 'graph' ? 'graph' : 'timeline'}
            items={processItems}
            emptyDescription="该方案暂无提交与发布记录。"
          />
        </div>
      </DSDrawer>
      {toast ? <div className="mpa-toast" role="status">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<PlanAuditDetailPage />)
