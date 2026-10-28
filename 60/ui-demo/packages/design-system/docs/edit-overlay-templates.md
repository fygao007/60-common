# 编辑弹层模板

来源：

- 单列编辑弹窗：`mastergo://getd2c/195991886967017-11-91955`
- 双列编辑弹窗：`mastergo://getd2c/195991886967017-11-92097`
- 带分组抽屉：`mastergo://getd2c/195991886967017-11-92271`
- 大尺寸与宽尺寸弹窗：`https://mastergo.com/goto/WK3QSSKH?page_id=3665:105590&file=200884015180678`

原始 D2C 落盘：

- `.mastergo/edit-modal-single/195991886967017-11-91955.html`
- `.mastergo/edit-modal-double/195991886967017-11-92097.html`
- `.mastergo/grouped-drawer/195991886967017-11-92271.html`

交互预览：`ui-demo/components/edit-overlay-templates.html`

## 组件映射

| 模板 | 容器 | 内容布局 |
|---|---|---|
| 单列编辑弹窗 | `DSSingleEditModal` | 内部固定 `DSEditForm columns={1}` |
| 双列编辑弹窗 | `DSDoubleEditModal` | 内部固定 `DSEditForm columns={2}` |
| 大尺寸弹窗 | `DSLargeModalTemplate` | `1200px × 640px`，正文区域可自由组合 |
| 宽尺寸弹窗 | `DSWideModalTemplate` | `900px × 640px`，适合双列或对照内容 |
| 带分组抽屉 | `DSGroupedEditDrawer` | `DSFormGroup` + `DSEditForm columns={1}` |

`DSEditField` 只负责标签列、必填标记、控件列和帮助/错误信息。输入、选择、日期、开关和富文本仍使用各自基础组件。

## 共同尺寸

| 项目 | 数值 |
|---|---:|
| 标题栏 / 底栏高度 | `58px / 56px` |
| 标题栏内边距 | `12px 12px 12px 20px` |
| 内容区水平内边距 | `20px` |
| 底栏内边距 | `12px 20px` |
| 标签宽度 | `94px` |
| 标签与控件间距 | `16px` |
| 字段行 / 列间距 | `16px` |
| 控件高度 | `32px` |
| 控件圆角 | `4px` |
| 底栏按钮间距 | `8px` |

## 单列编辑弹窗

- 容器为 `600px × 664px`。
- 正文填充头尾之间的可用空间；字段较多时只滚动正文。
- 表单内容宽 `560px`，字段保持单列，每个字段最大宽度 `600px`。
- 示例中的 9 个标准高度字段使用上下各 `16px` 留白。
- 字段较多时只滚动正文，不扩大弹窗到视口之外。

## 双列编辑弹窗

- 容器为 `900px × 520px`。
- 正文内容宽 `860px`，两列各约 `422px`，列间距 `16px`。
- 单列最小宽度为 `370px`；可用宽度小于 `756px` 时自动改为单列。
- 需要跨列的字段使用 `DSEditField fullWidth`。
- 双列只用于短字段。富文本、复杂上传和大文本域应通栏或改用抽屉。

## 大尺寸与宽尺寸弹窗

- `DSLargeModalTemplate` 固定为 `1200px × 640px`，用于连续浏览的复杂配置和长内容。
- `DSWideModalTemplate` 固定为 `900px × 640px`，用于双列字段和横向对照。
- 两种模板均固定标题栏与底栏，正文独立滚动；业务页不覆盖其尺寸或内部间距。

## 带分组抽屉

- 抽屉宽 `600px`，从右侧打开，左侧使用 `1px solid #F6F6F7` 分隔。
- 标题栏和底栏固定，正文独立滚动。
- 分组间距 `24px`；分组标题和内容间距 `16px`。
- 分组标题高 `38px`，内边距 `8px 16px`，使用浅紫渐变背景。
- 抽屉内容宽 `560px`，默认采用单列表单。
- 富文本等高控件使用 `DSEditField align="start"`，标签顶部对齐。

## 交互规则

- 打开后焦点进入第一个可操作元素，`Tab` 在当前弹层内循环。
- 关闭后焦点返回触发按钮。
- 默认支持关闭按钮、取消、遮罩和 `Escape` 关闭。
- 点击内容区域不应触发遮罩关闭。
- 提交中锁定关闭按钮、取消、确定、遮罩和 `Escape`。
- 打开时锁定页面滚动；关闭时恢复原滚动设置。
- 双列模板响应式降为单列，不通过压缩标签或控件维持双列。

## React 用法

```jsx
<DSDoubleEditModal
  open={open}
  title="双列编辑弹窗"
  onCancel={() => setOpen(false)}
  onOk={handleSubmit}
>
  <DSEditField label="名称" required>
    <DSInput />
  </DSEditField>
  <DSEditField label="类型">
    <DSSelect options={options} />
  </DSEditField>
</DSDoubleEditModal>
```

```jsx
<DSGroupedEditDrawer
  open={open}
  title="编辑活动信息"
  confirmLoading={submitting}
  onClose={() => setOpen(false)}
  onOk={handleSubmit}
>
  <DSFormGroup title="基本信息">
    <DSEditForm columns={1}>
      <DSEditField label="活动名称" required>
        <DSInput />
      </DSEditField>
    </DSEditForm>
  </DSFormGroup>
  <DSFormGroup title="详细说明">
    <DSEditForm columns={1}>
      <DSEditField label="活动详情" align="start">
        <DSRichTextEditor />
      </DSEditField>
    </DSEditForm>
  </DSFormGroup>
</DSGroupedEditDrawer>
```

模板宽度、高度、列数和核心间距由场景组件锁定。调用方传入 `width`、`height` 或 `size` 不会覆盖规范。

机器可读单一来源：

`packages/design-system/specs/edit-overlay-templates.json`

修改数值后运行：

```bash
npm run generate:edit-overlay-spec
npm run test:edit-overlays:update
```
