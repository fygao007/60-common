# 从这里开始（Windows / 无历史记忆）

这是一套「UI 页面生成流水线」技能包 + 配套模板工程。你不需要了解它的来历，按下面顺序走一遍就能出图。

---

## 1. 这是什么

两个东西在配合：

| 目录 | 作用 |
|---|---|
| `expert-hermass/` | **技能包**：规定 AI 怎么选模板、怎么装配页面、怎么验收（Markdown 指令 + 4 个检查脚本） |
| `../ui-demo/` | **模板工程**：设计系统组件、场景页模板、页面装配脚本、校验脚本（React + esbuild） |

技能包本身不含页面模板，它靠 `../ui-demo/` 干活。两者必须放在同一个 `60/` 目录下（现在的结构就是对的）：

```
common/
└── 60/
    ├── expert-hermass/     <- 技能包（本文件所在）
    ├── ui-demo/            <- 模板工程（必需）
    ├── ontology/           <- 字段单源（可选但建议保留）
    └── docs/               <- 规范文档（可选）
```

---

## 2. 三步跑通

### 第 0 步：装 Node.js

需要 **Node 18 或更高**。装完在终端（PowerShell 或 CMD）里确认：

```powershell
node -v
```

`v18` 以上就行。没有就装：https://nodejs.org/ （选 LTS 版）。

> 建议用 **PowerShell** 或 Windows Terminal 执行下面所有命令。如果看到中文变成乱码，先执行 `chcp 65001` 切到 UTF-8，或直接用 Windows Terminal（默认 UTF-8）。

### 第 1 步：装依赖

```powershell
cd common\60\ui-demo
npm ci
```

> **如果是从别人电脑拷过来的**：先删掉 `ui-demo\node_modules` 整个目录再执行 `npm ci`。
> 原因：里面 `esbuild` 是原系统的二进制，在 Windows 上跑不起来。自检脚本会提示这一点。

网络慢可以换国内源：`npm ci --registry=https://registry.npmmirror.com`

### 第 2 步：环境自检

```powershell
cd common\60\expert-hermass
node scripts\doctor.mjs
```

全部 `[OK]` 才算准备好。有 `[MISS]` 就按提示逐条修，它会告诉你缺什么、在哪、怎么补。

常见提示与处理：

| 提示 | 处理 |
|---|---|
| `没找到合格的模板工程` | 确认 `ui-demo` 与 `expert-hermass` 在同一个 `60\` 下；或用 `--ui-demo D:\路径\ui-demo` 指定 |
| `node_modules 不存在` | 回第 1 步 |
| `缺本机平台的 esbuild 二进制` | 删 `node_modules` 重装 |
| `没找到 Chrome / Edge` | 装 Chrome，或设环境变量 `CHROME_PATH` |
| `playwright-core 未安装` | 回第 1 步（它是 devDependency，`npm ci` 会装） |

指定浏览器（可选）：

```powershell
$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
```

### 第 3 步：起个预览服务，看模板长什么样

```powershell
cd common\60\expert-hermass
node scripts\serve.mjs ..\ui-demo 8765
```

终端会打印真实地址（8765 被占会自动换成 8766、8767…）。浏览器打开：

```
http://127.0.0.1:8765/scenarios/scenario-templates-index.html
```

这是模板总览，先看清有哪些页面形态，再决定要生成什么。

---

## 3. 怎么让 AI 用这套技能

### 方式 A：装进 WorkBuddy / CodeBuddy（有对应宿主时）

把 `expert-hermass` 整个目录作为专家包导入（含 `.codebuddy-plugin/plugin.json`），然后在专家中心选 Hermass。

### 方式 B：直接喂给任意 AI（Claude Code / Cursor / ChatGPT 都行）

按这个顺序把文件内容贴进去，或让 AI 自己读：

1. `expert-hermass/agents/hermass.md` —— 主流程（五步）
2. 然后告诉它："按 hermass.md 的流程做，`<专家包>` 就是 `common\60\expert-hermass`，`${UI_DEMO_ROOT}` 是 `common\60\ui-demo`"
3. AI 到对应步骤会自己读 `skills/` 下的 5 个 SKILL.md

一句话开场示例：

> 按 expert-hermass/agents/hermass.md 的五步流程，帮我生成一个「补贴发放明细」列表页。
> 专家包在 `D:\share\common\60\expert-hermass`，模板工程在 `D:\share\common\60\ui-demo`。

---

## 4. 包内 4 个脚本（已适配 Windows，不用改）

这些脚本替代了 macOS 上常用的 `grep` / `python3 -m http.server` / 手写 playwright，Windows 直接能跑。

| 命令 | 作用 | 什么时候用 |
|---|---|---|
| `node scripts\doctor.mjs` | 环境自检 | 每次开工前 |
| `node scripts\check-page.mjs <页面或目录> --static` | 页面静态检查（禁用项、背景色、尺寸、**本地资源 404**） | 写完页面后 |
| `node scripts\serve.mjs <目录> [端口]` | 静态预览服务 | 要打开页面时 |
| `node scripts\shot.mjs <页面或URL> --out a.png` | 截图 + 骨架实测（内边距/表头/行高/背景） | 验收出图时 |

三个检查脚本用退出码表示结论：`0` 通过，非 `0` 有问题。

出图示例：

```powershell
node scripts\shot.mjs ..\ui-demo\demos\xxx\index.html --out out\xxx.png
```

它会打印：

```
骨架实测：
  ok 内容左右内边距：12px
  ok 表头高：40px
  ok 数据行高：46px
  ok body 背景：rgb(255, 255, 255)
  .. 表格数据行数：31
```

这四项 + 无控制台报错，就是"没走样"的硬指标。

---

## 5. 这套东西的几个硬规矩（AI 必须遵守，你也用来判它做没做对）

1. **用模板，别重画**。整份复制 `ui-demo/scenarios/` 下的场景页，只改字段/文案/数据。手写筛选区、表格、分页 = 不合格。
2. **页面里不写尺寸**。内边距 12、表头 40、数据行 46 已经写在 `ui-demo/packages/design-system/src/tokens.css`，模板自动继承。页面再写一遍属于重复声明，要删。
3. **静态页禁用两样东西**：`<ds-*>` 自定义标签、`type="module"`。`file://` 直开时它们不会生效，表格会一片空白。
4. **页面背景必须 `#fff`**，不能用灰底 `#f0f2f5` 或 `--ds-color-bg-page`。
5. **验收看实测值，不看源码**。用 `shot.mjs` 打印的计算样式说话。

---

## 6. 出问题先看这里

| 现象 | 原因 | 处理 |
|---|---|---|
| 表格一片空白 | 用了 `<ds-data-table>` 或 `type="module"`，`file://` 下没注册 | 改用普通 `<table>` + `.ds-*` 类名；`check-page.mjs --static` 会拦 |
| 页面样式全崩、字体不对 | CSS 相对路径没跟着改（模板里是 `../packages/...`） | 按新位置重算相对层级 |
| 行高和设计稿差 2px | 引了另一份 tokens 拷贝 | `check-page.mjs` 会比对源码版与拷贝版是否一致 |
| `npm ci` 报 esbuild 平台错误 | `node_modules` 是别的系统留下的 | 删 `node_modules` 重装 |
| 端口打不开 | 8765 被占 | 用 `serve.mjs`，它自己顺延并打印真实端口 |
| 中文路径报错 | 命令里没加引号 | 路径整体用双引号包起来 |

---

## 7. 目录速查

```
expert-hermass/
├── START-HERE.md              <- 本文件
├── agents/hermass.md          <- 主流程：五步流水线
├── skills/
│   ├── requirement-clarify/   <- Step 1 需求澄清
│   ├── field-ontology/        <- Step 1 字段回溯
│   ├── template-and-component/<- Step 2-3 选模板、认组件
│   ├── build-chain/           <- Step 4 装配与构建
│   └── design-qa-loop/        <- Step 5 验收与出图
├── scripts/                   <- 4 个跨平台检查脚本
└── .codebuddy-plugin/         <- 专家包清单（装宿主用）
```

配套的 `ui-demo/`：

```
ui-demo/
├── scenarios/                 <- 场景页模板（从这里选）
├── packages/design-system/    <- 设计系统组件与 tokens
├── templates/                 <- React 业务页模板
├── specs/                     <- 模板索引（page-template-catalog.json）
├── scripts/                   <- 装配器与校验（assemble-standard-list.mjs 等）
└── ontology/                  <- 字段单源
```
