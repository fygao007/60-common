import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const input = process.argv[2]
if (!input) throw new Error('请提供产品世界模型 JSON 路径')
const source = path.resolve(root, input)
const model = JSON.parse(fs.readFileSync(source))
const output = path.resolve(root, model.artifacts?.requirementDoc || `docs/generated/${model.id}.md`)
const list = (items = []) => items.length ? items.map((item, index) => `${index + 1}. ${item}`).join('\n') : '无'
const actors = (model.research.actors || []).map((item) => `- ${item.name}（${item.id}）`).join('\n')
const fields = (model.page.fieldRefs || []).map((item) => `- \`${item}\``).join('\n')
const components = (model.page.components || []).map((item) => `- \`${item}\``).join('\n')
const document = `# ${model.page.title}需求说明\n\n> 场景：\`${model.id}\`　版本：\`${model.version}\`　由产品世界模型生成，请勿手工维护重复副本。\n\n## 目标\n\n${list(model.research.goals)}\n\n## 用户角色\n\n${actors}\n\n## 当前痛点\n\n${list(model.research.painPoints)}\n\n## 场景流程\n\n### 前置条件\n\n${list(model.scenario.preconditions)}\n\n### 主流程\n\n${list(model.scenario.mainFlow)}\n\n### 异常流程\n\n${list(model.scenario.exceptions)}\n\n## 页面装配\n\n- 模板：\`${model.page.templateId}\`\n- 菜单：\`${model.page.menuRef}\`\n- Demo：\`${model.page.demoPath}\`\n\n### 字段\n\n${fields}\n\n### 组件\n\n${components}\n\n## 业务规则\n\n${list(model.requirements.rules)}\n\n## 验收标准\n\n${list(model.requirements.acceptanceCriteria)}\n\n## 待确认问题\n\n${list(model.research.openQuestions)}\n`
fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, document)
console.log(path.relative(root, output))
