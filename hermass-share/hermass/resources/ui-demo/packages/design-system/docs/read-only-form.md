# 只读表单

来源：`mastergo://getd2c/195991886967017-34-89993`

`DSReadOnlyForm` 用于详情页、审核页、表单提交后预览和表单表格组合场景中的只读字段展示。它按 MasterGo 只读表单样式渲染为表格化网格，不渲染输入控件，不承载提交交互。

## 组件映射

| 区域 | 组件 | 规则 |
|---|---|---|
| 表单容器 | `DSReadOnlyForm` | 默认双列，渲染为 `标签-值 / 标签-值` 四列网格 |
| 字段 | `DSReadOnlyField` | 标签单元格浅灰底，值单元格白底，单元格之间使用 1px 分割线 |
| 长文本 | `DSReadOnlyField fullWidth align="start"` | 左侧保留标签列，值区跨剩余 3 列 |
| 空值 | `emptyText` | 默认展示 `-` |

## 使用规则

- 只读详情、审批查看、提交预览优先使用本组件。
- 不要用 disabled 输入框模拟只读展示。
- 不要在业务页重写标签列宽、行高、边框和单元格底色。
- 需要编辑时切换到 `DSEditForm` / `DSEditField`，不要在同一字段中混合只读和值编辑状态。

## React 示例

```jsx
<DSReadOnlyForm
  labelWidth={150}
  items={[
    { label: '项目名称', value: '课程资源建设计划', required: true },
    { label: '归属部门', value: '教务处', required: true },
    { label: '开始日期', value: '2026-06-01' },
    { label: '结束日期', value: '2026-09-30' },
    {
      label: '建设目标',
      value: '完成资源清单梳理、校内评审和发布准备。',
      fullWidth: true,
      align: 'start',
    },
  ]}
/>
```
