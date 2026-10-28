# React 业务页模板

> 这是所有模型生成业务页的默认入口。开始编码前，先依据
> `specs/page-template-catalog.json` 完成模板选择；没有明确选择模板时不得生成页面。

新增或修改 `demos/` 业务页面时使用此模板，不再复制历史静态 HTML。

1. HTML 只保留 `.frame2-stage`、`WiseFramework2.mount()` 和同名 bundle。
2. 业务入口命名为 `<page>.page.jsx`，只能从 `@wisedu/design-system` 导入基础组件。
3. 业务 CSS 命名为 `<page>.css`，只负责业务布局，禁止覆盖 `.ds-*` 和 `.frame2-*`。
   首行保留 `@import '../framework/react-page-host.css';`，统一清除页面根级默认边距和滚动。
4. 禁止在业务 JSX 中直接写 `button`、`input`、`select`、`textarea`、`table`。
5. 执行 `npm run validate` 和 `npm run test:business-pages`；旧静态页面一旦修改，校验会要求迁移为此结构。
6. 关键页面应登记到 `specs/business-page-regression.json`，固定框架尺寸、组件数量、响应式布局和主交互。
7. Demo 只能依赖框架、设计系统、正式领域包和自身目录；禁止引用其他 Demo 或业务 `shared/` 文件。
8. 页面文案与 Mock 数据优先放入同目录独立数据文件，确保修改内容时无需改动框架或其他 Demo。

模板文件：

- `standard-list.page.jsx.template`：严格根容器标准列表，对应 `standard-list-root`，也接受原模板地址 `scenarios/szd-standard-list-page.html`。入口保持模板结构，业务配置放入同目录 `<page>.config.js`，导出 `usePageConfig()`，可在其中维护查询、分页、勾选等业务状态。配置只接受 `filterProps`、`toolbarActions`、`tableProps`、`pagination`；不可传入框架壳、页签、额外内容或布局覆盖参数。场景模型先登记该模板，再运行 `generate:demo-context` 获取固定入口。

标准列表的 `tableProps.columns` 必须使用领域包 `defineTableColumns()` 生成并保留 `fieldRef`，筛选字段使用 `defineOntologyFields()`。列展示约束 `displayType` 可选 `text`、`remark`、`datetime`、`date`、`calendar`、`dictionary`、`number`、`switch`、`status`，不是新增本体数据类型；省略时按默认文本计算。模板自动设置最小列宽，显式宽度小于标准或出现未登记配置会报错。分页和数据须显式传入，不自动补充样例数据。该模式暂不含序号列，需要序号时应先登记扩展规则。

该模板的入口一致性由 `validate:business-pages` 检查，配置白名单与宽度由组件运行时检查。上线前仍需验证字段引用、实际交互和视觉效果；模板检查不代替业务场景验收。

- `page.html.template`
- `page.page.jsx.template`
- `page.css.template`

可运行实现参考：

- `demos/teaching-portfolio-teacher.html`
- `demos/teaching-portfolio-teacher.page.jsx`
- `demos/teaching-portfolio-teacher.css`
