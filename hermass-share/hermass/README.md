# Hermass

五步流水线做页面 demo 的 UI Demo 流水线工程师：需求梳理 → 结构搭建 → 模板匹配 → 组装预览 → 循环检查，交付符合设计规范的页面。

## 安装位置与模板工程

Hermass 是独立安装的 Agent 插件；分享版将模板工程放在插件内部的 `resources/ui-demo/`，包含场景模板、组件、脚本和 ontology。Agent 优先使用随包资源；未带资源的开发版才从接收方的工作区定位 UI Demo 工程。

## 类型

Agent 型（单个 AI 专家）

## 功能

面向深职大智能人事平台（智慧人事一体化服务系统 2026）的 UI Demo 生成与迭代：

- **需求梳理**：一句话/截图需求 → 结构化需求卡，字段回溯 ontology 单源
- **结构与模板匹配**：生成 Demo 时优先从 `${UI_DEMO_ROOT}/scenarios/` 现有页面选择结构模板，再按 `page-template-catalog` 映射组件与装配约束；组件只从 `@wisedu/design-system` 导入
- **组装可运行 demo**：esbuild 单页打包 → bundle 版本递增 → cache-bust，使用实际启动的预览地址
- **自动循环检查**：npm 静态校验 + Playwright 截图对照设计规范清单，不合格自动回改重建

内置 5 个 Skill（`skills/`）：`requirement-clarify` / `field-ontology` / `template-and-component` / `build-chain` / `design-qa-loop`。

## 使用示例

直接说：使用 Hermass，按 `${UI_DEMO_ROOT}/scenarios/szd-standard-list-page.html` 模板生成人员列表，字段为姓名、工号、出生日期；模板视觉保持原样，填好业务配置后直接截图出图。

也可让 Hermass 根据需求优先从 `${UI_DEMO_ROOT}/scenarios/` 的现有场景页选择模板，并在需求卡中记录页面路径、对应组件模板和选择理由。选定后只填写字段、文案、数据和已确认操作，布局、间距和配色保持模板原样。无法容纳的需求会报告缺口，不自行重画。截图来自实际页面渲染，交付截图与页面地址。

标准列表已接入 `${UI_DEMO_ROOT}/scripts/assemble-standard-list.mjs` 固定装配器：程序生成入口、HTML 和 CSS，智能体只编辑业务配置，然后用 `--check` 检查骨架。其他模板尚未接入该装配器，不保证同等自动锁定能力。生成无需常驻后台；预览按页面需要复用本地服务或直接打开 HTML。

- 按五步流水线帮我生成一个新页面demo，需求是：\____
- 对 ui-demo 的指定页面截图，按设计规范自动检查并修复
- 梳理这个需求，推荐页面模板和参考页面

## 头像

头像已自动生成在 `avatars/` 目录下。如需替换为自定义头像，要求：

- 格式：PNG（推荐）或 JPG
- 尺寸：512×512 px
- 大小：单张不超过 500KB

## 安装

### 1. 安装 Agent

把分享版的 `hermass/` 导入 WorkBuddy 的专家插件目录；该目录可以在任意位置。保持 `agents/`、`skills/` 和 `resources/ui-demo/` 在同一个插件目录内。

### 2. 提供 UI Demo 工程

分享版内置模板工程，路径由 Agent 自己从 `resources/ui-demo/` 定位；无需接收方另建同级目录。若使用未带 `resources/` 的开发版，Hermass 才需要用户提供外部 UI Demo 工程。

Windows 上需安装 Node.js 与 npm，在插件内的 `resources/ui-demo/` 运行 `npm ci`，由 Windows 安装本机依赖；不要复制 macOS 的 `node_modules`。截图校验脚本还需找到 Chrome，在 PowerShell 中把 `$env:CHROME_PATH` 设置为本机 `chrome.exe` 的完整路径。命令示例中的 `${UI_DEMO_ROOT}` 是 Hermass 本次定位出的工程路径，不是固定安装路径。

## 打包分享

分享版将插件和 `resources/ui-demo/` 放在同一个 `hermass/` 目录内，并排除 macOS 的 `node_modules/`。macOS/Linux 可在插件目录的上一级执行：

```bash
zip -ry hermass.zip hermass -x '*/node_modules/*' '*/.DS_Store'
```

Windows 接收方可用资源管理器解压 ZIP。导入 Agent 后，按上文在随包的 `resources/ui-demo/` 安装 Windows 依赖，再开始生成或预览页面。
