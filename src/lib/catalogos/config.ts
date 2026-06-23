export type CampoConfig = {
  key: string;
  label: string;
  type: "text" | "number" | "fk";
  fkTabla?: string;       // tabla referenciada (si type === 'fk')
  fkEtiqueta?: string;    // columna a mostrar como etiqueta de la fk
  requerido?: boolean;
};

export type CatalogoConfig = {
  slug: string;
  tabla: string;
  titulo: string;
  descripcion: string;
  campos: CampoConfig[];
  ordenarPor: string;
};

// Único lugar donde se define qué catálogos son administrables desde
// /catalogos. Agregar uno nuevo es agregar una entrada aquí: la pantalla
// de listar/crear/editar/retirar es genérica para todos.
export const CATALOGOS: Record<string, CatalogoConfig> = {
  areas: {
    slug: "areas",
    tabla: "areas",
    titulo: "Áreas",
    descripcion: "Áreas de planta (Litografía, Guillotina, Plastificado, Terminado…).",
    ordenarPor: "codigo",
    campos: [
      { key: "codigo", label: "Código", type: "number", requerido: true },
      { key: "nombre", label: "Nombre", type: "text", requerido: true },
    ],
  },
  actividades: {
    slug: "actividades",
    tabla: "actividades",
    titulo: "Códigos y actividades",
    descripcion: "El catálogo que se ve en el formulario de registro de tiempo.",
    ordenarPor: "codigo",
    campos: [
      { key: "codigo", label: "Código", type: "number", requerido: true },
      { key: "nombre", label: "Actividad", type: "text", requerido: true },
      { key: "area_id", label: "Área", type: "fk", fkTabla: "areas", fkEtiqueta: "nombre", requerido: true },
    ],
  },
  maquinas: {
    slug: "maquinas",
    tabla: "maquinas",
    titulo: "Máquinas",
    descripcion: "Su valor/hora se usa para calcular el costo de máquina al cerrar cada orden.",
    ordenarPor: "codigo",
    campos: [
      { key: "codigo", label: "Código", type: "text", requerido: true },
      { key: "nombre", label: "Nombre", type: "text", requerido: true },
      { key: "area_id", label: "Área", type: "fk", fkTabla: "areas", fkEtiqueta: "nombre" },
      { key: "valor_hora", label: "Valor/hora", type: "number", requerido: true },
    ],
  },
  operarios: {
    slug: "operarios",
    tabla: "operarios",
    titulo: "Operarios",
    descripcion: "Lista de la que el operario elige su nombre al iniciar turno (sin contraseña).",
    ordenarPor: "codigo",
    campos: [
      { key: "codigo", label: "Código", type: "number", requerido: true },
      { key: "nombre", label: "Nombre", type: "text", requerido: true },
      { key: "cargo", label: "Cargo", type: "text" },
      { key: "valor_hora", label: "Valor/hora", type: "number", requerido: true },
    ],
  },
  papeles: {
    slug: "papeles",
    tabla: "papeles",
    titulo: "Papeles",
    descripcion: "Catálogo de materiales/papel usado en la ficha técnica de cada suborden.",
    ordenarPor: "codigo",
    campos: [
      { key: "codigo", label: "Código", type: "text", requerido: true },
      { key: "nombre", label: "Nombre", type: "text", requerido: true },
    ],
  },
  "tipos-acabado": {
    slug: "tipos-acabado",
    tabla: "tipos_acabado",
    titulo: "Tipos de acabado",
    descripcion: "Lista de acabados disponibles al crear una suborden (laminado, barniz UV, troquelado…).",
    ordenarPor: "nombre",
    campos: [
      { key: "codigo", label: "Código", type: "text" },
      { key: "nombre", label: "Nombre", type: "text", requerido: true },
    ],
  },
  clientes: {
    slug: "clientes",
    tabla: "clientes",
    titulo: "Clientes",
    descripcion: "Clientes de LitoColor.",
    ordenarPor: "nombre",
    campos: [{ key: "nombre", label: "Nombre", type: "text", requerido: true }],
  },
};
