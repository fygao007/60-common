import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSAlert,
  DSButton,
  DSCard,
  DSDataTable,
  DSField,
  DSInput,
  DSPageHeader,
  DSSelect,
  DSTag,
  DSUpload,
} from '@wisedu/design-system'
import './teaching-portfolio-teacher.css'

const featureMeta = {
  'tp-overview': ['档', '档案总览'],
  'tp-courses': ['课', '课程教学档案'],
  'tp-upload': ['传', '教学文件上传'],
  'tp-reflect': ['思', '教学总结与反思'],
  'tp-achievements': ['果', '荣誉与成果'],
  'tp-club': ['团', '学生社团档案'],
  'tp-coop': ['企', '现场工程师班'],
  'tp-feedback': ['信', '我收到的反馈'],
  'tp-visibility': ['开', '开放范围设置'],
  'tp-kpi': ['标', '我的目标'],
  'tp-portrait': ['像', '成长画像'],
}

const achievementRows = [
  { id: 1, name: '全国职业院校技能大赛「嵌入式系统应用开发」赛项 省级一等奖', type: '指导学生', level: 'A类 · 省级一等 · 指导教师', date: '2026-04', score: 12, evidence: '证书+名单', status: '已核验 · 已回填目标', tone: 'success' },
  { id: 2, name: '广东省职业院校教学能力比赛 二等奖', type: '教学竞赛', level: 'A类 · 省级二等 · 第一完成人', date: '2025-09', score: 8, evidence: '证书', status: '已核验', tone: 'success' },
  { id: 3, name: '《嵌入式系统开发实践教程》（高等教育出版社）', type: '教材编写', level: '主编', date: '2024-08', score: 6, evidence: '封面+CIP', status: '已核验', tone: 'success' },
  { id: 4, name: '校级教改课题「岗课赛证融通的嵌入式课程重构」', type: '教研项目', level: '校级 · 主持', date: '2025-03 立项', score: 4, evidence: '立项书', status: '在研', tone: 'primary' },
  { id: 5, name: '指导学生发明专利「一种低功耗循迹小车控制电路」', type: '专利', level: '授权 · 第一指导教师', date: '2025-12', score: 3, evidence: '专利证书', status: '已核验', tone: 'success' },
]

const genericRows = [
  { id: 1, title: '嵌入式系统开发', category: '课程教学档案', updatedAt: '2026-06-10', status: '已归档' },
  { id: 2, title: '单片机应用技术', category: '课程教学档案', updatedAt: '2026-06-08', status: '进行中' },
  { id: 3, title: '智能小车协会过程材料', category: '特色档案', updatedAt: '2026-06-05', status: '待审核' },
]

const achievementColumns = [
  { key: 'name', dataIndex: 'name', title: '成果名称', width: 360 },
  { key: 'type', dataIndex: 'type', title: '类别', width: 120 },
  { key: 'level', dataIndex: 'level', title: '等级 / 角色', width: 240 },
  { key: 'date', dataIndex: 'date', title: '取得时间', width: 140 },
  { key: 'score', dataIndex: 'score', title: '赋分', width: 90, render: (value) => <strong>{value}</strong> },
  { key: 'evidence', dataIndex: 'evidence', title: '佐证', width: 130, render: (value) => <DSButton variant="link">{value}</DSButton> },
  { key: 'status', dataIndex: 'status', title: '状态', width: 190, render: (value, row) => <DSTag tone={row.tone}>{value}</DSTag> },
]

const genericColumns = [
  { key: 'title', dataIndex: 'title', title: '名称', width: 360 },
  { key: 'category', dataIndex: 'category', title: '分类', width: 220 },
  { key: 'updatedAt', dataIndex: 'updatedAt', title: '更新时间', width: 160 },
  { key: 'status', dataIndex: 'status', title: '状态', width: 140, render: (value) => <DSTag status={value}>{value}</DSTag> },
]

const typeOptions = ['指导学生竞赛获奖', '教学竞赛获奖', '教材编写', '教研教改项目', '论文论著', '专利（含指导学生）']
const levelOptions = ['国家级一等奖', '国家级二等奖', '省级一等奖', '省级二等奖', '校级']
const roleOptions = ['指导教师（第一）', '指导教师（其他）', '第一完成人', '主持人', '主编', '团队成员']

function PageTitle({ feature }) {
  const [badge, title] = featureMeta[feature] || ['档', '教学档案袋']
  return (
    <span className="tp-page__title">
      <span className="tp-page__badge" aria-hidden="true">{badge}</span>
      <span>{title}</span>
    </span>
  )
}

function LabelWithHint({ children, hint }) {
  return (
    <span className="tp-field-label">
      <span>{children}</span>
      {hint ? <span className="tp-field-label__hint">{hint}</span> : null}
    </span>
  )
}

function AchievementView({ notify }) {
  const [submitting, setSubmitting] = useState(false)

  const submit = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      notify('成果已提交核验')
    }, 600)
  }

  return (
    <>
      <DSPageHeader
        title={<PageTitle feature="tp-achievements" />}
        actions={<DSButton variant="default">生成申报材料包</DSButton>}
      />
      <DSAlert>
        成果一次登记、多处调用：经学院核验后可被「职称评审」「项目申报」直接引用，并自动回填团队目标进度、计入成长画像赋分。
      </DSAlert>
      <DSCard
        className="tp-form-card"
        layout="long"
        title="成果登记"
        extra={<DSTag tone="neutral">带 * 为必填项</DSTag>}
      >
        <div className="tp-form-grid">
          <DSField className="tp-form-field" label="成果类别" required>
            <DSSelect className="tp-control" defaultValue={typeOptions[0]} options={typeOptions} />
          </DSField>
          <DSField className="tp-form-field" label="成果名称" required>
            <DSInput placeholder="如：全国职业院校技能大赛「嵌入式系统应用开发」赛项" />
          </DSField>
          <DSField className="tp-form-field" label={<LabelWithHint hint="（竞赛类必选，由校级标准库带出）">赛事分级</LabelWithHint>}>
            <DSSelect className="tp-control" defaultValue="A 类" options={['A 类', 'B 类', '非分级赛事']} />
          </DSField>
          <DSField className="tp-form-field" label={<LabelWithHint hint="（竞赛/荣誉类必选）">获奖等级</LabelWithHint>}>
            <DSSelect className="tp-control" defaultValue={levelOptions[0]} options={levelOptions} />
          </DSField>
          <DSField className="tp-form-field" label="取得时间" required>
            <DSInput aria-label="取得时间" placeholder="YYYY-MM，如 2026-04" />
          </DSField>
          <DSField className="tp-form-field" label="本人角色" required>
            <DSSelect className="tp-control" defaultValue={roleOptions[0]} options={roleOptions} />
          </DSField>
          <DSField className="tp-form-field" label="团队成员 / 获奖学生">
            <DSInput placeholder="多人用顿号分隔，学生注明年级" />
          </DSField>
          <DSField className="tp-form-field" label={<LabelWithHint hint="（系统按指标自动匹配，可调整）">关联团队目标</LabelWithHint>}>
            <DSSelect className="tp-control" defaultValue="自动匹配：指导学生获省技能大赛一等奖" options={['自动匹配：指导学生获省技能大赛一等奖', '不关联']} />
          </DSField>
          <DSField className="tp-form-grid__full" label="佐证材料" required>
            <DSUpload
              accept=".pdf,.jpg,.jpeg,.png"
              description="支持 pdf、jpg、png，可上传多份"
              maxCount={6}
              multiple
              uploadText="上传证书扫描件 / 获奖文件"
            />
            <p className="tp-upload-note">佐证经学院核验后成果生效；预估赋分按校级 A/B 类标准自动计算，本人不可修改。</p>
          </DSField>
        </div>
        <div className="tp-form-actions">
          <DSButton variant="default" onClick={() => notify('草稿已保存')}>存为草稿</DSButton>
          <DSButton loading={submitting} onClick={submit}>提交核验</DSButton>
        </div>
      </DSCard>
      <DSDataTable
        title="我的成果列表"
        summary="已登记 9 项 · 本年赋分 23"
        columns={achievementColumns}
        data={achievementRows}
        minWidth={1230}
        selectable={false}
        tableTools={false}
      />
    </>
  )
}

function OverviewView() {
  return (
    <>
      <DSPageHeader title={<PageTitle feature="tp-overview" />} />
      <div className="tp-metric-grid">
        {[
          ['86%', '档案完整度'],
          ['61', '累计归档材料'],
          ['3', '待办事项'],
          ['86.5', '教学画像综合分'],
        ].map(([value, label]) => (
          <DSCard key={label} layout="long">
            <div className="tp-metric"><strong>{value}</strong><span>{label}</span></div>
          </DSCard>
        ))}
      </div>
      <DSDataTable title="最近动态" columns={genericColumns} data={genericRows} selectable={false} tableTools={false} />
    </>
  )
}

function UploadView({ notify }) {
  return (
    <>
      <DSPageHeader title={<PageTitle feature="tp-upload" />} />
      <DSCard layout="long" title="上传教学文件">
        <DSUpload
          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
          description="支持文档、表格和压缩包，单次最多 10 份"
          maxCount={10}
          mode="dragger"
          multiple
          onChange={(files) => files.length && notify(`已选择 ${files.length} 个文件`)}
        />
      </DSCard>
    </>
  )
}

function GenericView({ feature }) {
  const [, title] = featureMeta[feature] || featureMeta['tp-overview']
  return (
    <>
      <DSPageHeader title={<PageTitle feature={feature} />} />
      <DSAlert tone="info">{title}使用统一设计系统组件呈现，业务数据可在接入接口后替换。</DSAlert>
      <div className="tp-card-grid">
        <DSCard layout="long" title="当前进度" status="进行中" statusTone="primary">
          <div className="tp-metric"><strong>72%</strong><span>本学年材料完成度</span></div>
        </DSCard>
        <DSCard layout="long" title="待处理事项" status="待处理" statusTone="warning">
          <div className="tp-metric"><strong>3</strong><span>需要本人确认或补充</span></div>
        </DSCard>
      </div>
      <DSDataTable title={title} columns={genericColumns} data={genericRows} selectable={false} tableTools={false} />
    </>
  )
}

function TeachingPortfolioApp() {
  const initialFeature = window.__DS_PAGE__?.activeFeature || 'tp-achievements'
  const [feature, setFeature] = useState(initialFeature)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const onFeatureChange = (event) => setFeature(event.detail.key)
    window.addEventListener('ds:feature-change', onFeatureChange)
    return () => window.removeEventListener('ds:feature-change', onFeatureChange)
  }, [])

  useEffect(() => {
    if (!message) return undefined
    const timer = window.setTimeout(() => setMessage(''), 1800)
    return () => window.clearTimeout(timer)
  }, [message])

  const content = useMemo(() => {
    if (feature === 'tp-achievements') return <AchievementView notify={setMessage} />
    if (feature === 'tp-overview') return <OverviewView />
    if (feature === 'tp-upload') return <UploadView notify={setMessage} />
    return <GenericView feature={feature} />
  }, [feature])

  return (
    <main className="tp-page" data-ds-business-page="teaching-portfolio-teacher">
      {content}
      {message ? <div className="tp-toast" role="status">{message}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<TeachingPortfolioApp />)
