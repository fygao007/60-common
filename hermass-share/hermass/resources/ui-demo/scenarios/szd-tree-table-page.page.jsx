import { createRoot } from 'react-dom/client'
import { useMemo, useState } from 'react'
import { DSInput, DSRegularListTemplate, DSTag, DSTree } from '@wisedu/design-system'
import './szd-tree-table-page.css'

const treeData = [{ key: 'group', title: '二级分组', children: [{ key: 'node-1', title: '菜单名称' }, { key: 'node-2', title: '菜单名称' }, { key: 'node-3', title: '菜单名称' }] }]
const rows = Array.from({ length: 10 }, (_, index) => ({ id: index + 1, name: index === 9 ? '文本' : 'JAVA基础入门', isbn: index === 9 ? '文本' : '98765757', type: index === 9 ? '文本' : '出版教材', date: index === 9 ? '文本' : '2022年7月', status: '待院系审核' }))
const filterTree = (nodes, keyword) => nodes.flatMap((node) => {
  const children = filterTree(node.children || [], keyword)
  return node.title.includes(keyword) || children.length ? [{ ...node, children }] : []
})

function TreeTablePage() {
  const [selectedKey, setSelectedKey] = useState('node-2')
  const [treeKeyword, setTreeKeyword] = useState('')
  const [filters, setFilters] = useState({ first: '', second: '', third: '', fourth: '' })
  const data = useMemo(() => { const keyword = Object.values(filters).find(Boolean)?.trim(); return keyword ? rows.filter((row) => row.name.includes(keyword)) : rows }, [filters])
  const visibleTree = useMemo(() => filterTree(treeData, treeKeyword.trim()), [treeKeyword])
  return <main className="szd-tree-table-page" data-ds-business-page="szd-tree-table-page"><section className="szd-tree-table-layout"><aside className="szd-tree-table-sidebar"><DSInput className="szd-tree-table-search" value={treeKeyword} placeholder="搜索" onChange={(event) => setTreeKeyword(event.target.value)} /><DSTree className="szd-tree-table-tree" dataSource={visibleTree} defaultExpandAll selectedKey={selectedKey} onSelect={setSelectedKey} /></aside><section className="szd-tree-table-main"><DSRegularListTemplate className="szd-tree-table-template" tabs={[]} metaLabel="" metaValue="" notice="" inset={12} contentGap={12} tableGap={8} toolbarGap={8} filterProps={{ density: 'compact', columns: 3, defaultExpanded: true, showExpand: false, showMore: false, fields: ['first', 'second', 'third', 'fourth'].map((key) => ({ key, label: '标题名称', placeholder: '请输入', controlledValue: filters[key], onChange: (event) => setFilters((current) => ({ ...current, [key]: event.target.value })) })), onReset: () => setFilters({ first: '', second: '', third: '', fourth: '' }) }} toolbarActions={[{ key: 'primary', label: '主按钮', variant: 'primary' }, { key: 'secondary', label: '次按钮', variant: 'ghost' }, { key: 'report', label: '导出报表' }, { key: 'download', label: '批量下载' }, { key: 'import', label: '导入' }, { key: 'export', label: '导出', dropdown: true }, { key: 'print', label: '打印' }, { key: 'sort', label: '排序查询' }]} summary="" tableProps={{ columns: [{ key: 'name', dataIndex: 'name', title: '教材名称', width: 240 }, { key: 'isbn', dataIndex: 'isbn', title: 'ISBN', width: 160 }, { key: 'type', dataIndex: 'type', title: '教材类型', width: 160 }, { key: 'date', dataIndex: 'date', title: '出版年月', width: 160 }, { key: 'status', dataIndex: 'status', title: '审核状态', width: 180, render: (value) => <DSTag>{value}</DSTag> }], data, rowKey: 'id', selectable: true, showIndex: true, actions: [{ key: 'first', label: '按钮' }, { key: 'second', label: '按钮' }], actionFixed: true, minWidth: 980 }} pagination={{ total: 100, totalPages: 10, current: 1, pageSize: 10 }} footerActions={[]} /></section></section></main>
}
createRoot(document.getElementById('app')).render(<TreeTablePage />)
