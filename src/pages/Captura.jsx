import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../App'
import { ACTIVIDADES, MAQUINAS, TIPO_COLORS } from '../lib/data'

function nowStr() {
  const d = new Date()
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0')
}
function toMin(s) {
  if (!s) return null
  const [h, m] = s.split(':').map(Number)
  return h * 60 + m
}
function fmtMin(m) {
  if (m == null || m < 0) return '—'
  return Math.floor(m / 60) + 'h ' + Math.round(m % 60).toString().padStart(2,'0') + 'm'
}
function today() {
  return new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})
}

const JORNADA_H = 8

export default function Captura() {
  const { registros, addRegistro, delRegistro } = useApp()
  const [jStart,  setJStart]  = useState(null)
  const [jEnd,    setJEnd]    = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [tab,     setTab]     = useState('form')
  const timer = useRef(null)

  const BLANK = { actCod:'', maquina:'', opp:'', cantidad:'', inicio:nowStr(), fin:'', reproceso:false, paro:false, comentario:'' }
  const [form, setForm] = useState(BLANK)

  useEffect(() => {
    if (jStart && !jEnd) {
      timer.current = setInterval(() => setElapsed(Math.floor((Date.now() - jStart) / 1000)), 1000)
    } else {
      clearInterval(timer.current)
    }
    return () => clearInterval(timer.current)
  }, [jStart, jEnd])

  function iniciar()   { setJStart(Date.now()); setElapsed(0); setTab('form') }
  function finalizar() { setJEnd(Date.now()) }

  function save() {
    const act = ACTIVIDADES.find(a => a.cod === form.actCod)
    if (!act) return
    const ini = toMin(form.inicio)
    const fin = toMin(form.fin)
    addRegistro({
      actCod: form.actCod, actividad: act.label, area: act.area, tipo: act.tipo,
      maquina: form.maquina, opp: form.opp,
      cantidad: form.cantidad ? parseInt(form.cantidad) : null,
      inicio: form.inicio, fin: form.fin,
      durMin: fin && ini ? (fin - ini) : null,
      reproceso: form.reproceso, paro: form.paro, comentario: form.comentario,
    })
    setForm({ ...BLANK, inicio: form.fin || nowStr() })
    setTab('lista')
  }

  const eH = Math.floor(elapsed / 3600)
  const eM = Math.floor((elapsed % 3600) / 60)
  const eS = elapsed % 60
  const pct = Math.min(100, Math.round(elapsed / (JORNADA_H * 3600) * 100))

  const actSel = ACTIVIDADES.find(a => a.cod === form.actCod)
  const canSave = !!form.actCod && !!form.inicio

  // Stats
  const dirMin  = registros.filter(r => r.tipo === 'directa').reduce((s,r) => s + (r.durMin||0), 0)
  const indMin  = registros.filter(r => r.tipo === 'indirecta').reduce((s,r) => s + (r.durMin||0), 0)
  const parMin  = registros.filter(r => r.tipo === 'paro').reduce((s,r) => s + (r.durMin||0), 0)
  const legMin  = registros.filter(r => r.tipo === 'legales').reduce((s,r) => s + (r.durMin||0), 0)
  const totMin  = dirMin + indMin + parMin + legMin
  const efic    = totMin > 0 ? Math.round(dirMin / totMin * 100) : 0
  const totProd = registros.reduce((s,r) => s + (r.cantidad || 0), 0)

  return (
    <>
      {/* Date strip */}
      <div style={{fontSize:12,color:'var(--ink3)',paddingTop:4}}>{today()}</div>

      {/* Jornada card */}
      <div className="card">
        {!jStart ? (
          <button className="btn-primary" onClick={iniciar}>
            <i className="ti ti-player-play" aria-hidden="true" />Iniciar Jornada
          </button>
        ) : (
          <>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <div style={{fontSize:12,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'0.04em'}}>Tiempo en jornada</div>
              <span className={`badge ${jEnd ? 'badge-legales' : 'badge-success'}`}>
                {jEnd ? 'Finalizada' : 'Activa'}
              </span>
            </div>
            <div style={{fontSize:32,fontWeight:500,fontVariantNumeric:'tabular-nums'}}>
              {eH}h {eM.toString().padStart(2,'0')}m <span style={{fontSize:20,color:'var(--ink3)'}}>{eS.toString().padStart(2,'0')}s</span>
            </div>
            <div className="progress-bar" style={{marginTop:10}}>
              <div className="progress-fill" style={{width:pct+'%'}} />
            </div>
            <div style={{fontSize:11,color:'var(--ink3)',marginTop:4,textAlign:'right'}}>{pct}% de 8h</div>
            {!jEnd && (
              <button className="btn-primary btn-danger" style={{marginTop:12}} onClick={finalizar}>
                <i className="ti ti-player-stop" aria-hidden="true" />Finalizar Jornada
              </button>
            )}
          </>
        )}
      </div>

      {jStart && (
        <>
          {/* Tabs */}
          <div style={{display:'flex',background:'var(--surface)',border:'0.5px solid var(--border)',borderRadius:'var(--rad)',overflow:'hidden'}}>
            {[['form','Registrar','ti-plus'],['lista',`Lista (${registros.length})`,'ti-list'],['resumen','Resumen','ti-chart-bar']].map(([id,label,icon]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                flex:1, padding:'0.65rem 0.25rem',
                background: tab===id ? 'var(--accent)' : 'none',
                color: tab===id ? '#fff' : 'var(--ink2)',
                border:'none', cursor:'pointer', fontSize:12, fontFamily:'inherit',
                display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                transition:'all 0.15s',
              }}>
                <i className={`ti ${icon}`} aria-hidden="true" />{label}
              </button>
            ))}
          </div>

          {/* FORM */}
          {tab === 'form' && (
            <div className="card">
              <div className="card-title"><i className="ti ti-clipboard-plus" aria-hidden="true" />Nueva actividad</div>

              <div className="field-group">
                <label className="field-label">Actividad *</label>
                <select className="field-select" value={form.actCod} onChange={e => setForm(f => ({...f, actCod:e.target.value}))}>
                  <option value="">Seleccionar actividad...</option>
                  {['directa','indirecta','paro','legales'].map(tipo => (
                    <optgroup key={tipo} label={tipo.charAt(0).toUpperCase()+tipo.slice(1)}>
                      {ACTIVIDADES.filter(a => a.tipo===tipo).map(a => (
                        <option key={a.cod} value={a.cod}>{a.label} — {a.area}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {actSel && (
                <div style={{display:'flex',gap:6,marginBottom:'0.875rem',flexWrap:'wrap'}}>
                  <span className={`badge badge-${actSel.tipo}`}>{actSel.tipo}</span>
                  <span className="badge badge-legales">{actSel.area}</span>
                </div>
              )}

              <div className="field-group">
                <label className="field-label">Máquina / Puesto</label>
                <select className="field-select" value={form.maquina} onChange={e => setForm(f => ({...f, maquina:e.target.value}))}>
                  <option value="">Sin máquina (trabajo manual)</option>
                  {MAQUINAS.map(m => <option key={m.cod} value={m.cod}>{m.nombre} ({m.cod}) — {m.area}</option>)}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">O.P.P.</label>
                <input className="field-input" placeholder="Ej: 5530-1" value={form.opp}
                  onChange={e => setForm(f => ({...f, opp:e.target.value}))} />
              </div>

              <div className="time-pair">
                <div className="field-group">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <label className="field-label">Inicio *</label>
                    <button className="btn-sm" onClick={() => setForm(f => ({...f, inicio:nowStr()}))}>Ahora</button>
                  </div>
                  <input type="time" className="field-input" value={form.inicio}
                    onChange={e => setForm(f => ({...f, inicio:e.target.value}))} />
                </div>
                <div className="field-group">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <label className="field-label">Fin</label>
                    <button className="btn-sm" onClick={() => setForm(f => ({...f, fin:nowStr()}))}>Ahora</button>
                  </div>
                  <input type="time" className="field-input" value={form.fin}
                    onChange={e => setForm(f => ({...f, fin:e.target.value}))} />
                </div>
              </div>

              {actSel?.tipo === 'directa' && (
                <div className="field-group">
                  <label className="field-label">Cantidad producida</label>
                  <input type="number" className="field-input" placeholder="Unidades" value={form.cantidad}
                    onChange={e => setForm(f => ({...f, cantidad:e.target.value}))} />
                </div>
              )}

              <div style={{display:'flex',gap:16,marginBottom:'0.875rem'}}>
                {[['reproceso','Reproceso'],['paro','Paro']].map(([k,label]) => (
                  <label key={k} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,cursor:'pointer'}}>
                    <input type="checkbox" checked={form[k]}
                      onChange={e => setForm(f => ({...f, [k]:e.target.checked}))} />
                    {label}
                  </label>
                ))}
              </div>

              <div className="field-group">
                <label className="field-label">Comentario</label>
                <input className="field-input" placeholder="Opcional" value={form.comentario}
                  onChange={e => setForm(f => ({...f, comentario:e.target.value}))} />
              </div>

              <button className="btn-primary" disabled={!canSave} onClick={save}>
                <i className="ti ti-check" aria-hidden="true" />Guardar actividad
              </button>
            </div>
          )}

          {/* LIST */}
          {tab === 'lista' && (
            registros.length === 0
              ? <div className="empty-state"><i className="ti ti-clipboard" /><br/>No hay actividades aún.</div>
              : registros.map(r => {
                  const c = TIPO_COLORS[r.tipo] || {}
                  return (
                    <div key={r.id} className="card" style={{padding:'0.875rem 1rem'}}>
                      <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:c.dot,marginTop:5,flexShrink:0}} />
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:500,fontSize:14}}>{r.actividad}</div>
                          <div style={{fontSize:12,color:'var(--ink3)',marginTop:2}}>
                            {r.inicio}{r.fin && ' → '+r.fin}
                            {r.opp && ' · '+r.opp}
                            {r.maquina && ' · '+r.maquina}
                          </div>
                          <div style={{display:'flex',gap:4,marginTop:5,flexWrap:'wrap'}}>
                            <span className={`badge badge-${r.tipo}`}>{r.tipo}</span>
                            {r.reproceso && <span className="badge badge-warn">Reproceso</span>}
                            {r.paro && <span className="badge badge-warn">Paro</span>}
                          </div>
                          {r.comentario && <div style={{fontSize:12,color:'var(--ink3)',marginTop:4}}>{r.comentario}</div>}
                        </div>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2,flexShrink:0}}>
                          {r.durMin > 0 && <div style={{fontSize:13,fontWeight:500}}>{fmtMin(r.durMin)}</div>}
                          {r.cantidad > 0 && <div style={{fontSize:12,color:'var(--accent)'}}>{r.cantidad.toLocaleString()} uds</div>}
                          <button className="btn-icon" onClick={() => delRegistro(r.id)}>
                            <i className="ti ti-trash" style={{fontSize:15}} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
          )}

          {/* RESUMEN */}
          {tab === 'resumen' && (
            <>
              <div className="section-label">Tiempo por tipo</div>
              <div className="stats-grid">
                {[
                  {label:'Directa',   val:fmtMin(dirMin),  sub: totMin>0?Math.round(dirMin/totMin*100)+'%':'—',  color:'var(--accent)'},
                  {label:'Indirecta', val:fmtMin(indMin),  sub: totMin>0?Math.round(indMin/totMin*100)+'%':'—',  color:'var(--info)'},
                  {label:'Paros',     val:fmtMin(parMin),  sub: totMin>0?Math.round(parMin/totMin*100)+'%':'—',  color:'var(--warn)'},
                  {label:'Legales',   val:fmtMin(legMin),  sub: registros.filter(r=>r.tipo==='legales').length+' reg', color:'var(--ink3)'},
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-val" style={{color:s.color}}>{s.val}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="section-label">Producción</div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Eficiencia</div>
                  <div className="stat-val" style={{color: efic>=70?'var(--accent)':efic>=50?'var(--warn)':'var(--danger)'}}>{efic}%</div>
                  <div className="progress-bar" style={{marginTop:8}}>
                    <div className="progress-fill" style={{width:efic+'%',background: efic>=70?'var(--accent)':efic>=50?'var(--warn)':'var(--danger)'}} />
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Unidades</div>
                  <div className="stat-val">{totProd.toLocaleString()}</div>
                  <div className="stat-sub">{registros.filter(r=>r.tipo==='directa').length} actividad(es)</div>
                </div>
              </div>

              {registros.length === 0 && (
                <div className="empty-state"><i className="ti ti-chart-bar" /><br/>Registra actividades para ver el resumen.</div>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
