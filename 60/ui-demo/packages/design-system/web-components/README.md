# Design System Web Components

独立 HTML 页面使用的 Web Components。页面只维护数据和配置，组件结构、交互和样式集中在这里维护。

## GroupTitle

`GroupTitle` 是无依赖 Web Component，可直接通过 `file://` 或 HTTP 页面加载。

```html
<script defer src="./packages/design-system/web-components/GroupTitle/ds-group-title.js"></script>

<ds-group-title title="分组名称"></ds-group-title>

<ds-group-title title="基本信息" level="2">
  <span slot="leading" class="section-mark"></span>
  <button slot="extra" type="button">查看说明</button>
</ds-group-title>
```

- `title`：标题内容，长文本自动省略。
- `level`：标题语义层级，默认 `1`，支持 `1` 至 `6`。
- `slot="leading"`：前置图标或标识。
- `slot="extra"`：右侧按钮、链接或状态。

## DataTable

```html
<script type="importmap">
{
  "imports": {
    "lit": "./node_modules/lit/index.js",
    "lit/": "./node_modules/lit/",
    "lit-html": "./node_modules/lit-html/lit-html.js",
    "lit-html/": "./node_modules/lit-html/",
    "lit-element/": "./node_modules/lit-element/",
    "@lit/reactive-element": "./node_modules/@lit/reactive-element/reactive-element.js",
    "@lit/reactive-element/": "./node_modules/@lit/reactive-element/"
  }
}
</script>
<script type="module" src="./packages/design-system/web-components/DataTable/ds-data-table.js"></script>

<ds-data-table id="table" row-key="id" draggable selectable show-index></ds-data-table>
<script type="module">
  const table = document.getElementById('table')
  table.columns = [
    { key: 'title', title: '标题', width: 240, fixed: 'left' },
    { key: 'enabled', title: '启用', width: 120, type: 'switch' }
  ]
  table.data = [
    { id: 1, title: '培养方案模板维护', enabled: true }
  ]
</script>
```
