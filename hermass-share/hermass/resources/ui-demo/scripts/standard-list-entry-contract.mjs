import fs from 'node:fs'
import path from 'node:path'

export function checkStandardListEntry(root, file, source) {
  const name = path.basename(file).replace(/\.page\.jsx$/, '')
  const expected = fs.readFileSync(path.join(root, 'templates/react-business-page/standard-list.page.jsx.template'), 'utf8').replaceAll('{{PAGE_NAME}}', name)
  const normalize = (text) => text.replace(/\/\/[^\n]*/g, '').replace(/\s+/g, '')
  return normalize(source) === normalize(expected)
}
