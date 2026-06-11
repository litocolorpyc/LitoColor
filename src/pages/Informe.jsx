import React, { useState } from 'react'
import { useApp } from '../App'

function fmtMin(m) {
  if (!m || m <= 0) return '0m'
  const h = Math.floor(m / 60)
  const min = Math.round(m % 60)
  return h > 0 ? `${h}h ${min.toString().padStart(2,'0')}m` : `${min}m`
}

export default function Informe() {
  const { registros, consumos, despachos, addDespacho, delDespacho } = useApp()
  const [tab, setTab] = useState('informe')
  const [form, setForm] = useState({ opp:'', referencia:'', cantDespachada:'', cantInventario:'', remision:'' })

  function saveDespacho() {
    if (!form.opp) return
    addDespacho({
      opp: form.opp,
      referencia: form.referencia,
      cantDespachada: parseInt(form.cantDespachada)||0,
      cantInventario: parseInt(form.cantInventario)||0,
      remision: form.remision,
      fecha: new Date().toISOString().slice(0,10),
    })
    setForm({ opp:'', referencia:'', cantDespachada:'', cantInventario:'', remision:'' })
  }

  const hoy    = new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long','year':'numeric'})
  const dirMin = registros.filter(r=>r.tipo==='directa').reduce((s,r)=>s+(r.durMin||0),0)
  const indMin = registros.filter(r=>r.tipo==='indirecta').reduce((s,r)=>s+(r.durMin||0),0)
  const parMin = registros.filter(r=>r.tipo==='paro').reduce((s,r)=>s+(r.durMin||0),0)
  const legMin = registros.filter(r=>r.tipo==='legales').reduce((s,r)=>s+(r.durMin||0),0)
  const totMin = dirMin+indMin+parMin+legMin
  const efic   = totMin>0?Math.round(dirMin/totMin*100):0
  const totProd= registros.reduce((s,r)=>s+(r.cantidad||0),0)

  // Group registros by tipo for report
  const groups = ['directa','indirecta','paro','legales'].map(tipo => ({
    tipo,
    items: registros.filter(r=>r.tipo===tipo)
  })).filter(g=>g.items.length>0)

  function exportCSV() {
    const rows = [
      ['Fecha','Actividad','Tipo','Área','Máquina','OPP','Inicio','Fin','Minutos','Cantidad','Reproceso','Paro','Comentario'],
      ...registros.map(r => [
        new Date().toISOString().slice(0,10),
        r.actividad, r.tipo, r.area, r.maquina||'', r.opp||'',
        r.inicio||'', r.fin||'', r.durMin||'', r.cantidad||'',
        r.reproceso?'Sí':'No', r.paro?'Sí':'No', r.comentario||''
      ])
    ]
    const csv = rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'})
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `informe_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const TIPO_LABEL = {directa:'Directa',indirecta:'Indirecta',paro:'Paro',legales:'Legales'}

  return (
    <>
      <div style={{fontSize:16,fontWeight:500,paddingTop:4}}>Informe Diario</div>
      <div style={{fontSize:12,color:'var(--ink3)'}}>{hoy}</div>

      {/* Tabs */}
      <div style={{display:'flex',background:'var(--surface)',border:'0.5px solid var(--border)',borderRadius:'var(--rad)',overflow:'hidden'}}>
        {[['informe','Informe','ti-file-report'],['despachos',`Despachos (${despachos.length})`,'ti-truck']].map(([id,label,icon])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            flex:1, padding:'0.65rem 0.25rem',
            background: tab===id?'var(--accent)':'none',
            color: tab===id?'#fff':'var(--ink2)',
            border:'none', cursor:'pointer', fontSize:12, fontFamily:'inherit',
            display:'flex',alignItems:'center',justifyContent:'center',gap:5,
          }}>
            <i className={`ti ${icon}`} aria-hidden="true" />{label}
          </button>
        ))}
      </div>

      {/* INFORME */}
      {tab==='informe' && (
        <>
          {/* Header resumen */}
          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:500}}>Resumen ejecutivo</div>
              <span className={`badge ${efic>=70?'badge-directa':efic>=50?'badge-warn':'badge-paro'}`}>{efic}% eficiencia</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px 16px',fontSize:13}}>
              {[
                ['Tiempo directo', fmtMin(dirMin)],
                ['Tiempo indirecto', fmtMin(indMin)],
                ['Paros', fmtMin(parMin)],
                ['Legales', fmtMin(legMin)],
                ['Total tiempo', fmtMin(totMin)],
                ['Unidades producidas', totProd.toLocaleString()],
              ].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',gap:8,borderBottom:'0.5px solid var(--border)',paddingBottom:6}}>
                  <span style={{color:'var(--ink3)'}}>{k}</span>
                  <span style={{fontWeight:500}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detalle por tipo */}
          {groups.map(g => (
            <div key={g.tipo} className="card" style={{padding:'0.875rem 1rem'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                <span className={`badge badge-${g.tipo}`}>{TIPO_LABEL[g.tipo]}</span>
                <span style={{fontSize:12,color:'var(--ink3)'}}>{g.items.length} registro(s)</span>
              </div>
              {g.items.map((r,i)=>(
                <div key={r.id}>
                  {i>0 && <div className="divider" />}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'5px 0',fontSize:13}}>
                    <div>
                      <div style={{fontWeight:500}}>{r.actividad}</div>
                      <div style={{fontSize:11,color:'var(--ink3)'}}>
                        {r.inicio}{r.fin&&' → '+r.fin}
                        {r.maquina&&' · '+r.maquina}
                        {r.opp&&' · '+r.opp}
                      </div>
                      {(r.reproceso||r.paro)&&(
                        <div style={{display:'flex',gap:4,marginTop:3}}>
                          {r.reproceso&&<span className="badge badge-warn" style={{fontSize:10}}>Reproceso</span>}
                          {r.paro&&<span className="badge badge-warn" style={{fontSize:10}}>Paro</span>}
                        </div>
                      )}
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      {r.durMin>0&&<div style={{fontWeight:500}}>{fmtMin(r.durMin)}</div>}
                      {r.cantidad>0&&<div style={{fontSize:11,color:'var(--accent)'}}>{r.cantidad.toLocaleString()} uds</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Consumo de papel */}
          {consumos.length > 0 && (
            <div className="card">
              <div className="card-title"><i className="ti ti-packages" />Consumo de papel</div>
              {consumos.map((c,i)=>(
                <div key={c.id}>
                  {i>0&&<div className="divider" />}
                  <div style={{display:'flex',justifyContent:'space-between',padding:'5px 0',fontSize:13}}>
                    <div>
                      <div style={{fontWeight:500}}>{c.opp}</div>
                      <div style={{fontSize:11,color:'var(--ink3)'}}>{c.papel}</div>
                    </div>
                    <div style={{textAlign:'right',fontSize:12}}>
                      <div>E:{c.hEntrada?.toLocaleString()} / S:{c.hSalida?.toLocaleString()}</div>
                      <div style={{color: c.merma>10?'var(--danger)':'var(--accent)'}}>Merma {c.merma}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {registros.length > 0 && (
            <button className="btn-primary" style={{background:'var(--info)'}} onClick={exportCSV}>
              <i className="ti ti-download" aria-hidden="true" />Exportar CSV
            </button>
          )}

          {registros.length === 0 && (
            <div className="empty-state"><i className="ti ti-file-report" /><br/>No hay actividades para reportar.</div>
          )}
        </>
      )}

      {/* DESPACHOS */}
      {tab==='despachos' && (
        <>
          <div className="card">
            <div className="card-title"><i className="ti ti-truck" />Registrar despacho</div>

            <div className="field-group">
              <label className="field-label">O.P.P. *</label>
              <input className="field-input" placeholder="Ej: 5530-1" value={form.opp}
                onChange={e=>setForm(f=>({...f,opp:e.target.value}))} />
            </div>
            <div className="field-group">
              <label className="field-label">Referencia / Producto</label>
              <input className="field-input" placeholder="Ej: Cuaderno DLS" value={form.referencia}
                onChange={e=>setForm(f=>({...f,referencia:e.target.value}))} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:'0.875rem'}}>
              <div className="field-group" style={{marginBottom:0}}>
                <label className="field-label">Cant. despachada</label>
                <input type="number" className="field-input" placeholder="0" value={form.cantDespachada}
                  onChange={e=>setForm(f=>({...f,cantDespachada:e.target.value}))} />
              </div>
              <div className="field-group" style={{marginBottom:0}}>
                <label className="field-label">Cant. inventario</label>
                <input type="number" className="field-input" placeholder="0" value={form.cantInventario}
                  onChange={e=>setForm(f=>({...f,cantInventario:e.target.value}))} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">No. Remisión</label>
              <input className="field-input" placeholder="Opcional" value={form.remision}
                onChange={e=>setForm(f=>({...f,remision:e.target.value}))} />
            </div>
            <button className="btn-primary" disabled={!form.opp} onClick={saveDespacho}>
              <i className="ti ti-check" />Guardar despacho
            </button>
          </div>

          {despachos.length === 0
            ? <div className="empty-state"><i className="ti ti-truck" /><br/>No hay despachos registrados.</div>
            : despachos.map(d=>(
                <div key={d.id} className="card" style={{padding:'0.875rem 1rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={{fontWeight:500}}>{d.opp}</div>
                      {d.referencia&&<div style={{fontSize:13,color:'var(--ink2)',marginTop:2}}>{d.referencia}</div>}
                      {d.remision&&<div style={{fontSize:12,color:'var(--ink3)'}}>Rem. {d.remision}</div>}
                      <div style={{display:'flex',gap:10,marginTop:6,fontSize:12}}>
                        <span>Desp: <b style={{color:'var(--accent)'}}>{d.cantDespachada?.toLocaleString()}</b></span>
                        <span>Inv: <b>{d.cantInventario?.toLocaleString()}</b></span>
                      </div>
                    </div>
                    <button className="btn-icon" onClick={()=>delDespacho(d.id)}>
                      <i className="ti ti-trash" style={{fontSize:15}} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))
          }
        </>
      )}
    </>
  )
}
