import { useState } from 'react'
import { createInitialArchiveStructure } from './sys-shared-archive.js'

// 兼容旧入口，但数据结构统一由 ontology 驱动的共享档案视图生成。
export function useSysSharedArchive() {
  const [archiveGroups] = useState(createInitialArchiveStructure)
  return archiveGroups
}
