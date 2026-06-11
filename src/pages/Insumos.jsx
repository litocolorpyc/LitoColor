import React, { useState } from 'react'
import { useApp } from '../App'
import { PAPELES, MAQUINAS } from '../lib/data'

export default function Insumos() {
  const { consumos, addConsumo, delConsumo } = useApp()
  const [tab, setTab] = useState('form')

  const BLANK = { opp:'', papelCod:'', maquina:'', hEntrada:'', hSalida:'', maculatura:'', comentario:'' }
  const [form, setForm] = useState(BLANK)

  function save() {
    if (!form.papelCod || !form.opp) return
    const papel = PAPELES.find(p => p.cod === form.papelCod)
    const hE = parseInt(form.hEntrada) || 0
    const hS = parseInt(form.hSalida)  || 0
    const mac = parseInt(form.maculatura) || 0
    addConsumo({
      opp:        form.opp,
      papelCod:   form.papelCod,
      papel:      papel?.nombre || form.papelCod,
      maquina:    form.maquina,
      hEntrada:   hE,
      hSalida:    hS,
      maculatura: mac,
      merma:      hE > 0 ? Math.round((hE - hS) / hE * 100) : 0,
      comentario: form.comentario,
      fecha:      new Date().toISOString().slice(0,10),
    })
    setForm(BLANK)
    setTab('lista')
  }

  const canSave = !!form.papelCod && !!form.opp

  // Stats
  const totalEntrada = consumos.reduce((s,c) => s + (c.hEntrada||0), 0)
  const totalSalida  = consumos.reduce((s,c) => s + (c.hSalida||0), 0)
  const totalMac     = consumos.reduce((s,c) => s + (c.maculatura||0), 0)
  const mermaGlobal  = totalEntrada > 0 ? Math.round((totalEntrada - totalSalida) / totalEntrada * 100) : 0

  return (
    <>
      <div style={{fontSize:16,fontWeight:500,paddingTop:4}}>Control de Insumos</div>
      <div style={{fontSize:12,color:'var(--ink3)'}}>Registro de consumo de papel por trabajo</div>

      {/* Tabs */}
      <div style={{display:'flex',background:'var(--surface)',border:'0.5px solid var(--border)',borderRadius:'var(--rad)',overflow:'hidden'}}>
        {[['form','Registrar','ti-plus'],['lista',`Registros (${consumos.length})`,'ti-list'],['stats','Estadísticas','ti-chart-pie']].map(([id,label,icon]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex:1, padding:'0.65rem 0.25rem',
            background: tab===id ? 'var(--accent)' : 'none',
            color: tab===id ? '#fff' : 'var(--ink2)',
            border:'none', cursor:'pointer', fontSize:12, fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap:5,
          }}>
            <i className={`ti ${icon}`} aria-hidden="true" />{label}
          </button>
        ))}
      </div>

      {/* FORM */}
      {tab === 'form' && (
        <div className="card">
          <div className="card-title"><i className="ti ti-packages" aria-hidden="true" />Nuevo consumo de papel</div>

          <div className="field-group">
            <label className="field-label">O.P.P. *</label>
            <input className="field-input" placeholder="Ej: 5530-1" value={form.opp}
              onChange={e => setForm(f => ({...f, opp:e.target.value}))} />
          </div>

          <div className="field-group">
            <label className="field-label">Tipo de papel *</label>
            <select className="field-select" value={form.papelCod} onChange={e => setForm(f => ({...f, papelCod:e.target.value}))}>
              <option value="">Seleccionar papel...</option>
              {PAPELES.map(p => <option key={p.cod} value={p.cod}>{p.nombre}</option>)}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Máquina</label>
            <select className="field-select" value={form.maquina} onChange={e => setForm(f => ({...f, maquina:e.target.value}))}>
              <option value="">Sin máquina</option>
              {MAQUINAS.map(m => <option key={m.cod} value={m.cod}>{m.nombre} ({m.cod})</option>)}
            </select>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:'0.875rem'}}>
            <div className="field-group" style={{marginBottom:0}}>
              <label className="field-label">Hojas entrada</label>
              <input type="number" className="field-input" placeholder="0" value={form.hEntrada}
                onChange={e => setForm(f => ({...f, hEntrada:e.target.value}))} />
            </div>
            <div className="field-group" style={{marginBottom:0}}>
              <label className="field-label">Hojas salida buena</label>
              <input type="number" className="field-input" placeholder="0" value={form.hSalida}
                onChange={e => setForm(f => ({...f, hSalida:e.target.value}))} />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Maculatura (hojas desperdicio)</label>
            <input type="number" className="field-input" placeholder="0" value={form.maculatura}
              onChange={e => setForm(f => ({...f, maculatura:e.target.value}))} />
          </div>

          {/* Merma calculada en vivo */}
          {form.hEntrada && form.hSalida && (
            <div style={{
              background:'var(--surface2)', borderRadius:'var(--rad-sm)',
              padding:'0.6rem 0.875rem', marginBottom:'0.875rem',
              display:'flex', justifyContent:'space-between', alignItems:'center'
            }}>
              <span style={{fontSize:13,color:'var(--ink2)'}}>Merma calculada</span>
              <span style={{
                fontWeight:500, fontSize:15,
                color: ((parseInt(form.hEntrada)-parseInt(form.hSalida))/parseInt(form.hEntrada)*100) > 10 ? 'var(--danger)' : 'var(--accent)'
              }}>
                {Math.round((parseInt(form.hEntrada)-parseInt(form.hSalida)) / parseInt(form.hEntrada) * 100)}%
              </span>
            </div>
          )}

          <div className="field-group">
            <label className="field-label">Comentario</label>
            <input className="field-input" placeholder="Opcional" value={form.comentario}
              onChange={e => setForm(f => ({...f, comentario:e.target.value}))} />
          </div>

          <button className="btn-primary" disabled={!canSave} onClick={save}>
            <i className="ti ti-check" aria-hidden="true" />Guardar consumo
          </button>
        </div>
      )}

      {/* LIST */}
      {tab === 'lista' && (
        consumos.length === 0
          ? <div className="empty-state"><i className="ti ti-packages" /><br/>No hay consumos registrados.</div>
          : consumos.map(c => (
              <div key={c.id} className="card" style={{padding:'0.875rem 1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:500,fontSize:14}}>{c.opp}</div>
                    <div style={{fontSize:12,color:'var(--ink3)',marginTop:2}}>{c.papel}</div>
                    {c.maquina && <div style={{fontSize:12,color:'var(--ink3)'}}>{c.maquina}</div>}
                    <div style={{display:'flex',gap:8,marginTop:6,fontSize:12}}>
                      <span>Entrada: <b>{c.hEntrada?.toLocaleString()}</b></span>
                      <span>Salida: <b>{c.hSalida?.toLocaleString()}</b></span>
                      <span style={{color: c.merma > 10 ? 'var(--danger)' : 'var(--accent)'}}>
                        Merma: <b>{c.merma}%</b>
                      </span>
                    </div>
                    {c.comentario && <div style={{fontSize:12,color:'var(--ink3)',marginTop:4}}>{c.comentario}</div>}
                  </div>
                  <button className="btn-icon" onClick={() => delConsumo(c.id)}>
                    <i className="ti ti-trash" style={{fontSize:15}} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))
      )}

      {/* STATS */}
      {tab === 'stats' && (
        <>
          <div className="section-label">Resumen del día</div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Hojas entrada</div>
              <div className="stat-val">{totalEntrada.toLocaleString()}</div>
              <div className="stat-sub">{consumos.length} registro(s)</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Hojas buenas</div>
              <div className="stat-val" style={{color:'var(--accent)'}}>{totalSalida.toLocaleString()}</div>
              <div className="stat-sub">{totalEntrada > 0 ? Math.round(totalSalida/totalEntrada*100) : 0}% del total</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Maculatura</div>
              <div className="stat-val" style={{color:'var(--warn)'}}>{totalMac.toLocaleString()}</div>
              <div className="stat-sub">hojas desperdicio</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Merma global</div>
              <div className="stat-val" style={{color: mermaGlobal > 10 ? 'var(--danger)' : 'var(--accent)'}}>
                {mermaGlobal}%
              </div>
              <div className="progress-bar" style={{marginTop:6}}>
                <div className="progress-fill" style={{
                  width: mermaGlobal+'%',
                  background: mermaGlobal > 10 ? 'var(--danger)' : 'var(--accent)'
                }} />
              </div>
            </div>
          </div>

          {consumos.length === 0 && (
            <div className="empty-state"><i className="ti ti-chart-pie" /><br/>Registra consumos para ver estadísticas.</div>
          )}
        </>
      )}
    </>
  )
}
