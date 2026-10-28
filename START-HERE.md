# 收件人先读这里

这是「UI 页面生成流水线」的完整工作集：技能包 + 模板工程。**不需要懂它的来历**，按下面走。

## 三步开始

```powershell
# 1. 装依赖（Node 18+；从别的系统拷过来的话，先删掉 ui-demo\node_modules）
cd 60\ui-demo
npm ci

# 2. 环境自检
cd ..\expert-hermass
node scripts\doctor.mjs

# 3. 起预览看模板
node scripts\serve.mjs ..\ui-demo 8765
```

然后浏览器打开 `http://127.0.0.1:8765/scenarios/scenario-templates-index.html`。

详细说明（目录结构、脚本用法、硬规矩、排错表）在：

**`60/expert-hermass/START-HERE.md`**

## 目录说明

| 目录 | 是否必需 | 内容 |
|---|---|---|
| `60/expert-hermass/` | 必需 | 技能包：五步流程 + 4 个跨平台检查脚本 |
| `60/ui-demo/` | 必需 | 模板工程：场景页模板、设计系统组件、装配与校验脚本 |
| `60/ontology/` | 建议保留 | 字段单源（字段名、类型、口径） |
| `60/docs/` | 建议保留 | 页面生成规范、骨架尺寸核对清单 |
| `hermass-share/` | **可删** | 旧打包产物（含一个 60MB 的 zip），本次工作不需要 |
| `.DS_Store` | 可删 | macOS 文件夹元数据，Windows 上无用 |

## 一句话说明这套东西在干什么

用现成的页面模板拼业务页面，不允许手画。AI 负责选模板、填字段、装配、跑检查；人只看截图和实测值。

判断做得好不好，看三件事：

1. 结构和模板一致（不是"看着像"）
2. 页面里没重写尺寸（内边距 12 / 表头 40 / 数据行 46 由 tokens 统一给）
3. 静态页里没有 `<ds-*>` 和 `type="module"`（否则 `file://` 打开是空白）

验收命令：

```powershell
node scripts\check-page.mjs <页面目录> --static
node scripts\shot.mjs <页面路径> --out out\页面.png
```
