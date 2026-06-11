import React from 'react'
import { useApp } from '../../App'
import { USUARIOS, fmtMin, fmtCOP } from '../../lib/data'

export default function InformesJP() {
  const { registros, ops, consumos } = useApp()

  const hoy = new Date().toISOString().slice(0,10)
  const regsHoy = registros.filter(r=>r.fecha===hoy)

  // Por operario
  const porOperario = USUARIOS.filter(u=>u.rol==='operario'&&u.activo).map(u => {
    const regs = regsHoy.filter(r=>r.operarioId===u.id)
    const dirMin  = regs.filter(r=>r.tipo==='directa').reduce((s,r)=>s+(r.durMin||0),0)
    const totMin  = regs.reduce((s,r)=>s+(r.durMin||0),0)
    const uds     = regs.reduce((s,r)=>s+(r.cantidad||0),0)
    const efic    = totMin>0?Math.round(dirMin/totMin*100):0
    const paros   = regs.filter(r=>r.tipo==='paro').length
    return { ...u, regs, dirMin, totMin, uds, efic, paros }
  }).filter(u=>u.regs.length>0)

  // Por OP
  const porOP = ops.map(op => {
    const regs = regsHoy.filter(r=>r.opId===op.id)
    const min  = regs.reduce((s,r)=>s+(r.durMin||0),0)
    const uds  = regs.reduce((s,r)=>s+(r.cantidad||0),0)
    return { ...op, regsHoy:regs, minHoy:min, udsHoy:uds }
  }).filter(o=>o.minHoy>0)

  const totDir  = regsHoy.filter(r=>r.tipo==='directa').reduce((s,r)=>s+(r.durMin||0),0)
  const totParo = regsHoy.filter(r=>r.tipo==='paro').reduce((s,r)=>s+(r.durMin||0),0)
  const totMin  = regsHoy.reduce((s,r)=>s+(r.durMin||0),0)
  const eficGlobal = totMin>0?Math.round(totDir/totMin*100):0

  function exportCSV() {
    const rows = [
      ['Fecha','Operario','Actividad','Tipo','Máquina','OPP','Inicio','Fin','Minutos','Cantidad'],
      ...regsHoy.map(r=>[r.fecha,r.operarioNombre,r.actividad,r.tipo,r.maquina||'',r.opId||r.opp||'',r.inicio||'',r.fin||'',r.durMin||'',r.cantidad||''])
    ]
    const csv = rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'})
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`informe_jp_${hoy}.csv`; a.click()
  }

  return (
    <>
      <div style={{ fontSize:16, fontWeight:500, paddingTop:4 }}>Informe del día</div>
      <div style={{ fontSize:12, color:'var(--ink3)' }}>{new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})}</div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Eficiencia global</div>
          <div className="stat-val" style={{ color: eficGlobal>=70?'var(--accent)':eficGlobal>=50?'var(--warn)':'var(--danger)' }}>{eficGlobal}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tiempo directo</div>
          <div className="stat-val" style={{ fontSize:16 }}>{fmtMin(totDir)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total paros</div>
          <div className="stat-val" style={{ fontSize:16, color:'var(--warn)' }}>{fmtMin(totParo)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Operarios activos</div>
          <div className="stat-val">{porOperario.length}</div>
        </div>
      </div>

      {porOperario.length > 0 && (
        <>
          <div className="section-label">Por operario</div>
          {porOperario.map(u => (
            <div key={u.id} className="card" style={{ padding:'0.875rem 1rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div className="avatar" style={{ width:32, height:32, fontSize:12 }}>{u.iniciales}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:500, fontSize:13 }}>{u.nombre}</div>
                  <div style={{ fontSize:11, color:'var(--ink3)' }}>{u.regs.length} actividades · {fmtMin(u.totMin)}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:500, fontSize:15, color: u.efic>=70?'var(--accent)':u.efic>=50?'var(--warn)':'var(--danger)' }}>{u.efic}%</div>
                  {u.uds>0 && <div style={{ fontSize:11, color:'var(--accent)' }}>{u.uds.toLocaleString()} uds</div>}
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width:u.efic+'%', background: u.efic>=70?'var(--accent)':u.efic>=50?'var(--warn)':'var(--danger)' }} />
              </div>
              {u.paros>0 && <div style={{ fontSize:11, color:'var(--warn)', marginTop:4 }}>⚠ {u.paros} paro(s) registrado(s)</div>}
            </div>
          ))}
        </>
      )}

      {porOP.length > 0 && (
        <>
          <div className="section-label">Por orden de producción</div>
          {porOP.map(op => (
            <div key={op.id} className="card" style={{ padding:'0.875rem 1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontWeight:500, fontSize:13 }}>{op.id}</div>
                  <div style={{ fontSize:11, color:'var(--ink2)' }}>{op.descripcion}</div>
                  <div style={{ fontSize:11, color:'var(--ink3)', marginTop:4 }}>
                    {op.regsHoy.length} actividades · {fmtMin(op.minHoy)}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  {op.udsHoy>0 && <div style={{ fontWeight:500, color:'var(--accent)' }}>{op.udsHoy.toLocaleString()} uds</div>}
                  <div className="progress-bar" style={{ width:80, marginTop:6 }}>
                    <div className="progress-fill" style={{ width:op.progreso+'%' }} />
                  </div>
                  <div style={{ fontSize:10, color:'var(--ink3)', marginTop:2 }}>{op.progreso}%</div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {regsHoy.length > 0 && (
        <button className="btn-primary" style={{ background:'var(--info)' }} onClick={exportCSV}>
          <i className="ti ti-download" />Exportar CSV del día
        </button>
      )}

      {regsHoy.length===0 && (
        <div className="empty-state"><i className="ti ti-chart-bar" /><br/>No hay registros del día todavía.</div>
      )}
    </>
  )
}
