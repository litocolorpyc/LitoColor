// ─── USUARIOS Y ROLES ───────────────────────────────────────────────────────
export const USUARIOS = [
  { id:1,  nombre:'Carlos Mejia',        rol:'gerente',   pin:'1001', iniciales:'CM', activo:true,  valorHora:35000 },
  { id:2,  nombre:'Ricardo Ospina',      rol:'jp',        pin:'1002', iniciales:'RO', activo:true,  valorHora:28000 },
  { id:3,  nombre:'James Rodriguez',     rol:'operario',  pin:'2501', iniciales:'JR', activo:true,  valorHora:18000 },
  { id:4,  nombre:'Andres Moreno',       rol:'operario',  pin:'2502', iniciales:'AM', activo:true,  valorHora:18000 },
  { id:5,  nombre:'Juliana Cortes',      rol:'operario',  pin:'2503', iniciales:'JC', activo:true,  valorHora:17000 },
  { id:6,  nombre:'Teresa Sierra',       rol:'operario',  pin:'2504', iniciales:'TS', activo:true,  valorHora:17000 },
  { id:7,  nombre:'Alejandro Rodriguez', rol:'operario',  pin:'2505', iniciales:'AL', activo:true,  valorHora:16000 },
  { id:8,  nombre:'Juan Carlos Quintero',rol:'operario',  pin:'2509', iniciales:'JQ', activo:true,  valorHora:17000 },
]

export const ROL_LABEL = { gerente:'Gerente', jp:'Jefe de Producción', operario:'Operario' }
export const ROL_COLOR = { gerente:'#534AB7', jp:'#185FA5', operario:'#1D9E75' }

// ─── MÁQUINAS ────────────────────────────────────────────────────────────────
export const MAQUINAS = [
  { cod:'P1', nombre:'GTO 525',           area:'Litografía',       valorHora:85000 },
  { cod:'P2', nombre:'Adast Dominant 2',  area:'Litografía',       valorHora:75000 },
  { cod:'G1', nombre:'Guillotina',        area:'Guillotina',       valorHora:35000 },
  { cod:'Tr', nombre:'Troqueladora',      area:'Troquelado',       valorHora:55000 },
  { cod:'L1', nombre:'Laminadora',        area:'Plastificado',     valorHora:45000 },
  { cod:'L2', nombre:'Laminadora Manual', area:'Plastificado',     valorHora:25000 },
  { cod:'D1', nombre:'Xerox 700',         area:'Impresión Digital',valorHora:65000 },
  { cod:'Ar', nombre:'Argolladora',       area:'Terminado',        valorHora:20000 },
  { cod:'En', nombre:'Engomadora',        area:'Terminado',        valorHora:20000 },
  { cod:'Ma', nombre:'Manual',            area:'Terminado',        valorHora:0     },
]

// ─── MATERIALES / PAPELES ────────────────────────────────────────────────────
export const MATERIALES = [
  { cod:'B-70-1',        nombre:'Bond 70 gr 70x100',             unidad:'resma', precio:28000  },
  { cod:'B-90-1',        nombre:'Bond 90 gr 70x100',             unidad:'resma', precio:35000  },
  { cod:'B-115-1',       nombre:'Bond 115 gr 70x100',            unidad:'resma', precio:42000  },
  { cod:'Cote-115-C2-1', nombre:'Propalcote 115 gr C2S 70x100',  unidad:'resma', precio:58000  },
  { cod:'Cote-150-C2-1', nombre:'Propalcote 150 gr C2S 70x100',  unidad:'resma', precio:72000  },
  { cod:'Cote-200-C2-1', nombre:'Propalcote 200 gr C2S 70x100',  unidad:'resma', precio:89000  },
  { cod:'Cote-240-C2-1', nombre:'Propalcote 240 gr C2S 70x100',  unidad:'resma', precio:105000 },
  { cod:'Cote-300-C1-1', nombre:'Propalcote 300 gr C1S 70x100',  unidad:'resma', precio:125000 },
  { cod:'Ca-Ma-36-RB-1', nombre:'Cartulina Maule 0.36 R/Blanco', unidad:'resma', precio:95000  },
  { cod:'Ca-Ma-40-RB-1', nombre:'Cartulina Maule 0.40 R/Blanco', unidad:'resma', precio:110000 },
  { cod:'Mate-150-1',    nombre:'Propalmate 150 gr 70x100',      unidad:'resma', precio:68000  },
  { cod:'Mate-200-1',    nombre:'Propalmate 200 gr 70x100',      unidad:'resma', precio:85000  },
  { cod:'R-150-1',       nombre:'Reciclado Earth Pact 150 gr',   unidad:'resma', precio:52000  },
  { cod:'Lam-Bri',       nombre:'Laminado Brillante',            unidad:'m2',    precio:1200   },
  { cod:'Lam-Mat',       nombre:'Laminado Mate',                 unidad:'m2',    precio:1400   },
  { cod:'Arg-12',        nombre:'Argolla Doble O 12mm',          unidad:'caja',  precio:18000  },
  { cod:'Arg-19',        nombre:'Argolla Doble O 19mm',          unidad:'caja',  precio:22000  },
  { cod:'Col-Bon',       nombre:'Colbón',                        unidad:'litro', precio:12000  },
]

// ─── ACABADOS ────────────────────────────────────────────────────────────────
export const ACABADOS = [
  { cod:'lam-bri',  nombre:'Laminado Brillante',   precio:45  },
  { cod:'lam-mat',  nombre:'Laminado Mate',         precio:52  },
  { cod:'troquel',  nombre:'Troquelado',             precio:80  },
  { cod:'argolla',  nombre:'Argollado',              precio:120 },
  { cod:'hotst',    nombre:'Hot Stamping',           precio:150 },
  { cod:'estria',   nombre:'Estriado',               precio:35  },
  { cod:'repujar',  nombre:'Repujado',               precio:95  },
  { cod:'barniz',   nombre:'Barniz UV',              precio:60  },
]

// ─── PRODUCTOS TIPO (plantillas de cotización) ───────────────────────────────
export const PRODUCTOS_TIPO = [
  {
    cod:'tarjeta-presentacion',
    nombre:'Tarjeta de Presentación',
    descripcion:'9x5 cm, tiro y retiro',
    unidadMin: 500,
    materialDefault: 'Cote-300-C1-1',
    acabadosDefault: ['lam-bri'],
    procesos: ['P1','G1'],
    tiempoHoras: 2,
    precioBase: 180,
  },
  {
    cod:'volante-carta',
    nombre:'Volante Carta',
    descripcion:'21.5x28 cm, full color',
    unidadMin: 500,
    materialDefault: 'Cote-115-C2-1',
    acabadosDefault: [],
    procesos: ['P1','G1'],
    tiempoHoras: 3,
    precioBase: 95,
  },
  {
    cod:'brochure-tri',
    nombre:'Brochure Triptico',
    descripcion:'Carta, tiro y retiro, 3 cuerpos',
    unidadMin: 300,
    materialDefault: 'Cote-150-C2-1',
    acabadosDefault: ['lam-mat'],
    procesos: ['P1','G1','Tr'],
    tiempoHoras: 5,
    precioBase: 280,
  },
  {
    cod:'catalogo',
    nombre:'Catálogo / Revista',
    descripcion:'Carta, cosido o argollado',
    unidadMin: 100,
    materialDefault: 'Cote-115-C2-1',
    acabadosDefault: ['lam-bri','argolla'],
    procesos: ['P1','G1','Ar'],
    tiempoHoras: 8,
    precioBase: 850,
  },
  {
    cod:'empaque',
    nombre:'Empaque / Caja',
    descripcion:'Troquelado, armado',
    unidadMin: 200,
    materialDefault: 'Ca-Ma-40-RB-1',
    acabadosDefault: ['lam-bri','troquel'],
    procesos: ['P1','G1','Tr','En'],
    tiempoHoras: 10,
    precioBase: 650,
  },
  {
    cod:'talonario',
    nombre:'Talonario',
    descripcion:'Consecutivo, original y copia',
    unidadMin: 500,
    materialDefault: 'B-70-1',
    acabadosDefault: [],
    procesos: ['P1','G1'],
    tiempoHoras: 4,
    precioBase: 320,
  },
  {
    cod:'afiche',
    nombre:'Afiche / Póster',
    descripcion:'Tamaño pliego, full color',
    unidadMin: 100,
    materialDefault: 'Cote-200-C2-1',
    acabadosDefault: [],
    procesos: ['P1'],
    tiempoHoras: 2,
    precioBase: 380,
  },
  {
    cod:'cuaderno',
    nombre:'Cuaderno',
    descripcion:'Argollado, portada impresa',
    unidadMin: 100,
    materialDefault: 'B-70-1',
    acabadosDefault: ['lam-bri','argolla'],
    procesos: ['P1','G1','Ar'],
    tiempoHoras: 6,
    precioBase: 4500,
  },
]

// ─── CLIENTES (demo) ─────────────────────────────────────────────────────────
export const CLIENTES = [
  { id:1, nombre:'Grupo Éxito S.A.',          nit:'860002517-1', contacto:'María Fernanda López',  tel:'3001234567' },
  { id:2, nombre:'Universidad de Antioquia',   nit:'890980040-8', contacto:'Jorge Restrepo',        tel:'3112345678' },
  { id:3, nombre:'Bancolombia S.A.',           nit:'890903938-8', contacto:'Claudia Ríos',          tel:'3201234567' },
  { id:4, nombre:'Postobón S.A.',              nit:'860005586-5', contacto:'Andrés Cardona',        tel:'3151234567' },
  { id:5, nombre:'Alcaldía de Medellín',       nit:'800024390-4', contacto:'Patricia Herrera',      tel:'3001112233' },
  { id:6, nombre:'Distribuidora El Papelero',  nit:'811012345-2', contacto:'Luis Jaramillo',        tel:'3041234567' },
]

// ─── ACTIVIDADES ─────────────────────────────────────────────────────────────
export const ACTIVIDADES = [
  { cod:'1201', label:'Calibración',            area:'Litografía',    tipo:'directa' },
  { cod:'1202', label:'Arreglo Inicial',         area:'Litografía',    tipo:'directa' },
  { cod:'1203', label:'Impresión',               area:'Litografía',    tipo:'directa' },
  { cod:'1204', label:'Preparar Tintas',         area:'Litografía',    tipo:'directa' },
  { cod:'1205', label:'Esperar Secado',          area:'Litografía',    tipo:'directa' },
  { cod:'1301', label:'Preparar Maquina',        area:'Guillotina',    tipo:'directa' },
  { cod:'1302', label:'Cortar Papel Inicial',    area:'Guillotina',    tipo:'directa' },
  { cod:'1303', label:'Corte Final',             area:'Guillotina',    tipo:'directa' },
  { cod:'1401', label:'Preparar Maquina',        area:'Troquelado',    tipo:'directa' },
  { cod:'1403', label:'Troquelar',               area:'Troquelado',    tipo:'directa' },
  { cod:'1404', label:'Estriar',                 area:'Troquelado',    tipo:'directa' },
  { cod:'1408', label:'Hot Stamping',            area:'Troquelado',    tipo:'directa' },
  { cod:'1501', label:'Preparar Maquina',        area:'Plastificado',  tipo:'directa' },
  { cod:'1503', label:'Plastificar',             area:'Plastificado',  tipo:'directa' },
  { cod:'1602', label:'Engomar',                 area:'Engomadora',    tipo:'directa' },
  { cod:'1603', label:'Engomar y poner Caratula',area:'Engomadora',    tipo:'directa' },
  { cod:'1704', label:'Plegar',                  area:'Terminado',     tipo:'directa' },
  { cod:'1707', label:'Enganchar',               area:'Terminado',     tipo:'directa' },
  { cod:'1714', label:'Argollar',                area:'Terminado',     tipo:'directa' },
  { cod:'1722', label:'Empacar y Rotular',       area:'Terminado',     tipo:'directa' },
  { cod:'2105', label:'Hacer Aseo',              area:'General',       tipo:'indirecta' },
  { cod:'2107', label:'Mantenimiento Preventivo',area:'General',       tipo:'indirecta' },
  { cod:'2108', label:'Lubricación y Limpieza',  area:'General',       tipo:'indirecta' },
  { cod:'3101', label:'Esperando Aprobación',    area:'General',       tipo:'paro' },
  { cod:'3102', label:'Esperando Asignación',    area:'General',       tipo:'paro' },
  { cod:'3103', label:'Esperando Papel',         area:'General',       tipo:'paro' },
  { cod:'3104', label:'Esperando Producción',    area:'General',       tipo:'paro' },
  { cod:'3105', label:'Esperando Suministros',   area:'General',       tipo:'paro' },
  { cod:'4101', label:'Descanso Desayuno',       area:'General',       tipo:'legales' },
  { cod:'4102', label:'Descanso Almuerzo',       area:'General',       tipo:'legales' },
  { cod:'4104', label:'Incapacidad',             area:'General',       tipo:'legales' },
  { cod:'4105', label:'Permiso Remunerado',      area:'General',       tipo:'legales' },
]

// ─── ESTADOS OP ──────────────────────────────────────────────────────────────
export const OP_ESTADOS = {
  borrador:     { label:'Borrador',      color:'#888780', bg:'#F1EFE8' },
  cotizacion:   { label:'En cotización', color:'#185FA5', bg:'#E6F1FB' },
  aprobada:     { label:'Aprobada',      color:'#BA7517', bg:'#FAEEDA' },
  en_produccion:{ label:'En producción', color:'#1D9E75', bg:'#E1F5EE' },
  pausada:      { label:'Pausada',       color:'#A32D2D', bg:'#FCEBEB' },
  terminada:    { label:'Terminada',     color:'#534AB7', bg:'#EEEDFE' },
  despachada:   { label:'Despachada',    color:'#085041', bg:'#9FE1CB' },
}

export const TIPO_COLORS = {
  directa:   { dot:'#1D9E75', badge:'#E1F5EE', text:'#085041' },
  indirecta: { dot:'#185FA5', badge:'#E6F1FB', text:'#185FA5' },
  paro:      { dot:'#BA7517', badge:'#FAEEDA', text:'#BA7517' },
  legales:   { dot:'#888780', badge:'#F1EFE8', text:'#5F5E5A' },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export function fmtCOP(n) {
  return '$' + Math.round(n).toLocaleString('es-CO')
}
export function fmtMin(m) {
  if (!m || m <= 0) return '0m'
  const h = Math.floor(m / 60)
  const min = Math.round(m % 60)
  return h > 0 ? `${h}h ${min.toString().padStart(2,'0')}m` : `${min}m`
}
export function nowStr() {
  const d = new Date()
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0')
}
export function toMin(s) {
  if (!s) return null
  const [h, m] = s.split(':').map(Number)
  return h * 60 + m
}
export function todayISO() {
  return new Date().toISOString().slice(0,10)
}
export function genCod(prefix) {
  return prefix + '-' + Date.now().toString().slice(-6)
}
