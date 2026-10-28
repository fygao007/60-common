import { createRoot } from 'react-dom/client'
import { DSSubPageHeader } from '@wisedu/design-system'
import { SourceEditNote } from '../../shared/components'
import './enterprise-practice.css'

const PRACTICES = [
  { id: 'practice-2025-smart-hardware', company: '联科精密电子股份有限公司', code: '91440300MA5K1C8X6L', industry: '科技行业', startDate: '2025-01-01', endDate: '2025-02-01', content: '参与智能硬件测试流程、生产现场工艺诊断与岗位能力调研，跟岗了解企业真实生产任务、质量控制要求和技术岗位协作流程。', result: '形成智能硬件测试岗位能力分析报告，完成企业测试流程优化建议 1 项，并沉淀可用于课堂教学的真实任务案例。', transfer: '更新《嵌入式系统开发》项目案例 2 个，补充企业真实测试任务单、岗位能力评价表和课堂实践指导材料。' },
  { id: 'practice-2024-industrial-internet', company: '深圳云启工业互联网有限公司', code: '91440300MA5L9F2P3Q', industry: '科技行业', startDate: '2024-07-01', endDate: '2024-08-30', content: '参与工业互联网平台项目调研，了解设备数据采集、边缘网关配置、生产数据看板和企业数字化改造实施流程。', result: '完成企业数字化岗位能力画像，梳理工业互联网平台课程案例，形成校企协同实践任务清单。', transfer: '将设备数据采集、异常诊断和看板配置转化为课程综合实训项目，补充课堂演示数据与考核 rubrics。' },
  { id: 'practice-2023-ai-platform', company: '鹏城智慧教育科技有限公司', code: '91440300MA5H7N8R2T', industry: '科技行业', startDate: '2023-12-01', endDate: '2024-01-15', content: '参与智慧教学平台功能验证、课堂学习数据分析和产品需求评审，重点了解教育技术产品从需求到交付的全流程。', result: '沉淀智慧教学平台应用案例，完善学习过程数据采集与课堂反馈分析方法。', transfer: '转化为信息化教学工具应用专题，纳入课程资源建设和教师教学改进材料。' },
]

const SORTED_PRACTICES = [...PRACTICES].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

function PracticeBlock({ title, children }) {
  return (
    <div className="ep-practice-block">
      <div className="ep-practice-block__title">{title}</div>
      <div className="ep-practice-block__content">{children}</div>
    </div>
  )
}

function PracticeCard({ item }) {
  return (
    <article className="ep-practice-card" id={item.id}>
      <div className="ep-practice-card__head">
        <h3>{item.company}（{item.code}）</h3>
        <div className="ep-practice-meta" aria-label="企业实践关键信息">
          <span>所属行业 <strong>{item.industry}</strong></span>
          <span>实践开始时间 <strong>{item.startDate}</strong></span>
          <span>实践结束时间 <strong>{item.endDate}</strong></span>
        </div>
      </div>

      <div className="ep-practice-card__body">
        <PracticeBlock title="实践内容">{item.content}</PracticeBlock>
        <PracticeBlock title="实践成果">{item.result}</PracticeBlock>
        <PracticeBlock title="转化内容">{item.transfer}</PracticeBlock>
      </div>
    </article>
  )
}

function PracticeTimeline() {
  return (
    <div className="ep-timeline" aria-label="企业实践经历时间轴">
      {SORTED_PRACTICES.map((item) => (
        <div className="ep-timeline-item" key={item.id}>
          <span className="ep-timeline-dot" aria-hidden="true" />
          <PracticeCard item={item} />
        </div>
      ))}
    </div>
  )
}

function EnterprisePracticePage() {
  const onBack = () => { window.location.href = 't-overview.html' }
  const onEdit = () => { window.location.hash = 'enterprise-practice-records' }

  return (
    <main className="ep-page" data-ds-business-page="enterprise-practice">
      <div className="ep-content-card">
        <DSSubPageHeader className="ep-top-header" title="企业实践" backLabel="返回" onBack={onBack} surface={false} />
        <section className="ep-records" id="enterprise-practice-records">
          <div className="ep-section-head">
            <h2 className="ep-section-title">企业实践记录</h2>
            <SourceEditNote source="人事系统" onEdit={onEdit} />
          </div>
          <PracticeTimeline />
        </section>
      </div>
    </main>
  )
}

createRoot(document.getElementById('app')).render(<EnterprisePracticePage />)