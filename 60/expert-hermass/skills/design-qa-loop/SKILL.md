---
name: design-qa-loop
description: Hermass 出图验收：校验业务装配并对照已选模板截图，仅修复渲染和交互错误，保持模板视觉原样。
---

# 模板出图验收（Step 5）

## 包内检查脚本（跨平台，替代 grep / python / 手写 playwright）

本技能包自带 4 个脚本，**不要**再手写 `grep`、`diff`、`python3 -m http.server` 或临时 playwright 脚本——Windows 上没有这些命令，同一套命令也跑不出同样结果。

| 脚本 | 用途 | 用法 |
|---|---|---|
| `<专家包>/scripts/doctor.mjs` | 环境自检：node、模板工程、依赖、tokens 三值、浏览器、端口 | `node scripts/doctor.mjs [--ui-demo <路径>]` |
| `<专家包>/scripts/check-page.mjs` | 页面静态检查：禁用项、背景色、尺寸覆盖、**本地资源 404** | `node scripts/check-page.mjs <页面或目录> [--static] [--shell <外壳index.html>]` |
| `<专家包>/scripts/serve.mjs` | 静态预览服务，端口占用自动顺延，中文路径与 MIME 已处理 | `node scripts/serve.mjs <目录> [端口]` |
| `<专家包>/scripts/shot.mjs` | 出图 + 骨架实测（内边距/th/td/背景）+ 控制台与 4xx 收集 | `node scripts/shot.mjs <页面或URL> [--out x.png] [--width 1440] [--full]` |

三个脚本都用退出码表达结论：`0` 通过，非 `0` 未通过。先跑 `doctor.mjs`，它不过就不要往下走。

## 静态校验

在 UI Demo 目录 `${UI_DEMO_ROOT}` 下执行：

```bash
npm run validate:business-pages
npm run validate
npm run validate:page-compositions
npm run validate:product-world
```

字段改动追加字段本体校验。不得沿用旧日期的校验状态或用刷新基线绕过错误；全库失败时准确报告，不宣称完整验收通过。

对于 standard-list-root，追加：
```bash
node --test "${UI_DEMO_ROOT}/packages/design-system/test/standard-list-contract.test.mjs"
```

## 原样渲染并截图

1. 打开构建后的实际页面。静态页可直接用 `file://`；需要 http 时用 `serve.mjs` 启动，**不要**假定固定端口可用——脚本会在占用时顺延并打印真实地址。
2. 用 `shot.mjs` 截图，默认 1440×900；用户指定尺寸时传 `--width/--height`。它会等页面与字体加载，并收集控制台异常与 4xx。
3. 对照所选模板，检查组件顺序、框架壳有无、间距、行高、颜色和变体是否保持模板原样；列宽执行模板规则，业务字段通过 fieldRef 引用。
4. 检查查询、重置、分页及已确认的操作能否运行。只修配置装配错误、构建缓存问题、渲染故障和交互错误。
5. 截图并提供页面地址。禁止自行更换主题色、标签样式、阴影或其他视觉细节；禁止用生成图片替代实际页面截图。
6. 若问题来自模板本身，报告模板问题；本次生成不得顺手修改模板。用户明确要求修改模板后才进入模板修改任务。

## 验收边界

选定模板是视觉依据，不套用另一套统一美化清单。截图检查发现与模板不同，应恢复模板；检查发现模板本身与需求冲突，应报告缺口，不自由重排页面。

standard-list-root 的固定入口、布局参数、配置白名单和最小列宽有代码校验。其他模板只有已实现的校验，交付时不得声称所有模板都被自动锁定。

## 静态工程输出检查（目标工程不能运行 ES module 时必做）

输出目录为纯静态站（`file://` 直开、无构建步骤）时，`validate:*` 系列不覆盖这些页面，改用 `check-page.mjs`；任一项不通过即未通过验收：

```bash
node "<专家包>/scripts/check-page.mjs" <页面目录> --static --shell <工程外壳index.html>
```

脚本会替你查这些（原先是 grep，Windows 上没有 grep）：

- `<ds-*>` Web Component 计数 → 必须为 0（`file://` 下不会注册）
- `type="module"` 计数 → 必须为 0
- body 背景不得用页面灰（`--ds-color-bg-page` / `#f0f2f5`），须 `#fff`
- **页面引用的本地 CSS/JS/图片是否存在**（原先 grep 查不出 404，这里是硬检查）
- 页面是否重复声明骨架尺寸（`--ds-regular-list-inset`、`th`/`td` 写死高度）
- 外壳 `index.html` 里是否登记了该页面的映射（给了 `--shell` 才查）

仍需人工确认的：打开页面看表格有实际行、分页可见、弹层可开合；对照白名单模板比对层级与组件顺序，不得以"配色相似"代替结构复用。

## 骨架尺寸检查（所有页面必做，含 React 工程）

尺寸真源是 `packages/design-system/src/tokens.css`，`check-page.mjs` 会自动核对三个值（`--ds-regular-list-inset` 12 / `--ds-table-header-height` 40 / `--ds-table-row-height` 46），并顺带比对本机若有 `60sysV2/assets/tokens.css` 这类拷贝版是否与源码一致。

**实测值用 `shot.mjs` 取**（不要另写 playwright 脚本）：

```bash
node "<专家包>/scripts/shot.mjs" <页面或URL> --out <输出.png>
```

脚本会打印并在不符时以非 0 退出：

| 项 | 期望 | 脚本取值方式 |
|---|---|---|
| 内容左右内边距 | `12px` | `.ds-regular-list-template__content` 的 `padding-left` |
| 表头高 | `40px` | 首行 `th` 的 `getBoundingClientRect().height` |
| 数据行高 | `46px` | 首行 `td` 高 |
| body 背景 | `#fff` | `backgroundColor` |
| 表格数据行数 | `> 0` | 0 行说明表格没渲染 |

区域间距与"筛选→工具栏 / 工具栏→表格 / 表格→分页"的 12/8/8 若需逐项核，直接看截图相邻区域像素差；出现 10/14/18/24 等自造值即阻断交付，除非该模板小节明确列出。

**跨系统注意**：从 macOS 整包拷到 Windows 时，`node_modules` 里的 esbuild 是 mac 二进制，必须删掉重装（`doctor.mjs` 会告警）。

## 交付

简要说明改动、验证结果，提供可打开的页面地址和实际渲染截图。未通过校验时保留可审阅结果，明确标注未完成验收。
