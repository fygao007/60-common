# 分组表单表格页模板

来源：`mastergo://getd2c/195991886967017-36-015282`

分组表单表格页用于同一页面内同时呈现主表单、分组说明、明细表格和补充表单的后台业务场景。生成业务页时应根据实际任务裁剪分组数量，而不是把全部区域机械复制。

## 页面结构

1. 页面容器宽度建议为 `1240px`，小屏下自然收缩。
2. 顶部卡片承载标题说明和基础筛选字段。
3. 中部使用分组标题组织主表单，字段默认使用只读格式。
4. 明细区使用 `DSDataTable`，默认不带按钮、分页和行操作。
5. 底部补充说明只保留表单字段和状态说明。

## 组件映射

| 模板区域 | 设计系统组件 | 配置 |
|---|---|---|
| 页面容器 | 业务布局类 + token | 只负责栅格、留白和响应式 |
| 分组标题 | `DSGroupTitle` | 标题高度 `38px`，右侧 extra 可显示状态 |
| 主表单字段 | `DSReadOnlyForm` / `DSReadOnlyField` | 标签宽 `94px`，值区不渲染输入控件 |
| 明细表格 | `DSDataTable` | 序号、固定首列、业务列 |
| 表格分页 | `DSDataTable.pagination` / `DSPagination` | 按业务需要追加 |
| 页面操作 | `DSButton` | 按业务需要追加，默认不展示 |

## 生成规则

- 只有查询和明细列表时，优先使用常规列表页模板。
- 需要维护一个主对象及其子项时，使用本模板。
- 表单字段少于 4 个时可合并为一个分组；超过 8 个字段时拆分为多个 `DSFormGroup`。
- 详情、审核查看和提交预览使用 `DSReadOnlyForm`；需要编辑时再切换为 `DSEditForm`。
- 明细新增或编辑涉及按钮、弹窗、抽屉时，必须使用 `DSButton`、`DSSingleEditModal`、`DSDoubleEditModal` 或 `DSGroupedEditDrawer`。
- 页面级 CSS 只写业务布局，不覆盖 `.ds-*` 的核心尺寸、字段间距、表格行高和浮层结构。
- 表格列、筛选字段、分组标题、默认值和提交逻辑由业务页定制。

## 尺寸与视觉

| 项目 | 数值 |
|---|---:|
| 页面最大宽度 | `1240px` |
| 页面外边距 | `20px` |
| 卡片内边距 | `16px` |
| 卡片圆角 | `12px` |
| 分组标题高度 | `38px` |
| 表单标签宽度 | `94px` |
| 字段横向间距 | `20px` |
| 只读字段最小高度 | `32px` |
| 表格最小宽度 | `1180px` |
| 表头高度 | `40px` |
| 数据行高度 | `46px` |

## React 示例

```jsx
<section className="business-form-table">
  <DSFormGroup title="基础信息" extra="主表单">
    <DSReadOnlyForm
      items={[
        { label: '项目名称', value: '课程资源建设计划', required: true },
        { label: '归属部门', value: '教务处', required: true },
        { label: '开始日期', value: '2026/06/01' },
        { label: '结束日期', value: '2026/09/30' },
        { label: '建设目标', value: '完成资源清单梳理。', fullWidth: true, align: 'start' },
      ]}
    />
  </DSFormGroup>

  <DSDataTable
    title="明细表格"
    variant="lowcode"
    columns={columns}
    data={rows}
    showIndex
  />
</section>
```
