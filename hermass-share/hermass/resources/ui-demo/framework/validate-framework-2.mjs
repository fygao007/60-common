import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const uiDemoDirectory = path.resolve(directory, '..');
const appShellDirectory = path.resolve(directory, '../packages/design-system/src/AppShellV2');
const pageDirectories = ['framework', 'components', 'scenarios', 'demos'];
const htmlFiles = pageDirectories.flatMap((folder) => {
  const folderPath = path.join(uiDemoDirectory, folder);
  return fs.readdirSync(folderPath)
    .filter((name) => name.endsWith('.html'))
    .map((name) => path.join(folder, name));
}).sort();
const errors = [];
const forbiddenFrameworkKeys = [
  'systemName',
  'frameworkAssetBase',
  'frameworkLogoSrc',
  'logoSrc',
  'topTools',
  'appGroups',
  'roles',
  'roleProfiles'
];

function addError(file, message) {
  errors.push(`${file}: ${message}`);
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(uiDemoDirectory, file), 'utf8');
  const usesFramework = source.includes('WiseFramework2.mount(')
    || source.includes('WiseAppShellV2.init(')
    || source.includes('legacy-app-shell-adapter.js');

  if (!usesFramework) continue;

  if (source.includes('WiseAppShellV2.init(')) {
    addError(file, '禁止直接调用 WiseAppShellV2.init()');
  }

  if (!/src="[^"]*framework-2\.js(?:\?[^"]*)?"/.test(source)) {
    addError(file, '缺少 framework-2.js');
  }

  if (!/src="[^"]*framework-2\.staff-preset\.js(?:\?[^"]*)?"/.test(source)) {
    addError(file, '缺少 framework-2.staff-preset.js');
  }

  if (!source.includes('class="frame2-stage')) {
    addError(file, '缺少 .frame2-stage 根节点');
  }

  const rootClasses = source.match(/class="([^"]*\bframe2-stage\b[^"]*)"/)?.[1]
    ?.split(/\s+/)
    .filter(Boolean) || [];
  const rootExtras = rootClasses.filter((name) => !['frame2-stage', 'ds-scope'].includes(name));
  if (rootExtras.length) {
    addError(file, `.frame2-stage 根节点禁止挂载业务类：${rootExtras.join(', ')}`);
  }

  if (!source.includes('AppShellV2/app-shell-v2.js?v=')) {
    addError(file, 'AppShellV2 脚本必须带版本号，避免引用页缓存旧样式');
  }

  const styleBlocks = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  styleBlocks.forEach((match) => {
    if (/\.frame2-[\w-]+/.test(match[1])) {
      addError(file, '业务样式禁止覆盖 .frame2-* 核心类');
    }
  });

  const inlineScripts = [...source.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => !/\btype=["'](?:importmap|application\/json)["']/i.test(match[1]));
  inlineScripts.forEach((match, index) => {
    try {
      new vm.Script(match[2], { filename: `${file}:inline-${index + 1}.js` });
    } catch (error) {
      addError(file, `内联脚本语法错误：${error.message}`);
    }
  });

  const mountConfig = source.match(/WiseFramework2\.mount\s*\(\s*\{([\s\S]*?)\}\s*\);/)?.[1] || '';
  forbiddenFrameworkKeys.forEach((key) => {
    if (new RegExp(`\\b${key}\\s*:`).test(mountConfig)) {
      addError(file, `业务页面禁止配置框架字段 ${key}`);
    }
  });
}

const appShellSource = fs.readFileSync(path.join(appShellDirectory, 'app-shell-v2.js'), 'utf8');
const appShellStyles = fs.readFileSync(path.join(appShellDirectory, 'app-shell-v2.css'), 'utf8');

if (!appShellSource.includes('attachShadow({ mode: \'open\' })')) {
  addError('AppShellV2/app-shell-v2.js', '框架壳必须使用 Shadow DOM 隔离宿主样式');
}

if (!appShellSource.includes('slot name="frame2-content"')) {
  addError('AppShellV2/app-shell-v2.js', '业务内容必须通过 slot 挂载');
}

if (/\.frame2-app-group:hover\s+\.frame2-app-menu/.test(appShellStyles)) {
  addError('AppShellV2/app-shell-v2.css', '应用菜单禁止通过 hover 自动展开');
}

if (!/\.frame2-content\s*\{[^}]*overflow-y:\s*auto;/s.test(appShellStyles)) {
  addError('AppShellV2/app-shell-v2.css', '框架2工作区必须支持内部纵向滚动');
}

if (!/\.frame2-content\s*>\s*slot::slotted\(\*\)\s*\{[^}]*flex:\s*none;/s.test(appShellStyles)) {
  addError('AppShellV2/app-shell-v2.css', '框架2页面内容必须按自然高度参与滚动');
}

if (errors.length) {
  console.error(`框架2校验失败，共 ${errors.length} 项：`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`框架2校验通过：${htmlFiles.length} 个 HTML 文件，未发现核心样式覆盖或旧初始化方式。`);
}
