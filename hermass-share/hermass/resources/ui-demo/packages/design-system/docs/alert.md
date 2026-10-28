# Alert 警告提示规范

来源：MasterGo《📌【PC】基础控件 / Alert》

设计文档：
https://mastergo.com/goto/T29Z6cTr?page_id=32:2475&file=139272150501659&devMode=true

## 当前落地范围

- React 组件：`src/Alert/index.jsx`
- 样式文件：`src/Alert/index.css`
- HTML 预览：`ui-demo/components/ant-components-page.html#official-alert`

## 形态

- Info：信息提示，用于一般信息告知。
- Success：成功提示，用于操作成功反馈。
- Warning：警告提示，用于警示用户注意。
- Danger：错误提示，用于错误或危险操作告知。

## 结构

```
.ds-alert--{tone}
├── .ds-alert__icon（左侧圆形图标）
├── .ds-alert__content
│   ├── .ds-alert__title（标题，可选）
│   └── .ds-alert__description（描述内容，可选）
├── .ds-alert__action（操作按钮，可选）
└── .ds-alert__close（关闭按钮，可选）
```

## 尺寸

- 最小高度：`40px`（var(--ds-control-height-xl)）
- 内边距：`8px 16px`（var(--ds-space-2) var(--ds-space-4)）
- 图标尺寸：`16px` 圆形
- 间距：图标与内容间距 `8px`（var(--ds-space-2)）

## 配色方案

| tone | 背景 | 边框 | 文字 | 图标 |
|---|---|---|---|---|
| Info | `--ds-color-info-light` | `--ds-color-primary-weak` | 蓝色 `--ds-color-primary-active` | 蓝色圆形 "i" |
| Success | `--ds-color-success-light` | `--ds-color-success-border` | 绿色 `--ds-color-success-active` | 绿色圆形 "✓" |
| Warning | `--ds-color-warning-light` | `--ds-color-warning-border` | 橙色 `--ds-color-warning-text` | 橙色圆形 "!" |
| Danger | `--ds-color-danger-light` | `--ds-color-danger` | 红色 `--ds-color-danger-active` | 红色圆形 "×" |

## 状态

- Default：默认显示状态。
- Hover：关闭按钮 hover 显示高亮。
- Focus：操作按钮 focus 显示外发光。

## 使用规则

- 页面级提示：用于页面顶部或内容区顶部，告知用户重要信息。
- 表单级提示：用于表单顶部，提示填写规则或错误信息。
- 卡片级提示：用于卡片内部，提示卡片相关状态信息。
- 不适用于：短暂浮动的 Toast 提示（应使用 Toast 组件）。
- 关闭行为：用户点击关闭按钮后，Alert 应从 DOM 中移除或隐藏。
- 操作按钮：可选，用于引导用户进行下一步操作（如"查看详情"、"立即处理"）。

## React Props

```jsx
<DSAlert
  tone="info"           // info | success | warning | danger
  title="提示标题"       // 可选
  description="详细描述" // 可选，也可通过 children 传入
  action={<button>操作</button>} // 可选
  closable={true}       // 是否显示关闭按钮，可选
  onClose={() => {}}    // 关闭回调，可选
/>
```

## HTML 示例

```html
<!-- 信息提示 -->
<section class="ds-alert ds-alert--info" role="status">
  <span class="ds-alert__icon" aria-hidden="true"></span>
  <div class="ds-alert__content">
    <strong class="ds-alert__title">信息提示</strong>
    <div class="ds-alert__description">这是一条信息提示内容。</div>
  </div>
  <div class="ds-alert__action">
    <button class="ds-button ds-button--link">查看详情</button>
  </div>
  <button class="ds-alert__close" aria-label="关闭">
    <span aria-hidden="true">×</span>
  </button>
</section>

<!-- 成功提示 -->
<section class="ds-alert ds-alert--success" role="status">
  <span class="ds-alert__icon" aria-hidden="true"></span>
  <div class="ds-alert__content">
    <strong class="ds-alert__title">操作成功</strong>
    <div class="ds-alert__description">您的数据已成功保存。</div>
  </div>
</section>

<!-- 警告提示 -->
<section class="ds-alert ds-alert--warning" role="status">
  <span class="ds-alert__icon" aria-hidden="true"></span>
  <div class="ds-alert__content">
    <strong class="ds-alert__title">警告提示</strong>
    <div class="ds-alert__description">请注意，此操作可能影响其他数据。</div>
  </div>
  <div class="ds-alert__action">
    <button class="ds-button ds-button--link">了解更多</button>
  </div>
</section>

<!-- 错误提示 -->
<section class="ds-alert ds-alert--danger" role="status">
  <span class="ds-alert__icon" aria-hidden="true"></span>
  <div class="ds-alert__content">
    <strong class="ds-alert__title">错误提示</strong>
    <div class="ds-alert__description">操作失败，请检查输入数据后重试。</div>
  </div>
  <div class="ds-alert__action">
    <button class="ds-button ds-button--link">重新提交</button>
  </div>
  <button class="ds-alert__close" aria-label="关闭">
    <span aria-hidden="true">×</span>
  </button>
</section>
```

## 后续待对齐

- 从 MasterGo 设计稿继续校准具体色值、圆角、间距和多状态截图。
- 增加 Alert 独立 HTML 状态页，覆盖所有形态和状态组合。
- 补充关闭按钮的样式和交互逻辑。
- 补充 Toast 组件规范（短暂浮动提示）。