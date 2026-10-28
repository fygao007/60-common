import { createRoot } from 'react-dom/client'

export const PAGE_GENERATION_CONTRACT = 'v1'
export const PAGE_TEMPLATE = 'react-business-page'

import { useMemo, useState } from 'react'
import {
  DSButton,
  DSDatePicker,
  DSDrawer,
  DSEmptyState,
  DSModal,
  DSReadOnlyForm,
  DSRegularListTemplate,
  DSProcessDynamics,
  DSSelect,
  DSTabs,
} from '@wisedu/design-system'
import {
  CONFIG_STATUSES,
  EMPTY_FILTERS,
  ORG_OPTIONS,
  PERIOD_TYPES,
  STATUS_TABS,
  allPlans,
  archivePlan,
  canDeleteDraft,
  createRevision,
  deleteDraft,
  duplicateAsNewPlan,
  orgName,
  paginate,
  personName,
  planEvents,
  queryPlans,
  requirementSummaryByPlan,
  statusCounts,
  submitForConfirm,
  validatePlanForPublish,
  withdrawSubmission,
} from '../../shared/growth-plan-store.js'
import './mp-plan-list.css'

// M01 发展方案台账
// 依据：《管理侧学校发展与师资队伍建设详细设计》M01（regular-list / custom 模式）
//  - 结构：状态页签 → 筛选 → 工具栏 → 表格 → 分页
//  - 筛选采用“编辑条件 → 查询生效”；重置恢复全部授权范围与默认状态
//  - 行操作按配置生命周期状态分支；已发布版本不得直接编辑
//  - 「复制为新方案」与「创建修订版本」语义严格区分
//  - 管理侧不消费五维评分（见 shared/growth-plan-store.js 顶部边界说明）

const PAGE_SIZE_OPTIONS = [10, 20, 50]

function formatPeriod(row) {
  if (!row.periodStart && !row.periodEnd) return '-'
  return `${row.periodStart || '-'} 至 ${row.periodEnd || '-'}`
}

// 状态指示：圆点 + 文字（规范：状态不使用彩色标签块）
function StatusDot({ value }) {
  const meta = CONFIG_STATUSES[value] || { label: value, tone: 'default' }
  return (
    <span className={`mpl-status is-${meta.tone}`}>
      <i aria-hidden="true" />
      {meta.label}
    </span>
  )
}

function csvCell(value) {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function buildPlanCsv(rows) {
  const headers = ['方案编号', '发展方案名称', '周期类型', '学校发展阶段', '规划周期', '责任组织', '责任人', '关联要求数量', '配置状态', '版本号', '最近更新时间']
  const lines = [headers.join(',')]
  rows.forEach((row) => {
    lines.push([
      row.planCode,
      row.planName,
      row.planPeriodType,
      row.stageName,
      formatPeriod(row),
      orgName(row.ownerOrganization),
      personName(row.ownerPerson),
      row.requirementCount,
      (CONFIG_STATUSES[row.configurationStatus] || {}).label || row.configurationStatus,
      row.schemeVersion,
      row.businessUpdatedAt,
    ].map(csvCell).join(','))
  })
  return `\ufeff${lines.join('\r\n')}`
}

function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// 行操作按状态分支（文档 M01「行操作」）：
//  草稿 编辑/提交确认/删除 · 待确认 查看/撤回 · 已发布 查看/创建修订版本/归档
//  已归档与已替代只读，可复制为新方案
function actionsForStatus(status) {
  if (status === 'draft') {
    return [
      { key: 'edit', label: '编辑' },
      { key: 'submit', label: '提交确认' },
      { key: 'delete', label: '删除', danger: true },
    ]
  }
  if (status === 'pending') {
    return [
      { key: 'view', label: '查看' },
      { key: 'withdraw', label: '撤回提交' },
    ]
  }
  if (status === 'published') {
    return [
      { key: 'view', label: '查看' },
      { key: 'revision', label: '创建修订版本' },
      { key: 'archive', label: '归档' },
    ]
  }
  return [
    { key: 'view', label: '查看' },
    { key: 'duplicate', label: '复制为新方案' },
  ]
}

function PlanListPage() {
  // draft = 编辑中的条件；committed = 已生效条件。两者分离即“编辑条件 → 查询生效”。
  const [draft, setDraft] = useState({ ...EMPTY_FILTERS })
  const [committed, setCommitted] = useState({ ...EMPTY_FILTERS })
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [revision, setRevision] = useState(0)
  const [toast, setToast] = useState('')
  const [detailId, setDetailId] = useState('')
  const [processRow, setProcessRow] = useState(null)
  const [processTab, setProcessTab] = useState('timeline')
  const [confirm, setConfirm] = useState(null)

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  function refresh() {
    setRevision((value) => value + 1)
  }

  // 依赖 revision 以在数据变更后重算（无持久化后端，store 为模块内内存态）
  /* eslint-disable react-hooks/exhaustive-deps */
  const counts = useMemo(() => statusCounts(), [revision])
  const filtered = useMemo(() => queryPlans(committed), [committed, revision])
  const paged = useMemo(() => paginate(filtered, page, pageSize), [filtered, page, pageSize])
  const totalPlans = useMemo(() => allPlans().length, [revision])
  const detail = useMemo(() => (detailId ? allPlans().find((row) => row.planId === detailId) : null), [detailId, revision])
  const detailSummary = useMemo(() => (detail ? requirementSummaryByPlan(detail.planId) : null), [detail])
  const detailEvents = useMemo(() => (detail ? planEvents(detail.planId) : []), [detail])
  const detailValidation = useMemo(() => (detail ? validatePlanForPublish(detail.planId) : null), [detail])
  /* eslint-enable react-hooks/exhaustive-deps */

  const tabs = useMemo(() => STATUS_TABS.map((tab) => ({
    key: tab.key,
    label: counts[tab.key] ? `${tab.label}(${counts[tab.key]})` : tab.label,
  })), [counts])

  const summaryText = useMemo(
    () => `数据统计：全部(${counts.all || 0})  草稿(${counts.draft || 0})  待确认(${counts.pending || 0})  已发布(${counts.published || 0})  已归档(${counts.archived || 0})  已替代(${counts.superseded || 0})`,
    [counts],
  )

  function applyTab(key) {
    setActiveTab(key)
    const statuses = key === 'all' ? [] : [key]
    setCommitted((prev) => ({ ...prev, statuses }))
    setDraft((prev) => ({ ...prev, statuses }))
    setPage(1)
  }

  function handleSearch() {
    setCommitted({ ...draft })
    setPage(1)
    notify('已按当前条件查询')
  }

  function handleReset() {
    const cleared = { ...EMPTY_FILTERS }
    setDraft(cleared)
    setCommitted(cleared)
    setActiveTab('all')
    setPage(1)
    notify('已重置筛选条件，恢复全部授权范围')
  }

  function openConfig(row, mode) {
    const url = row
      ? `../mp-plan-config/mp-plan-config.html?planId=${encodeURIComponent(row.planId)}&mode=${mode}`
      : '../mp-plan-config/mp-plan-config.html?mode=create'
    window.location.href = url
  }

  function runAction(row, action) {
    if (action === 'view') {
      setDetailId(row.planId)
      return
    }
    if (action === 'edit') {
      openConfig(row, 'edit')
      return
    }
    if (action === 'submit') {
      const result = submitForConfirm(row.planId)
      refresh()
      if (!result.ok) {
        notify(result.reason)
        return
      }
      const blockers = result.validation.blockers
      notify(blockers.length
        ? `已提交确认；仍有 ${blockers.length} 项发布前阻断项待补齐`
        : '已提交确认，等待学校指定确认人处理')
      setDetailId('')
      return
    }
    if (action === 'withdraw') {
      const result = withdrawSubmission(row.planId)
      refresh()
      notify(result.ok ? '已撤回提交，方案回到草稿' : result.reason)
      return
    }
    if (action === 'revision') {
      const result = createRevision(row.planId)
      refresh()
      notify(result.ok ? result.message : result.reason)
      return
    }
    if (action === 'duplicate') {
      const result = duplicateAsNewPlan(row.planId)
      refresh()
      notify(result.ok ? result.message : result.reason)
      return
    }
    if (action === 'archive') {
      setConfirm({
        title: '归档方案',
        description: `确认归档「${row.planName}」${row.schemeVersion}？归档后该版本只读，已生成的历史报告与快照继续可读。`,
        confirmText: '确认归档',
        onConfirm: () => {
          const result = archivePlan(row.planId)
          refresh()
          notify(result.ok ? '方案已归档' : result.reason)
          setConfirm(null)
        },
      })
      return
    }
    if (action === 'delete') {
      const check = canDeleteDraft(row.planId)
      if (!check.ok) {
        notify(check.reason)
        return
      }
      setConfirm({
        title: '删除草稿方案',
        description: `「${row.planName}」为无提交历史、无业务引用的草稿，删除后不可恢复。确认删除？`,
        confirmText: '删除',
        danger: true,
        onConfirm: () => {
          const result = deleteDraft(row.planId)
          refresh()
          notify(result.ok ? '草稿已删除' : result.reason)
          setConfirm(null)
        },
      })
    }
  }

  const columns = useMemo(() => [
    { key: 'planCode', dataIndex: 'planCode', title: '方案编号', width: 118 },
    {
      key: 'planName',
      dataIndex: 'planName',
      title: '发展方案名称',
      width: 240,
      render: (value, record) => (
        <DSButton variant="link" size="small" onClick={() => runAction(record, 'view')}>{value}</DSButton>
      ),
    },
    { key: 'planPeriodType', dataIndex: 'planPeriodType', title: '周期类型', width: 98 },
    { key: 'stageName', dataIndex: 'stageName', title: '学校发展阶段', width: 128 },
    { key: 'period', dataIndex: 'periodStart', title: '规划周期', width: 196, render: (_, record) => formatPeriod(record) },
    { key: 'ownerOrganization', dataIndex: 'ownerOrganization', title: '责任部门', width: 168, render: (value) => orgName(value) },
    {
      key: 'requirementCount',
      dataIndex: 'requirementCount',
      title: '关联要求',
      width: 96,
      render: (value, record) => (
        value
          ? <DSButton variant="link" size="small" onClick={() => runAction(record, 'view')}>{`${value} 项`}</DSButton>
          : <span className="mpl-muted">0 项</span>
      ),
    },
    { key: 'configurationStatus', dataIndex: 'configurationStatus', title: '配置状态', width: 104, render: (value) => <StatusDot value={value} /> },
    { key: 'schemeVersion', dataIndex: 'schemeVersion', title: '版本号', width: 78 },
    { key: 'businessUpdatedAt', dataIndex: 'businessUpdatedAt', title: '最近更新时间', width: 150 },
    {
      key: 'process',
      dataIndex: 'planId',
      title: '流程动态',
      width: 104,
      render: (_, record) => (
        <DSButton
          variant="link"
          size="small"
          onClick={() => {
            setProcessRow(record)
            setProcessTab('timeline')
          }}
        >
          流程动态
        </DSButton>
      ),
    },
    {
      key: 'ops',
      dataIndex: 'planId',
      title: '操作',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <span className="mpl-ops">
          {actionsForStatus(record.configurationStatus).map((action) => (
            <DSButton
              key={action.key}
              variant="link"
              size="small"
              danger={action.danger}
              onClick={() => runAction(record, action.key)}
            >
              {action.label}
            </DSButton>
          ))}
        </span>
      ),
    },
  ], [])

  const filterProps = useMemo(() => ({
    fields: [
      {
        key: 'keyword',
        label: '方案名称/编号',
        controlledValue: draft.keyword,
        placeholder: '请输入方案名称或编号',
        onChange: (event) => setDraft((prev) => ({ ...prev, keyword: event?.target?.value ?? event ?? '' })),
      },
      {
        key: 'statuses',
        label: '配置状态',
        render: () => (
          <DSSelect
            multiple
            placeholder="请选择配置状态"
            options={Object.entries(CONFIG_STATUSES).map(([value, meta]) => ({ value, label: meta.label }))}
            value={draft.statuses}
            onChange={(value) => {
              const next = Array.isArray(value) ? value : (value ? [value] : [])
              setDraft((prev) => ({ ...prev, statuses: next }))
              setActiveTab(next.length === 1 ? next[0] : 'all')
            }}
          />
        ),
      },
      {
        key: 'periodType',
        label: '周期类型',
        type: 'select',
        placeholder: '全部周期类型',
        options: [{ value: '', label: '全部周期类型' }, ...PERIOD_TYPES.map((item) => ({ value: item, label: item }))],
        controlledValue: draft.periodType,
        onChange: (value) => setDraft((prev) => ({ ...prev, periodType: value || '' })),
      },
      {
        key: 'ownerOrganization',
        label: '责任组织',
        type: 'select',
        searchable: true,
        placeholder: '全部组织',
        options: [{ value: '', label: '全部组织' }, ...ORG_OPTIONS.map((org) => ({ value: org.id, label: org.name }))],
        controlledValue: draft.ownerOrganization,
        onChange: (value) => setDraft((prev) => ({ ...prev, ownerOrganization: value || '' })),
      },
      {
        key: 'periodStart',
        // 筛选标签须落在筛选标签轨道内（紧凑档 94px ÷ 14px ≈ 6 个汉字，7 字以内可容纳）。
        // 原「周期开始（高级）」8 字实测溢 18px，首字被前一个控件压住；筛选区默认全展开、无收起行为，
        // 故去掉「（高级）」标记，标签统一控制在 6 字内。
        label: '周期开始',
        render: () => (
          <DSDatePicker
            value={draft.periodStart}
            clearable
            placeholder="查询与该日期期间重叠的方案"
            onChange={(value) => setDraft((prev) => ({ ...prev, periodStart: value || '' }))}
          />
        ),
      },
    ],
    density: 'compact',
    // 4 列时字段格只有 240px，装不下「字段最小内容宽 262–282px」（94px 标签 + 8px 间距 +
    // 控件最小宽：输入 160px / 日期 180px），控件会越格压住下一个标签。
    // 本页此前靠"第 2 行只有 1 个字段、左侧没有控件"侥幸不显形，与同组三页统一为 3 列（322px）。
    columns: 3,
    defaultExpanded: true,
    onSearch: handleSearch,
    onReset: handleReset,
  }), [draft])

  const toolbarActions = useMemo(() => ([
    { key: 'create', label: '新建方案', variant: 'primary', onClick: () => openConfig(null, 'create') },
    {
      key: 'ai-import',
      label: '从文件辅助创建',
      onClick: () => notify('AI 规划文件辅助创建（M18）属可选增强，第一期未启用；请先手动创建方案，AI 提取不参与基础功能可用性。'),
    },
  ]), [])

  const summary = useMemo(() => (
    <div className="mpl-summary-bar">
      <DSButton
        variant="primary"
        onClick={() => {
          if (!filtered.length) {
            notify('当前筛选结果为空，没有可导出的方案')
            return
          }
          downloadCsv(`发展方案台账_${new Date().toISOString().slice(0, 10)}.csv`, buildPlanCsv(filtered))
          notify(`已导出当前台账 ${filtered.length} 条`)
        }}
      >
        导出当前台账
      </DSButton>
      <span className="mpl-summary-bar__text">{summaryText}</span>
    </div>
  ), [filtered, summaryText])

  const emptyRender = useMemo(() => (
    totalPlans === 0
      ? (
        <DSEmptyState
          type="data"
          title="暂无发展方案"
          description="还没有配置师资队伍建设方案。新建方案后进入方案配置，设置统计范围、发展任务与师资要求。"
          actionText="新建方案"
          onAction={() => openConfig(null, 'create')}
        />
      )
      : (
        <DSEmptyState
          type="search"
          title="没有符合当前条件的方案"
          description="可清除筛选条件后重新查询；已替代方案只在「全部」页签下展示。"
          actionText="清除筛选条件"
          onAction={handleReset}
        />
      )
  ), [totalPlans])

  return (
    <main className="mpl-page" data-ds-business-page="mp-plan-list">
      <DSRegularListTemplate
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={applyTab}
        metaLabel=""
        metaValue=""
        notice="方案草稿试算不改变正式总览；发布后各模块统一指向同一配置版本与分析快照。"
        filterProps={filterProps}
        toolbarActions={toolbarActions}
        tableTools={false}
        summary={summary}
        tableProps={{
          columns,
          data: paged.rows,
          rowKey: 'planId',
          selectable: false,
          showIndex: false,
          actions: [],
          emptyRender,
          minWidth: 1720,
        }}
        pagination={{
          total: paged.total,
          totalPages: Math.max(1, Math.ceil(paged.total / pageSize)),
          current: page,
          pageSize,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showJumper: true,
          onChange: (next) => setPage(next),
          onPageSizeChange: (size) => { setPageSize(size); setPage(1) },
        }}
        footerActions={[]}
        inset={12}
        contentGap={12}
        toolbarGap={8}
      />

      <DSDrawer
        open={Boolean(detail)}
        title={detail ? detail.planName : ''}
        description={detail ? `${detail.planCode} · ${detail.schemeVersion}` : ''}
        size="large"
        onCancel={() => setDetailId('')}
        footer={detail ? (
          <div className="mpl-drawer-footer">
            {detail.configurationStatus === 'draft'
              ? <DSButton variant="primary" onClick={() => openConfig(detail, 'edit')}>编辑方案</DSButton>
              : null}
            {detail.configurationStatus === 'published'
              ? <DSButton variant="primary" onClick={() => openConfig(detail, 'revision')}>创建修订版本</DSButton>
              : null}
            <DSButton onClick={() => setDetailId('')}>关闭</DSButton>
          </div>
        ) : null}
      >
        {detail ? (
          <div className="mpl-drawer-body">
            <DSReadOnlyForm
              columns={2}
              items={[
                { label: '方案编号', value: detail.planCode },
                { label: '配置状态', value: <StatusDot value={detail.configurationStatus} /> },
                { label: '配置版本号', value: detail.schemeVersion },
                { label: '周期类型', value: detail.planPeriodType },
                { label: '学校发展阶段', value: detail.stageName },
                { label: '阶段说明', value: detail.stageDescription || '-' },
                { label: '规划周期', value: formatPeriod(detail) },
                { label: '方案基准日期', value: detail.baselineDate || '-' },
                { label: '责任组织', value: orgName(detail.ownerOrganization) },
                { label: '责任人', value: personName(detail.ownerPerson) },
                { label: '配置生效日期', value: detail.effectiveFrom || '未设置' },
                { label: '业务最近更新时间', value: detail.businessUpdatedAt },
              ]}
            />

            <section className="mpl-drawer-section">
              <h3>依据文件与原文条款</h3>
              <p className="mpl-drawer-quote">{detail.sourceClause || '未填写重点依据原文条款。'}</p>
              <p className="mpl-drawer-hint">
                {detail.documentRefs && detail.documentRefs.length
                  ? `引用依据文件 ${detail.documentRefs.length} 份；依据为引用关系，不复制文件本体。`
                  : '至少需要附件或明确来源记录，否则发布前会被阻断。'}
              </p>
            </section>

            <section className="mpl-drawer-section">
              <h3>要求配置概览</h3>
              <p className="mpl-drawer-hint">
                {`共 ${detailSummary.total} 项师资要求：已满足 ${detailSummary.satisfied}、存在缺口 ${detailSummary.gap}、待核验 ${detailSummary.pending}、待人工评估 ${detailSummary.manual}、未分析 ${detailSummary.notAnalyzed}。`}
              </p>
              <p className="mpl-drawer-hint">不合成“学校发展总分”；汇总只统计各状态数量，并单独突出关键要求。</p>
            </section>

            {detailValidation && detailValidation.blockers.length ? (
              <section className="mpl-drawer-section">
                <h3>发布前阻断项</h3>
                <ul className="mpl-blocker-list">
                  {detailValidation.blockers.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            ) : null}

            <section className="mpl-drawer-section">
              <h3>版本与流转记录</h3>
              {detailEvents.length ? (
                <ul className="mpl-event-list">
                  {detailEvents.map((event) => (
                    <li key={event.id}>
                      <span className="mpl-event-list__time">{event.at}</span>
                      <span>{event.label}</span>
                      <span className="mpl-muted">{event.operator}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mpl-drawer-hint">该版本暂无提交与发布记录。</p>
              )}
            </section>
          </div>
        ) : null}
      </DSDrawer>

      <DSDrawer
        open={Boolean(processRow)}
        title="流程动态"
        description={processRow ? `${processRow.planName} · ${processRow.schemeVersion}` : ''}
        width={680}
        showFooter={false}
        onClose={() => setProcessRow(null)}
      >
        {processRow ? (
          <div className="mpl-process-drawer">
            <DSTabs
              variant="section"
              size="small"
              items={[{ key: 'timeline', label: '流程动态' }, { key: 'graph', label: '流程图' }]}
              activeKey={processTab}
              onChange={setProcessTab}
            />
            <DSProcessDynamics
              key={processRow.planId}
              showHeader={false}
              view={processTab === 'graph' ? 'graph' : 'timeline'}
              items={[
                ...(processRow.configurationStatus === 'pending' ? [{
                  id: `current-${processRow.planId}`,
                  title: '校级审核',
                  status: '待审核',
                  operator: personName(processRow.submittedBy),
                  time: processRow.submittedAt,
                  timeLabel: '提交时间',
                  current: true,
                }] : []),
                ...planEvents(processRow.planId).map((event, index) => ({
                  ...event,
                  current: processRow.configurationStatus !== 'pending' && index === 0,
                })),
              ]}
              emptyDescription="该方案暂无提交与发布记录。"
            />
          </div>
        ) : null}
      </DSDrawer>

      <DSModal
        open={Boolean(confirm)}
        title={confirm ? confirm.title : ''}
        danger={Boolean(confirm && confirm.danger)}
        onCancel={() => setConfirm(null)}
        onOk={confirm ? confirm.onConfirm : undefined}
        okText={confirm ? confirm.confirmText : '确定'}
        cancelText="取消"
      >
        <p className="mpl-modal-text">{confirm ? confirm.description : ''}</p>
      </DSModal>

      {toast ? <div className="mpl-toast" role="status">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<PlanListPage />)
