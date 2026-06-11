import React from 'react'
import { useApp } from '../App'
import { TIPO_COLORS } from '../lib/data'

function fmtMin(m) {
  if (!m || m <= 0) return '0m'
  const h = Math.floor(m / 60)
  const min = Math.round(m % 60)
  return h > 0 ? `${h}h ${min.toString().padStart(2,'0')}m` : `${min}m`
}

export default function Dashboard() {
  const { registros, consumos } = useApp()

  const dirMin  = registros.filter(r => r.tipo==='directa').reduce((s,r) => s+(r.durMin||0), 0)
  const indMin  = registros.filter(r => r.tipo==='indirecta').reduce((s,r) => s+(r.durMin||0), 0)
  const parMin  = registros.filter(r => r.tipo==='paro').reduce((s,r) => s+(r.durMin||0), 0)
  const legMin  = registros.filter(r => r.tipo==='legales').reduce((s,r) => s+(r.durMin||0), 0)
  const totMin  = dirMin + indMin + parMin + legMin
  const efic    = totMin > 0 ? Math.round(dirMin / totMin * 100) : 0
  const totProd = registros.reduce((s,r) => s+(r.cantidad||0), 0)

  // Group by OPP
  const byOpp = {}
  registros.forEach(r => {
    if (!r.opp) return
    if (!byOpp[r.opp]) byOpp[r.opp] = { opp:r.opp, actividades:[], minutos:0, unidades:0 }
    byOpp[r.opp].actividades.push(r.actividad)
    byOpp[r.opp].minutos += r.durMin || 0
    byOpp[r.opp].unidades += r.cantidad || 0
  })

  // Group by machine
  const byMaq = {}
  registros.filter(r => r.maquina).forEach(r => {
    if (!byMaq[r.maquina]) byMaq[r.maquina] = { maq:r.maquina, min:0, ops:0 }
    byMaq[r.maquina].min += r.durMin || 0
    byMaq[r.maquina].ops++
  })

  // Last 5 activities
  const recientes = registros.slice(0, 5)

  const hoy = new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})

  return (
    <>
      <div style={{fontSize:16,fontWeight:500,paddingTop:4}}>Dashboard</div>
      <div style={{fontSize:12,color:'var(--ink3)'}}>{hoy}</div>

      {/* Eficiencia grande */}
      <div className="card" style={{textAlign:'center',padding:'1.5rem 1rem'}}>
        <div style={{fontSize:12,color:'var(--ink3)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}}>Eficiencia del día</div>
        <div style={{
          fontSize:56, fontWeight:500,
          color: efic>=70?'var(--accent)':efic>=50?'var(--warn)':'var(--danger)'
        }}>{efic}%</div>
        <div className="progress-bar" style={{margin:'10px auto',maxWidth:200}}>
          <div className="progress-fill" style={{
            width: efic+'%',
            background: efic>=70?'var(--accent)':efic>=50?'var(--warn)':'var(--danger)'
          }} />
        </div>
        <div style={{fontSize:12,color:'var(--ink3)',marginTop:4}}>
          {fmtMin(dirMin)} directa de {fmtMin(totMin)} total
        </div>
      </div>

      {/* Stats grid */}
      <div className="section-label">Resumen de tiempo</div>
      <div className="stats-grid">
        {[
          {label:'Directa',   val:fmtMin(dirMin),  color:'var(--accent)'},
          {label:'Indirecta', val:fmtMin(indMin),  color:'var(--info)'},
          {label:'Paros',     val:fmtMin(parMin),  color:'var(--warn)'},
          {label:'Legales',   val:fmtMin(legMin),  color:'var(--ink3)'},
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-val" style={{color:s.color, fontSize:18}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Producción */}
      <div className="section-label">Producción</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Unidades</div>
          <div className="stat-val">{totProd.toLocaleString()}</div>
          <div className="stat-sub">producidas hoy</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Actividades</div>
          <div className="stat-val">{registros.length}</div>
          <div className="stat-sub">{registros.filter(r=>r.reproceso).length} reprocesos</div>
        </div>
      </div>

      {/* Por OPP */}
      {Object.keys(byOpp).length > 0 && (
        <>
          <div className="section-label">Por orden de producción</div>
          {Object.values(byOpp).map(o => (
            <div key={o.opp} className="card" style={{padding:'0.75rem 1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{fontWeight:500}}>{o.opp}</div>
                  <div style={{fontSize:12,color:'var(--ink3)',marginTop:2}}>
                    {[...new Set(o.actividades)].join(' · ')}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:14,fontWeight:500}}>{fmtMin(o.minutos)}</div>
                  {o.unidades > 0 && <div style={{fontSize:12,color:'var(--accent)'}}>{o.unidades.toLocaleString()} uds</div>}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Por máquina */}
      {Object.keys(byMaq).length > 0 && (
        <>
          <div className="section-label">Por máquina</div>
          {Object.values(byMaq).sort((a,b) => b.min-a.min).map(m => (
            <div key={m.maq} className="card" style={{padding:'0.75rem 1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <i className="ti ti-tool" style={{fontSize:18,color:'var(--ink3)'}} aria-hidden="true" />
                  <div>
                    <div style={{fontWeight:500,fontSize:14}}>{m.maq}</div>
                    <div style={{fontSize:12,color:'var(--ink3)'}}>{m.ops} operación(es)</div>
                  </div>
                </div>
                <div style={{fontWeight:500}}>{fmtMin(m.min)}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Paros activos */}
      {registros.filter(r=>r.tipo==='paro').length > 0 && (
        <>
          <div className="section-label" style={{color:'var(--warn)'}}>
            ⚠ Paros registrados ({registros.filter(r=>r.tipo==='paro').length})
          </div>
          {registros.filter(r=>r.tipo==='paro').map(r => (
            <div key={r.id} className="card" style={{borderColor:'var(--warn)',padding:'0.75rem 1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontWeight:500,fontSize:14,color:'var(--warn)'}}>{r.actividad}</div>
                  <div style={{fontSize:12,color:'var(--ink3)',marginTop:2}}>
                    {r.inicio}{r.fin && ' → '+r.fin}{r.opp && ' · '+r.opp}
                  </div>
                </div>
                {r.durMin > 0 && <div style={{fontWeight:500,color:'var(--warn)'}}>{fmtMin(r.durMin)}</div>}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Actividad reciente */}
      {recientes.length > 0 && (
        <>
          <div className="section-label">Actividad reciente</div>
          {recientes.map(r => {
            const c = TIPO_COLORS[r.tipo] || {}
            return (
              <div key={r.id} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'0.625rem 0.875rem',
                background:'var(--surface)',
                border:'0.5px solid var(--border)',
                borderRadius:'var(--rad-sm)',
              }}>
                <div style={{width:8,height:8,borderRadius:'50%',background:c.dot,flexShrink:0}} />
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500}}>{r.actividad}</div>
                  <div style={{fontSize:11,color:'var(--ink3)'}}>{r.inicio}{r.fin&&' → '+r.fin}{r.opp&&' · '+r.opp}</div>
                </div>
                {r.cantidad > 0 && <div style={{fontSize:12,color:'var(--accent)',flexShrink:0}}>{r.cantidad.toLocaleString()}</div>}
              </div>
            )
          })}
        </>
      )}

      {registros.length === 0 && consumos.length === 0 && (
        <div className="empty-state">
          <i className="ti ti-chart-bar" />
          <br/>No hay datos del día todavía.<br/>Empieza registrando actividades en Captura.
        </div>
      )}
    </>
  )
}
