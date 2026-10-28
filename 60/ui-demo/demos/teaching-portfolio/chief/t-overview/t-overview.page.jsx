import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSButton,
  DSDrawer,
  DSEditField,
  DSInput,
  DSModal,
  DSTabs,
  DSTextarea,
} from '@wisedu/design-system'
import { ArchiveCard } from '../../shared/components'
import './t-overview.css'

// 一个理念的版本：降序(最新在前)
// { version, time, author, label, content }
const now = () => new Date().toISOString().slice(0, 10)

const mkVersion = (label, content, version, time) => ({ version, time, label, content })

// === 两组教学理念：育人理念 / 教学理念 ===
const IDEA_GROUPS = [
  {
    key: 'educate', label: '育人理念',
    items: [
      {
        key: 'ethics', versions: [
          mkVersion('立德树人、润物无声', '把价值引领融入课程内容、专业实践和师生交往，以教师的专业态度、责任意识和行为示范影响学生，引导学生成为有本领、有担当的专业人才。', 3, '2026-07-01'),
          mkVersion('立德树人、润物无声', '把价值引领融入专业实践和师生交往，引导学生成为有担当的专业人才。', 2, '2026-05-10'),
          mkVersion('立德树人', '注重价值引领，引导学生成长。', 1, '2026-03-15'),
        ],
      },
      {
        key: 'student', versions: [
          mkVersion('大先生', '坚持以学生成长为中心，在专业知识之外关注学生的学习方法、职业素养和责任意识。课堂教学强调真实任务、规范表达和持续反思，让学生在解决问题的过程中建立专业自信。', 2, '2026-06-20'),
          mkVersion('大先生', '以学生成长为中心，关注学生的职业素养和责任意识。', 1, '2026-04-08'),
        ],
      },
      {
        key: 'research', versions: [
          mkVersion('教研相长、研学相长', '将科研训练、产业案例与课程改革结合起来，把研究中的问题意识和方法意识转化为课堂资源，持续推动课程内容更新、实践任务优化和学习评价改进。', 2, '2026-06-25'),
          mkVersion('教研相长', '科研与课程结合，推动课程持续改进。', 1, '2026-02-28'),
        ],
      },
    ],
  },
  {
    key: 'teaching', label: '教学理念',
    items: [
      {
        key: 'skills', versions: [
          mkVersion('教学的根本是传授知识技能', '本人每年春季学期讲授64学时"电路原理"课程，始终坚持课大于天、以本为本，把给本科生上好课作为工作的第一要务。本人讲授该课程以来，从未因出差、开会或身体原因调整过一次课堂讲授，以最高权重保证本科课程教学。', 2, '2026-06-18'),
          mkVersion('教学的根本是传授知识技能', '坚持课大于天、以本为本，把给本科生上好课作为第一要务。', 1, '2026-03-01'),
        ],
      },
      {
        key: 'practice', versions: [
          mkVersion('知行合一、学以致用', '将真实项目、企业标准和岗位任务引入教学，通过任务驱动、项目实践和反思总结，帮助学生把专业知识转化为解决实际问题的能力。', 3, '2026-07-05'),
          mkVersion('知行合一、学以致用', '将真实项目引入教学，帮助学生把知识转化为能力。', 2, '2026-05-22'),
          mkVersion('知行合一', '项目驱动教学，学以致用。', 1, '2026-01-30'),
        ],
      },
      {
        key: 'reflection', versions: [
          mkVersion('课程反思', '每轮课程结束后梳理课堂反馈、作业质量、学习数据和学生访谈结果，重点改进课程节奏、任务难度和过程评价，让课程档案成为下一轮教学优化的依据。', 1, '2026-06-30'),
        ],
      },
    ],
  },
]

const ideaArrowIcon = '../../../../assets/icons/arrow-down-s-line.svg'

const ARCHIVE_CARDS = [
  { key: 'basic-info', title: '基本信息', desc: '个人基础信息、任职资格与基本档案', count: 46, href: 'basic-info.html' },
  { key: 'teaching-info', title: '教学信息', desc: '授课课程、教学任务与课堂教学记录', count: 5, href: 'teaching-info.html' },
  { key: 'enterprise-practice', title: '企业实践', desc: '企业实践、挂职时间与产学合作经历', count: 3, href: 'enterprise-practice.html' },
  { key: 'achievements-honors', title: '成果与荣誉', desc: '教学科研成果、获奖与荣誉称号', count: 13, href: 'achievements-honors.html' },
  { key: 'training', title: '进修（访学）培训', desc: '进修访学、专业培训与学历提升', count: 6, href: 'training.html' },
  { key: 'social-service', title: '社会服务与影响力', desc: '社会服务与行业影响力', count: 12, href: 'social-service.html' },
  { key: 'appointment', title: '任职情况', desc: '担任班主任，带领新教师情况', count: 5, href: 'appointment.html' },
  { key: 'other-education', title: '其他教育工作', desc: '其他与教育工作相关的工作资料', count: 6, href: 'other-education.html' },
  { key: 'major-construction', title: '专业建设', desc: '专业建设理念、团队建设、成果与相关工作', count: 27, href: 'major-construction.html' },
]

// 当前版本(最新)= versions[0]
const currentVersion = (item) => item.versions[0]

function TeachingIdeaItem({ item, onEdit, onInlineEdit, onDelete }) {
  const cur = currentVersion(item)
  return (
    <article className="to-idea-item">
      <div className="to-idea-item__head">
        <h3>{cur.label}</h3>
        {item.versions.length > 1 && <span className="to-idea-item__version">v{cur.version}（共{item.versions.length}版）</span>}
      </div>
      <div className="to-idea-item__body">
        <p>{cur.content}</p>
        <div className="to-idea-item__actions">
          <DSButton variant="text" danger onClick={() => onDelete(item)}>删除</DSButton>
          <DSButton variant="text" onClick={() => onInlineEdit(item)}>编辑</DSButton>
          <DSButton variant="text" onClick={() => onEdit(item)}>更新</DSButton>
        </div>
      </div>
    </article>
  )
}

// 理念抽屉：新增/更新(左编辑 + 右历史只读)
function TeachingIdeaEditor({ editor, onSave, onClose }) {
  // editor: { mode: 'add'|'inline-edit'|'edit', groupKey, itemKey, label, content, previewVersion, versions } | null
  const isAdd = editor?.mode === 'add'
  const isInlineEdit = editor?.mode === 'inline-edit'
  const isPreview = !isAdd && !isInlineEdit && editor?.previewVersion != null
  const title = !editor ? '' : isAdd ? '新增理念' : (isInlineEdit ? `编辑理念：${currentVersionLabel(editor)}` : `更新理念：${currentVersionLabel(editor)}`)
  const okText = isAdd ? '保存' : (isInlineEdit ? '保存修改' : (isPreview ? '继续编辑' : '保存为新版本'))
  return (
    <DSDrawer
      open={Boolean(editor)}
      title={title}
      width="80vw"
      showFooter
      okText={okText}
      okDisabled={isPreview || !(editor?.label.trim() && editor?.content.trim())}
      cancelText="取消"
      onOk={() => isPreview ? editor.onExitPreview() : onSave()}
      onClose={() => onClose()}
    >
      <div className={`to-idea-editor ${(isAdd || isInlineEdit) ? 'to-idea-editor--add' : ''}`}>
        <div className="to-idea-editor__main">
          <DSEditField label="理念标题" required fullWidth htmlFor="idea-title">
            <DSInput
              id="idea-title"
              value={editor?.label || ''}
              placeholder="请输入理念标题"
              disabled={isPreview}
              onChange={(e) => editor.onChange({ label: e.target.value })}
            />
          </DSEditField>
          <DSEditField label="理念内容" required fullWidth align="start" htmlFor="idea-content">
            <DSTextarea
              id="idea-content"
              rows={isAdd ? 18 : 14}
              value={editor?.content || ''}
              placeholder="请输入理念内容"
              disabled={isPreview}
              onChange={(e) => editor.onChange({ content: e.target.value })}
            />
          </DSEditField>
          <div className="to-idea-editor__hint">
            {isAdd
              ? `新理念将添加到「${editor?.groupName || ''}」页签的第一位。`
              : (isInlineEdit
                ? '保存后仅修改当前版本，不会生成新的历史版本。'
                : (isPreview
                  ? `正在查看历史版本 v${editor.previewVersion}（只读），点「继续编辑」回到编辑。`
                  : '保存后将生成新版本，历史版本可在右侧查看。'))}
          </div>
        </div>

        {/* 新增/编辑当前模式无历史版本交互，隐藏右侧 */}
        {!isAdd && !isInlineEdit && (
        <aside className="to-idea-editor__history">
          <div className="to-idea-editor__history-head">
            <span>历史版本</span>
            <b>{editor?.versions?.length || 0}</b>
          </div>
          <ol className="to-idea-editor__history-list">
            {editor?.versions?.map((v, i) => {
              const isActive = (isPreview ? editor.previewVersion : null) === v.version
              const isCurrent = i === 0 && !isPreview
              return (
                <li
                  key={v.version}
                  className={`to-idea-history-item ${isActive || isCurrent ? 'is-active' : ''}`}
                  onClick={() => editor.onPreview(v.version)}
                >
                  <span className="to-idea-history-item__version">v{v.version}</span>
                  <span className="to-idea-history-item__label">{v.label}</span>
                  {i === 0 ? <em className="to-idea-history-item__tag">当前</em> : <em className="to-idea-history-item__time">{v.time}</em>}
                </li>
              )
            })}
          </ol>
        </aside>
        )}
      </div>
    </DSDrawer>
  )
}

function currentVersionLabel(editor) {
  if (!editor?.versions?.length) return editor?.label || ''
  return editor.versions[0].label
}

function TeachingIdeaPager({ startIndex, total, pageSize, onPrev, onNext }) {
  const canMovePrev = startIndex > 0
  const canMoveNext = startIndex + pageSize < total
  return (
    <div className="to-idea-pager" role="group" aria-label="理念翻页">
      <DSButton className="to-idea-pager__button is-previous" variant="text" size="small" iconOnly disabled={!canMovePrev} aria-label="上一组" onClick={() => onPrev(startIndex)}>
        <img src={ideaArrowIcon} alt="" aria-hidden="true" />
      </DSButton>
      <DSButton className="to-idea-pager__button is-next" variant="text" size="small" iconOnly disabled={!canMoveNext} aria-label="下一组" onClick={() => onNext(startIndex, total)}>
        <img src={ideaArrowIcon} alt="" aria-hidden="true" />
      </DSButton>
    </div>
  )
}

function TeachingIdeaPanel() {
  const [groups, setGroups] = useState(IDEA_GROUPS)
  const [groupKey, setGroupKey] = useState(IDEA_GROUPS[0].key)
  const [startIndex, setStartIndex] = useState(0)
  const [editor, setEditor] = useState(null)
  const PAGE_SIZE = 2

  const group = groups.find((g) => g.key === groupKey) || groups[0]

  const visibleItems = group.items.slice(startIndex, startIndex + PAGE_SIZE)

  const openEditor = (item, mode = 'edit') => {
    const cur = currentVersion(item)
    setEditor({
      mode,
      groupKey,
      itemKey: item.key,
      label: cur.label,
      content: cur.content,
      previewVersion: null,
      versions: item.versions,
      onChange: (patch) => setEditor((prev) => (prev ? { ...prev, ...patch } : prev)),
      onPreview: (version) => {
        const v = item.versions.find((x) => x.version === version)
        if (!v) return
        setEditor((prev) => (prev ? { ...prev, label: v.label, content: v.content, previewVersion: version } : prev))
      },
      onExitPreview: () => {
        const cur2 = currentVersion(item)
        setEditor((prev) => (prev ? { ...prev, label: cur2.label, content: cur2.content, previewVersion: null } : prev))
      },
    })
  }

  const openAddEditor = () => {
    setEditor({
      mode: 'add',
      groupKey,
      groupName: group.label,
      itemKey: '',
      label: '',
      content: '',
      onChange: (patch) => setEditor((prev) => (prev ? { ...prev, ...patch } : prev)),
    })
  }

  // 保存：新增插入到当前组最前；编辑覆盖当前版本；更新生成新版本
  const handleSave = () => {
    if (!editor?.label.trim() || !editor?.content.trim()) return
    if (editor.mode === 'add') {
      const newItem = {
        key: `custom-${Date.now()}`,
        versions: [{ version: 1, time: '2026-07-12', label: editor.label.trim(), content: editor.content.trim() }],
      }
      setGroups((prev) => prev.map((g) => g.key !== editor.groupKey ? g : { ...g, items: [newItem, ...g.items] }))
      setStartIndex(0) // 新增放第一个,回到首页展示
    } else if (editor.mode === 'inline-edit') {
      // 编辑当前：原地覆盖最新版本(不新增版本)
      setGroups((prev) => prev.map((g) => g.key !== editor.groupKey ? g : {
        ...g,
        items: g.items.map((it) => it.key !== editor.itemKey ? it : {
          ...it,
          versions: it.versions.map((v, i) => i === 0 ? { ...v, label: editor.label.trim(), content: editor.content.trim() } : v),
        }),
      }))
    } else {
      const newVersion = (editor.versions[0]?.version || 0) + 1
      const newVer = { version: newVersion, time: '2026-07-12', label: editor.label.trim(), content: editor.content.trim() }
      setGroups((prev) => prev.map((g) => g.key !== editor.groupKey ? g : {
        ...g,
        items: g.items.map((it) => it.key !== editor.itemKey ? it : { ...it, versions: [newVer, ...it.versions] }),
      }))
    }
    setEditor(null)
  }

  const switchGroup = (key) => { setGroupKey(key); setStartIndex(0) }

  // 删除
  const [deleteItem, setDeleteItem] = useState(null)
  const confirmDelete = () => {
    if (!deleteItem) return
    setGroups((prev) => prev.map((g) => g.key !== groupKey ? g : {
      ...g,
      items: g.items.filter((it) => it.key !== deleteItem.key),
    }))
    // 删除后若超出当前页范围,回退
    setStartIndex((prev) => {
      const remaining = group.items.length - 1
      return Math.min(prev, Math.max(0, remaining - (remaining % PAGE_SIZE)))
    })
    setDeleteItem(null)
  }

  const tabItems = groups.map((g) => ({ key: g.key, label: g.label, count: g.items.length }))

  const rangeText = group.items.length > PAGE_SIZE
    ? `共 ${group.items.length} 个，当前显示 ${startIndex + 1}-${Math.min(startIndex + PAGE_SIZE, group.items.length)}`
    : `共 ${group.items.length} 个理念`

  return (
    <section className="to-idea-card" aria-label="教学理念">
      {/* 页签行：标准一级页签 + 右侧计数与翻页 */}
      <div className="to-idea-tabbar">
        <DSTabs items={tabItems} activeKey={groupKey} onChange={switchGroup} />
        <div className="to-idea-tabbar__right">
          <span className="to-idea-tabbar__count">{rangeText}</span>
          {group.items.length > PAGE_SIZE && (
            <TeachingIdeaPager
              startIndex={startIndex}
              total={group.items.length}
              pageSize={PAGE_SIZE}
              onPrev={(idx) => setStartIndex(Math.max(0, idx - PAGE_SIZE))}
              onNext={(idx, total) => setStartIndex(Math.min(Math.max(0, total - PAGE_SIZE), idx + PAGE_SIZE))}
            />
          )}
          <DSButton variant="primary" size="small" onClick={openAddEditor}>新增理念</DSButton>
        </div>
      </div>

      <div className="to-idea-grid">
        {visibleItems.map((item) => (
          <TeachingIdeaItem key={item.key} item={item} onEdit={openEditor} onInlineEdit={(it) => openEditor(it, 'inline-edit')} onDelete={setDeleteItem} />
        ))}
      </div>

      {/* 删除确认 */}
      {deleteItem && (
        <DSModal
          open
          title="删除理念"
          okText="确认删除"
          okButtonProps={{ danger: true }}
          onCancel={() => setDeleteItem(null)}
          onOk={confirmDelete}
        >
          <p style={{ color: 'var(--ds-color-text-secondary)' }}>
            确认删除理念「{currentVersion(deleteItem).label}」？该理念的{deleteItem.versions.length}个版本将一并删除，删除后不可恢复。
          </p>
        </DSModal>
      )}

      <TeachingIdeaEditor editor={editor} onSave={handleSave} onClose={() => setEditor(null)} />
    </section>
  )
}

function ArchiveFiles() {
  return (
    <section className="to-files-panel" aria-label="档案文件">
      <div className="to-section-title">
        <h2>档案文件 <span>（共{ARCHIVE_CARDS.length}个）</span></h2>
      </div>
      <div className="to-folder-grid">
        {ARCHIVE_CARDS.map((card) => (
          <ArchiveCard card={card} classNamePrefix="to-folder-card" key={card.key} />
        ))}
      </div>
    </section>
  )
}

function TOverviewPage() {
  return (
    <main className="to-page" data-ds-business-page="t-overview">
      <TeachingIdeaPanel />
      <ArchiveFiles />
    </main>
  )
}

createRoot(document.getElementById('app')).render(<TOverviewPage />)