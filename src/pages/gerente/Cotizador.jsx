import React, { useState } from 'react'
import { useApp } from '../../App'
import { CLIENTES, PRODUCTOS_TIPO, MATERIALES, ACABADOS, fmtCOP, genCod, todayISO } from '../../lib/data'

export default function Cotizador() {
  const { cotizaciones, addCotizacion, updateCotizacion, addOP } = useApp()
  const [tab, setTab] = useState('lista')
  const [form, setForm] = useState({
    clienteId:'', productoTip:'', cantidad:1000,
    materialCod:'', acabados:[], margen:35, notas:''
  })
  const [detalle, setDetalle] = useState(null)

  const prod = PRODUCTOS_TIPO.find(p => p.cod === form.productoTip)
  const mat  = MATERIALES.find(m => m.cod === (form.materialCod || prod?.materialDefault))

  // Cálculo de costos
  function calcular() {
    if (!prod || !form.cantidad) return null
    const cant     = parseInt(form.cantidad)
    const pliegos  = Math.ceil(cant / 8)
    const costoMat = mat ? (pliegos / 500) * mat.precio : 0
    const costoMaq = prod.procesos.reduce((s, cod) => {
      const { MAQUINAS } = require('../../lib/data')
      // inline lookup
      return s
    }, 0)
    const costoHH      = prod.tiempoHoras * 18000
    const costoMaqTotal= prod.tiempoHoras * 55000
    const costoBase    = costoMat + costoHH + costoMaqTotal
    const margenVal    = parseInt(form.margen) / 100
    const precioTotal  = Math.ceil(costoBase / (1 - margenVal))
    const precioUnit   = Math.ceil(precioTotal / cant)
    return { cant, costoMat: Math.round(costoMat), costoHH, costoMaqTotal, costoBase: Math.round(costoBase), precioTotal, precioUnit, margen: parseInt(form.margen) }
  }

  // Versión sin require
  function calcularV2() {
    if (!prod || !form.cantidad) return null
    const cant      = parseInt(form.cantidad)
    const pliegos   = Math.ceil(cant / 8)
    const costoMat  = mat ? Math.round((pliegos / 500) * mat.precio) : 0
    const costoHH   = Math.round(prod.tiempoHoras * 18000)
    const costoMaq  = Math.round(prod.tiempoHoras * 65000)
    const acabCosto = form.acabados.reduce((s, ac) => {
      const a = ACABADOS.find(x => x.cod === ac)
      return s + (a ? a.precio * cant : 0)
    }, 0)
    const costoBase = costoMat + costoHH + costoMaq + acabCosto
    const margenVal = parseInt(form.margen || 35) / 100
    const precioTotal = Math.ceil(costoBase / (1 - margenVal))
    const precioUnit  = Math.ceil(precioTotal / cant)
    return { cant, costoMat, costoHH, costoMaq, acabCosto: Math.round(acabCosto), costoBase, precioTotal, precioUnit, margen: parseInt(form.margen||35) }
  }

  const calculo = calcularV2()

  function guardarCotizacion() {
    if (!calculo || !form.clienteId) return
    addCotizacion({
      clienteId: parseInt(form.clienteId),
      items: [{ productoNombre: prod.nombre, cantidad: calculo.cant, precioUnitario: calculo.precioUnit, subtotal: calculo.precioTotal }],
      total: calculo.precioTotal,
      margen: calculo.margen,
      notas: form.notas,
      calculo,
    })
    setTab('lista')
    setForm({ clienteId:'', productoTip:'', cantidad:1000, materialCod:'', acabados:[], margen:35, notas:'' })
  }

  function aprobarYcrearOP(cot) {
    updateCotizacion(cot.id, { estado:'aprobada' })
    addOP({
      cotizacionId: cot.id,
      clienteId: cot.clienteId,
      descripcion: cot.items[0]?.productoNombre + ' — ' + CLIENTES.find(c=>c.id===cot.clienteId)?.nombre,
      estado: 'aprobada',
      prioridad: 'media',
      fechaEntrega: '',
      maquinas: [],
      cantidad: cot.items[0]?.cantidad || 0,
      costoEstimado: cot.total,
    })
    setDetalle(null)
  }

  const ESTADO_BADGE = {
    borrador:'badge-legales', cotizacion:'badge-info', aprobada:'badge-success', rechazada:'badge-danger'
  }

  return (
    <>
      <div style={{ fontSize:16, fontWeight:500, paddingTop:4 }}>Cotizaciones</div>

      <div className="tabs-bar">
        {[['lista','Lista','ti-list'],['nueva','Nueva cotización','ti-plus']].map(([id,label,icon]) => (
          <button key={id} className={`tab-btn${tab===id?' active':''}`} onClick={() => setTab(id)}>
            <i className={`ti ${icon}`} aria-hidden="true" />{label}
          </button>
        ))}
      </div>

      {/* LISTA */}
      {tab==='lista' && !detalle && (
        cotizaciones.length === 0
          ? <div className="empty-state"><i className="ti ti-file-invoice" /><br/>No hay cotizaciones aún.</div>
          : cotizaciones.map(cot => {
              const cliente = CLIENTES.find(c => c.id === cot.clienteId)
              return (
                <div key={cot.id} className="row-item" style={{ cursor:'pointer' }} onClick={() => setDetalle(cot)}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:500, fontSize:14 }}>{cot.id}</div>
                    <div style={{ fontSize:12, color:'var(--ink2)', marginTop:2 }}>{cliente?.nombre}</div>
                    <div style={{ fontSize:12, color:'var(--ink3)' }}>{cot.items[0]?.productoNombre} · {cot.items[0]?.cantidad?.toLocaleString()} uds</div>
                    <div style={{ marginTop:6 }}>
                      <span className={`badge ${ESTADO_BADGE[cot.estado]||'badge-legales'}`}>{cot.estado}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontWeight:500, fontSize:15 }}>{fmtCOP(cot.total)}</div>
                    <div style={{ fontSize:11, color:'var(--accent)' }}>Margen {cot.margen}%</div>
                    <div style={{ fontSize:11, color:'var(--ink3)', marginTop:4 }}>{cot.fecha}</div>
                  </div>
                </div>
              )
            })
      )}

      {/* DETALLE COTIZACIÓN */}
      {tab==='lista' && detalle && (
        <>
          <button className="btn-sm" onClick={() => setDetalle(null)} style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:4 }}>
            <i className="ti ti-arrow-left" />Volver
          </button>
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ fontWeight:500, fontSize:16 }}>{detalle.id}</div>
                <div style={{ fontSize:13, color:'var(--ink2)' }}>{CLIENTES.find(c=>c.id===detalle.clienteId)?.nombre}</div>
                <div style={{ fontSize:12, color:'var(--ink3)' }}>{detalle.fecha}</div>
              </div>
              <span className={`badge ${ESTADO_BADGE[detalle.estado]||'badge-legales'}`}>{detalle.estado}</span>
            </div>
            <div className="divider" />
            {detalle.items.map((item,i) => (
              <div key={i} style={{ padding:'10px 0', fontSize:13 }}>
                <div style={{ fontWeight:500 }}>{item.productoNombre}</div>
                <div style={{ display:'flex', justifyContent:'space-between', color:'var(--ink2)', marginTop:4 }}>
                  <span>{item.cantidad?.toLocaleString()} unidades</span>
                  <span>{fmtCOP(item.precioUnitario)} / ud</span>
                </div>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:500, padding:'8px 0', fontSize:15 }}>
              <span>Total</span><span>{fmtCOP(detalle.total)}</span>
            </div>
            <div style={{ fontSize:12, color:'var(--accent)', textAlign:'right' }}>Margen estimado: {detalle.margen}%</div>
            {detalle.notas && <div style={{ fontSize:12, color:'var(--ink3)', marginTop:8 }}>{detalle.notas}</div>}
          </div>

          {detalle.estado === 'cotizacion' && (
            <button className="btn-primary btn-purple" onClick={() => aprobarYcrearOP(detalle)}>
              <i className="ti ti-check" />Aprobar y crear Orden de Producción
            </button>
          )}
          {detalle.estado === 'aprobada' && (
            <div style={{ textAlign:'center', fontSize:13, color:'var(--accent)', padding:'0.5rem' }}>
              ✓ Cotización aprobada — OP generada
            </div>
          )}
        </>
      )}

      {/* NUEVA COTIZACIÓN */}
      {tab==='nueva' && (
        <div className="card">
          <div className="card-title"><i className="ti ti-file-plus" />Nueva cotización</div>

          <div className="field-group">
            <label className="field-label">Cliente *</label>
            <select className="field-select" value={form.clienteId} onChange={e => setForm(f=>({...f,clienteId:e.target.value}))}>
              <option value="">Seleccionar cliente...</option>
              {CLIENTES.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Producto *</label>
            <select className="field-select" value={form.productoTip} onChange={e => {
              const p = PRODUCTOS_TIPO.find(x=>x.cod===e.target.value)
              setForm(f=>({...f, productoTip:e.target.value, materialCod:p?.materialDefault||'', acabados:p?.acabadosDefault||[]}))
            }}>
              <option value="">Seleccionar producto...</option>
              {PRODUCTOS_TIPO.map(p => <option key={p.cod} value={p.cod}>{p.nombre} — {p.descripcion}</option>)}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Cantidad</label>
            <input type="number" className="field-input" value={form.cantidad} onChange={e=>setForm(f=>({...f,cantidad:e.target.value}))} />
          </div>

          <div className="field-group">
            <label className="field-label">Material</label>
            <select className="field-select" value={form.materialCod} onChange={e=>setForm(f=>({...f,materialCod:e.target.value}))}>
              <option value="">Usar material por defecto</option>
              {MATERIALES.filter(m=>m.unidad==='resma').map(m => <option key={m.cod} value={m.cod}>{m.nombre} — {fmtCOP(m.precio)}/resma</option>)}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Acabados</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, padding:'8px 0' }}>
              {ACABADOS.map(a => (
                <button key={a.cod} onClick={() => setForm(f => ({
                  ...f, acabados: f.acabados.includes(a.cod) ? f.acabados.filter(x=>x!==a.cod) : [...f.acabados, a.cod]
                }))} style={{
                  padding:'4px 12px', borderRadius:20, fontSize:12, cursor:'pointer', fontFamily:'inherit',
                  background: form.acabados.includes(a.cod) ? 'var(--accent)' : 'var(--surface3)',
                  color: form.acabados.includes(a.cod) ? '#fff' : 'var(--ink2)',
                  border: `0.5px solid ${form.acabados.includes(a.cod)?'var(--accent)':'var(--border2)'}`,
                }}>{a.nombre}</button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <label className="field-label">Margen de ganancia</label>
              <span style={{ fontSize:14, fontWeight:500, color:'var(--accent)' }}>{form.margen}%</span>
            </div>
            <input type="range" min="10" max="60" step="1" value={form.margen} onChange={e=>setForm(f=>({...f,margen:e.target.value}))} style={{ width:'100%' }} />
          </div>

          <div className="field-group">
            <label className="field-label">Notas</label>
            <input className="field-input" placeholder="Especificaciones adicionales" value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} />
          </div>

          {/* Cálculo en vivo */}
          {calculo && (
            <div style={{ background:'var(--surface2)', borderRadius:'var(--rad-sm)', padding:'0.875rem', marginBottom:'0.875rem' }}>
              <div style={{ fontSize:12, color:'var(--ink3)', marginBottom:8, fontWeight:500 }}>ESTIMADO DE COSTOS</div>
              {[
                ['Materiales',    fmtCOP(calculo.costoMat)],
                ['Mano de obra',  fmtCOP(calculo.costoHH)],
                ['Horas máquina', fmtCOP(calculo.costoMaq)],
                ['Acabados',      fmtCOP(calculo.acabCosto)],
                ['Costo total',   fmtCOP(calculo.costoBase)],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'3px 0', borderBottom:'0.5px solid var(--border)' }}>
                  <span style={{ color:'var(--ink3)' }}>{k}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:500, fontSize:14, padding:'8px 0 0' }}>
                <span>Precio sugerido</span><span style={{ color:'var(--accent)' }}>{fmtCOP(calculo.precioTotal)}</span>
              </div>
              <div style={{ fontSize:12, color:'var(--ink3)', textAlign:'right' }}>
                {fmtCOP(calculo.precioUnit)} / unidad · Margen {calculo.margen}%
              </div>
            </div>
          )}

          <button className="btn-primary btn-purple" disabled={!form.clienteId||!form.productoTip} onClick={guardarCotizacion}>
            <i className="ti ti-send" />Guardar cotización
          </button>
        </div>
      )}
    </>
  )
}
