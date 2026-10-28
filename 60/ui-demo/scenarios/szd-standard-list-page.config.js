import { useState } from 'react'
import { defineTableColumns, defineOntologyFields } from '@wisedu/hr-domain/fields'

// 演示数据不代表真实人员，字段定义来自正式领域包。
const refs = ['StaffBasicInformation.xm', 'StaffBasicInformation.zgh', 'StaffBasicInformation.csrq']
const fields = defineOntologyFields(refs)
const columns = defineTableColumns(refs).map((column, index) => ({ ...column, displayType: index === 2 ? 'date' : 'text' }))
const rows = Array.from({ length: 10 }, (_, index) => Object.fromEntries([
  ['id', index + 1],
  ...columns.map((column, fieldIndex) => [column.dataIndex, fieldIndex === 0 ? `示例人员${index + 1}` : fieldIndex === 1 ? `DEMO${String(index + 1).padStart(3, '0')}` : '1990-01-01']),
]))

export function usePageConfig() {
  const [draft, setDraft] = useState(['', '', ''])
  const [keywords, setKeywords] = useState(['', '', ''])
  const data = rows.filter((row) => columns.every((column, index) => String(row[column.dataIndex]).includes(keywords[index])))
  return {
    filterProps: {
      fields: fields.map((field, index) => ({
        fieldRef: field.fieldRef, key: field.fieldRef, label: field.label,
        placeholder: '请输入', controlledValue: draft[index],
        onChange: (event) => setDraft(draft.map((value, item) => item === index ? event.target.value : value)),
      })),
      onSearch: () => setKeywords(draft.map((value) => value.trim())),
      onReset: () => { setDraft(['', '', '']); setKeywords(['', '', '']) },
      defaultExpanded: true,
    },
    toolbarActions: [],
    tableProps: { columns, data, rowKey: 'id', selectable: false, actions: [] },
    pagination: { total: data.length, totalPages: 1, current: 1, pageSize: 10 },
  }
}
