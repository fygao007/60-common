import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pageDirectories = ['components', 'scenarios', 'demos', 'framework'];
const extensions = new Set(['.html', '.css', '.js']);
const errors = [];

function collectFiles(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(folder, entry.name);
    if (entry.isDirectory() && (entry.name === '.workbuddy' || entry.name === 'node_modules')) return [];
    if (entry.isDirectory()) return collectFiles(target);
    if (/\.bundle\.(?:js|css)$/.test(entry.name)) return [];
    return extensions.has(path.extname(entry.name)) ? [target] : [];
  });
}

function collectReferences(source) {
  const references = new Set();
  const patterns = [
    /(?:href|src)=["']([^"']+)["']/gi,
    /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
    /["'`](\.\.?\/[^"'`\s]+)["'`]/g
  ];

  patterns.forEach((pattern) => {
    for (const match of source.matchAll(pattern)) references.add(match[1]);
  });
  return references;
}

for (const folder of pageDirectories) {
  for (const file of collectFiles(path.join(directory, folder))) {
    const source = fs.readFileSync(file, 'utf8');
    for (const reference of collectReferences(source)) {
      if (!reference.startsWith('./') && !reference.startsWith('../')) continue;
      if (reference.includes('${') || reference.includes('/node_modules/')) continue;

      const pathname = reference.split(/[?#]/, 1)[0];
      if (pathname.endsWith('/')) continue;
      const target = path.resolve(path.dirname(file), decodeURIComponent(pathname));
      const moduleTarget = path.extname(target) ? target : `${target}.js`;
      if (!fs.existsSync(target) && !fs.existsSync(moduleTarget)) {
        errors.push(`${path.relative(directory, file)} -> ${reference}`);
      }
    }
  }
}

if (errors.length) {
  console.error(`本地链接校验失败，共 ${errors.length} 项：`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('本地链接校验通过：四类页面目录未发现失效的相对路径。');
}
