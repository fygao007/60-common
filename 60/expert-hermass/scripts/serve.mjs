#!/usr/bin/env node
// 静态预览服务（替代 python3 -m http.server，Windows / macOS / Linux 通用）。
// 用法：node scripts/serve.mjs <目录> [端口]
//   node scripts/serve.mjs ../../ui-demo 8765
// 端口被占用时自动顺延，启动后打印实际地址。

import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { join, resolve, extname, normalize, sep } from 'node:path'

const args = process.argv.slice(2)
const rootArg = args[0] || '.'
const portArg = Number(args[1] || 8765)
const ROOT = resolve(rootArg)

if (!existsSync(ROOT)) {
  console.error(`目录不存在：${ROOT}`)
  process.exit(1)
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.yaml': 'text/plain; charset=utf-8',
  '.yml': 'text/plain; charset=utf-8',
}

const server = createServer((req, res) => {
  let urlPath
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  } catch {
    res.writeHead(400); res.end('bad request'); return
  }
  let filePath = normalize(join(ROOT, urlPath))
  // 防目录穿越
  if (!filePath.startsWith(ROOT + sep) && filePath !== ROOT) {
    res.writeHead(403); res.end('forbidden'); return
  }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html')
  }
  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(`404 ${urlPath}`)
    return
  }
  const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream'
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' })
  createReadStream(filePath).pipe(res)
})

let port = portArg
let tries = 0
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && tries < 20) {
    tries++
    port = portArg + tries
    console.log(`端口 ${port - 1} 被占用，改用 ${port}`)
    server.listen(port, '127.0.0.1')
  } else {
    console.error(err.message)
    process.exit(1)
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`\n预览服务已启动：http://127.0.0.1:${port}/`)
  console.log(`根目录：${ROOT}`)
  console.log('按 Ctrl+C 停止\n')
})
