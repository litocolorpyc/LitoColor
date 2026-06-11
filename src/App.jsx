import React, { createContext, useContext, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { USUARIOS, genCod, todayISO } from './lib/data'
import Login from './pages/Login'

// ── Vistas por rol ──
import ShellGerente   from './pages/gerente/Shell'
import ShellJP        from './pages/jp/Shell'
import ShellOperario  from './pages/operario/Shell'

export const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

// ── Demo data inicial ────────────────────────────────────────────────────────
const DEMO_COTIZACIONES = [
  {
    id:'COT-241001', fecha:'2026-06-01', clienteId:1, estado:'aprobada',
    items:[{ productoNombre:'Tarjeta de Presentación', cantidad:1000, precioUnitario:220, subtotal:220000 }],
    total:220000, margen:35, validezDias:30,
    notas:'Full color, laminado brillante ambas caras',
  },
  {
    id:'COT-241002', fecha:'2026-06-05', clienteId:2, estado:'cotizacion',
    items:[{ productoNombre:'Brochure Triptico', cantidad:500, precioUnitario:320, subtotal:160000 }],
    total:160000, margen:38, validezDias:30,
    notas:'Papel mate, sin laminado',
  },
  {
    id:'COT-241003', fecha:'2026-06-08', clienteId:3, estado:'aprobada',
    items:[{ productoNombre:'Catálogo / Revista', cantidad:200, precioUnitario:950, subtotal:190000 }],
    total:190000, margen:42, validezDias:15,
    notas:'Portada propalcote 300, interior bond 90',
  },
]

const DEMO_OPS = [
  {
    id:'OP-2406-001', cotizacionId:'COT-241001', clienteId:1,
    descripcion:'Tarjetas de presentación Grupo Éxito',
    estado:'en_produccion', prioridad:'alta',
    fechaEntrega:'2026-06-12',
    maquinas:['P1','G1'],
    materialCod:'Cote-300-C1-1',
    cantidad:1000,
    progreso:65,
    tareas:[],
    costoEstimado:142000,
    costoReal:0,
  },
  {
    id:'OP-2406-002', cotizacionId:'COT-241003', clienteId:3,
    descripcion:'Catálogo Bancolombia Q2 2026',
    estado:'aprobada', prioridad:'media',
    fechaEntrega:'2026-06-18',
    maquinas:['P1','G1','Ar'],
    materialCod:'Cote-115-C2-1',
    cantidad:200,
    progreso:0,
    tareas:[],
    costoEstimado:113000,
    costoReal:0,
  },
]

export default function App() {
  const [usuario,       setUsuario]       = useState(null)
  const [cotizaciones,  setCotizaciones]  = useState(DEMO_COTIZACIONES)
  const [ops,           setOps]           = useState(DEMO_OPS)
  const [registros,     setRegistros]     = useState([])
  const [consumos,      setConsumos]      = useState([])

  function login(pin) {
    const u = USUARIOS.find(u => u.pin === pin && u.activo)
    if (u) { setUsuario(u); return true }
    return false
  }
  function logout() { setUsuario(null); setRegistros([]); setConsumos([]) }

  // Cotizaciones
  function addCotizacion(c) { setCotizaciones(p => [{ ...c, id: genCod('COT'), fecha: todayISO(), estado:'cotizacion' }, ...p]) }
  function updateCotizacion(id, changes) { setCotizaciones(p => p.map(c => c.id===id ? {...c,...changes} : c)) }

  // OPs
  function addOP(op) { setOps(p => [{ ...op, id: genCod('OP'), tareas:[], costoReal:0, progreso:0 }, ...p]) }
  function updateOP(id, changes) { setOps(p => p.map(o => o.id===id ? {...o,...changes} : o)) }

  // Registros (tiempo operarios)
  function addRegistro(r) {
    const nuevo = { ...r, id: Date.now(), fecha: todayISO(), operarioId: usuario?.id, operarioNombre: usuario?.nombre }
    setRegistros(p => [nuevo, ...p])
    // Actualizar costo real de la OP
    if (r.opId && r.durMin) {
      const op = ops.find(o => o.id === r.opId)
      if (op) {
        const costoHH = (usuario?.valorHora || 0) * (r.durMin / 60)
        updateOP(r.opId, { costoReal: (op.costoReal || 0) + costoHH })
      }
    }
  }
  function delRegistro(id) { setRegistros(p => p.filter(r => r.id !== id)) }

  function addConsumo(c) { setConsumos(p => [{ ...c, id: Date.now(), fecha: todayISO() }, ...p]) }

  const ctx = {
    usuario, login, logout,
    cotizaciones, addCotizacion, updateCotizacion,
    ops, addOP, updateOP,
    registros, addRegistro, delRegistro,
    consumos, addConsumo,
  }

  function RoleRouter() {
    if (!usuario) return <Navigate to="/login" replace />
    if (usuario.rol === 'gerente')  return <Navigate to="/gerente"  replace />
    if (usuario.rol === 'jp')       return <Navigate to="/jp"       replace />
    return <Navigate to="/operario" replace />
  }

  return (
    <AppCtx.Provider value={ctx}>
      <Routes>
        <Route path="/login"      element={!usuario ? <Login /> : <RoleRouter />} />
        <Route path="/"           element={<RoleRouter />} />
        <Route path="/gerente/*"  element={usuario?.rol==='gerente'  ? <ShellGerente />  : <Navigate to="/login" replace />} />
        <Route path="/jp/*"       element={usuario?.rol==='jp'       ? <ShellJP />       : <Navigate to="/login" replace />} />
        <Route path="/operario/*" element={usuario?.rol==='operario' ? <ShellOperario /> : <Navigate to="/login" replace />} />
      </Routes>
    </AppCtx.Provider>
  )
}
