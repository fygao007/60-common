import DSButton from '../Button'
import './index.css'

const defaultColumns = [
  { key: 'name', title: '姓名' },
  { key: 'department', title: '部门' },
  { key: 'status', title: '状态' },
]

const defaultData = [
  { id: 1, name: '张三', department: '人事处', status: '启用' },
  { id: 2, name: '李四', department: '教务处', status: '停用' },
]

export default function DSCrudTemplate({
  title = '增删改查',
  description = '适用于 MIS 后台常见数据管理场景。',
  searchFields = [],
  columns = defaultColumns,
  data = defaultData,
  rowKey = 'id',
  selectedCount = 0,
  total = data.length,
  current = 1,
  pageSize = 20,
  showCreatePanel = false,
  showDeleteConfirm = false,
  createTitle = '新增数据',
  formFields = [],
  onSearch,
  onReset,
  onCreate,
  onBatchDelete,
  onExport,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="ds-crud-template">
      <header className="ds-crud-template__header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <DSButton onClick={onCreate}>新增</DSButton>
      </header>

      <section className="ds-crud-template__search" aria-label="查询条件">
        {searchFields.map((field) => (
          <label className="ds-crud-template__field" key={field.key || field.label}>
            <span>{field.label}</span>
            <input placeholder={field.placeholder || `请输入${field.label}`} defaultValue={field.value} />
          </label>
        ))}
        <div className="ds-crud-template__search-actions">
          <DSButton onClick={onSearch}>查询</DSButton>
          <DSButton variant="default" onClick={onReset}>重置</DSButton>
        </div>
      </section>

      <section className="ds-crud-template__card">
        <div className="ds-crud-template__toolbar">
          <div className="ds-crud-template__selection">已选 {selectedCount} 项</div>
          <div className="ds-crud-template__actions">
            <DSButton variant="default" onClick={onExport}>导出</DSButton>
            <DSButton variant="default" danger onClick={onBatchDelete}>批量删除</DSButton>
          </div>
        </div>

        <div className="ds-crud-template__table-wrap">
          <table className="ds-crud-template__table">
            <thead>
              <tr>
                <th className="ds-crud-template__checkbox"><input type="checkbox" aria-label="全选" /></th>
                {columns.map((column) => (
                  <th key={column.key}>{column.title}</th>
                ))}
                <th className="ds-crud-template__operation">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record, index) => (
                <tr key={record[rowKey] || index}>
                  <td className="ds-crud-template__checkbox"><input type="checkbox" aria-label={`选择第 ${index + 1} 行`} /></td>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render ? column.render(record[column.key], record) : record[column.key]}</td>
                  ))}
                  <td className="ds-crud-template__operation">
                    <button type="button">编辑</button>
                    <button type="button" className="ds-crud-template__danger-link">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ds-crud-template__pagination">
          <span>共 {total} 条</span>
          <button type="button">上一页</button>
          <strong>{current}</strong>
          <button type="button">下一页</button>
          <span>{pageSize} 条/页</span>
        </div>
      </section>

      {showCreatePanel && (
        <div className="ds-crud-template__overlay">
          <aside className="ds-crud-template__drawer" aria-label={createTitle}>
            <header>
              <h3>{createTitle}</h3>
              <button type="button" onClick={onCancel}>×</button>
            </header>
            <div className="ds-crud-template__form">
              {formFields.map((field) => (
                <label className="ds-crud-template__form-field" key={field.key || field.label}>
                  <span>{field.required && <b>*</b>}{field.label}</span>
                  <input placeholder={field.placeholder || `请输入${field.label}`} defaultValue={field.value} />
                </label>
              ))}
            </div>
            <footer>
              <DSButton variant="default" onClick={onCancel}>取消</DSButton>
              <DSButton onClick={onSubmit}>确定</DSButton>
            </footer>
          </aside>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="ds-crud-template__overlay ds-crud-template__overlay--center">
          <div className="ds-crud-template__confirm" role="dialog" aria-modal="true" aria-label="删除确认">
            <h3>确认删除？</h3>
            <p>删除后数据不可恢复，请谨慎操作。</p>
            <footer>
              <DSButton variant="default" onClick={onCancel}>取消</DSButton>
              <DSButton danger onClick={onSubmit}>删除</DSButton>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
