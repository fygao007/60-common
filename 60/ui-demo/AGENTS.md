# 产品字段默认规则

在本工程设计或实现产品页面、表单、列表、接口、事件、导入导出和 Mock 数据时，`ontology/` 是所有字段定义的唯一可编辑来源：

1. **所有表字段必须先进入 ontology，再由其他模块通过 `fieldRef` 调用。** 页面、接口、Mock、菜单和业务包不得各自创建字段定义副本。
2. 涉及人员基本信息，必须先查询 `ontology/basic-information/basic-information-fields.json` 或使用 `@wisedu/hr-domain/basic-information`。
3. 找到语义相同字段时，必须通过 `fieldRef: "StaffBasicInformation.<code>"` 引用，不得重新定义中文同义字段、类型或下拉字典。
4. 业务只增加必填、只读、显隐、提示语等产品约束时，使用 `defineProductField`；不得覆盖标准数据类型、数据分级、字典和语义目标。
5. 标准库不存在时，将字段登记到 `ontology/basic-information/business-field-extensions.json`：优先 `business-extension`，确属新语义才用 `business-specific`。
6. 新增或修改业务字段后运行：
   - `npm run sync:field-ontology`
   - `npm run validate:field-ontology`
   - `node scripts/sync-basic-info-package-data.mjs`
   - `node scripts/validate-basic-info-ontology.mjs`
   - `node --test packages/hr-domain/test/basic-information.test.mjs`

字段检索：`node scripts/find-standard-field.mjs <字段名称或编码>`。

详细说明：`docs/product-field-usage.md`。

通用实体字段使用 `Entity.field`，基础信息字段使用 `StaffBasicInformation.code`。列表列通过 `@wisedu/hr-domain/fields` 的 `defineTableColumns()` 生成，表单字段通过 `defineOntologyFields()` 生成。模块只能增加展示约束，不得重定义字段类型、标签、字典、分级、引用目标或语义。完整规则见 `ontology/FIELD_ONTOLOGY.md`。

## 页面生成硬约束（适用于所有模型和人工开发）

新增或修改 `demos/` 页面时，必须按以下顺序执行，不得跳过：

1. **先选模板**：读取 `specs/page-template-catalog.json`，根据页面意图选择最接近的模板；禁止从空白文件开始手写通用页面。
2. **再查组件**：读取 `packages/design-system/src/index.js`，按钮、输入、选择、表格、分页、标签、卡片、弹窗、抽屉、空状态等必须从 `@wisedu/design-system` 导入。
3. **最后写业务差异**：业务 JSX 只组合组件，业务 CSS 只写页面布局和专属可视化。

框架页面必须直接复用所选模板提供的根容器；框架运行时不得再包裹或生成第二个根容器，页面也不得添加仅用于包裹内容的额外根层。

### 详情、新增与编辑承载规则

- 详情、新增或编辑涉及的字段少于 `12` 条时，使用弹窗承载。
- 字段数量达到 `12` 条或业务信息量较多、需要连续浏览时，使用独立详情页承载。
- 尽量不用抽屉；除非存在明确的上下文保留需求且弹窗与详情页均不适用，否则不得将抽屉作为默认方案。

强制禁止：

- 在 JSX 中手写 `button`、`input`、`select`、`textarea`、`table`。
- 复制 `.ds-*` 组件内部 DOM，或覆盖 `.ds-*`、`.frame2-*` 样式。
- 导入其他 Demo 的 CSS、JS、Mock 数据或页面组件。
- 在页面中复制菜单配置，或硬编码其他页面的相对跳转地址。
- 把页面专属实现放进公共 `shared/` 目录以规避独立性检查。
- 修改锁定的旧静态页面；需要改动时先迁移到 React 业务页模板。

### 无框架根容器列表模板视觉强约束

适用于只交付根容器内部内容、未要求框架壳（一级导航、侧栏、页签条、面包屑）的标准列表模板，例如 `scenarios/szd-standard-list-page.html`：

1. 页面不得渲染或挂载框架壳；只输出根容器内的筛选区、工具栏、表格和分页。
2. 根容器高度随视口自适应（最小高度 `100vh`，内容超过时自然延展）；根容器内所有内容距四边均为 `12px`。
3. 必须使用 `DSRegularListTemplate`，并传入 `inset={12}`、`contentGap={12}`、`toolbarGap={8}`；不得在业务 CSS 中覆盖 `.ds-*` 选择器实现这些间距。
4. 筛选区与工具栏间距为 `12px`，工具栏按钮间距为 `8px`。
5. 表格必须由 `DSDataTable` 渲染，使用 `lowcode` 与 `bordered` 变体（渲染类为 `ds-data-table ds-card ds-data-table--lowcode ds-data-table--bordered`），并在模板弹性内容区内自适应高度。
6. 分页必须使用模板 footer，由弹性布局贴齐根容器底部；禁止使用绝对定位或固定定位伪造底部分页。

完整组件参数、布局实现与生成验收清单见 `packages/design-system/docs/regular-list-page.md` 的“无框架根容器表格页（强制规范）”；后续生成此类页面必须逐项遵守。

每个 Demo 的实现只允许依赖：框架2、`@wisedu/design-system`、正式领域包，以及当前页面目录内的文件。菜单和业务页面按以下规则解耦：

- 菜单定义统一放在 `demos/<产品>/menus/`，每组菜单使用唯一 ID 注册到 `WiseMenuRegistry`。
- 页面只声明“菜单 ID + 当前功能 key”，不得拥有菜单结构副本。
- 页面间允许互相跳转，但必须使用 `WiseMenuRegistry.route('菜单ID:功能key')` 或 `link()` 获取地址。
- 菜单模块只能保存导航元数据和路由，不得导入页面代码、样式或 Mock 数据。

完成后必须运行：

```bash
npm run validate:business-pages
npm run validate
```

任一校验失败都不能交付。

## 产品世界与需求文档约束

新增业务 Demo 前必须先在 `ontology/product-world/scenarios/` 建立场景模型，记录调研来源、角色、目标、流程、规则、验收标准，以及页面使用的模板、组件、菜单和字段引用。Demo 与需求文档必须从同一场景模型生成或装配，不允许维护互相矛盾的两套业务定义。

- 未确认内容写入 `research.openQuestions`，不得当作确定需求。
- 场景字段必须是已登记的 `fieldRef`。
- 场景模板必须来自 `specs/page-template-catalog.json`。
- 场景组件必须来自 `@wisedu/design-system` 公共出口。
- 删除废弃代码时直接删除，不以注释、禁用分支或重命名文件的方式保留。

运行 `npm run validate:product-world` 校验世界模型，运行 `npm run generate:requirement -- <场景JSON>` 生成需求文档。  
生成页面前必须运行 `npm run generate:demo-context -- <场景JSON>`，模型只根据生成的上下文、指定模板和组件实现 Demo，不得自行发明字段或业务规则。

## 公共页面与个性化页面约束

生成或修改页面前必须读取 `specs/page-compositions.json`，页面只能选择一种模式：

- `shared`：直接使用 `@wisedu/shared-pages` 公共页面，公共修改统一生效。
- `custom`：页面完全独立，禁止导入公共页面包，公共修改不得影响它。
- `hybrid`：使用公共页面主体，只能通过公共页面已登记的扩展点加入个性内容。

公共页面只能放在 `packages/shared-pages/`，不能放进设计系统或业务 Demo。混合页面禁止覆盖公共页面内部 CSS、复制内部 DOM、访问内部状态或新增未登记插槽。页面类型、公共页面引用和扩展点必须登记到 `specs/page-compositions.json`，并运行 `npm run validate:page-compositions`。

## 招聘管理 Demo 专项约束

招聘管理页面除遵守本文件全部通用规则外，还须遵守以下规则。

### 框架页签规则

- 框架2页签栏的第一个页签必须永远是固定“首页”页签。
- 首页页签必须指向系统首页地址，且不可关闭。
- 当前业务页签必须显示当前功能或菜单名称，例如“岗位管理”“招聘计划”“面试安排”。
- 当前业务页签必须可关闭。
- 禁止用“系统管理”“工作台”等总称替代当前功能页签。

### 标签样式规范

- 列表、详情摘要和流程节点中的状态、结果类标签，统一使用设计系统组件 `DSTag`（`@wisedu/design-system`）；禁止页面自写标签样式或复制 `.ds-tag` 内部 DOM。
- 标签视觉标准：浅色底、彩色文字、`4px` 圆角、无边框、高度 `24px`。标准样式由 `packages/design-system/src/Tag/index.css` 中的 `ds-process-tag--filled` 维护。
- 六色语义（文字决定颜色，颜色不得代替文字含义）：
  - 灰（neutral）：未开始、未提交、草稿、未算分等未进入流程的状态。
  - 蓝（primary）：审核中、进行中、待审核、待确认等正在处理的状态。
  - 绿（success）：已通过、已发布、已提交、符合、合格等已完成或已生效的状态。
  - 橙（warning）：退回、递补、补交、新增等需要关注或补救的状态。
  - 红（danger）：不通过、不符合、不录用、不合格等否决性结果。
  - 青（teal）：已完成、办结等终态完结。
- 业务文字到颜色的映射在页面内实现（如 `pillTone()`），并通过 `DSTag` 的 `tone` 属性传入（支持 `gray`、`orange`、`red`、`green`、`teal`、`blue` 别名）；新增状态先归入上述六色语义，不得发明第七种颜色。
