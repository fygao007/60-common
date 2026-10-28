# RichTextEditor / 富文本编辑器

MasterGo 设计来源：

```text
mastergo://getd2c/139272150501659-1221-23902
```

## 用途

`DSRichTextEditor` 用于公告正文、说明内容、材料要求、审核意见模板等需要格式化文本的表单场景。

## 能力

- 工具栏：支持撤销、重做、标题、加粗、斜体、下划线、删除线、列表、引用、代码、链接和图片。
- 编辑区：支持占位、已输入内容、基础排版、滚动内容。
- 状态：默认、聚焦、禁用、错误。
- 辅助：底部提示和字数统计。
- 图标：使用 `ui-demo/assets/rich-text-icons/` 中的 MasterGo 导出图标。

## React 用法

```jsx
<DSRichTextEditor
  placeholder="请输入正文内容"
  maxLength={5000}
  defaultValue="<p>用于演示富文本内容。</p>"
/>
```

预览页：`ui-demo/components/form-rich-text-editor-states.html`。
