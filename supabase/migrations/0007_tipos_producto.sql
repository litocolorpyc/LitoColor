-- =========================================================
-- Parametrización por tipo de producto.
--
-- Problema: un afiche se describe con 4-5 datos; un cuaderno necesita
-- 5 piezas (Carátula, Guarda, Interiores, Cartón, Insertos) cada una
-- con sus propios datos; un mazo de cartas o un calendario plegable
-- pueden necesitar datos que hoy no existen en ningún campo fijo
-- (ej. "cartas por mazo", "meses por calendario").
--
-- Solución: cada Tipo de Producto define
--   (a) qué piezas suele tener (para generarlas de un clic al crear
--       la orden, en vez de escribir cada una a mano), y
--   (b) qué campos adicionales aplican (más allá de los fijos de
--       `subordenes`), con su tipo de dato — sin tocar código cada
--       vez que aparece un producto nuevo.
-- =========================================================

create table tipos_producto (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null unique,      -- ej. 'Cuaderno argollado'
  descripcion text,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table tipos_producto_piezas (
  id              uuid primary key default gen_random_uuid(),
  tipo_producto_id uuid not null references tipos_producto(id) on delete cascade,
  nombre_pieza    text not null,         -- ej. 'Carátula', 'Guarda'
  orden_sugerido  int not null default 0,
  activo          boolean not null default true
);

create table tipos_producto_campos (
  id               uuid primary key default gen_random_uuid(),
  tipo_producto_id uuid not null references tipos_producto(id) on delete cascade,
  clave            text not null,        -- ej. 'cartas_por_mazo' (sin espacios, para usar como key de jsonb)
  etiqueta         text not null,        -- ej. 'Cartas por mazo' (lo que ve el usuario)
  tipo_dato        text not null default 'texto' check (tipo_dato in ('texto', 'numero', 'booleano')),
  orden_sugerido   int not null default 0,
  activo           boolean not null default true,
  unique (tipo_producto_id, clave)
);

-- Cada orden es de un tipo de producto (opcional: puede quedar sin
-- clasificar y se maneja como hasta ahora, campo por campo).
alter table ordenes add column tipo_producto_id uuid references tipos_producto(id);

-- Donde se guardan los valores de los campos personalizados de cada
-- suborden, ej: {"cartas_por_mazo": 52, "acabado_caja": "Mate"}.
alter table subordenes add column campos_personalizados jsonb not null default '{}'::jsonb;
