import { ARCHIVE_DOMAINS, indicators } from './portfolio-foundation.js'

export default function ArchiveDomainSummary({ teacher }) {
  if (!teacher) return null
  return <section className="ads"><header><div><span>ARCHIVE DOMAINS</span><h3>八大档案域</h3></div><p>档案域用于归档事实材料，不等同于五维评价分数</p></header><div className="ads-grid">{ARCHIVE_DOMAINS.map((domain) => { const list=indicators.filter((i)=>i.archiveDomainKey===domain.key); const filled=domain.key==='basic'?4:list.filter((i)=>{const d=teacher.data[i.id];return d&&d.value!==''&&d.value!==0}).length; const total=domain.key==='basic'?4:list.length; const rate=total?Math.round(filled/total*100):0; return <article key={domain.key}><div><strong>{domain.label}</strong><em>{rate}%</em></div><p>{domain.items.slice(0,3).join(' · ')}</p><i><b style={{width:`${rate}%`}}/></i><span>{filled}/{total} 项有效材料</span></article>})}</div></section>
}
