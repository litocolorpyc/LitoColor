import React from 'react'
import { useApp } from '../../App'
import { fmtMin } from '../../lib/data'

export default function MiResumen() {
  const { usuario, registros } = useApp()
  const mis = registros.filter(r=>r.operarioId===usuario.id)

  const dirMin  = mis.filter(r=>r.tipo==='directa').reduce((s,r)=>s+(r.durMin||0),0)
  const indMin  = mis.filter(r=>r.tipo==='indirecta').reduce((s,r)=>s+(r.durMin||0),0)
  const parMin  = mis.filter(r=>r.tipo==='paro').reduce((s,r)=>s+(r.durMin||0),0)
  const legMin  = mis.filter(r=>r.tipo==='legales').reduce((s,r)=>s+(r.durMin||0),0)
  const totMin  = dirMin+indMin+parMin+legMin
  const efic    = totMin>0?Math.round(dirMin/totMin*100):0
  const totProd = mis.reduce((s,r)=>s+(r.cantidad||0),0)

  return (
    <>
      <div style={{ fontSize:16, fontWeight:500, paddingTop:4 }}>Mi día</div>
      <div style={{ fontSize:12, color:'var(--ink3)' }}>{new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})}</div>

      <div className="card" style={{ textAlign:'center', padding:'1.5rem 1rem' }}>
        <div style={{ fontSize:12, color:'var(--ink3)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Mi eficiencia</div>
        <div style={{ fontSize:52, fontWeight:500, color: efic>=70?'var(--accent)':efic>=50?'var(--warn)':'var(--danger)' }}>{efic}%</div>
        <div className="progress-bar" style={{ margin:'10px auto', maxWidth:160 }}>
          <div className="progress-fill" style={{ width:efic+'%', background: efic>=70?'var(--accent)':efic>=50?'var(--warn)':'var(--danger)' }}/>
        </div>
        <div style={{ fontSize:12, color:'var(--ink3)', marginTop:4 }}>{fmtMin(dirMin)} productivo de {fmtMin(totMin)} total</div>
      </div>

      <div className="stats-grid">
        {[
          {label:'Directa',   val:fmtMin(dirMin),  color:'var(--accent)'},
          {label:'Indirecta', val:fmtMin(indMin),  color:'var(--info)'},
          {label:'Paros',     val:fmtMin(parMin),  color:'var(--warn)'},
          {label:'Legales',   val:fmtMin(legMin),  color:'var(--ink3)'},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-val" style={{ color:s.color, fontSize:17 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Unidades</div>
          <div className="stat-val">{totProd.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Actividades</div>
          <div className="stat-val">{mis.length}</div>
          <div className="stat-sub">{mis.filter(r=>r.reproceso).length} reprocesos</div>
        </div>
      </div>

      {mis.length===0&&<div className="empty-state"><i className="ti ti-chart-bar"/><br/>Registra actividades para ver tu resumen.</div>}
    </>
  )
}
