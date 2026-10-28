import { useCallback, useMemo, useState } from 'react'
import {
  DSButton, DSDataTable, DSDrawer, DSEditField, DSInput, DSReadOnlyForm, DSSelect,
  DSModal, DSRadioGroup, DSSubPageHeader, DSTabs, DSTag, DSTextarea,
} from '@wisedu/design-system'
import StatusDot from './StatusDot.jsx'
import {
  listResumeSections, listResumeFormFields, listResumeColumns,
  listResumeSubsections, resolveResumeValue, resolvePeriodValue,
} from '@wisedu/hr-domain'
import './RecruitmentResumePage.css'

const PAGE_SIZE = 10

/* 列表数据增强：mock 的 TODO_CANDIDATES 缺少性别/学位/证件号/材料完整度等字段，
   此处仅在本页派生补充，不侵入修改共享 mock（避免影响 process-audit 等页面）。 */
const FEMALE_NAMES = ['李', '王', '赵', '刘', '周', '吴', '冯', '苏', '马', '林']
const DEGREE_MAP = { '博士': '博士', '硕士': '硕士', '本科': '学士', '大专': '' }
function maskId(id) {
  if (!id) return '—'
  return id.length > 6 ? id.slice(0, 4) + '********' + id.slice(-4) : id
}
// 基于 id 生成稳定的18位身份证号(用于列表脱敏显示和详情完整显示)
function deriveIdCard(id) {
  if (!id) return '440301199001010001'
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 100000000
  const region = '440301'
  const birth = '199' + String(hash % 10) + (10 + hash % 3).toString().padStart(2, '0') + (1 + hash % 28).toString().padStart(2, '0')
  const seq = String(100 + hash % 900)
  const base17 = region + birth + seq
  // 校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  let sum = 0
  for (let i = 0; i < 17; i++) sum += parseInt(base17[i]) * weights[i]
  return base17 + checkCodes[sum % 11]
}
function deriveGender(name) {
  if (!name) return '—'
  return FEMALE_NAMES.includes(name.charAt(0)) ? '女' : '男'
}
function completenessOf(row) {
  // 与详情附件材料口径一致:基于必传材料齐全度计算
  const REQUIRED = ['个人简历', '身份证', '学历证书', '学位证书', '学历认证']
  const files = (row.materials || []).map((f) => String(f))
  const uploaded = REQUIRED.filter((cat) => files.some((f) => f.includes(cat.slice(0, 2)) || f === cat)).length
  const pct = Math.round((uploaded / REQUIRED.length) * 100)
  return `${pct}%`
}

// 环节字段：审核信息（各页面不一样，不在通用简历表库中）
const AUDIT_SECTION = { sectionKey: 'audit', title: '审核信息' }
// 通用简历表分区（来源于 hr-domain 单源库）+ 环节字段；统一字段名
const RESUME_SECTIONS = [...listResumeSections(), AUDIT_SECTION]

const REVIEW_STATUS_OPTIONS = ['待审核', '审核通过', '审核不通过', '需补充材料']

function ResumeRecordTable({ columns, data }) {
  return (
    <DSDataTable bordered className="ri-extension-table" columns={columns}
      data={data}
      rowKey="id"
      selectable={false}
      showToolbar={false}
      pagination={false}
      minWidth={Math.max(720, columns.length * 120)}
      emptyText="暂无数据"
    />
  )
}

export default function RecruitmentResumePage({
  dataSource,
  detailRecord,
  detailResume,
  detailTitle,
  detailHeaderActions,
  detailFooter,
  onDetailBack,
  enableSectionReview = true,
  showAiOverview = true,
  showApplicationInfo = true,
  showAuditInfo = true,
} = {}) {
  const mock = dataSource || window.RecruitmentMock || {}
  const ALL_PLANS = useMemo(() => mock.loadTodos?.() || [], [mock])
  const ENRICHED = useMemo(() => (mock.loadCandidates?.() || []).map((candidate) => {
    const fullIdCard = candidate.idCard || deriveIdCard(candidate.id)
    return {
      ...candidate,
      gender: candidate.gender || deriveGender(candidate.name),
      idCard: maskId(fullIdCard),
      idCardFull: fullIdCard,
      degreeName: DEGREE_MAP[candidate.degree] || '',
      completeness: candidate.completeness || completenessOf(candidate),
      recruitType: candidate.recruitType || '教师岗招聘',
    }
  }), [mock])
  const [filters, setFilters] = useState({ plan: '', name: '', status: '' })
  const [selectedKeys, setSelectedKeys] = useState([])
  const [page, setPage] = useState(1)
  const [activeId, setActiveId] = useState(null)
  const [reviewSection, setReviewSection] = useState('')
  const [reviewStatus, setReviewStatus] = useState('')
  const [reviewOpinion, setReviewOpinion] = useState('')
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [notifyModalOpen, setNotifyModalOpen] = useState(false)
  const [notifyContent, setNotifyContent] = useState('')
  const [toast, setToast] = useState('')
  const [detailAnchorKey, setDetailAnchorKey] = useState('section-basic')
  const [attachmentDrawerOpen, setAttachmentDrawerOpen] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState(null)
  const [recordDetail, setRecordDetail] = useState(null)
  const [showFullIdCard, setShowFullIdCard] = useState(false)

  const planOptions = useMemo(() => [
    { label: '全部计划', value: '' },
    ...ALL_PLANS.map(p => ({ label: p.name, value: p.id }))
  ], [])

  const filtered = useMemo(() => {
    return ENRICHED.filter(c => {
      if (filters.plan && c.planId !== filters.plan) return false
      if (filters.name && !c.name.includes(filters.name.trim())) return false
      if (filters.status && c.subStatus !== filters.status) return false
      return true
    })
  }, [filters])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const active = useMemo(() => {
    if (detailRecord) {
      return {
        ...detailRecord,
        idCardFull: detailRecord.idCardFull || detailResume?.basic?.idCard,
        idCard: detailRecord.idCard || maskId(detailResume?.basic?.idCard || ''),
        resume: detailResume || detailRecord.resume || mock.generateResumeDetail?.(detailRecord.id) || null,
      }
    }
    if (!activeId) return null
    const candidate = ENRICHED.find(c => c.id === activeId)
    if (!candidate) return null
    return {
      ...candidate,
      resume: mock.generateResumeDetail?.(activeId) || null
    }
  }, [activeId, detailRecord, detailResume, mock])

  const notify = useCallback((message) => {
    setToast(message)
    setTimeout(() => setToast(''), 1800)
  }, [])

  const openDetail = (row) => {
    setActiveId(row.id)
    setDetailAnchorKey('section-basic')
  }

  const columns = useMemo(() => [
    { key: 'name', dataIndex: 'name', title: '姓名', width: 90, fixed: 'left', render: (v) => <b>{v}</b> },
    { key: 'phone', dataIndex: 'phone', title: '手机号', width: 120 },
    { key: 'idCard', dataIndex: 'idCard', title: '证件号码', width: 160 },
    { key: 'planName', title: '招聘批次', width: 160, render: (_, row) => {
      const plan = ALL_PLANS.find(p => p.id === row.planId)
      return plan?.name || row.planId || '—'
    }},
    { key: 'department', title: '应聘部门', width: 140, render: (_, row) => {
      const parts = (row.jobName || '').split('·')
      return parts[0] || '—'
    }},
    { key: 'position', title: '应聘岗位', width: 170, render: (_, row) => {
      const parts = (row.jobName || '').split('·')
      return parts[1] || row.jobName || '—'
    }},
    { key: 'degree', title: '最高学历／学位', width: 120, render: (_, row) => `${row.degree || '—'}${row.degreeName ? '／' + row.degreeName : ''}` },
    { key: 'school', dataIndex: 'school', title: '毕业院校', width: 140 },
    { key: 'major', dataIndex: 'major', title: '所学专业', width: 150 },
    { key: 'arrivedAt', dataIndex: 'arrivedAt', title: '报名时间', width: 120 },
    { key: 'completeness', dataIndex: 'completeness', title: '材料完整度', width: 100, align: 'center', render: (v) => {
      const pct = parseInt(v, 10) || 0
      const tone = pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger'
      return <DSTag tone={tone}>{v}</DSTag>
    }},
    { key: 'subStatus', dataIndex: 'subStatus', title: '审核状态', width: 100, render: (v) => <StatusDot value={v} /> },
    {
      key: 'operation', title: '操作', width: 76, fixed: 'right',
      render: (_, row) => (
        <span className="ri-row-actions">
          <DSButton variant="link" size="small" onClick={() => openDetail(row)}>查看</DSButton>
        </span>
      )
    }
  ], [])

  // ── 通用简历表字段渲染 ──
  // 根据简历表库的字段定义，解析对应值
  const resolveFieldValue = (resume, field) => {
    if (field.computed === 'period') return resolvePeriodValue(resume, field.path)
    const value = resolveResumeValue(resume, field.path)
    return value === undefined || value === null ? '--' : value
  }

  const resolveRecordValue = (row, column) => {
    if (column.computed === 'period') {
      const start = row?.startDate || row?.start || ''
      const end = row?.endDate || row?.end || ''
      return start || end ? `${start || '--'} — ${end || '--'}` : '--'
    }
    const value = row?.[column.key]
    return value === undefined || value === null || value === '' ? '--' : value
  }

  // 把库中的列定义转为 DSDataTable 列，扩展信息直接展示字段值。
  const toTableColumns = (libraryColumns) => {
    return libraryColumns.map((col) => {
      const column = {
        key: col.key,
        dataIndex: col.key,
        title: col.title,
        width: col.width,
        minWidth: col.minWidth,
        render: (_, row) => col.statusTone
          ? <StatusDot value={resolveRecordValue(row, col)} />
          : resolveRecordValue(row, col),
      }
      return column
    })
  }

  // 详情页
  if (active) {
    const resume = active.resume
    const anchorItems = RESUME_SECTIONS.filter((section) => (showApplicationInfo || section.sectionKey !== 'application') && (showAuditInfo || section.sectionKey !== 'audit')).map(s => ({
      key: `section-${s.sectionKey}`,
      href: `#section-${s.sectionKey}`,
      title: s.title
    }))

    const openReview = (sectionKey) => {
      if (!enableSectionReview) return
      setReviewSection(sectionKey)
      setReviewModalOpen(true)
    }

    // 通用 form 分区渲染
    const renderFormSection = (sectionKey) => {
      const fields = listResumeFormFields(sectionKey)
      const items = fields.map((field) => {
        const raw = resolveFieldValue(resume, field)
        if (field.render === 'maskedId') {
          return {
            label: field.label,
            value: (
              <span className="ri-id-masked">
                {showFullIdCard ? (active?.idCardFull || raw) : (active?.idCard || maskId(raw || ''))}
                <DSButton variant="link" size="small" onClick={() => setShowFullIdCard(v => !v)}>
                  {showFullIdCard ? '隐藏' : '查看完整信息'}
                </DSButton>
              </span>
            ),
          }
        }
        if (field.render === 'statusTag') {
          return { label: field.label, value: <StatusDot value={raw} /> }
        }
        if (field.render === 'photo') {
          return {
            label: field.label,
            value: raw && raw !== '--' ? <img src={raw} className="ri-field-photo" alt={field.label} /> : '未上传照片',
          }
        }
        return { label: field.label, value: raw }
      })
      return <DSReadOnlyForm columns={2} items={items} />
    }

    // 通用 table 分区渲染（页面负责数据准备）
    const renderTableSection = (sectionKey, data, columnsOverride, titleOverride) => {
      const libraryColumns = columnsOverride || listResumeColumns(sectionKey)
      const displayColumns = libraryColumns.filter((column) => !['op', 'action'].includes(column.key))
      const cols = [
        ...toTableColumns(displayColumns),
        {
          key: '__detail',
          title: '操作',
          width: 76,
          fixed: 'right',
          align: 'left',
          className: 'ri-extension-table__action',
          render: (_, row) => (
            <DSButton
              variant="link"
              size="small"
              onClick={() => setRecordDetail({
                title: titleOverride || RESUME_SECTIONS.find((item) => item.sectionKey === sectionKey)?.title || '扩展信息',
                items: displayColumns.map((column) => ({ label: column.title, value: resolveRecordValue(row, column) })),
              })}
            >
              详情
            </DSButton>
          ),
        },
      ]
      return <ResumeRecordTable columns={cols} data={data} />
    }

    return (
      <main className={`resume-info-page ri-detail-page${enableSectionReview ? ' ri-detail-page--reviewable' : ''}${showAiOverview ? '' : ' ri-detail-page--hide-ai'}`} data-ds-business-page="resume-info-detail">
        <DSSubPageHeader
          title={detailTitle || `${active.name} · 简历信息`}
          backLabel="返回"
          onBack={() => onDetailBack ? onDetailBack() : setActiveId(null)}
          actions={detailHeaderActions ?? (
            <>
              <DSButton variant="default" onClick={() => { setNotifyContent(''); setNotifyModalOpen(true) }}>
                补材料通知
              </DSButton>
              <DSButton variant="primary" onClick={() => notify('报名表PDF已生成，开始下载...')}>
                生成报名表PDF
              </DSButton>
            </>
          )}
        />

        <div className="ri-detail-layout">
          <div className="ri-detail-content">
            {/* AI审核概览 */}
            {showAiOverview && <section className="ri-ai-overview" id="section-ai">
              <div className="ri-ai-overview-head">
                <span>✦</span>
                <strong>AI 综合审核建议</strong>
                <DSTag tone={resume?.aiReview?.hasRisk ? 'danger' : 'success'}>
                  {resume?.aiReview?.hasRisk ? '存在异常' : '材料完整'}
                </DSTag>
              </div>
              <p>{resume?.aiReview?.advice || '材料完整，符合岗位要求'}</p>
              {resume?.aiReview?.mismatchedFields?.length > 0 && (
                <div className="ri-ai-mismatch">
                  <span>异常字段：</span>
                  {resume.aiReview.mismatchedFields.map((f, i) => (
                    <DSTag key={i} tone="warning">{f}</DSTag>
                  ))}
                </div>
              )}
            </section>}

            {/* 基本信息 */}
            <section className="ri-detail-section" id="section-basic">
              <div className="ri-section-head">
                <h3>基本信息</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('basic')}>
                  分区审核
                </DSButton>
              </div>
              {renderFormSection('basic')}
            </section>

            {/* 配偶信息 */}
            <section className="ri-detail-section" id="section-spouse">
              <div className="ri-section-head">
                <h3>配偶信息</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('spouse')}>
                  分区审核
                </DSButton>
              </div>
              {resume?.spouse ? (
                renderFormSection('spouse')
              ) : (
                <div className="ri-empty-tip">暂无配偶信息</div>
              )}
            </section>

            {/* 报名信息 */}
            {showApplicationInfo && <section className="ri-detail-section" id="section-application">
              <div className="ri-section-head">
                <h3>报名信息</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('application')}>
                  分区审核
                </DSButton>
              </div>
              {renderFormSection('application')}
            </section>}

            {/* 学历学位 */}
            <section className="ri-detail-section" id="section-education">
              <div className="ri-section-head">
                <h3>学历学位</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('education')}>
                  分区审核
                </DSButton>
              </div>
              {renderTableSection('education', [
                ['bachelor', '本科'],
                ['master', '硕士'],
                ['doctor', '博士'],
              ].filter(([key]) => resume?.education?.[key]).map(([key, level]) => {
                const item = resume.education[key]
                return { ...item, id: key, level, period: `${item.startDate} — ${item.endDate}` }
              }))}
            </section>

            {/* 工作经历 */}
            <section className="ri-detail-section" id="section-work">
              <div className="ri-section-head">
                <h3>工作经历</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('work')}>
                  分区审核
                </DSButton>
              </div>
              {resume?.workExperience?.length > 0 ? (
                renderTableSection('work', resume.workExperience.map((item, index) => ({ ...item, id: item.id || `work-${index}`, period: `${item.startDate} — ${item.endDate}` })))
              ) : (
                <div className="ri-empty-tip">暂无工作经历</div>
              )}
            </section>

            {/* 专业技术资格 */}
            <section className="ri-detail-section" id="section-technical">
              <div className="ri-section-head">
                <h3>专业技术职务或技术工人等级</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('technical')}>
                  分区审核
                </DSButton>
              </div>
              {resume?.technicalTitles?.length > 0 ? (
                renderTableSection('technical', resume.technicalTitles.map((item, index) => ({ ...item, id: item.id || `technical-${index}` })))
              ) : (
                <div className="ri-empty-tip">暂无专业技术资格</div>
              )}
            </section>

            {/* 职业资格 */}
            <section className="ri-detail-section" id="section-professional">
              <div className="ri-section-head">
                <h3>职业资格</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('professional')}>
                  分区审核
                </DSButton>
              </div>
              {resume?.professionalQualifications?.length > 0 ? (
                renderTableSection('professional', resume.professionalQualifications.map((item, index) => ({ ...item, id: item.id || `professional-${index}` })))
              ) : (
                <div className="ri-empty-tip">暂无职业资格</div>
              )}
            </section>

            {/* 资质信息 */}
            <section className="ri-detail-section" id="section-qualification">
              <div className="ri-section-head">
                <h3>资质信息</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('qualification')}>
                  分区审核
                </DSButton>
              </div>
              {renderFormSection('qualification')}
            </section>

            {/* 博士后经历 */}
            <section className="ri-detail-section" id="section-postdoc">
              <div className="ri-section-head">
                <h3>博士后经历</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('postdoc')}>
                  分区审核
                </DSButton>
              </div>
              {resume?.postdoctoral ? (
                renderFormSection('postdoc')
              ) : (
                <div className="ri-empty-tip">暂无博士后经历</div>
              )}
            </section>

            {/* 科研能力（各类论文数） */}
            <section className="ri-detail-section" id="section-paperStats">
              <div className="ri-section-head">
                <h3>科研能力（各类论文数）</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('paperStats')}>
                  分区审核
                </DSButton>
              </div>
              {resume?.paperStats ? (
                renderFormSection('paperStats')
              ) : (
                <div className="ri-empty-tip">暂无科研能力统计</div>
              )}
            </section>

            {/* 科研与业绩成果 */}
            <section className="ri-detail-section" id="section-research">
              <div className="ri-section-head">
                <h3>科研与业绩成果</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('research')}>
                  分区审核
                </DSButton>
              </div>
              {listResumeSubsections('research').map((sub) => {
                const data = (resume?.[sub.key] || []).map((item, index) => ({
                  ...item,
                  id: item.id || `${sub.key}-${index}`,
                  ...(sub.key === 'projects' ? { period: `${item.startDate} — ${item.endDate}` } : {}),
                }))
                return (
                  <div className="ri-subsection" key={sub.key}>
                    <h4>{sub.title}</h4>
                    {data.length > 0 ? (
                      renderTableSection(sub.key, data, sub.columns, sub.title)
                    ) : (
                      <div className="ri-empty-tip">
                        暂无{sub.title.replace('情况', '').replace('成果', '')}
                      </div>
                    )}
                  </div>
                )
              })}
            </section>

            {/* 外语等级 */}
            <section className="ri-detail-section" id="section-language">
              <div className="ri-section-head">
                <h3>外语等级及成绩</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('language')}>
                  分区审核
                </DSButton>
              </div>
              {renderFormSection('language')}
            </section>

            {/* 填表信息 */}
            <section className="ri-detail-section" id="section-submission">
              <div className="ri-section-head">
                <h3>填表信息</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('submission')}>
                  分区审核
                </DSButton>
              </div>
              {renderFormSection('submission')}
            </section>

            {/* 附件材料 */}
            <section className="ri-detail-section" id="section-attachments">
              <div className="ri-section-head">
                <h3>附件材料</h3>
                <DSButton variant="link" size="small" onClick={() => openReview('attachments')}>
                  分区审核
                </DSButton>
              </div>
              {(() => {
                const ATTACH_REQUIRED = ['个人简历', '身份证', '学历证书', '学位证书', '学历认证', '职称证书', '职业资格证书', '代表性成果', '其他材料']
                // 非必传(缺失时提示补充而非直接缺失)的材料
                const OPTIONAL = ['职称证书', '职业资格证书', '其他材料']
                // 部分材料默认为已失效(如过期认证)
                const EXPIRED_HINT = ['学历认证', '职称证书']
                const files = (resume?.attachments || []).map((f) => String(f))
                // 基于 id 稳定派生:部分材料显示为"已失效"
                const seed = (active?.id || '').length
                const matched = ATTACH_REQUIRED.map((cat, idx) => {
                  const hit = files.find((f) => f.includes(cat.slice(0, 2)) || f === cat)
                  if (hit) {
                    // 已上传;个别类别标识为已失效
                    if (EXPIRED_HINT.includes(cat) && (seed + idx) % 5 === 0) {
                      return { cat, name: hit, status: '已失效', time: '2025-08-15 09:30', missing: false, disabled: true }
                    }
                    return { cat, name: hit, status: '已上传', time: '2026-03-08 10:15', missing: false }
                  }
                  // 未上传:必传→缺失,非必传→待补充
                  if (OPTIONAL.includes(cat)) {
                    return { cat, name: '', status: '待补充', time: '', missing: true }
                  }
                  return { cat, name: '', status: '缺失', time: '', missing: true }
                })
                // 额外未归类文件
                const extra = files.filter((f) => !ATTACH_REQUIRED.some((cat) => f.includes(cat.slice(0, 2)) || f === cat))
                  .map((f) => ({ cat: '其他材料', name: f, status: '已上传', time: '2026-03-08 10:15', missing: false }))
                const rows = [...matched, ...extra]
                const statusToneMap = { '已上传': 'done', '缺失': 'neutral', '待补充': 'warn', '已失效': 'neutral' }
                const attachColumns = toTableColumns(listResumeColumns('attachments')).map((col) => {
                  if (col.key === 'status') {
                    return { ...col, render: (v) => <StatusDot value={v} tone={statusToneMap[v] || 'neutral'} /> }
                  }
                  if (col.key === 'op') {
                    return { ...col, render: (_, row) => row.name ? (
                      <span className="ri-row-actions">
                        <DSButton variant="link" size="small" onClick={() => { setSelectedAttachment({ type: 'file', name: row.name }); setAttachmentDrawerOpen(true) }}>预览</DSButton>
                        <span className="ri-actions-divider">|</span>
                        <DSButton variant="link" size="small" onClick={() => notify(`下载「${row.name}」（演示）`)}>下载</DSButton>
                      </span>
                    ) : <span className="ri-missing">—</span> }
                  }
                  if (col.key === 'name' || col.key === 'time') {
                    return { ...col, render: (v, row) => row[col.key] ? v : <span className="ri-missing">—</span> }
                  }
                  return col
                })
                return (
                  <DSDataTable bordered columns={attachColumns}
                    data={rows}
                    rowKey="cat"
                    selectable={false}
                    showToolbar={false}
                    pagination={false}
                    minWidth={800}
                    emptyText="暂无附件"
                  />
                )
              })()}
            </section>

            {/* 审核信息 — 环节字段，页面本地维护 */}
            {showAuditInfo && <section className="ri-detail-section" id="section-audit">
              <div className="ri-section-head">
                <h3>审核信息</h3>
                <DSButton variant="link" size="small" onClick={() => { setReviewSection('application'); setReviewModalOpen(true) }}>
                  综合审核
                </DSButton>
              </div>
              {(() => {
                const missingList = (resume?.aiReview?.mismatchedFields || []).length ? resume.aiReview.mismatchedFields : []
                return (
                  <>
                    <DSReadOnlyForm columns={2} items={[
                      { label: '材料完整度', value: active.completeness },
                      { label: '缺失材料', value: missingList.length ? missingList.join('、') : '无' },
                      { label: 'AI预审结果', value: resume?.aiReview?.hasRisk ? '有异常' : '正常' },
                      { label: '人工审核状态', value: active.subStatus },
                      { label: '审核意见', value: resume?.aiReview?.advice || '—' },
                      { label: '审核人', value: '人事处·王芳' },
                      { label: '审核时间', value: '2026-03-09 14:20' },
                    ]} />
                    {missingList.length ? (
                      <div className="ri-audit-warn">
                        <DSTag tone="danger">缺失或异常</DSTag>
                        <span>以下材料缺失或预审异常：{missingList.join('、')}，建议通知应聘者补充。</span>
                      </div>
                    ) : null}
                  </>
                )
              })()}
            </section>}
          </div>

          {/* 右侧锚点导航 */}
          <aside className="ri-detail-anchor" aria-label="简历分区导航">
            <div className="ri-photo-wrap ri-photo-anchor">
              <div className="ri-id-photo" role="img" aria-label={`${active.name}证件照`}>
                <img src={resume?.basic?.photo} alt={`${active.name}证件照`} />
              </div>
              <strong className="ri-photo-name">{active.name}</strong>
              <DSButton variant="link" size="small" onClick={() => { setSelectedAttachment({ type: 'photo', name: '证件照', url: resume?.basic?.photo }); setAttachmentDrawerOpen(true) }}>
                查看附件
              </DSButton>
            </div>
            <div className="ri-detail-side-summary">
              <div>
                <span>应聘岗位</span>
                <strong>{active.jobName}</strong>
              </div>
              <div>
                <span>当前状态</span>
                <strong>{active.subStatus}</strong>
              </div>
            </div>
            <strong>内容导航</strong>
            <nav className="ri-detail-nav" aria-label="简历内容锚点">
              {anchorItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className={item.key === detailAnchorKey ? 'is-active' : ''}
                  onClick={(event) => {
                    event.preventDefault()
                    setDetailAnchorKey(item.key)
                    document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </aside>
        </div>

        {detailFooter}

        {/* 分区审核弹窗 */}
        <DSModal
          open={reviewModalOpen}
          size="small"
          title={`${RESUME_SECTIONS.find(s => s.sectionKey === reviewSection)?.title || ''}审核`}
          okText="确认审核"
          cancelText="取消"
          onCancel={() => { setReviewModalOpen(false); setReviewOpinion(''); setReviewStatus('') }}
          onOk={() => {
            if (!reviewStatus) { notify('请选择审核结果'); return }
            if (reviewStatus === '审核不通过' && !reviewOpinion.trim()) { notify('请填写审核意见'); return }
            notify(`${RESUME_SECTIONS.find(s => s.sectionKey === reviewSection)?.title}审核完成`)
            setReviewModalOpen(false)
            setReviewOpinion('')
            setReviewStatus('')
          }}
        >
          <div className="ri-review-modal">
            <DSEditField label="审核结果" required>
              <DSRadioGroup
                value={reviewStatus}
                options={REVIEW_STATUS_OPTIONS.map(s => ({ label: s, value: s }))}
                onChange={setReviewStatus}
              />
            </DSEditField>
            <DSEditField label="审核意见" required={reviewStatus === '审核不通过'}>
              <DSTextarea
                value={reviewOpinion}
                placeholder="请输入审核意见"
                rows={4}
                onChange={(e) => setReviewOpinion(e.target.value)}
              />
            </DSEditField>
          </div>
        </DSModal>

        {/* 补材料通知弹窗 */}
        <DSModal
          open={notifyModalOpen}
          width="min(720px, calc(100vw - 64px))"
          title="发送补材料通知"
          okText="发送通知"
          cancelText="取消"
          onCancel={() => setNotifyModalOpen(false)}
          onOk={() => {
            if (!notifyContent.trim()) { notify('请填写通知内容'); return }
            notify('补材料通知已发送')
            setNotifyModalOpen(false)
          }}
        >
          <div className="ri-notify-modal">
            <DSEditField label="通知对象">
              <DSInput value={`${active.name} (${active.phone})`} disabled />
            </DSEditField>
            <DSEditField label="通知内容" required>
              <DSTextarea
                value={notifyContent}
                placeholder="请输入需要补充的材料清单和要求..."
                rows={6}
                onChange={(e) => setNotifyContent(e.target.value)}
              />
            </DSEditField>
          </div>
        </DSModal>

        {/* 扩展信息详情 */}
        <DSModal
          open={!!recordDetail}
          width="min(760px, calc(100vw - 64px))"
          title={`${recordDetail?.title || '扩展信息'}详情`}
          showFooter={false}
          onCancel={() => setRecordDetail(null)}
        >
          <DSReadOnlyForm columns={2} items={recordDetail?.items || []} />
        </DSModal>

        {/* 附件查看抽屉 */}
        <DSDrawer
          open={attachmentDrawerOpen}
          width={640}
          showFooter={false}
          title={selectedAttachment?.name || '附件查看'}
          onClose={() => { setAttachmentDrawerOpen(false); setSelectedAttachment(null) }}
        >
          <div className="ri-attachment-preview">
            {selectedAttachment?.type === 'photo' && (
              <img src={selectedAttachment.url} alt={selectedAttachment.name} />
            )}
            {selectedAttachment?.type === 'certificate' && (
              <div className="ri-certificate-preview">
                <div className="ri-certificate-icon">📄</div>
                <p>{selectedAttachment.name}</p>
                <DSButton variant="primary">下载证书</DSButton>
              </div>
            )}
            {selectedAttachment?.type === 'file' && (
              <div className="ri-file-preview">
                <div className="ri-file-icon">📎</div>
                <p>{selectedAttachment.name}</p>
                <DSButton variant="primary">下载文件</DSButton>
              </div>
            )}
          </div>
        </DSDrawer>

        {toast && <div className="ri-toast" role="status" aria-live="polite">{toast}</div>}
      </main>
    )
  }

  // 列表页
  return (
    <main className="resume-info-page" data-ds-business-page="resume-info">
      <header className="ri-top">
        <DSTabs
          items={[{ key: 'list', label: '简历信息列表' }]}
          activeKey="list"
          variant="section"
        />
      </header>

      <section className="ri-workspace">
        <div className="ri-filter-panel">
          <div className="ri-filter">
            <label>
              <span>招聘计划</span>
              <DSSelect
                value={filters.plan}
                options={planOptions}
                onChange={(value) => { setFilters(prev => ({ ...prev, plan: value })); setPage(1) }}
              />
            </label>
            <label>
              <span>姓名</span>
              <DSInput
                value={filters.name}
                placeholder="请输入姓名"
                onChange={(e) => { setFilters(prev => ({ ...prev, name: e.target.value })); setPage(1) }}
              />
            </label>
            <label>
              <span>审核状态</span>
              <DSSelect
                value={filters.status}
                options={[
                  { label: '全部状态', value: '' },
                  { label: '待审核', value: '待审核' },
                  { label: '审核通过', value: '审核通过' },
                  { label: '审核不通过', value: '审核不通过' },
                ]}
                onChange={(value) => { setFilters(prev => ({ ...prev, status: value })); setPage(1) }}
              />
            </label>
            <div className="ri-filter-actions">
              <DSButton variant="default" onClick={() => { setFilters({ plan: '', name: '', status: '' }); setPage(1) }}>
                重置
              </DSButton>
              <DSButton variant="primary" onClick={() => notify('查询完成')}>
                查询
              </DSButton>
            </div>
          </div>
        </div>

        <div className="ri-table-frame">
          <DSDataTable bordered className="ri-table"
            showToolbar={false}
            columns={columns}
            data={pageRows}
            rowKey="id"
            selectable
            selectedRowKeys={selectedKeys}
            onSelectRow={(key, checked) => setSelectedKeys(prev => checked ? [...prev, key] : prev.filter(k => k !== key))}
            onSelectAll={(checked, records) => setSelectedKeys(checked ? records.map(r => r.id) : [])}
            showIndex
            minWidth={980}
            emptyText="暂无简历信息"
          />
        </div>

        <div className="ri-page-actions">
          <span>共 {filtered.length} 条</span>
          <DSButton variant="link" size="small" disabled={currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            上一页
          </DSButton>
          <b>{currentPage}</b>
          <DSButton variant="link" size="small" disabled={currentPage >= pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))}>
            下一页
          </DSButton>
          <span>共 {pageCount} 页</span>
        </div>
      </section>

      {toast && <div className="ri-toast" role="status" aria-live="polite">{toast}</div>}
    </main>
  )
}
