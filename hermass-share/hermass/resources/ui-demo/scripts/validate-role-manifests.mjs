import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const demosRoot = path.join(root, 'demos')
const errors = []
const roleIds = new Map()

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch (error) { errors.push(`${path.relative(root, file)}: JSON 无效（${error.message}）`); return null }
}

for (const entry of fs.readdirSync(demosRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const appFile = path.join(demosRoot, entry.name, 'app.json')
  if (!fs.existsSync(appFile)) continue
  const app = readJson(appFile)
  if (!app) continue
  if (!app.roleContractVersion) continue

  for (const listedRole of app.roles || []) {
    const roleFile = path.resolve(path.dirname(appFile), listedRole.manifest || '')
    if (!listedRole.roleId) errors.push(`${path.relative(root, appFile)}: 角色 ${listedRole.key} 缺少 roleId`)
    if (listedRole.roleId && roleIds.has(listedRole.roleId)) errors.push(`${path.relative(root, appFile)}: roleId ${listedRole.roleId} 重复`)
    else if (listedRole.roleId) roleIds.set(listedRole.roleId, appFile)
    if (!listedRole.manifest || !fs.existsSync(roleFile)) { errors.push(`${path.relative(root, appFile)}: 角色 ${listedRole.key} 的 manifest 不存在`); continue }

    const manifest = readJson(roleFile)
    if (!manifest) continue
    if (manifest.application?.key !== app.key) errors.push(`${path.relative(root, roleFile)}: application.key 与 app.json 不一致`)
    if (manifest.role?.key !== listedRole.key) errors.push(`${path.relative(root, roleFile)}: role.key 与 app.json 不一致`)
    if (manifest.role?.roleId !== listedRole.roleId) errors.push(`${path.relative(root, roleFile)}: roleId 与 app.json 不一致`)
    if (Boolean(manifest.role?.enabled) !== Boolean(listedRole.enabled)) errors.push(`${path.relative(root, roleFile)}: enabled 与 app.json 不一致`)
    if (listedRole.enabled && !(manifest.menus || []).length) errors.push(`${path.relative(root, roleFile)}: 已启用角色没有菜单`)

    for (const menu of manifest.menus || []) {
      const menuFile = path.resolve(path.dirname(roleFile), menu.manifest || '')
      if (!menu.manifest || !fs.existsSync(menuFile)) errors.push(`${path.relative(root, roleFile)}: 菜单 ${menu.key} 的 manifest 不存在`)
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`角色清单校验通过：${roleIds.size} 个稳定 roleId`)
