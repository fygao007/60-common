import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  DSButton,
  DSCheckbox,
  DSDataTable,
  DSEditField,
  DSInput,
  DSModal,
  DSSelect,
  DSSteps,
  DSSwitch,
  DSTextarea,
  DSTree,
} from '@wisedu/design-system'
import {
  archiveDisplayTypes,
  PERMISSION_USER_GROUPS,
  createInitialArchiveStructure,
  findNodeById,
  updateNodeById,
  appendChildById,
} from '../../shared/sys-shared-archive.js'
import './form-management.css'

// 设置表下拉：直接显示表名称（由现有业务表衍生）
const TABLE_NAME_OPTIONS = ['个人信息', '学历信息', '资格证书', '课程清单', '课程设计与实施', '课程反思', '实践经历', '教学科研成果', '培训记录', '社会服务', '任职记录', '教育工作记录']
const SOURCE_SYSTEM_OPTIONS = ['人事系统', '组织机构', '教务系统', '科研管理系统', '教学档案袋']

const STEPS_ITEMS = [
  { key: 'fields', title: '设置档案字段', description: '配置分组、表与字段结构' },
  { key: 'permissions', title: '设置用户组权限', description: '按用户组配置查看/编辑/必填' },
]

const PLACEHOLDER_GROUP_NAME = '未设置分组'
const PLACEHOLDER_TABLE_NAME = '未设置表'
const DISPLAY_TYPE_TAG_CLASS = {
  表格: 'is-table',
  表单: 'is-form',
  卡片: 'is-card',
  时间轴: 'is-timeline',
  大文本: 'is-text',
  文件: 'is-file',
}

function notify(setMessage, text) {
  setMessage(text)
  window.setTimeout(() => setMessage(''), 1800)
}

function FormManagementWorkbench({ groups, setGroups }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedNodeKey, setSelectedNodeKey] = useState('table-profile')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [expandedTreeKeys, setExpandedTreeKeys] = useState([
  'basic-info', 'teaching-info', 'enterprise-practice', 'achievements-honors', 'training', 'social-service', 'appointment', 'other-education',
  'profile', 'education', 'certificates', 'courses', 'course-design', 'reflection', 'practice-records', 'achievements', 'training-records', 'service-records', 'appointment-records', 'other-records'
])
  const [permUserGroup, setPermUserGroup] = useState(PERMISSION_USER_GROUPS[0])
  const [permExpandedGroups, setPermExpandedGroups] = useState(['basic-info', 'teaching-info'])
  const [permActiveGroupTab, setPermActiveGroupTab] = useState(groups[0]?.id || '')
  const [tooltipPos, setTooltipPos] = useState(null)

  const found = useMemo(() => findNodeById(groups, selectedNodeKey), [groups, selectedNodeKey])
  const selectedNode = found?.node || null
  const selectedLevel = !selectedNode ? 'empty'
    : selectedNode.nodeType === 'table' ? 'table'
    : 'group'
  const isTopLevelGroup = selectedLevel === 'group' && found?.path.length === 1
  const selectedTable = selectedLevel === 'table' ? selectedNode : null

  const archiveTreeData = useMemo(() => {
    const mapNode = (node, isNew) => {
      const isPlaceholder = isNew || (node.nodeType === 'group' ? node.name === PLACEHOLDER_GROUP_NAME : node.displayName === PLACEHOLDER_TABLE_NAME)
      if (node.nodeType === 'table') {
        const displayType = node.displayType || '表格'
        return {
          key: node.id,
          title: node.displayName || node.name,
          nodeType: 'table',
          enabled: node.enabled,
          icon: <span className={['archive-tree-status-dot', node.enabled ? 'is-enabled' : 'is-disabled'].filter(Boolean).join(' ')} aria-hidden="true" />,
          isPlaceholder,
          draggable: true,
          // 仅「表格」类型可删除（字段经右侧字段配置维护）
          actions: displayType === '表格' ? [
            { key: 'delete', label: '删除', danger: true, onClick: () => setDeleteTarget({ type: 'table', id: node.id, name: node.displayName || node.name }) },
          ] : [],
        }
      }
      return {
        key: node.id,
        title: node.name,
        nodeType: 'group',
        enabled: node.enabled,
        icon: <span className={['archive-tree-status-dot', node.enabled ? 'is-enabled' : 'is-disabled'].filter(Boolean).join(' ')} aria-hidden="true" />,
        isPlaceholder,
        draggable: true,
        actions: [
          { key: 'add-group', label: '新增分组', onClick: () => addGroup(node.id) },
          { key: 'add-table', label: '添加表', onClick: () => addTable(node.id) },
          { key: 'delete', label: '删除', danger: true, onClick: () => setDeleteTarget({ type: 'group', id: node.id, name: node.name }) },
        ],
        children: (node.children || []).map((child) => mapNode(child, false)),
      }
    }
    return groups.map((node) => mapNode(node, false))
    // addGroup/addTable 通过闭包引用，依赖 groups 即可触发重渲染
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups])

  const showMessage = (text) => notify(setMessageText, text)

  // 直接更新当前选中节点（即时入库）
  const updateSelectedNode = (updater) => {
    if (!selectedNode) return
    setGroups((current) => updateNodeById(current, selectedNode.id, updater))
  }

  const handleSelectNode = (key, node) => {
    setSelectedNodeKey(key)
    if (node.nodeType !== 'table') {
      setExpandedTreeKeys((current) => [...new Set([...current, key])])
    }
  }

  // 新增分组：立即在树里插入未设置名称的节点并选中
  const addGroup = (parentId = null) => {
    const newGroup = {
      id: `group-${Date.now()}`,
      name: PLACEHOLDER_GROUP_NAME,
      nodeType: 'group',
      enabled: true,
      children: [],
    }
    setGroups((current) => (parentId ? appendChildById(current, parentId, newGroup) : [...current, newGroup]))
    if (parentId) setExpandedTreeKeys((current) => [...new Set([...current, parentId])])
    setSelectedNodeKey(newGroup.id)
    showMessage('已新增分组，请在右侧设置名称')
  }

  // 新增表：立即在树里插入未设置名称的表并选中
  const addTable = (parentId) => {
    const newTable = {
      id: `table-${Date.now()}`,
      name: '',
      displayName: PLACEHOLDER_TABLE_NAME,
      nodeType: 'table',
      displayType: '表格',
      sourceTable: '扩展表',
      sourceSystem: '教学档案袋',
      fileSize: '10',
      fileType: 'PDF, Word, Excel',
      enabled: true,
      fields: [],
    }
    setGroups((current) => appendChildById(current, parentId, newTable))
    setExpandedTreeKeys((current) => [...new Set([...current, parentId])])
    setSelectedNodeKey(newTable.id)
    showMessage('已新增表，请在右侧设置名称')
  }

  // 右侧表单变更：直接写回树节点（实时联动）
  const changeNodeField = (field, value) => {
    updateSelectedNode((node) => ({ ...node, [field]: value }))
  }

  const getFieldPerm = (field, groupKey) => {
    const perGroup = field.perGroup || {}
    const fallback = perGroup['全部用户'] || { visible: true, required: false, view: true, edit: false }
    const merged = { ...fallback, ...perGroup[groupKey] }
    return merged
  }

  const updateSelectedTable = (updater) => {
    if (!selectedTable) return
    setGroups((current) => updateNodeById(current, selectedTable.id, (table) => updater(table)))
  }

  const updateFieldPerm = (fieldId, permKey, value) => updateSelectedTable((table) => ({
    ...table,
    fields: table.fields.map((field) => {
      if (field.id !== fieldId) return field
      const perGroup = { ...(field.perGroup || {}) }
      perGroup['全部用户'] = { ...getFieldPerm(field, '全部用户'), [permKey]: value }
      return { ...field, perGroup }
    }),
  }))

  const updateAllFieldVisibility = (visible) => updateSelectedTable((table) => ({
    ...table,
    fields: table.fields.map((field) => {
      const perGroup = { ...(field.perGroup || {}) }
      perGroup['全部用户'] = { ...getFieldPerm(field, '全部用户'), visible }
      return { ...field, perGroup }
    }),
  }))

  // 更新字段属性（如 cardRole）
  const updateFieldProperty = (fieldId, propKey, value) => updateSelectedTable((table) => ({
    ...table,
    fields: table.fields.map((field) => {
      if (field.id !== fieldId) return field
      return { ...field, [propKey]: value }
    }),
  }))

  const handleTreeDrop = ({ dragNode, dropNode }) => {
    if (!dragNode || !dropNode) return
    // 分组不能拖进表内部，表不能拖成分组的子项；同类型同父级排序
    if (dragNode.key === dropNode.key) return
    if (dragNode.nodeType !== dropNode.nodeType) {
      showMessage('仅支持同类型节点排序')
      return
    }
    const dragFound = findNodeById(groups, dragNode.key)
    const dropFound = findNodeById(groups, dropNode.key)
    if (!dragFound || !dropFound) return
    const dragParent = dragFound.path.length > 1 ? dragFound.path[dragFound.path.length - 2] : null
    const dropParent = dropFound.path.length > 1 ? dropFound.path[dropFound.path.length - 2] : null
    if (dragParent?.id !== dropParent?.id) {
      showMessage('仅支持同父级下的节点排序')
      return
    }
    const reorder = (list) => {
      const next = [...list]
      const from = next.findIndex((item) => item.id === dragNode.key)
      const to = next.findIndex((item) => item.id === dropNode.key)
      if (from < 0 || to < 0) return list
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    }
    if (!dragParent) {
      setGroups((current) => reorder(current))
    } else {
      setGroups((current) => updateNodeById(current, dragParent.id, (parent) => ({
        ...parent,
        children: reorder(parent.children || []),
      })))
    }
    showMessage('顺序已更新')
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'field') {
      updateSelectedTable((table) => ({ ...table, fields: table.fields.filter((field) => field.id !== deleteTarget.id) }))
    } else if (deleteTarget.type === 'table' || deleteTarget.type === 'group') {
      const foundNode = findNodeById(groups, deleteTarget.id)
      if (!foundNode) return
      const parent = foundNode.path.length > 1 ? foundNode.path[foundNode.path.length - 2] : null
      if (!parent) {
        setGroups((current) => current.filter((item) => item.id !== deleteTarget.id))
        const nextRoot = groups.find((item) => item.id !== deleteTarget.id) || groups[0]
        setSelectedNodeKey(nextRoot?.id || '')
      } else {
        setGroups((current) => updateNodeById(current, parent.id, (p) => ({
          ...p,
          children: (p.children || []).filter((child) => child.id !== deleteTarget.id),
        })))
        const nextSibling = (parent.children || []).find((child) => child.id !== deleteTarget.id)
        setSelectedNodeKey(nextSibling?.id || parent.id)
      }
    }
    setDeleteTarget(null)
    showMessage('配置项已删除')
  }

  const fieldColumns = useMemo(() => {
    const fields = selectedTable?.fields || []
    const visibleCount = fields.filter((field) => getFieldPerm(field, '全部用户').visible).length
    const allVisible = fields.length > 0 && visibleCount === fields.length
    const partlyVisible = visibleCount > 0 && visibleCount < fields.length
    const baseColumns = [
      { key: 'name', dataIndex: 'name', title: '字段名称', width: 150 },
      { key: 'key', dataIndex: 'key', title: '字段标识', width: 150 },
      { key: 'visible', title: (
        <span className="field-visible-header">
          <DSCheckbox
            checked={allVisible}
            indeterminate={partlyVisible}
            disabled={!fields.length}
            aria-label="全选展示字段"
            onChange={(event) => updateAllFieldVisibility(event.target.checked)}
          />
          <span>展示</span>
        </span>
      ), width: 96, render: (_, record) => {
        const perm = getFieldPerm(record, '全部用户')
        return <DSCheckbox checked={perm.visible} aria-label={`展示${record.name}`} onChange={(event) => updateFieldPerm(record.id, 'visible', event.target.checked)} />
      } },
    ]
    // 仅当展示类型为「卡片」或「时间轴」时，增加「字段属性」列
    if (selectedTable?.displayType === '卡片' || selectedTable?.displayType === '时间轴') {
      baseColumns.push({
        key: 'cardRole',
        title: (
          <span className="field-role-header">
            字段属性
            <span
              className="field-role-tooltip-trigger"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setTooltipPos({ left: rect.left + rect.width / 2, top: rect.bottom + 8 })
              }}
              onMouseLeave={() => setTooltipPos(null)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
          </span>
        ),
        width: 140,
        render: (_, record) => (
          <DSSelect
            portal
            options={[
              { value: '重要字段', label: '重要字段' },
              { value: '辅助信息', label: '辅助信息' },
              { value: '内容字段', label: '内容字段' },
            ]}
            value={record.cardRole || '内容字段'}
            onChange={(value) => updateFieldProperty(record.id, 'cardRole', value)}
          />
        ),
      })
    }
    return baseColumns
  }, [selectedTable])
  // updateFieldPerm 通过闭包引用，依赖 groups 即可触发重渲染
  // eslint-disable-next-line react-hooks/exhaustive-deps

  if (!groups.length) return null

  // 第二步权限辅助函数
  const getPerm = (field, groupKey) => {
    const perGroup = field.perGroup || {}
    const fallback = perGroup['全部用户'] || { view: true, edit: false, required: false }
    return perGroup[groupKey] || fallback
  }

  const updatePerm = (fieldId, permKey, value) => {
    setGroups((current) => updateNodeById(current, fieldId, (field) => {
      const perGroup = { ...(field.perGroup || {}) }
      const currentPerm = getPerm(field, permUserGroup)
      // 级联勾选：编辑勾上时自动勾上查看；必填勾上时自动勾上查看和编辑
      let nextPerm = { ...currentPerm, [permKey]: value }
      if (permKey === 'edit' && value) {
        nextPerm.view = true
      }
      if (permKey === 'required' && value) {
        nextPerm.view = true
        nextPerm.edit = true
      }
      perGroup[permUserGroup] = nextPerm
      return { ...field, perGroup }
    }))
  }

  const collectGroupFields = (group) => {
    const fields = []
    const traverse = (node) => {
      if (node.nodeType === 'table' && node.fields) {
        fields.push(...node.fields)
      } else if (node.children) {
        node.children.forEach(traverse)
      }
    }
    traverse(group)
    return fields
  }

  const getGroupPerm = (group, groupKey) => {
    const fields = collectGroupFields(group)
    if (!fields.length) return { view: false, edit: false, required: false }
    return {
      view: fields.every((f) => getPerm(f, groupKey).view),
      edit: fields.every((f) => getPerm(f, groupKey).edit),
      required: fields.every((f) => getPerm(f, groupKey).required),
    }
  }

  const updateGroupPerm = (groupId, permKey, value) => {
    const groupFound = findNodeById(groups, groupId)
    if (!groupFound) return
    collectGroupFields(groupFound.node).forEach((field) => {
      updatePerm(field.id, permKey, value)
    })
  }

  const getTableActionPerm = (table, groupKey) => {
    const fallback = table.actionPermissions?.['全部用户'] || { create: false, delete: false }
    return { ...fallback, ...table.actionPermissions?.[groupKey] }
  }

  const updateTableActionPerm = (tableId, permKey, value) => {
    setGroups((current) => updateNodeById(current, tableId, (table) => ({
      ...table,
      actionPermissions: {
        ...(table.actionPermissions || {}),
        [permUserGroup]: {
          ...getTableActionPerm(table, permUserGroup),
          [permKey]: value,
        },
      },
    })))
  }

  // 字段配置中的权限校验（同 updatePerm 的级联逻辑，作用于「全部用户」组）
  const cascadeFieldPerm = (perm, permKey, value) => {
    let nextPerm = { ...perm, [permKey]: value }
    if (permKey === 'edit' && value) nextPerm.view = true
    if (permKey === 'required' && value) {
      nextPerm.view = true
      nextPerm.edit = true
    }
    return nextPerm
  }

  const renderPermissionMatrix = () => {
    // 当前选中的一级分组
    const activeGroup = groups.find((g) => g.id === permActiveGroupTab) || groups[0]

    const renderPermissionTable = (table) => {
      const expanded = permExpandedGroups.includes(table.id)
      const displayType = table.displayType || '表格'
      const tablePerm = getGroupPerm(table, permUserGroup)
      const actionPerm = getTableActionPerm(table, permUserGroup)
      const fieldColumnSize = Math.ceil((table.fields?.length || 0) / 2)
      const fieldColumns = [
        (table.fields || []).slice(0, fieldColumnSize),
        (table.fields || []).slice(fieldColumnSize),
      ].filter((column) => column.length)

      return (
        <div key={table.id} className="archive-permission-section">
          <div className="archive-permission-section__header">
            <DSButton
              variant="link"
              className="archive-permission-section__toggle"
              disabled={displayType === '大文本'}
              onClick={() => displayType !== '大文本' && setPermExpandedGroups((current) =>
                expanded ? current.filter((id) => id !== table.id) : [...current, table.id]
              )}
            >
              {displayType !== '大文本' ? (
                <span className={['archive-permission-section__arrow', expanded && 'is-expanded'].filter(Boolean).join(' ')}>▶</span>
              ) : null}
              <span className="archive-permission-section__title">
                {table.displayName || table.name}
                <span className={['archive-permission-type-tag', DISPLAY_TYPE_TAG_CLASS[displayType] || 'is-table'].join(' ')}>{displayType}</span>
              </span>
            </DSButton>
            <span className="archive-permission-section__batch">
              <DSCheckbox label="全部查看" checked={tablePerm.view} onChange={(next) => updateGroupPerm(table.id, 'view', next)} />
              <DSCheckbox label="全部编辑" checked={tablePerm.edit} onChange={(next) => updateGroupPerm(table.id, 'edit', next)} />
              <DSCheckbox label="全部必填" checked={tablePerm.required} onChange={(next) => updateGroupPerm(table.id, 'required', next)} />
              {['表格', '卡片'].includes(displayType) ? (
                <>
                  <DSCheckbox label="新增" checked={actionPerm.create} onChange={(next) => updateTableActionPerm(table.id, 'create', next)} />
                  <DSCheckbox label="删除" checked={actionPerm.delete} onChange={(next) => updateTableActionPerm(table.id, 'delete', next)} />
                </>
              ) : null}
            </span>
          </div>
          {expanded && table.fields?.length ? (
            <div className="archive-permission-section__detail">
              {fieldColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="archive-permission-field-column">
                  <div className="archive-permission-field-column__header">
                    <span>字段名</span>
                    <span className="archive-permission-field-column__permission-labels">
                      <span>查看</span>
                      <span>编辑</span>
                      <span>必填</span>
                    </span>
                  </div>
                  {column.map((field) => {
                    const perm = getPerm(field, permUserGroup)
                    return (
                      <div key={field.id} className="archive-permission-field">
                        <span className="archive-permission-field__name">{field.name}</span>
                        <span className="archive-permission-field__perms">
                          <DSCheckbox aria-label={`${field.name}：查看`} checked={perm.view} onChange={(next) => updatePerm(field.id, 'view', next)} />
                          <DSCheckbox aria-label={`${field.name}：编辑`} checked={perm.edit} onChange={(next) => updatePerm(field.id, 'edit', next)} />
                          <DSCheckbox aria-label={`${field.name}：必填`} checked={perm.required} onChange={(next) => updatePerm(field.id, 'required', next)} />
                        </span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )
    }

    const renderPermissionNode = (node) => {
      if (node.nodeType === 'table') return renderPermissionTable(node)

      return (
        <section key={node.id} className="archive-permission-subgroup">
          <h4 className="archive-permission-subgroup__title">{node.name}</h4>
          <div className="archive-permission-sections">
            {(node.children || []).map(renderPermissionNode)}
          </div>
        </section>
      )
    }

    return (
      <section className="archive-permission-layout" aria-label="用户组权限配置">
        <aside className="archive-permission-sidebar">
          <h3>用户组</h3>
          <ul className="archive-permission-groups">
            {PERMISSION_USER_GROUPS.map((group) => (
              <li
                key={group}
                className={['archive-permission-groups__item', group === permUserGroup && 'is-active'].filter(Boolean).join(' ')}
                onClick={() => setPermUserGroup(group)}
              >
                {group}
              </li>
            ))}
          </ul>
        </aside>

        <div className="archive-permission-main">
          {/* 一级分组横向页签 */}
          <div className="archive-permission-tabs">
            {groups.map((group) => (
              <div
                key={group.id}
                className={['archive-permission-tabs__item', group.id === permActiveGroupTab && 'is-active'].filter(Boolean).join(' ')}
                onClick={() => setPermActiveGroupTab(group.id)}
                role="tab"
                aria-selected={group.id === permActiveGroupTab}
                tabIndex={group.id === permActiveGroupTab ? 0 : -1}
              >
                {group.name}
              </div>
            ))}
          </div>

          {/* 当前一级分组下的二级分组或表 */}
          {activeGroup ? (
            <div className="archive-permission-tab-content">
              {/* 二级分组或表列表 */}
              {activeGroup.children?.length ? (
                <div className="archive-permission-node-list">
                  {activeGroup.children.map(renderPermissionNode)}
                </div>
              ) : (
                <div className="archive-permission-empty">暂无二级分组或表</div>
              )}
            </div>
          ) : (
            <div className="archive-permission-empty">请选择一级分组</div>
          )}
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="archive-wizard" aria-label="档案字段设置向导">
        <DSSteps
          items={STEPS_ITEMS}
          current={currentStep}
          clickable
          onChange={(index) => setCurrentStep(index)}
        />

        {currentStep === 0 ? (
          <section className="archive-config-layout" aria-label="设置档案字段">
            <aside className="archive-config-tree">
              <div className="archive-config-tree-header">
                <h3>档案目录</h3>
                <DSButton size="small" onClick={() => addGroup(null)}>新增一级分组</DSButton>
              </div>
              <DSTree
                ariaLabel="教学档案袋目录"
                className="archive-tree-scroll"
                dataSource={archiveTreeData}
                expandedKeys={expandedTreeKeys}
                selectedKey={selectedNodeKey}
                onDrop={handleTreeDrop}
                onExpand={setExpandedTreeKeys}
                onSelect={handleSelectNode}
              />
            </aside>

            <div className="archive-config-main">
              {selectedLevel === 'group' ? (
                <div className="archive-config-group">
                  <div className="archive-config-group__header">
                    <h3>{selectedNode.name || '分组设置'}</h3>
                    {selectedNode.name === PLACEHOLDER_GROUP_NAME ? (
                      <span className="archive-config-placeholder-hint">请设置分组名称</span>
                    ) : null}
                  </div>
                  <div className="archive-config-table-form">
                    <DSEditField label="分组名称" required>
                      <DSInput value={selectedNode.name === PLACEHOLDER_GROUP_NAME ? '' : (selectedNode.name || '')} placeholder="请输入分组名称" onChange={(event) => changeNodeField('name', event.target.value)} />
                    </DSEditField>
                    {isTopLevelGroup ? (
                      <DSEditField label="副标题">
                        <DSInput value={selectedNode.subtitle || ''} placeholder="请输入副标题" onChange={(event) => changeNodeField('subtitle', event.target.value)} />
                      </DSEditField>
                    ) : null}
                    <DSEditField label="启用状态">
                      <DSSwitch checked={Boolean(selectedNode.enabled)} checkedText="启用" uncheckedText="停用" onChange={(value) => changeNodeField('enabled', value)} />
                    </DSEditField>
                  </div>
                </div>
              ) : selectedLevel === 'table' ? (
                <div className="archive-config-group">
                  <div className="archive-config-group__header">
                    <h3>{selectedNode.displayName || '表设置'}</h3>
                    {selectedNode.displayName === PLACEHOLDER_TABLE_NAME ? (
                      <span className="archive-config-placeholder-hint">请设置表显示名称</span>
                    ) : null}
                  </div>
                  <div className="archive-config-table-form">
                    <DSEditField label="展示类型" required>
                      <DSSelect options={archiveDisplayTypes} value={selectedNode.displayType} onChange={(value) => changeNodeField('displayType', value)} />
                    </DSEditField>
                    <DSEditField label="表显示名称" required>
                      <DSInput value={selectedNode.displayName === PLACEHOLDER_TABLE_NAME ? '' : (selectedNode.displayName || '')} placeholder="请输入表显示名称" onChange={(event) => changeNodeField('displayName', event.target.value)} />
                    </DSEditField>
                    {!['文件', '大文本'].includes(selectedNode.displayType) ? (
                      <>
                        <DSEditField label="设置表">
                          <DSSelect options={TABLE_NAME_OPTIONS} value={selectedNode.displayName === PLACEHOLDER_TABLE_NAME ? '档案袋自建表' : (selectedNode.displayName || selectedNode.sourceTable || '档案袋自建表')} onChange={(value) => changeNodeField('displayName', value)} />
                        </DSEditField>
                        <DSEditField label="来源系统">
                          <DSSelect options={SOURCE_SYSTEM_OPTIONS} value={selectedNode.sourceSystem || '教学档案袋'} onChange={(value) => changeNodeField('sourceSystem', value)} />
                        </DSEditField>
                      </>
                    ) : null}
                    {selectedNode.displayType === '时间轴' ? (
                      <>
                        <DSEditField label="过滤字段">
                          <DSSelect options={(selectedNode.fields || []).map((f) => f.name)} value={selectedNode.filterField ?? ''} placeholder="请选择过滤字段" onChange={(value) => changeNodeField('filterField', value)} />
                        </DSEditField>
                        <DSEditField label="展示顺序">
                          <DSSelect options={['按时间正序', '按时间倒序']} value={selectedNode.displayOrder ?? '按时间倒序'} onChange={(value) => changeNodeField('displayOrder', value)} />
                        </DSEditField>
                      </>
                    ) : null}
                    {selectedNode.displayType !== '大文本' ? (
                      <>
                        <DSEditField label="状态">
                          <DSSwitch checked={Boolean(selectedNode.enabled)} checkedText="启用" uncheckedText="停用" onChange={(value) => changeNodeField('enabled', value)} />
                        </DSEditField>
                        {selectedNode.displayType === '文件' ? (
                          <>
                            <DSEditField label="文件大小（MB）">
                              <DSInput value={selectedNode.fileSize ?? ''} placeholder="如 10" onChange={(event) => changeNodeField('fileSize', event.target.value)} />
                            </DSEditField>
                            <DSEditField label="文件类型">
                              <DSInput value={selectedNode.fileType ?? ''} placeholder="如 PDF, Word, Excel" onChange={(event) => changeNodeField('fileType', event.target.value)} />
                            </DSEditField>
                          </>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                  {selectedNode.displayType === '文件' || selectedNode.displayType === '大文本' ? null : (
                    <DSDataTable
                      className="archive-config-field-table"
                      title="字段配置"
                      summary={selectedNode.fields?.length ? `共 ${selectedNode.fields.length} 个字段` : '暂未配置字段'}
                      columns={fieldColumns}
                      data={selectedNode.fields || []}
                      rowKey="id"
                      selectable={false}
                      bordered
                      tableTools={false}
                      draggable
                    />
                  )}
                </div>
              ) : (
                <div className="archive-config-group">
                  <div className="archive-config-group__header">
                    <h3>请选择节点</h3>
                  </div>
                  <p className="archive-config-group__notice">请在左侧树中选择分组或表进行配置，或点击「新增一级分组」开始。</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          renderPermissionMatrix()
        )}

        <div className="archive-wizard-footer">
          {currentStep > 0 && <DSButton variant="default" onClick={() => setCurrentStep(currentStep - 1)}>上一步</DSButton>}
          {currentStep < STEPS_ITEMS.length - 1 ? (
            <>
              <DSButton variant="default" onClick={() => {
                const incomplete = findIncompleteNode(groups)
                showMessage(incomplete ? `「${incomplete}」未设置名称，请补全` : '档案结构已保存')
              }}>保存</DSButton>
              <DSButton variant="primary" onClick={() => {
                const incomplete = findIncompleteNode(groups)
                if (incomplete) {
                  showMessage(`「${incomplete}」未设置名称，请补全`)
                } else {
                  showMessage('档案结构已保存')
                  setCurrentStep(currentStep + 1)
                }
              }}>保存并下一步</DSButton>
            </>
          ) : (
            <DSButton variant="primary" onClick={() => {
              showMessage('用户组权限已保存')
            }}>保存</DSButton>
          )}
        </div>
      </section>

      {messageText ? <div className="sys-admin-status" role="status">{messageText}</div> : null}

      <DSModal
        open={Boolean(deleteTarget)}
        title="确认删除"
        danger
        okText="删除"
        onCancel={() => setDeleteTarget(null)}
        onOk={confirmDelete}
      >
        <p className="sys-admin-muted">删除"{deleteTarget?.name}"后无法恢复，请确认是否继续。</p>
      </DSModal>

      {/* 字段属性气泡提示（fixed 定位绕过 overflow） */}
      {tooltipPos && (
        <div
          className="field-role-tooltip"
          style={{ left: tooltipPos.left, top: tooltipPos.top, transform: 'translateX(-50%)' }}
        >
          重要字段：卡片标题区域显示，突出关键信息<br />
          辅助信息：卡片右上角或次要位置显示<br />
          内容字段：卡片正文区域显示
        </div>
      )}
    </>
  )
}

// 递归查找第一个未设置名称/标识的节点标题（用于保存前校验）
function findIncompleteNode(nodes) {
  for (const node of nodes) {
    if (node.nodeType === 'group') {
      if (!node.name?.trim() || node.name === PLACEHOLDER_GROUP_NAME) return node.name || PLACEHOLDER_GROUP_NAME
      if (node.children?.length) {
        const child = findIncompleteNode(node.children)
        if (child) return child
      }
    } else if (node.nodeType === 'table') {
      if (!node.displayName?.trim() || node.displayName === PLACEHOLDER_TABLE_NAME) return node.displayName || PLACEHOLDER_TABLE_NAME
      if (!node.name?.trim()) return node.displayName || PLACEHOLDER_TABLE_NAME
    }
  }
  return null
}

function FormManagementPage() {
  const [archiveGroups, setArchiveGroups] = useState(createInitialArchiveStructure)

  return (
    <main className="sys-admin-page sys-admin-page--form-management" data-ds-business-page="form-management">
      <FormManagementWorkbench groups={archiveGroups} setGroups={setArchiveGroups} />
    </main>
  )
}

createRoot(document.getElementById('app')).render(<FormManagementPage />)
