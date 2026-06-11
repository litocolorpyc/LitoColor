import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../../App'
import { ACTIVIDADES, MAQUINAS, TIPO_COLORS, OP_ESTADOS, nowStr, toMin, fmtMin } from '../../lib/data'

const JORNADA_H = 8

export default function Captura() {
  const { usuario, ops, registros, addRegistro, delRegistro } = useApp()
  const [jStart, setJStart] = useState(null)
  const [jEnd,   setJEnd]   = useState(null)
  const [elapsed,setElapsed]= useState(0)
  const [tab,    setTab]    = useState('form')
  const timer = useRef(null)

  const BLANK = { opId:'', actCod:'', maquina:'', cantidad:'', inicio:nowStr(), fin:'', reproceso:false, paro:false, comentario:'' }
  const [form, setForm] = useState(BLANK)

  useEffect(() => {
    if (jStart && !jEnd) { timer.current = setInterval(() => setElapsed(Math.floor((Date.now()-jStart)/1000)), 1000) }
    else clearInterval(timer.current)
    return () => clearInterval(timer.current)
  }, [jStart, jEnd])

  const opsActivas = ops.filter(o => o.estado==='en_produccion' || o.estado==='aprobada')
  const misRegistros = registros.filter(r => r.operarioId === usuario.id)

  function save() {
    const act = ACTIVIDADES.find(a=>a.cod===form.actCod)
    if (!act) return
    const ini = toMin(form.inicio), fin = toMin(form.fin)
    addRegistro({
      actCod:form.actCod, actividad:act.label, area:act.area, tipo:act.tipo,
      maquina:form.maquina, opId:form.opId, opp:form.opId,
      cantidad: form.cantidad ? parseInt(form.cantidad) : null,
      inicio:form.inicio, fin:form.fin,
      durMin: fin&&ini?(fin-ini):null,
      reproceso:form.reproceso, paro:form.paro, comentario:form.comentario,
    })
    setForm({...BLANK, inicio:form.fin||nowStr()})
    setTab('lista')
  }

  const eH = Math.floor(elapsed/3600), eM = Math.floor((elapsed%3600)/60), eS = elapsed%60
  const pct = Math.min(100, Math.round(elapsed/(JORNADA_H*3600)*100))
  const actSel = ACTIVIDADES.find(a=>a.cod===form.actCod)
  const opSel  = ops.find(o=>o.id===form.opId)

  const hoy = new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})

  return (
    <>
      <div style={{ fontSize:12, color:'var(--ink3)', paddingTop:4 }}>{hoy}</div>

      {/* Jornada */}
      <div className="card">
        {!jStart ? (
          <button className="btn-primary" onClick={() => { setJStart(Date.now()); setElapsed(0); setTab('form') }}>
            <i className="ti ti-player-play" />Iniciar Jornada
          </button>
        ) : (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontSize:12, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:'0.04em' }}>Tiempo en jornada</div>
              <span className={`badge ${jEnd?'badge-legales':'badge-success'}`}>{jEnd?'Finalizada':'Activa'}</span>
            </div>
            <div style={{ fontSize:32, fontWeight:500, fontVariantNumeric:'tabular-nums' }}>
              {eH}h {eM.toString().padStart(2,'0')}m <span style={{ fontSize:20, color:'var(--ink3)' }}>{eS.toString().padStart(2,'0')}s</span>
            </div>
            <div className="progress-bar" style={{ marginTop:10 }}>
              <div className="progress-fill" style={{ width:pct+'%' }} />
            </div>
            <div style={{ fontSize:11, color:'var(--ink3)', textAlign:'right', marginTop:4 }}>{pct}% de 8h</div>
            {!jEnd && (
              <button className="btn-primary btn-danger" style={{ marginTop:12 }} onClick={() => setJEnd(Date.now())}>
                <i className="ti ti-player-stop" />Finalizar Jornada
              </button>
            )}
          </>
        )}
      </div>

      {jStart && (
        <>
          <div className="tabs-bar">
            {[['form','Registrar','ti-plus'],['lista',`Lista (${misRegistros.length})`,'ti-list']].map(([id,label,icon]) => (
              <button key={id} className={`tab-btn${tab===id?' active':''}`} onClick={()=>setTab(id)}>
                <i className={`ti ${icon}`} />{label}
              </button>
            ))}
          </div>

          {tab==='form' && (
            <div className="card">
              <div className="card-title"><i className="ti ti-clipboard-plus" />Nueva actividad</div>

              {/* Orden de producción */}
              <div className="field-group">
                <label className="field-label">Orden de Producción</label>
                <select className="field-select" value={form.opId} onChange={e=>setForm(f=>({...f,opId:e.target.value}))}>
                  <option value="">Sin OP asignada</option>
                  {opsActivas.map(op => (
                    <option key={op.id} value={op.id}>{op.id} — {op.descripcion}</option>
                  ))}
                </select>
              </div>

              {opSel && (
                <div style={{ background:'var(--accent-l)', borderRadius:'var(--rad-sm)', padding:'8px 12px', marginBottom:'0.875rem', fontSize:12 }}>
                  <div style={{ fontWeight:500, color:'var(--accent-d)' }}>{opSel.descripcion}</div>
                  {opSel.notas && <div style={{ color:'var(--accent-d)', marginTop:2 }}>📋 {opSel.notas}</div>}
                  <div style={{ color:'var(--ink3)', marginTop:2 }}>
                    Máquinas: {opSel.maquinas?.join(', ')||'No asignadas'}
                  </div>
                </div>
              )}

              <div className="field-group">
                <label className="field-label">Actividad *</label>
                <select className="field-select" value={form.actCod} onChange={e=>setForm(f=>({...f,actCod:e.target.value}))}>
                  <option value="">Seleccionar actividad...</option>
                  {['directa','indirecta','paro','legales'].map(tipo=>(
                    <optgroup key={tipo} label={tipo.charAt(0).toUpperCase()+tipo.slice(1)}>
                      {ACTIVIDADES.filter(a=>a.tipo===tipo).map(a=>(
                        <option key={a.cod} value={a.cod}>{a.label} — {a.area}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {actSel && (
                <div style={{ display:'flex', gap:6, marginBottom:'0.875rem' }}>
                  <span className={`badge badge-${actSel.tipo}`}>{actSel.tipo}</span>
                  <span className="badge badge-legales">{actSel.area}</span>
                </div>
              )}

              <div className="field-group">
                <label className="field-label">Máquina</label>
                <select className="field-select" value={form.maquina} onChange={e=>setForm(f=>({...f,maquina:e.target.value}))}>
                  <option value="">Sin máquina / manual</option>
                  {MAQUINAS.map(m=><option key={m.cod} value={m.cod}>{m.nombre} ({m.cod})</option>)}
                </select>
              </div>

              <div className="time-pair">
                <div className="field-group">
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <label className="field-label">Inicio *</label>
                    <button className="btn-sm" onClick={()=>setForm(f=>({...f,inicio:nowStr()}))}>Ahora</button>
                  </div>
                  <input type="time" className="field-input" value={form.inicio} onChange={e=>setForm(f=>({...f,inicio:e.target.value}))} />
                </div>
                <div className="field-group">
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <label className="field-label">Fin</label>
                    <button className="btn-sm" onClick={()=>setForm(f=>({...f,fin:nowStr()}))}>Ahora</button>
                  </div>
                  <input type="time" className="field-input" value={form.fin} onChange={e=>setForm(f=>({...f,fin:e.target.value}))} />
                </div>
              </div>

              {actSel?.tipo==='directa' && (
                <div className="field-group">
                  <label className="field-label">Cantidad producida</label>
                  <input type="number" className="field-input" placeholder="Unidades" value={form.cantidad} onChange={e=>setForm(f=>({...f,cantidad:e.target.value}))} />
                </div>
              )}

              <div style={{ display:'flex', gap:16, marginBottom:'0.875rem' }}>
                {[['reproceso','Reproceso'],['paro','Paro']].map(([k,l])=>(
                  <label key={k} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
                    <input type="checkbox" checked={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.checked}))} />{l}
                  </label>
                ))}
              </div>

              <div className="field-group">
                <label className="field-label">Comentario</label>
                <input className="field-input" placeholder="Opcional" value={form.comentario} onChange={e=>setForm(f=>({...f,comentario:e.target.value}))} />
              </div>

              <button className="btn-primary" disabled={!form.actCod||!form.inicio} onClick={save}>
                <i className="ti ti-check" />Guardar actividad
              </button>
            </div>
          )}

          {tab==='lista' && (
            misRegistros.length===0
              ? <div className="empty-state"><i className="ti ti-clipboard" /><br/>Aún no hay actividades.</div>
              : misRegistros.map(r=>{
                  const c = TIPO_COLORS[r.tipo]||{}
                  return (
                    <div key={r.id} className="row-item">
                      <div style={{ width:10, height:10, borderRadius:'50%', background:c.dot, marginTop:5, flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:500, fontSize:14 }}>{r.actividad}</div>
                        <div style={{ fontSize:12, color:'var(--ink3)', marginTop:2 }}>
                          {r.inicio}{r.fin&&' → '+r.fin}{r.maquina&&' · '+r.maquina}
                        </div>
                        {r.opId && <div style={{ fontSize:11, color:'var(--info)', marginTop:2 }}>OP: {r.opId}</div>}
                        <div style={{ display:'flex', gap:4, marginTop:4 }}>
                          <span className={`badge badge-${r.tipo}`}>{r.tipo}</span>
                          {r.reproceso&&<span className="badge badge-warn">Reproceso</span>}
                          {r.paro&&<span className="badge badge-warn">Paro</span>}
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
                        {r.durMin>0&&<div style={{ fontSize:13, fontWeight:500 }}>{fmtMin(r.durMin)}</div>}
                        {r.cantidad>0&&<div style={{ fontSize:12, color:'var(--accent)' }}>{r.cantidad.toLocaleString()} uds</div>}
                        <button className="btn-icon" onClick={()=>delRegistro(r.id)}><i className="ti ti-trash" style={{ fontSize:15 }} /></button>
                      </div>
                    </div>
                  )
                })
          )}
        </>
      )}
    </>
  )
}
