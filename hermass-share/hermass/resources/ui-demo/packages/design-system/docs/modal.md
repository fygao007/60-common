# 弹窗组件规范

主要来源：`https://mastergo.com/goto/WK3QSSKH?page_id=3665:105590&file=200884015180678`

补充来源：`mastergo://getd2c/195991886967017-2-003301`

编辑模板来源：

- 单列：`mastergo://getd2c/195991886967017-11-91955`
- 双列：`mastergo://getd2c/195991886967017-11-92097`

原始 D2C 落盘：

- 批量配置弹窗：`.mastergo/modal-spec/139272150501659-4316-81924.html`
- 长表单弹窗：`.mastergo/195991886967017-2-003301/195991886967017-2-003301.html`
- 交互预览：`ui-demo/components/modal-components.html`

## 基本原则

- 弹窗由 `DSModal` 统一承载，不由业务页面重复实现遮罩、焦点、滚动和关闭逻辑。
- 宽度使用规格预设，高度默认由内容决定，不把设计稿示例高度当成所有弹窗的固定高度。
- 标题栏和底部操作栏固定；内容超过可用高度时只滚动正文。
- 默认弹窗允许关闭图标、取消、遮罩和 `Escape` 关闭；危险操作可关闭 `maskClosable` 和 `keyboard`。
- 提交中禁用关闭、取消、确定和遮罩关闭，避免重复提交或状态丢失。

## 尺寸规格

| 规格 | 宽度 | 适用场景 | 高度规则 |
|---|---:|---|---|
| `small` | `480px` | 确认、警告、短反馈 | 内容自适应 |
| `medium` | `600px` | 默认配置、短表单 | 内容自适应；本次 MasterGo 示例为 `484px` |
| `large` | `800px` | 复杂表单、表格、对照内容 | 内容自适应 |
| `wide` | `900px` | 双列短表单 | 内容自适应；编辑模板示例为 `352px` |

固定规格模板：`DSSingleEditModal` 为 `600 × 664px`，`DSLargeModalTemplate` 为 `1200 × 640px`，`DSWideModalTemplate` 为 `900 × 640px`。三种模板都有固定头尾和可滚动正文。

所有规格默认 `max-height: calc(100vh - 48px)`。长表单可以显式传入 `height={560}`，但内容区仍需独立滚动。

## 视觉规则

| 区域 | 规则 |
|---|---|
| 遮罩 | 全屏黑色 `80%` 透明度 |
| 容器 | 白底、`8px` 圆角、`1px solid #EEEEF0` |
| 标题栏 | 最小高 `58px`，内边距 `12px 12px 12px 20px` |
| 标题 | `16px / 24px / 600`，颜色 `#000000` |
| 关闭按钮 | `32px × 32px` 点击区，内部 `16px` 图标 |
| 内容区 | 左右内边距 `20px`，上下间距由内容结构决定 |
| 底栏 | 最小高 `56px`，内边距 `12px 20px` |
| 按钮 | 右对齐，高 `32px`，间距 `8px` |
| 取消按钮 | 白底、黑字、`#DCDCE0` 边框 |
| 确定按钮 | `#333FFF` 背景、白字 |

## 本稿配置结构

批量配置弹窗使用 `medium` 规格，正文按以下顺序组织：

1. 已选数据提示：`#EBECFF` 背景、`4px` 圆角、`9px 16px` 内边距。
2. 配置说明：`#FAFAFA` 背景、`4px` 圆角、`12px 16px` 内边距。
3. 单列表单：表单行间距 `20px`，标签宽 `94px`，标签与控件间距 `16px`。
4. 控件：高 `32px`、`4px` 圆角、水平内边距 `12px`。

## 交互与无障碍

- 打开后记录当前焦点，并把焦点移动到弹窗内第一个可操作元素。
- `Tab` 和 `Shift + Tab` 在弹窗可操作元素之间循环。
- 关闭后焦点返回原触发元素。
- 弹窗打开时锁定页面滚动；关闭后恢复原滚动设置。
- 遮罩只在点击遮罩本身时关闭，点击弹窗内容不会冒泡误关。
- 使用 `role="dialog"`、`aria-modal="true"` 和标题关联；强提醒可传 `role="alertdialog"`。
- 无标题弹窗不推荐使用；如业务必须隐藏视觉标题，仍需提供可访问名称。

## React 用法

```jsx
const [open, setOpen] = useState(false)
const [submitting, setSubmitting] = useState(false)

<DSModal
  open={open}
  title="批量配置"
  size="medium"
  confirmLoading={submitting}
  onCancel={() => setOpen(false)}
  onOk={handleSubmit}
>
  <BatchConfigForm />
</DSModal>
```

危险确认：

```jsx
<DSModal
  open={open}
  title="停用确认"
  size="small"
  role="alertdialog"
  danger
  okText="停用"
  maskClosable={false}
  keyboard={false}
  onCancel={() => setOpen(false)}
  onOk={handleDisable}
>
  停用后相关业务将无法继续使用该配置。
</DSModal>
```

## 主要 API

| 属性 | 默认值 | 说明 |
|---|---|---|
| `open` | `false` | 是否打开 |
| `size` | `medium` | `small`、`medium`、`large`、`wide` |
| `width` | - | 覆盖规格宽度 |
| `height` | - | 显式固定高度，默认内容自适应 |
| `maxHeight` | `calc(100vh - 48px)` | 最大高度 |
| `maskClosable` | `true` | 点击遮罩是否关闭 |
| `keyboard` | `true` | 是否允许 `Escape` 关闭 |
| `confirmLoading` | `false` | 确定按钮加载，并锁定所有关闭入口 |
| `showCancel` | `true` | 是否显示取消按钮 |
| `showClose` | `true` | 是否显示关闭按钮 |
| `showFooter` | `true` | 是否显示底栏 |
| `footer` | `undefined` | 自定义底栏；传 `null` 移除 |
| `bodyPadding` | `default` | 传 `none` 移除内容区内边距 |
| `afterOpen` | - | 焦点进入弹窗后触发 |
| `afterClose` | - | 关闭并恢复焦点后触发 |

## 选择建议

- 简短确认、危险操作：`small`。
- 集中配置、少量字段：`medium`。
- 双列短表单：`wide`，并使用 `DSEditForm columns={2}`。
- 复杂表格或多列内容：优先改用抽屉；必须居中呈现时使用 `large` 或 `wide`。
- 字段很多、需要持续编辑：优先抽屉或独立页面，不继续扩大弹窗。

单列、双列编辑弹窗的精确间距和响应式规则见 `docs/edit-overlay-templates.md`。
业务页面不要直接组合 `DSModal + DSEditForm`；应分别使用锁定规范的
`DSSingleEditModal` 或 `DSDoubleEditModal`。
