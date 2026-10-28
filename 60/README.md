# 智慧人事一体化服务系统（2026）· UI Demo 工具包

面向深职大招聘 / 人事 / 教学业务页面的 UI Demo 生成与迭代资产包。
由「一个 AI 专家 + 一套字段单源 + 一个可运行工作目录」三部分组成。

## 01 包内结构

| 目录 | 大小 | 说明 |
|---|---|---|
| `expert-hermass/` | 484K | **Hermass 专家包**（5 个 Skill + 1 个 Agent 定义）。唯一需要安装的入口 |
| `ontology/` | 5.1M | **字段单源**：90 个业务场景规格、人员基本信息字段、实体字段模型 |
| `ui-demo/` | 191M | **工作目录**：脚本、组件库、页面模板、Demo、已构建的页面产物 |
| `.mastergo/` | 392K | 设计稿导出的图标资源，供 `ui-demo/scenarios/` 下的参考稿使用 |

`ui-demo/` 内部：

| 子目录 | 说明 |
|---|---|
| `scripts/` | 生成、装配、校验脚本 |
| `specs/` | 页面登记表、模板目录、业务页基线 |
| `templates/` | React 业务页模板 |
| `packages/` | `@wisedu/design-system`、`@wisedu/hr-domain`、`@wisedu/shared-pages` **源码**。这三个不是 npm 包，由 `scripts/build-recruit-page.mjs` 里的 esbuild alias 指向 |
| `scenarios/` | 20 个场景模板 + 设计导出参考稿 |
| `demos/` | Demo 页面 |
| `assets/bundles/` | 构建产物（149M），**已随包附带**：解压后即可直接打开 Demo；改完源码用 `npm run build:previews` 重建 |
| `node_modules/` | 依赖。**本包未附带**；只看页面不需要，改代码 / 跑校验前先 `npm install` |

## 02 环境要求

- **只看 Demo 页面：无任何环境要求。** 解压后起一个静态服务即可（见 05）
- **需要改代码 / 跑校验时**：Node.js ≥ 20，并联网执行一次 `npm install`（见 3.3）

## 03 安装

### 3.1 解压并清除隔离属性

```bash
xattr -dr com.apple.quarantine <包根>
```

不清除的话，`ui-demo` 内的 esbuild 会被 Gatekeeper 拦截，构建报 `EACCES` 或 `The service was stopped`。

### 3.2 校验软链

`ui-demo/ontology` 是指向 `../ontology` 的相对软链，7 个脚本按这个路径读取字段单源。
若压缩 / 解压过程丢失了软链：

```bash
cd <包根>/ui-demo && ln -sfn ../ontology ontology
```

### 3.3 依赖

**只看页面可以跳过本节。** `assets/bundles/` 已随包附带，无需构建。

需要改代码、跑 `npm run validate` 或重建产物时，才安装依赖（需要联网）：

```bash
cd <包根>/ui-demo && npm install
```

### 3.4 安装 Hermass 专家

见 `expert-hermass/README.md` 与 `expert-hermass/START-HERE.md`。要点：**不需要固定安装路径**。Skill 与 Agent 用相对关系定位模板工程，按以下顺序自动查找：

1. `expert-hermass/resources/ui-demo/`（随包）
2. `expert-hermass/ui-demo/`
3. `expert-hermass/../ui-demo/`（同级，当前结构就是这种）

所以保持 `expert-hermass/` 与 `ui-demo/` 的相对位置不变即可，整包放哪个盘都行（Windows 上避免放 `C:\Program Files` 这类受保护目录）。两处都找不到时用 `--ui-demo <路径>` 显式指定。

首次使用先跑环境自检：

```bash
node expert-hermass/scripts/doctor.mjs
```

## 04 常用命令

在 `ui-demo/` 下执行：

```bash
npm run build:previews                       # 构建页面 bundle → assets/bundles/pages/
npm run generate:demo-context <场景 json>     # 场景规格 → demo-context
npm run validate                             # 先构建，再跑全部静态校验
```

单项校验：

| 命令 | 校验对象 |
|---|---|
| `npm run validate:field-ontology` | 字段引用是否都能回溯到 ontology 单源 |
| `npm run validate:product-world` | 90 个业务场景的菜单引用是否已注册 |
| `npm run validate:page-compositions` | 28 个页面声明与公共页面契约是否一致 |
| `npm run validate:framework2` | 框架2 页面骨架与样式覆盖 |
| `npm run validate:edit-overlays` | 编辑弹层模板契约 |
| `npm run validate:no-overlay-internals` | 禁止新增弹层内部实现 |
| `npm run validate:business-pages` | 业务页面与 `specs/business-page-baseline.json` 基线的一致性 |
| `npm run validate:links` | 页面内相对链接可达性 |

## 05 本地预览

`assets/bundles/` 已随包附带，直接起静态服务即可。**不要用 `python3 -m http.server`**（Windows 上常常没有 `python3`），用包里自带的跨平台脚本：

```bash
node expert-hermass/scripts/serve.mjs expert-hermass/../ui-demo 8765
```

或用包内任意能起静态服务的工具，只要 MIME 正确、支持中文路径。端口被占用时 `serve.mjs` 会自动顺延并打印真实地址。

浏览器打开 `http://127.0.0.1:8765/demos/...`。
页面引用带 `?v=` cache-buster，改完源码务必 **重建 bundle + 强制刷新**（Windows：`Ctrl+Shift+R`；macOS：`Cmd+Shift+R`）。

## 06 注意事项

1. **`assets/bundles/` 是构建产物，已随包附带。** 打开页面无需任何构建；但改完源码必须 `npm run build:previews` 重建（需先 `npm install`），否则页面仍是旧内容。
2. **`node_modules/` 未附带，也不该附带。** 里面的 esbuild 是平台相关二进制，跨系统拷贝一定跑不起来；在 `ui-demo/` 执行 `npm ci` 由本机重新安装。
3. **`ui-demo/AGENTS.md` 是唯一的页面生成约束文件**（字段默认规则），阅读顺序以它为准。
4. **包内不使用绝对路径。** 模板工程按 `expert-hermass/` 的相对位置自动定位，整包可放在任意目录，迁移时无需替换任何前缀。
5. **`npm run validate` 不会全绿。** `validate:links`、`validate:field-ontology`、`validate:business-pages` 三项在原工程中同样不通过（历史遗留）；本包这三项的失败项均为原工程失败项的子集，未引入新违规。
6. `demos/teaching-portfolio-full/` 只保留了 `menus/`（供 `validate:product-world` 注册菜单），该产品线的页面未随包分发。
