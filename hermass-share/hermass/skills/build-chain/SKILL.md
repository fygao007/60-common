---
name: build-chain
description: 构建与 cache-bust 全链路。Hermass Step 4 使用：esbuild 单页打包 → bundle 版本递增 → HTML 引用更新 + cache-bust，含 page-dir 模式、全库重建与"改了没生效"排查。
---

# 构建链（Step 4：缺一不可）

> 工作目录（以下命令均在该目录执行）：`${UI_DEMO_ROOT}`

## 标准链路

选定模板后先读取生成上下文中的固定入口，原样装配同目录业务配置。构建完成即用浏览器渲染截图，不插入重新设计、配色调整或布局优化步骤。需要交互状态时放入配置模块的 hook，保持入口不变。

standard-list-root 使用 `node "${UI_DEMO_ROOT}/scripts/assemble-standard-list.mjs" <demo-context.json>` 自动装配，配置完成后执行同命令加 `--check`。不要修改自动生成的 HTML、CSS、入口或追加版本文件；该模式使用标准 bundle 文件名，浏览器关闭缓存或重新加载验证。

```
修改源码 → 打包 bundle → 复制/输出为新版本号（v3、v4… 递增）→ HTML 引用同步更新 + ?v=YYYYMMDD-tag cache-bust
```

任何一步省略都会出现"源码改了但页面没变"。

## 单页打包（${UI_DEMO_ROOT}/scripts/build-recruit-page.mjs）

```bash
# 标准输出到 ${UI_DEMO_ROOT}/assets/bundles/pages/<page>.bundle.{js,css}
node "${UI_DEMO_ROOT}/scripts/build-recruit-page.mjs" <page>

# 带版本号（迭代页）：生成 <page>.<versionSuffix>.bundle.{js,css}
node "${UI_DEMO_ROOT}/scripts/build-recruit-page.mjs" <page> <versionSuffix>

# 页面目录模式（HTML 引用同级 ./<page>.bundle.{js,css}，如 recruit-type、plan-apply）
node "${UI_DEMO_ROOT}/scripts/build-recruit-page.mjs" <page> --page-dir
```

- 脚本 ROOT 由自身位置推导，入口在 `${UI_DEMO_ROOT}/demos/recruitment/hr/**` 下递归查找，嵌套目录页面可直接用，不必手写 esbuild。
- stdout 会打印 `entry: ...` 与 `bundle built: ...`；**先确认入口路径正确**再升级 HTML 的 `?v=`。
- esbuild alias 必须含 `@wisedu/design-system`、`@wisedu/hr-domain`、`@wisedu/hr-domain/resume-fields`，分别解析到 `${UI_DEMO_ROOT}/packages/design-system/src/index.js`、`${UI_DEMO_ROOT}/packages/hr-domain/src/index.js`、`${UI_DEMO_ROOT}/packages/hr-domain/src/resume-fields.js`；loader 覆盖 css/svg/png/jpg/gif/webp/woff/woff2/ttf。

## 全库重建

```bash
cd "$UI_DEMO_ROOT" && npm run build:previews
```

- 扫描 `${UI_DEMO_ROOT}/demos/**` 与 `${UI_DEMO_ROOT}/charts/**` 下的 `*.page.jsx`。
- 构建后会把 HTML 里 `xxx.vNN.bundle.js` 这类历史版本号引用**自动同步**为最新产物（`versionedBundlePattern` 逻辑）。
- ⚠️ "只跑单页脚本 + 没 bump `?v=`"时页面看着没变，多半是这一层没走到。

## cache-bust 规则

- 格式：`?v=YYYYMMDD-<change-tag>`，用编辑工具改 HTML，不用 sed（`?` 在 zsh 下触发 glob 报错）。
- 用了版本号后缀时，HTML 的 bundle **文件名**也要同步更新。

## 改动前的必修课

- 修改前先 Grep 目标 HTML 确认 bundle 引用路径（`${UI_DEMO_ROOT}/assets/bundles/pages/` 还是页面同级 `./`），再决定脚本参数。
- 验证 bundle 是否真的更新：bundle 默认 `charset: ascii`，中文被转成 `\uXXXX`，`grep 中文` 查不到 → 先用 node 解码再 `includes`。

## 死代码同步清理

删除的常量/字段/文件直接删净，不以注释、禁用分支或重命名文件保留；顺带删掉因此不再使用的 import。跨页共用模块每次改动，**所有引用它的页面 bundle 都要重建、所有 `?v=` 都要 bump**，回归两边都跑。
