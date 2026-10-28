# Hermass

五步流水线做页面 demo 的 UI Demo 流水线工程师：需求梳理 → 结构搭建 → 模板匹配 → 组装预览 → 循环检查，交付符合设计规范的页面。

> **第一次接触这套东西（尤其是拿到别人拷来的整个目录、Windows 环境）**：先读 [`START-HERE.md`](START-HERE.md)，它有三步跑通、平台差异和排错表。

## 安装位置与模板工程

Hermass 是独立安装的 Agent 插件。模板工程支持两种摆放，Agent 会按顺序自己找，不需要你改配置：

1. **同级**：`expert-hermass/` 与 `ui-demo/` 在同一个父目录下（当前 `common/60/` 就是这种）
2. **随包**：模板工程放在插件内部的 `resources/ui-demo/`

合格判据是同一目录下有 `package.json`、`scenarios/`、`specs/page-template-catalog.json`、`packages/design-system/src/index.js`。两处都找不到时，用 `--ui-demo <路径>` 显式指定。

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

### 1. 放到磁盘（路径任意，不要放在 C 盘受保护目录）

保持 `expert-hermass/` 与 `ui-demo/` 的相对位置不变即可。别把 `ui-demo` 单独挪走，Agent 按"同级"规则找它。

### 2. 装本机依赖（必须重装，不要拷 node_modules）

在 `ui-demo/` 下执行 `npm ci`。`node_modules` 里的 esbuild 是平台相关的二进制，从 macOS 拷到 Windows 一定跑不起来；自检脚本会告警。

### 3. 环境自检

```bash
node expert-hermass/scripts/doctor.mjs
```

全绿再开工。它会检查 node 版本、模板工程定位、依赖、tokens 三值、浏览器、端口，并直接给出修复命令。

### 4. 装进宿主（可选）

把 `expert-hermass/` 作为专家包导入 WorkBuddy / CodeBuddy。没有宿主也可以直接用：把 `agents/hermass.md` 交给任意 AI，告诉它专家包和 `UI_DEMO_ROOT` 的实际路径，按五步流程走。

### Windows 专属提示

- 浏览器：`$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"`（脚本也能自动探测 Chrome/Edge）
- 预览服务用 `node scripts/serve.mjs <目录>`，不要用 `python3 -m http.server`
- 检查用 `node scripts/check-page.mjs`，不要依赖 `grep` / `sed` / `diff`
- 含中文或空格的路径，命令里整体加双引号
- 命令示例中的 `${UI_DEMO_ROOT}` 是运行时定位出的工程路径，不是固定安装路径

## 打包分享

发之前一定要排除两样：`node_modules/`（体积大且平台相关）和 `.DS_Store`（macOS 垃圾文件）。

macOS / Linux：

```bash
zip -ry hermass.zip . -x '*/node_modules/*' '*/.DS_Store'
```

Windows（PowerShell，用 7-Zip 或资源管理器压缩时手动排除 `node_modules`）：

```powershell
Compress-Archive -Path (Get-ChildItem -Exclude node_modules) -DestinationPath hermass.zip
```

接收方解压后，按上文第 2 步在 `ui-demo/` 重新 `npm ci`，再跑 `doctor.mjs` 自检。
