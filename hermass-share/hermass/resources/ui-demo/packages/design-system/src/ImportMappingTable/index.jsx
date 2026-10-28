import { DSSelect } from '../Field'
import DSTag from '../Tag'
import './index.css'

const defaultRows = [
  { key: 'name', source: '姓名', target: '姓名', required: true, status: 'matched' },
  { key: 'department', source: '所属学院', target: '学院', required: true, status: 'matched' },
  { key: 'remark', source: '备注', target: '', required: false, status: 'unmatched' },
]

const statusMap = {
  matched: { label: '已匹配', color: 'success' },
  unmatched: { label: '待匹配', color: 'warning' },
  error: { label: '异常', color: 'danger' },
}

export default function DSImportMappingTable({
  rows = defaultRows,
  targetOptions = [],
  onChange,
  className = '',
}) {
  return (
    <section className={['ds-import-mapping-table', className].filter(Boolean).join(' ')} aria-label="字段映射">
      <table>
        <thead>
          <tr>
            <th>模板字段</th>
            <th>系统字段</th>
            <th>是否必填</th>
            <th>匹配状态</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const status = statusMap[row.status] || statusMap.unmatched
            return (
              <tr key={row.key || row.source}>
                <td>{row.source}</td>
                <td>
                  <DSSelect
                    value={row.target}
                    options={targetOptions.length ? targetOptions : [{ label: '请选择系统字段', value: '' }, row.target].filter(Boolean)}
                    onChange={(event) => onChange?.(row, event.target.value)}
                  />
                </td>
                <td>{row.required ? <DSTag color="danger">必填</DSTag> : <DSTag>选填</DSTag>}</td>
                <td><DSTag color={status.color}>{status.label}</DSTag></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
