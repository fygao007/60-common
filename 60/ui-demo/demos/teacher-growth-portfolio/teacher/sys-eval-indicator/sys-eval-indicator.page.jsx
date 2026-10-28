import { createRoot } from 'react-dom/client'

export const PAGE_GENERATION_CONTRACT = 'v1'
export const PAGE_TEMPLATE = 'regular-list'

import { useMemo, useRef, useState } from 'react'
import {
  DSButton,
  DSDoubleEditModal,
  DSEditField,
  DSEmptyState,
  DSInput,
  DSModal,
  DSRegularListTemplate,
  DSSelect,
  DSTag,
  DSTextarea,
  DSTree,
} from '@wisedu/design-system'
import {
  EVAL_SYSTEMS,
  EVAL_STATS,
  INDICATOR_KINDS,
  INDICATOR_TYPES,
  REQUIRED_OPTIONS,
} from './sys-eval-indicator.data.js'
import './sys-eval-indicator.css'

// S-评估指标配置（系统管理员）
// 数据源：《高职本科合格评估系统_评估指标与观测点要求配置.xlsx》工作表「评估指标及观测点要求」
// 结构：指标体系 → 一级/二级/三级指标 → 指标条目；每个指标节点挂观测点（依据 + 类型 + 必填 + 选项）
// 形态：左树右表（DSTree + DSRegularListTemplate），树上与表上均可新增/编辑/删除指标

const CHILD_KINDS = INDICATOR_KINDS.filter((kind) => kind !== '指标体系')
const PAGE_SIZE_OPTIONS = [10, 20, 50]
const ROOT_PREFIX = 'root:'

const KIND_BY_LEVEL = { 1: '一级指标', 2: '二级指标', 3: '三级指标' }
const kindForLevel = (level) => KIND_BY_LEVEL[level] || '指标条目'

const KIND_TONE = {
  指标体系: 'info',
  一级指标: 'primary',
  二级指标: 'primary',
  三级指标: 'primary',
  指标条目: 'muted',
}

// —— 数据初始化：把只读数据源深拷贝为可变工作副本，并派生展示用属性 ——
function deriveNode(node, order) {
  const observations = (node.observations || []).map((item) => ({ ...item, options: [...(item.options || [])] }))
  const hasChoice = observations.some((item) => (item.options || []).length > 1)
  return {
    ...node,
    order,
    type: node.type || (hasChoice ? '定量指标' : '定性指标'),
    required: node.required || (observations.some((item) => item.required === '必填') ? '必填' : '非必填'),
    weight: node.weight ?? '',
    desc: node.desc || '',
    observations,
    children: (node.children || []).map((child, index) => deriveNode(child, index + 1)),
  }
}

function initialSystems() {
  return EVAL_SYSTEMS.map((system) => ({
    key: system.key,
    label: system.label,
    source: system.source,
    stats: { ...system.stats },
    tree: system.tree.map((node, index) => deriveNode(node, index + 1)),
  }))
}

function countNodes(list) {
  return list.reduce((total, node) => total + 1 + countNodes(node.children), 0)
}

function walkNodes(list, visit, trail = []) {
  list.forEach((node) => {
    visit(node, trail)
    walkNodes(node.children, visit, [...trail, node])
  })
}

function truncate(text, max = 46) {
  const value = String(text || '')
  return value.length > max ? `${value.slice(0, max)}…` : value
}

function EvalIndicatorPage() {
  const [systems, setSystems] = useState(initialSystems)
  const [selectedKey, setSelectedKey] = useState(`${ROOT_PREFIX}${EVAL_SYSTEMS[0].key}`)
  const [expandedKeys, setExpandedKeys] = useState([`${ROOT_PREFIX}${EVAL_SYSTEMS[0].key}`])
  const [treeKeyword, setTreeKeyword] = useState('')
  const [draft, setDraft] = useState({ keyword: '', kind: '', observation: '' })
  const [committed, setCommitted] = useState({ keyword: '', kind: '', observation: '' })
  const [selectedRows, setSelectedRows] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editor, setEditor] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState('')
  const idRef = useRef(0)

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  function nextId() {
    idRef.current += 1
    return `E-${Date.now().toString(36).toUpperCase()}-${idRef.current}`
  }

  // —— 索引：id → { node, parent, systemKey, trail } ——
  const index = useMemo(() => {
    const map = new Map()
    systems.forEach((system) => {
      walkNodes(system.tree, (node, trail) => {
        map.set(node.id, {
          node,
          parent: trail.length ? trail[trail.length - 1] : null,
          systemKey: system.key,
          trail: [...trail, node],
        })
      })
    })
    return map
  }, [systems])

  const activeSystem = useMemo(
    () => systems.find((system) => `${ROOT_PREFIX}${system.key}` === selectedKey) || null,
    [systems, selectedKey],
  )
  const activeEntry = index.get(selectedKey) || null
  const activeNode = activeSystem
    ? { id: selectedKey, code: '', name: activeSystem.label, kind: '指标体系', level: 0, order: 1, type: '定性指标', required: '非必填', weight: '', desc: '', observations: [], children: activeSystem.tree }
    : (activeEntry ? activeEntry.node : null)

  const childRows = useMemo(() => {
    if (activeSystem) return activeSystem.tree
    return activeEntry ? activeEntry.node.children : []
  }, [activeSystem, activeEntry])

  const trailText = activeSystem
    ? activeSystem.label
    : (activeEntry ? activeEntry.trail.map((node) => node.name).join(' / ') : '未选择指标')

  const observationTotal = useMemo(() => {
    if (!activeNode) return 0
    return activeNode.observations.length + childRows.reduce((total, node) => total + node.observations.length, 0)
  }, [activeNode, childRows])

  // —— 左树 ——
  const treeData = useMemo(() => {
    const keyword = treeKeyword.trim()
    const buildChildren = (list) => list.reduce((acc, node) => {
      const children = buildChildren(node.children)
      const hit = !keyword || node.name.includes(keyword) || String(node.code || '').includes(keyword)
      if (!hit && children.length === 0) return acc
      acc.push({
        key: node.id,
        title: node.name,
        count: node.children.length + node.observations.length,
        children,
        actions: [
          { key: 'add', label: '新增', onClick: () => openCreate(node.id) },
          { key: 'edit', label: '编辑', onClick: () => openEdit(node.id) },
          { key: 'del', label: '删除', danger: true, onClick: () => askDelete(node.id) },
        ],
      })
      return acc
    }, [])
    return systems.map((system) => ({
      key: `${ROOT_PREFIX}${system.key}`,
      title: system.label,
      count: system.tree.length,
      children: buildChildren(system.tree),
      actions: [
        { key: 'add', label: '新增', onClick: () => openCreate(`${ROOT_PREFIX}${system.key}`) },
        { key: 'edit', label: '编辑', onClick: () => openEdit(`${ROOT_PREFIX}${system.key}`) },
      ],
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systems, treeKeyword])

  function selectNode(key) {
    setSelectedKey(key)
    setSelectedRows([])
    setPage(1)
    const trail = key.startsWith(ROOT_PREFIX) ? [] : (index.get(key) ? index.get(key).trail.slice(0, -1).map((node) => node.id) : [])
    const systemKey = key.startsWith(ROOT_PREFIX) ? key : (index.get(key) ? `${ROOT_PREFIX}${index.get(key).systemKey}` : '')
    setExpandedKeys((prev) => Array.from(new Set([...prev, ...trail, systemKey].filter(Boolean))))
  }

  function expandAll() {
    const flat = []
    systems.forEach((system) => {
      flat.push(`${ROOT_PREFIX}${system.key}`)
      walkNodes(system.tree, (node) => { if (node.children.length) flat.push(node.id) })
    })
    setExpandedKeys(flat)
  }

  function collapseAll() {
    setExpandedKeys(systems.map((system) => `${ROOT_PREFIX}${system.key}`))
  }

  // —— 增删改 ——
  function patchNode(id, patch) {
    setSystems((prev) => prev.map((system) => {
      if (`${ROOT_PREFIX}${system.key}` === id) return { ...system, label: patch.name || system.label, source: patch.desc === undefined ? system.source : system.source }
      const walk = (list) => list.map((node) => (node.id === id ? { ...node, ...patch } : { ...node, children: walk(node.children) }))
      return { ...system, tree: walk(system.tree) }
    }))
  }

  function insertChild(parentId, node) {
    setSystems((prev) => prev.map((system) => {
      if (`${ROOT_PREFIX}${system.key}` === parentId) {
        return { ...system, tree: [...system.tree, node], stats: { ...system.stats, indicators: countNodes([...system.tree, node]) } }
      }
      const walk = (list) => list.map((item) => (item.id === parentId ? { ...item, children: [...item.children, node] } : { ...item, children: walk(item.children) }))
      return { ...system, tree: walk(system.tree) }
    }))
  }

  function removeNode(id) {
    setSystems((prev) => prev.map((system) => {
      const walk = (list) => list
        .filter((node) => node.id !== id)
        .map((node) => ({ ...node, children: walk(node.children) }))
      return { ...system, tree: walk(system.tree) }
    }))
  }

  // —— 编辑弹窗 ——
  function openCreate(parentId) {
    const target = parentId || selectedKey
    const parentNode = target.startsWith(ROOT_PREFIX) ? null : index.get(target) ? index.get(target).node : null
    const level = parentNode ? parentNode.level + 1 : 1
    setEditor({
      mode: 'create',
      parentId: target,
      parentLabel: parentNode ? parentNode.name : (systems.find((system) => `${ROOT_PREFIX}${system.key}` === target) || {}).label || '—',
      level,
      form: { code: '', name: '', kind: kindForLevel(level), type: '定性指标', required: '非必填', weight: '', order: (parentNode ? parentNode.children.length : childRows.length) + 1, desc: '' },
    })
  }

  function openEdit(id) {
    if (id.startsWith(ROOT_PREFIX)) {
      const system = systems.find((item) => `${ROOT_PREFIX}${item.key}` === id)
      if (!system) return
      setEditor({ mode: 'edit-root', id, form: { name: system.label, desc: '' } })
      return
    }
    const entry = index.get(id)
    if (!entry) return
    setEditor({
      mode: 'edit',
      id,
      parentLabel: entry.parent ? entry.parent.name : (systems.find((system) => system.key === entry.systemKey) || {}).label || '—',
      form: {
        code: entry.node.code || '',
        name: entry.node.name || '',
        kind: entry.node.kind,
        type: entry.node.type || '定性指标',
        required: entry.node.required || '非必填',
        weight: entry.node.weight ?? '',
        order: entry.node.order ?? 1,
        desc: entry.node.desc || '',
      },
    })
  }

  function submitEditor() {
    if (!editor) return
    const form = editor.form
    if (!String(form.name || '').trim()) {
      notify('指标名称不能为空')
      return
    }
    if (editor.mode === 'edit-root') {
      patchNode(editor.id, { name: form.name.trim() })
      setEditor(null)
      notify('指标体系名称已保存')
      return
    }
    const payload = {
      code: String(form.code || '').trim(),
      name: String(form.name).trim(),
      kind: form.kind,
      type: form.type,
      required: form.required,
      weight: form.weight === '' ? '' : Number(form.weight),
      order: Number(form.order) || 1,
      desc: String(form.desc || '').trim(),
    }
    if (editor.mode === 'create') {
      const node = { id: nextId(), level: editor.level, children: [], observations: [], ...payload }
      insertChild(editor.parentId, node)
      setSelectedKey(node.id)
      setEditor(null)
      notify(`已新增「${payload.name}」`)
      return
    }
    patchNode(editor.id, payload)
    setEditor(null)
    notify(`已保存「${payload.name}」`)
  }

  // —— 删除确认 ——
  function askDelete(id) {
    const entry = index.get(id)
    if (!entry) return
    const total = countNodes([entry.node]) - 1
    setConfirm({
      title: '删除指标',
      description: total > 0
        ? `确认删除「${entry.node.name}」及其下级 ${total} 个指标？删除后不可恢复。`
        : `确认删除「${entry.node.name}」？删除后不可恢复。`,
      onConfirm: () => {
        removeNode(id)
        setConfirm(null)
        setSelectedRows([])
        notify('指标已删除')
      },
    })
  }

  function askBatchDelete() {
    if (!selectedRows.length) return
    setConfirm({
      title: '批量删除指标',
      description: `已选择 ${selectedRows.length} 个指标，确认删除（含各自下级指标）？删除后不可恢复。`,
      onConfirm: () => {
        selectedRows.forEach((id) => removeNode(id))
        setSelectedRows([])
        notify(`已删除 ${selectedRows.length} 个指标`)
        setConfirm(null)
      },
    })
  }

  // —— 右表 ——
  const filtered = useMemo(() => {
    const keyword = committed.keyword.trim()
    return childRows.filter((node) => {
      if (keyword && !(node.name.includes(keyword) || String(node.code || '').includes(keyword))) return false
      if (committed.kind && node.kind !== committed.kind) return false
      if (committed.observation === 'has' && node.observations.length === 0) return false
      if (committed.observation === 'none' && node.observations.length > 0) return false
      return true
    })
  }, [childRows, committed])

  const paged = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * pageSize
    return { rows: filtered.slice(start, start + pageSize), total: filtered.length, totalPages, current: safePage }
  }, [filtered, page, pageSize])

  const columns = useMemo(() => ([
    {
      key: 'code',
      dataIndex: 'code',
      title: '指标编码',
      width: 132,
      render: (value) => (value ? value : <span className="sei-muted">—</span>),
    },
    {
      key: 'name',
      dataIndex: 'name',
      title: '指标名称',
      width: 320,
      render: (value, record) => (
        <span className="sei-name-cell">
          <DSTag tone={KIND_TONE[record.kind] || 'muted'} size="small">{record.kind}</DSTag>
          <span className="sei-name-cell__text" title={value}>{value}</span>
        </span>
      ),
    },
    { key: 'type', dataIndex: 'type', title: '指标类型', width: 116 },
    {
      key: 'required',
      dataIndex: 'required',
      title: '是否必填',
      width: 100,
      render: (value) => <DSTag tone={value === '必填' ? 'danger' : 'muted'} size="small">{value}</DSTag>,
    },
    {
      key: 'observations',
      dataIndex: 'observations',
      title: '观测点要求',
      width: 300,
      render: (value, record) => {
        if (!value.length) return <span className="sei-muted">未配置观测点</span>
        return (
          <span className="sei-obs-cell">
            <span className="sei-obs-cell__text" title={value[0].text}>{truncate(value[0].text)}</span>
            <span className="sei-obs-cell__meta">{`共 ${value.length} 条 · ${value[0].type}`}</span>
          </span>
        )
      },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ]), [systems, selectedKey])

  // 行操作走 DSDataTable 标准 actions（自动按文案估宽并预留，避免末尾按钮被裁切）
  const rowActions = useMemo(() => ([
    { key: 'edit', label: '编辑', onClick: (record) => openEdit(record.id) },
    { key: 'add', label: '新增下级', onClick: (record) => openCreate(record.id) },
    { key: 'del', label: '删除', danger: true, onClick: (record) => askDelete(record.id) },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ]), [systems, selectedKey])

  const filterProps = useMemo(() => ({
    fields: [
      {
        key: 'keyword',
        label: '指标名称',
        controlledValue: draft.keyword,
        placeholder: '请输入指标名称或编码',
        onChange: (event) => setDraft((prev) => ({ ...prev, keyword: event?.target?.value ?? event ?? '' })),
      },
      {
        key: 'kind',
        label: '指标层级',
        type: 'select',
        placeholder: '全部层级',
        options: [{ value: '', label: '全部层级' }, ...CHILD_KINDS.map((kind) => ({ value: kind, label: kind }))],
        controlledValue: draft.kind,
        onChange: (value) => setDraft((prev) => ({ ...prev, kind: value || '' })),
      },
      {
        key: 'observation',
        label: '观测点',
        type: 'select',
        placeholder: '不限',
        options: [
          { value: '', label: '不限' },
          { value: 'has', label: '已配置观测点' },
          { value: 'none', label: '未配置观测点' },
        ],
        controlledValue: draft.observation,
        onChange: (value) => setDraft((prev) => ({ ...prev, observation: value || '' })),
      },
    ],
    density: 'compact',
    columns: 3,
    defaultExpanded: true,
    onSearch: () => { setCommitted({ ...draft }); setPage(1) },
    onReset: () => {
      const cleared = { keyword: '', kind: '', observation: '' }
      setDraft(cleared)
      setCommitted(cleared)
      setPage(1)
    },
  }), [draft])

  const toolbarActions = useMemo(() => ([
    { key: 'create', label: '新增下级指标', variant: 'primary', onClick: () => openCreate(selectedKey) },
    { key: 'remove', label: '批量删除', danger: true, disabled: !selectedRows.length, onClick: askBatchDelete },
  ]), [selectedKey, selectedRows, systems])

  const summary = useMemo(() => (
    <div className="sei-crumb">
      <span className="sei-crumb__path" title={trailText}>{trailText}</span>
      <span className="sei-crumb__sep">·</span>
      <span>{`下级指标 ${childRows.length}`}</span>
      <span className="sei-crumb__sep">·</span>
      <span>{`观测点 ${observationTotal}`}</span>
      <span className="sei-crumb__sep">·</span>
      <span>{`当前筛选 ${filtered.length}`}</span>
    </div>
  ), [trailText, childRows.length, observationTotal, filtered.length])

  const emptyRender = useMemo(() => (
    childRows.length === 0
      ? (
        <DSEmptyState
          type="data"
          title="该指标下暂无下级指标"
          description="可在左树选中指标后用「新增下级指标」继续细分层级，或直接为该指标配置观测点要求。"
          actionText="新增下级指标"
          onAction={() => openCreate(selectedKey)}
        />
      )
      : (
        <DSEmptyState
          type="search"
          title="没有符合当前条件的指标"
          description="可清除筛选条件后重新查询；观测点筛选只影响展示，不改变数据。"
          actionText="清除筛选条件"
          onAction={filterProps.onReset}
        />
      )
  ), [childRows.length, selectedKey, systems, filterProps])

  const editorTitle = editor
    ? (editor.mode === 'create' ? '新增指标' : (editor.mode === 'edit-root' ? '编辑指标体系' : '编辑指标'))
    : ''

  return (
    <main className="sei-page" data-ds-business-page="sys-eval-indicator">
      <aside className="sei-sidebar">
        <div className="sei-sidebar__head">
          <h2 className="sei-sidebar__title">评估指标体系</h2>
          <DSTag tone="muted" size="small">{`${EVAL_STATS.systemCount} 套体系`}</DSTag>
        </div>
        <div className="sei-sidebar__search">
          <DSInput
            value={treeKeyword}
            placeholder="搜索指标名称或编码"
            onChange={(event) => setTreeKeyword(event.target.value)}
          />
        </div>
        <div className="sei-sidebar__tools">
          <DSButton variant="link" size="small" onClick={expandAll}>展开全部</DSButton>
          <DSButton variant="link" size="small" onClick={collapseAll}>收起全部</DSButton>
          <span className="sei-sidebar__spacer" />
          <DSTag tone="muted" size="small">{`${EVAL_STATS.indicatorCount} 指标`}</DSTag>
        </div>
        <div className="sei-sidebar__tree">
          <DSTree
            dataSource={treeData}
            expandedKeys={expandedKeys}
            selectedKey={selectedKey}
            onSelect={selectNode}
            onExpand={(keys) => setExpandedKeys(keys)}
            ariaLabel="评估指标体系树"
          />
        </div>
        <p className="sei-sidebar__note">
          {'数据来源：办学能力评估系统官方导出（评估指标及观测点要求）。树上每行悬停可用「新增 / 编辑 / 删除」维护指标。'}
        </p>
      </aside>

      <section className="sei-main">
        <DSRegularListTemplate
          className="sei-main__template"
          tabs={[]}
          metaLabel=""
          metaValue=""
          notice=""
          filterProps={filterProps}
          toolbarActions={toolbarActions}
          tableTools={false}
          summary={summary}
          tableProps={{
            columns,
            data: paged.rows,
            rowKey: 'id',
            selectable: true,
            selectedRowKeys: selectedRows,
            onSelectRow: (key, checked) => setSelectedRows((prev) => (checked ? Array.from(new Set([...prev, key])) : prev.filter((item) => item !== key))),
            onSelectAll: (checked) => setSelectedRows(checked ? paged.rows.map((row) => row.id) : []),
            showIndex: true,
            actions: rowActions,
            actionsMaxVisible: 3,
            actionFixed: true,
            emptyRender,
          }}
          pagination={{
            total: paged.total,
            totalPages: paged.totalPages,
            current: paged.current,
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
      </section>

      <DSDoubleEditModal
        open={Boolean(editor)}
        title={editorTitle}
        okText="保存"
        okDisabled={Boolean(editor) && !String(editor.form.name || '').trim()}
        onOk={submitEditor}
        onCancel={() => setEditor(null)}
      >
        {editor ? (
          <>
            {editor.mode !== 'edit-root' ? (
              <>
                <DSEditField label="指标编码">
                  <DSInput
                    value={editor.form.code}
                    placeholder="如 4.3.1"
                    onChange={(event) => setEditor((prev) => ({ ...prev, form: { ...prev.form, code: event.target.value } }))}
                  />
                </DSEditField>
                <DSEditField label="指标名称" required>
                  <DSInput
                    value={editor.form.name}
                    placeholder="请输入指标名称"
                    onChange={(event) => setEditor((prev) => ({ ...prev, form: { ...prev.form, name: event.target.value } }))}
                  />
                </DSEditField>
                <DSEditField label="上级指标">
                  <DSInput value={editor.parentLabel} disabled onChange={() => {}} />
                </DSEditField>
                <DSEditField label="指标层级" required>
                  <DSSelect
                    options={CHILD_KINDS}
                    value={editor.form.kind}
                    onChange={(value) => setEditor((prev) => ({ ...prev, form: { ...prev.form, kind: value } }))}
                  />
                </DSEditField>
                <DSEditField label="指标类型" help="定量指标按数值达标判定，否决项按一票否决处理">
                  <DSSelect
                    options={INDICATOR_TYPES}
                    value={editor.form.type}
                    onChange={(value) => setEditor((prev) => ({ ...prev, form: { ...prev.form, type: value } }))}
                  />
                </DSEditField>
                <DSEditField label="是否必填">
                  <DSSelect
                    options={REQUIRED_OPTIONS}
                    value={editor.form.required}
                    onChange={(value) => setEditor((prev) => ({ ...prev, form: { ...prev.form, required: value } }))}
                  />
                </DSEditField>
                <DSEditField label="权重（%）" help="同级指标权重合计建议为 100%">
                  <DSInput
                    type="number"
                    min={0}
                    max={100}
                    value={editor.form.weight}
                    placeholder="未设置"
                    onChange={(event) => setEditor((prev) => ({ ...prev, form: { ...prev.form, weight: event.target.value } }))}
                  />
                </DSEditField>
                <DSEditField label="排序号">
                  <DSInput
                    type="number"
                    min={1}
                    value={editor.form.order}
                    onChange={(event) => setEditor((prev) => ({ ...prev, form: { ...prev.form, order: event.target.value } }))}
                  />
                </DSEditField>
              </>
            ) : (
              <DSEditField label="指标体系名称" required>
                <DSInput
                  value={editor.form.name}
                  placeholder="请输入指标体系名称"
                  onChange={(event) => setEditor((prev) => ({ ...prev, form: { ...prev.form, name: event.target.value } }))}
                />
              </DSEditField>
            )}

            <DSEditField label="指标说明" fullWidth align="start">
              <DSTextarea
                rows={3}
                value={editor.form.desc}
                placeholder="补充该指标的口径说明（原型阶段仅本地保存）"
                onChange={(event) => setEditor((prev) => ({ ...prev, form: { ...prev.form, desc: event.target.value } }))}
              />
            </DSEditField>

            {activeNode && editor.mode !== 'edit-root' ? (
              <DSEditField label={`观测点要求（只读 · 共 ${activeNode.observations.length} 条）`} fullWidth align="start">
                {activeNode.observations.length ? (
                  <span className="sei-obs-list">
                    {activeNode.observations.slice(0, 3).map((item, idx) => (
                      <span className="sei-obs-item" key={item.id || idx}>
                        <span className="sei-obs-item__head">
                          {`观测点 ${idx + 1}`}
                          <DSTag tone="muted" size="small">{item.type}</DSTag>
                          <DSTag tone={item.required === '必填' ? 'danger' : 'muted'} size="small">{item.required}</DSTag>
                          {item.options.length ? <DSTag tone="info" size="small">{`${item.options.length} 个选项`}</DSTag> : null}
                        </span>
                        <span className="sei-obs-item__text">{item.text}</span>
                      </span>
                    ))}
                    {activeNode.observations.length > 3 ? (
                      <span className="sei-obs-item__more">{`另有 ${activeNode.observations.length - 3} 条观测点未展开`}</span>
                    ) : null}
                  </span>
                ) : (
                  <span className="sei-muted">该指标尚未配置观测点要求。</span>
                )}
              </DSEditField>
            ) : null}
          </>
        ) : null}
      </DSDoubleEditModal>

      <DSModal
        open={Boolean(confirm)}
        title={confirm ? confirm.title : ''}
        danger
        okText="删除"
        cancelText="取消"
        onOk={confirm ? confirm.onConfirm : undefined}
        onCancel={() => setConfirm(null)}
      >
        <p className="sei-confirm-text">{confirm ? confirm.description : ''}</p>
      </DSModal>

      {toast ? <div className="sei-toast" role="status">{toast}</div> : null}
    </main>
  )
}

createRoot(document.getElementById('app')).render(<EvalIndicatorPage />)
