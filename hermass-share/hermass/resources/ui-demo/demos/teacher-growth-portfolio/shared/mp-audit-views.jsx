/**
 * M07 方案确认与版本发布 —— 列表页（台账/队列）与详情二级页共用的展示与「确认决定」组件。
 *
 * 单一来源：状态指示器、详情七段内容、三个决定弹窗（确认通过并发布 / 退回修改 / 重试分析）
 * 都在此定义一次，两个页面不再各写一份，避免口径分叉。
 * 依据：《管理侧学校发展与师资队伍建设详细设计》M07（audit / custom）。
 */
import { useMemo, useState } from 'react'
import {
  DSAlert,
  DSAuditOpinionModal,
  DSCheckbox,
  DSDatePicker,
  DSEditField,
  DSEditForm,
  DSModal,
  DSReadOnlyForm,
  DSSelect,
} from '@wisedu/design-system'
import {
  AUDIT_REJECT_TAGS,
  CONFIG_STATUSES,
  RESULT_STATES,
  TASK_STATUSES,
  auditDetail,
  canDecide,
  confirmPublish,
  describeTarget,
  evidencePolicyLabel,
  orgName,
  personName,
  retryAnalysis,
  returnForRevision,
  withdrawSubmission,
} from './growth-plan-store.js'
import './mp-audit-views.css'

// 详情二级页（不在左侧菜单，物理位于 teacher/mp-plan-audit-detail/）
export const AUDIT_LIST_VIEW = 'mp-plan-audit'
export const AUDIT_DETAIL_VIEW = 'mp-plan-audit-detail'

// 与 auditDetail 的六个内容分区同名：退回时用于标记问题位置。
export const AUDIT_DETAIL_SECTIONS = ['方案背景', '人员范围', '任务要求', '试算结果', '变更影响', '原文依据']

// 详情页地址：列表页「查看」与名称链接、详情页返回上级都走这两个函数，
// 保证路径规则只有一处（页面统一位于 teacher/<view>/<view>.html）。
export function auditDetailHref(planId) {
  return `../${AUDIT_DETAIL_VIEW}/${AUDIT_DETAIL_VIEW}.html?planId=${encodeURIComponent(planId)}`
}

export function auditListHref() {
  return `../${AUDIT_LIST_VIEW}/${AUDIT_LIST_VIEW}.html`
}

// 状态指示：圆点 + 文字（规范：状态不使用彩色标签块）
export function AuditStatusDot({ value, tone }) {
  return (
    <span className={`mpa-status is-${tone || 'default'}`}>
      <i aria-hidden="true" />
      {value}
    </span>
  )
}

export function businessTone(row) {
  if (!row) return 'default'
  if (row.analysisStatus === 'failed') return 'danger'
  if (row.configurationStatus === 'published') {
    return row.effectiveFrom && row.effectiveFrom > new Date().toISOString().slice(0, 10) ? 'warning' : 'success'
  }
  return (CONFIG_STATUSES[row.configurationStatus] || {}).tone || 'default'
}

function requirementStateOf(row) {
  return RESULT_STATES[row.resultState] || { label: row.resultState || '未分析', tone: 'default' }
}

function taskStateOf(row) {
  return TASK_STATUSES[row.taskStatus] || { label: row.taskStatus || '-', tone: 'default' }
}

/**
 * 详情正文七段：01 方案背景 / 02 人员范围 / 03 任务要求 / 04 试算结果 / 05 变更影响 /
 * 06 原文依据 / 07 版本与发布记录。
 * 七段之外不再合成「学校发展总分」之类的结论；未知按未知处理，不计入缺口。
 */
export function AuditDetailBody({ detail, row, history }) {
  if (!detail) return null
  const scope = detail.scope
  return (
    <div className="mpa-detail">
      {detail.validation.blockers.length ? (
        <DSAlert tone="danger" title={`发布前阻断项（${detail.validation.blockers.length}）`}>
          <ul className="mpa-list">
            {detail.validation.blockers.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </DSAlert>
      ) : null}
      {detail.validation.warnings.length ? (
        <DSAlert tone="warning" title={`发布前提示（${detail.validation.warnings.length}）`}>
          <ul className="mpa-list">
            {detail.validation.warnings.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </DSAlert>
      ) : null}

      <section className="mpa-detail__section">
        <h3>01 方案背景</h3>
        <DSReadOnlyForm columns={2} items={detail.background.map((item) => ({ label: item.label, value: item.value }))} />
        <p className="mpa-hint">
          本节为提交时冻结的版本内容；提交者在其后产生的新草稿不会覆盖本次审查对象。
        </p>
      </section>

      <section className="mpa-detail__section">
        <h3>02 人员范围</h3>
        <DSReadOnlyForm
          columns={2}
          items={[
            { label: '统计范围内去重人数', value: `${scope.total} 人` },
            { label: '覆盖组织数', value: `${scope.organizationCount} 个` },
            { label: '排除人数合计', value: `${scope.excludedTotal} 人` },
            { label: '授权交集说明', value: '方案范围与登录授权取交集' },
          ]}
        />
        <div className="mpa-subblock">
          <h4>排除明细</h4>
          <ul className="mpa-list">
            {scope.excluded.map((item) => (
              <li key={item.reason}>{`${item.reason}：${item.count} 人`}</li>
            ))}
          </ul>
        </div>
        <p className="mpa-hint">{scope.intersectNote}排除与未知不得互相顶替：本页只呈现范围口径，不呈现个人评价数据。</p>
      </section>

      <section className="mpa-detail__section">
        <h3>03 任务要求</h3>
        {detail.tasks.length ? detail.tasks.map((task) => {
          const state = taskStateOf(task)
          const rows = detail.frozenRequirements.filter((item) => item.taskId === task.taskId)
          return (
            <div className="mpa-subblock" key={task.taskId}>
              <h4>
                {task.taskName}
                <AuditStatusDot value={state.label} tone={state.tone} />
              </h4>
              <p className="mpa-hint">
                {`任务方向：${task.taskDirection || '未设置'} · 归口：${orgName(task.ownerOrganization)} · 责任人：${personName(task.ownerPerson)} · 期限：${task.deadline || '未设置'}`}
              </p>
              {rows.length ? (
                <ul className="mpa-requirement-list">
                  {rows.map((item) => {
                    const itemState = requirementStateOf(item)
                    return (
                      <li key={item.requirementId}>
                        <div className="mpa-requirement-list__head">
                          <strong>{item.requirementName}</strong>
                          <span className="mpa-muted">{item.requirementType || '未配置类型'}</span>
                          {item.mandatory ? <span className="mpa-flag">关键要求</span> : null}
                          <AuditStatusDot value={itemState.label} tone={itemState.tone} />
                        </div>
                        <div className="mpa-requirement-list__line">{describeTarget(item)}</div>
                        <div className="mpa-requirement-list__line">{`证据核验规则：${evidencePolicyLabel(item.evidencePolicy)}`}</div>
                        <div className="mpa-requirement-list__line">{`统计指标引用：${item.metricRef || '未选择（不可计算）'}${item.unknownCount ? ` · 待核验 ${item.unknownCount} 人（按未知处理，不计入缺口）` : ''}`}</div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="mpa-hint">该任务尚未配置师资要求，发布前会以提示项列出。</p>
              )}
            </div>
          )
        }) : <p className="mpa-hint">本方案尚未建立发展任务。</p>}
        <p className="mpa-hint">
          行动验收不直接改写人员指标：要求口径只说明"统计什么、目标多少"，成效表述为同期变化。
        </p>
      </section>

      <section className="mpa-detail__section">
        <h3>04 试算结果</h3>
        <DSReadOnlyForm
          columns={2}
          items={[
            { label: '师资要求总数', value: `${detail.trial.total} 项` },
            { label: '可计算要求', value: `${detail.trial.computable} 项` },
            { label: '关键要求', value: `${detail.trial.mandatory} 项` },
            { label: '已满足 / 存在缺口', value: `${detail.trial.satisfied} / ${detail.trial.gap}` },
            { label: '待核验', value: `${detail.trial.pending} 项` },
            { label: '待人工评估 / 不适用', value: `${detail.trial.manual} / ${detail.trial.notApplicable}` },
            { label: '未分析', value: `${detail.trial.notAnalyzed} 项` },
            { label: '试算版本', value: '提交时冻结配置版本' },
          ]}
        />
        <p className="mpa-hint">
          待核验按"未知"处理，不计入已满足，也不计入缺口；本页不合成"学校发展总分"。
        </p>
      </section>

      <section className="mpa-detail__section">
        <h3>05 变更影响</h3>
        <DSReadOnlyForm
          columns={2}
          items={[
            { label: '对比上一发布版本', value: detail.impact.previousVersion || '无（首次发布）' },
            { label: '新增要求', value: `${detail.impact.added} 项` },
            { label: '移除要求', value: `${detail.impact.removed} 项` },
            { label: '发布后默认方案', value: detail.currentDefault.length ? detail.currentDefault.map((item) => `${item.planName} ${item.schemeVersion}`).join('；') : '暂无显式默认方案' },
          ]}
        />
        {detail.impact.stoppedIndicator.length ? (
          <DSAlert tone="danger" title="引用已停用指标">
            <ul className="mpa-list">
              {detail.impact.stoppedIndicator.map((item) => <li key={item.requirementId}>{item.requirementName}</li>)}
            </ul>
          </DSAlert>
        ) : null}
        <ul className="mpa-list">
          {detail.impact.notes.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="mpa-detail__section">
        <h3>06 原文依据</h3>
        <p className="mpa-quote">{detail.sourceClause || '未填写重点依据原文条款。'}</p>
        {detail.documents.length ? (
          <ul className="mpa-list">
            {detail.documents.map((item) => <li key={item.id}>{`${item.name}（${item.type}）`}</li>)}
          </ul>
        ) : (
          <p className="mpa-hint">未引用依据文件；依据为引用关系，不复制文件本体。</p>
        )}
      </section>

      <section className="mpa-detail__section">
        <h3>07 版本与发布记录</h3>
        {row && row.decision ? (
          <div className="mpa-subblock">
            <h4>{row.decision === 'pass' ? '确认通过并发布' : '退回修改'}</h4>
            <p className="mpa-hint">{`${row.decidedAt} · ${personName(row.decidedBy)} · ${row.opinion || '未填写意见'}`}</p>
            {row.marks.length ? (
              <ul className="mpa-list">
                {row.marks.map((mark) => (
                  <li key={`${mark.section}-${mark.note}`}>{`问题位置：${mark.section}${mark.note ? ` — ${mark.note}` : ''}`}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        {history.length ? (
          <ul className="mpa-timeline">
            {history.map((event) => (
              <li key={event.id}>
                <span className="mpa-timeline__time">{event.at}</span>
                <span>{event.label}</span>
                <span className="mpa-muted">{event.operator}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mpa-hint">该版本暂无提交与发布记录。</p>
        )}
        <p className="mpa-hint">
          旧版已生成的报告与快照继续可读，不能被新规则覆盖；版本关系、启停与默认切换记录保留可查。
        </p>
      </section>
    </div>
  )
}

/**
 * 决定动作与弹窗的唯一实现：列表页行操作与详情页头部/底部动作都调用 `begin(row, kind)`。
 * kind: 'pass' | 'return' | 'retry' | 'withdraw'
 * 返回：`modals` 为三个弹窗节点，由调用页渲染（保证弹窗挂在页面根节点下）。
 */
export function useAuditDecisionModals({ refresh, notify }) {
  const [passTarget, setPassTarget] = useState(null)
  const [returnTarget, setReturnTarget] = useState(null)
  const [retryTarget, setRetryTarget] = useState(null)

  const passValidation = useMemo(
    () => (passTarget ? auditDetail(passTarget.row.planId).validation : null),
    [passTarget],
  )

  function begin(row, kind) {
    if (kind === 'withdraw') {
      const result = withdrawSubmission(row.planId)
      refresh()
      notify(result.ok ? '已撤回提交，方案回到草稿，可继续完善后重新提交' : result.reason)
      return
    }
    if (kind === 'pass' || kind === 'return') {
      const check = canDecide(row.planId)
      if (!check.ok) {
        notify(check.reason)
        refresh()
        return
      }
    }
    if (kind === 'pass') {
      setPassTarget({
        row,
        opinion: '',
        effectiveFrom: row.effectiveFrom || '',
        simulateAnalysisFailure: false,
      })
      return
    }
    if (kind === 'return') {
      setReturnTarget({ row, opinion: '', marks: [], tag: '' })
      return
    }
    if (kind === 'retry') setRetryTarget({ row, stillFailing: false })
  }

  function submitPass() {
    const result = confirmPublish(passTarget.row.planId, {
      opinion: passTarget.opinion,
      effectiveFrom: passTarget.effectiveFrom,
      simulateAnalysisFailure: passTarget.simulateAnalysisFailure,
    })
    refresh()
    setPassTarget(null)
    notify(result.ok ? result.message : result.reason)
  }

  function submitReturn() {
    if (!returnTarget.opinion.trim()) {
      notify('退回必须填写确认意见')
      return
    }
    const marks = returnTarget.marks.map((section) => ({ section, note: returnTarget.tag || '' }))
    const result = returnForRevision(returnTarget.row.planId, { opinion: returnTarget.opinion, marks })
    refresh()
    setReturnTarget(null)
    notify(result.ok ? result.message : result.reason)
  }

  function submitRetry() {
    const result = retryAnalysis(retryTarget.row.planId, { stillFailing: retryTarget.stillFailing })
    refresh()
    setRetryTarget(null)
    notify(result.ok ? result.message : result.reason)
  }

  const modals = (
    <>
      <DSAuditOpinionModal
        open={Boolean(passTarget)}
        type="pass"
        title="确认通过并发布"
        record={passTarget ? { name: passTarget.row.planName } : null}
        size="large"
        opinionLabel="确认意见"
        opinionPlaceholder="请输入确认意见"
        opinion={passTarget?.opinion}
        onOpinionChange={(value) => setPassTarget((prev) => (prev ? { ...prev, opinion: value } : prev))}
        opinionRows={3}
        okText="确认通过并发布"
        okDisabled={Boolean(passValidation && passValidation.blockers.length)}
        onOk={submitPass}
        onCancel={() => setPassTarget(null)}
      >
        {passTarget ? (
          <DSEditForm columns={1}>
            <DSReadOnlyForm
              columns={2}
              items={[
                { label: '配置版本号', value: passTarget.row.schemeVersion },
                { label: '业务责任组织', value: orgName(passTarget.row.ownerOrganization) },
                { label: '业务责任人', value: personName(passTarget.row.ownerPerson) },
                { label: '实际提交时间', value: passTarget.row.submittedAt },
              ]}
            />
            {passValidation && passValidation.blockers.length ? (
              <DSAlert tone="danger" title={`存在 ${passValidation.blockers.length} 项发布前阻断项，暂不能发布`}>
                <ul className="mpa-list">
                  {passValidation.blockers.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </DSAlert>
            ) : (
              <DSAlert tone="info" title="发布行为说明">
                确认通过后固定当前配置版本与生效日期，并开启初次分析。分析失败不撤销有效配置；生效日期在未来时，本版本暂不替代当前有效版本，到生效日切换。
              </DSAlert>
            )}
            <DSEditField label="配置生效日期" required help="选择未来日期将标记为「已发布（待生效）」，不会提前替代现行版本。">
              <DSDatePicker
                value={passTarget.effectiveFrom}
                placeholder="请选择生效日期"
                onChange={(value) => setPassTarget((prev) => ({ ...prev, effectiveFrom: value || '' }))}
              />
            </DSEditField>
            <DSEditField label="异常演练" help="仅用于验收「分析失败不撤销有效配置、可重试且记录不丢失」。">
              <DSCheckbox
                label="模拟初次分析失败"
                checked={passTarget.simulateAnalysisFailure}
                onChange={(event) => setPassTarget((prev) => ({ ...prev, simulateAnalysisFailure: event.target.checked }))}
              />
            </DSEditField>
          </DSEditForm>
        ) : null}
      </DSAuditOpinionModal>

      <DSAuditOpinionModal
        open={Boolean(returnTarget)}
        type="return"
        title="退回修改"
        record={returnTarget ? { name: returnTarget.row.planName } : null}
        size="large"
        opinionLabel="确认意见"
        opinionPlaceholder="请说明退回原因与需要补齐的内容"
        opinion={returnTarget?.opinion}
        onOpinionChange={(value) => setReturnTarget((prev) => (prev ? { ...prev, opinion: value } : prev))}
        opinionRows={4}
        okText="确认退回"
        onOk={submitReturn}
        onCancel={() => setReturnTarget(null)}
      >
        {returnTarget ? (
          <DSEditForm columns={1}>
            <DSReadOnlyForm
              columns={2}
              items={[
                { label: '配置版本号', value: returnTarget.row.schemeVersion },
                { label: '提交人', value: personName(returnTarget.row.submittedBy) },
                { label: '实际提交时间', value: returnTarget.row.submittedAt },
              ]}
            />
            <DSEditField label="标记问题位置" help="可多选，用于定位详情中的具体分区；不选择视为整份退回。">
              <DSSelect
                multiple
                placeholder="请选择问题所在分区"
                options={AUDIT_DETAIL_SECTIONS.map((item) => ({ value: item, label: item }))}
                value={returnTarget.marks}
                onChange={(value) => {
                  const next = Array.isArray(value) ? value : (value ? [value] : [])
                  setReturnTarget((prev) => ({ ...prev, marks: next }))
                }}
              />
            </DSEditField>
            <DSEditField label="问题说明（可选）" help="随问题位置一并记录，便于提交人逐条核对。">
              <DSSelect
                clearable
                placeholder="请选择问题类型"
                options={AUDIT_REJECT_TAGS.map((item) => ({ value: item, label: item }))}
                value={returnTarget.tag}
                onChange={(value) => setReturnTarget((prev) => ({ ...prev, tag: value || '' }))}
              />
            </DSEditField>
          </DSEditForm>
        ) : null}
      </DSAuditOpinionModal>

      <DSModal
        open={Boolean(retryTarget)}
        title="重试分析"
        okText="重试分析"
        cancelText="取消"
        onOk={submitRetry}
        onCancel={() => setRetryTarget(null)}
      >
        {retryTarget ? (
          <DSEditForm columns={1}>
            <p className="mpa-modal-text">
              {`「${retryTarget.row.planName}」已发布但初次分析失败；配置保持有效，将使用同一配置与数据快照重试，发布记录不会丢失。`}
            </p>
            <DSEditField label="重试结果（演练）" help="用于验收「重试仍失败」时的可重复重试路径。">
              <DSCheckbox
                label="本次重试仍然失败"
                checked={retryTarget.stillFailing}
                onChange={(event) => setRetryTarget((prev) => ({ ...prev, stillFailing: event.target.checked }))}
              />
            </DSEditField>
          </DSEditForm>
        ) : null}
      </DSModal>
    </>
  )

  return { begin, modals }
}
