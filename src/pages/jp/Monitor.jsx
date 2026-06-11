import React, { useState, useEffect } from 'react'
import { useApp } from '../../App'
import { USUARIOS, MAQUINAS, OP_ESTADOS, fmtMin, fmtCOP } from '../../lib/data'

export default function Monitor() {
  const { ops, registros, consumos } = useApp()
  const [ahora, setAhora] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setAhora(new Date()), 30000); return () => clearInterval(t) }, [])

  const operariosActivos = USUARIOS.filter(u => u.rol==='operario' && u.activo)
  const opsActivas = ops.filter(o => o.estado==='en_produccion' || o.estado==='aprobada')

  // Última actividad por operario
  function ultimaAct(opId) {
    return registros.filter(r=>r.operarioId===opId).sort((a,b)=>b.id-a.id)[0]
  }

  // Registros de hoy
  const hoy = new Date().toISOString().slice(0,10)
  const regsHoy = registros.filter(r => r.fecha===hoy)

  const minDir  = regsHoy.filter(r=>r.tipo==='directa').reduce((s,r)=>s+(r.durMin||0),0)
  const minParo = regsHoy.filter(r=>r.tipo==='paro').reduce((s,r)=>s+(r.durMin||0),0)
  const totMin  = regsHoy.reduce((s,r)=>s+(r.durMin||0),0)
  const efic    = totMin>0?Math.round(minDir/totMin*100):0
  const totUds  = regsHoy.reduce((s,r)=>s+(r.cantidad||0),0)

  const horaStr = ahora.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})
  const fechaStr = ahora.toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', paddingTop:4 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:500 }}>Monitor en vivo</div>
          <div style={{ fontSize:12, color:'var(--ink3)' }}>{fechaStr}</div>
        </div>
        <div style={{ fontSize:22, fontWeight:500, fontVariantNumeric:'tabular-nums', color:'var(--ink2)' }}>{horaStr}</div>
      </div>

      {/* KPIs del día */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Eficiencia</div>
          <div className="stat-val" style={{ color: efic>=70?'var(--accent)':efic>=50?'var(--warn)':'var(--danger)' }}>{efic}%</div>
          <div className="progress-bar" style={{ marginTop:6 }}>
            <div className="progress-fill" style={{ width:efic+'%', background: efic>=70?'var(--accent)':efic>=50?'var(--warn)':'var(--danger)' }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unidades hoy</div>
          <div className="stat-val">{totUds.toLocaleString()}</div>
          <div className="stat-sub">{regsHoy.filter(r=>r.tipo==='directa').length} actividades</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Paros</div>
          <div className="stat-val" style={{ color:'var(--warn)' }}>{fmtMin(minParo)}</div>
          <div className="stat-sub">{regsHoy.filter(r=>r.tipo==='paro').length} eventos</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">OPs activas</div>
          <div className="stat-val">{opsActivas.length}</div>
          <div className="stat-sub">{ops.filter(o=>o.estado==='aprobada').length} por iniciar</div>
        </div>
      </div>

      {/* Estado operarios */}
      <div className="section-label">Estado del personal</div>
      {operariosActivos.map(op => {
        const ult = ultimaAct(op.id)
        const esParo = ult?.tipo==='paro'
        const esLegal = ult?.tipo==='legales'
        const color = esParo?'var(--warn)':esLegal?'var(--ink3)':ult?'var(--accent)':'var(--ink3)'
        return (
          <div key={op.id} style={{
            display:'flex', alignItems:'center', gap:10,
            background:'var(--surface)', border:`0.5px solid ${esParo?'var(--warn)':'var(--border)'}`,
            borderRadius:'var(--rad)', padding:'0.75rem 1rem',
          }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:color, flexShrink:0 }} />
            <div className="avatar" style={{ width:32, height:32, fontSize:12 }}>{op.iniciales}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500 }}>{op.nombre}</div>
              <div style={{ fontSize:11, color:'var(--ink3)' }}>
                {ult ? `${ult.actividad} ${ult.inicio?'· '+ult.inicio:''}` : 'Sin registro hoy'}
              </div>
              {ult?.opp && <div style={{ fontSize:11, color:'var(--info)' }}>OP: {ult.opp}</div>}
            </div>
            {esParo && <span className="badge badge-warn">Paro</span>}
            {ult?.cantidad>0 && <span style={{ fontSize:12, color:'var(--accent)', fontWeight:500 }}>{ult.cantidad.toLocaleString()}</span>}
          </div>
        )
      })}

      {/* OPs activas */}
      {opsActivas.length > 0 && (
        <>
          <div className="section-label">Órdenes en producción</div>
          {opsActivas.map(op => {
            const est = OP_ESTADOS[op.estado]||{}
            const regsOP = registros.filter(r=>r.opId===op.id)
            const minTrab = regsOP.reduce((s,r)=>s+(r.durMin||0),0)
            const uds = regsOP.reduce((s,r)=>s+(r.cantidad||0),0)
            return (
              <div key={op.id} className="card" style={{ padding:'0.875rem 1rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:500, fontSize:14 }}>{op.id}</div>
                    <div style={{ fontSize:12, color:'var(--ink2)' }}>{op.descripcion}</div>
                  </div>
                  <span style={{ background:est.bg, color:est.color, padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:500 }}>{est.label}</span>
                </div>
                <div className="progress-bar" style={{ marginBottom:6 }}>
                  <div className="progress-fill" style={{ width:op.progreso+'%' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--ink3)' }}>
                  <span>{op.progreso}% completado</span>
                  <span>{fmtMin(minTrab)} · {uds.toLocaleString()} uds</span>
                </div>
                {op.fechaEntrega && (
                  <div style={{ fontSize:11, color:'var(--ink3)', marginTop:4 }}>📅 Entrega: {op.fechaEntrega}</div>
                )}
              </div>
            )
          })}
        </>
      )}

      {/* Alertas de paros */}
      {regsHoy.filter(r=>r.tipo==='paro').length > 0 && (
        <>
          <div className="section-label" style={{ color:'var(--warn)' }}>⚠ Paros del día</div>
          {regsHoy.filter(r=>r.tipo==='paro').map(r => (
            <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--warn-l)', border:'0.5px solid var(--warn)', borderRadius:'var(--rad-sm)', padding:'0.625rem 0.875rem', fontSize:13 }}>
              <div>
                <div style={{ fontWeight:500, color:'var(--warn)' }}>{r.actividad}</div>
                <div style={{ fontSize:11, color:'var(--ink3)' }}>{r.operarioNombre} · {r.inicio}</div>
              </div>
              {r.durMin>0 && <span style={{ fontWeight:500, color:'var(--warn)' }}>{fmtMin(r.durMin)}</span>}
            </div>
          ))}
        </>
      )}

      {regsHoy.length===0 && (
        <div className="empty-state"><i className="ti ti-layout-dashboard" /><br/>Los operarios aún no han registrado actividades hoy.</div>
      )}
    </>
  )
}
