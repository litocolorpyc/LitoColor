-- =========================================================
-- LitoColor — Esquema inicial de Control de Producción
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------- CATÁLOGOS MAESTROS ----------

create table areas (
  id          uuid primary key default gen_random_uuid(),
  codigo      int not null unique,        -- ej. 7
  nombre      text not null unique,       -- ej. 'Terminado'
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table actividades (
  id              uuid primary key default gen_random_uuid(),
  codigo          int not null unique,         -- ej. 1503
  area_id         uuid not null references areas(id),
  nombre          text not null,               -- ej. 'Plastificar'
  codigo_actividad text not null,              -- ej. '1503 - Plastificar' (para mostrar en listas)
  activo          boolean not null default true,
  created_at      timestamptz not null default now()
);

create table maquinas (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null unique,        -- ej. 'G1'
  nombre      text not null,               -- ej. 'Guillotina'
  area_id     uuid references areas(id),
  valor_hora  numeric(12,2) not null default 0,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table operarios (
  id              uuid primary key default gen_random_uuid(),
  codigo          int not null unique,        -- CodOperario del Excel
  nombre          text not null,
  cargo           text,
  valor_hora      numeric(12,2) not null default 0,
  codigo_seguridad text unique,               -- PIN de acceso (ya existe en su Excel: Codigo de Seguridad)
  activo          boolean not null default true,
  user_id         uuid references auth.users(id), -- opcional: si en el futuro se usa Supabase Auth real
  created_at      timestamptz not null default now()
);

create table papeles (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null unique,         -- ej. 'B-70-1'
  nombre      text not null,                -- ej. 'Bond 70 gr 70x100'
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table clientes (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null unique,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- ÓRDENES DE PRODUCCIÓN ----------

create table ordenes (
  id                  uuid primary key default gen_random_uuid(),
  numero_orden        int not null unique,     -- ej. 5944
  cliente_id          uuid references clientes(id),
  fecha               date not null default current_date,
  descripcion_general text,
  estado              text not null default 'Abierta' check (estado in ('Abierta','En Proceso','Terminada','Anulada')),
  created_at          timestamptz not null default now()
);

create table subordenes (
  id                    uuid primary key default gen_random_uuid(),
  orden_id              uuid not null references ordenes(id) on delete cascade,
  numero_suborden       int not null,
  opp                   text not null unique,   -- 'numero_orden-numero_suborden', ej '5944-3'
  producto              text,
  pieza                 text,
  cantidad_solicitada   numeric(12,2),
  cantidad_programada   numeric(12,2),
  papel_id              uuid references papeles(id),
  tintas_tiro           int,
  tintas_retiro         int,
  ancho_cm              numeric(8,2),
  alto_cm               numeric(8,2),
  ctp                   text,
  unidades_por_montaje  numeric(10,2),
  tamanos_por_pliego    numeric(10,2),
  pliegos               numeric(12,2),
  acabados              jsonb not null default '{}'::jsonb,  -- {laminado_mate:true, barniz_uv:false, troquelado:true, talonarios:false, argollado:true, otros:"texto libre"}
  estado                text not null default 'Pendiente' check (estado in ('Pendiente','En Proceso','Terminada','Anulada')),
  created_at            timestamptz not null default now(),
  unique (orden_id, numero_suborden)
);

create index idx_subordenes_orden on subordenes(orden_id);

-- ---------- REGISTROS DE PRODUCCIÓN (reemplazo del formulario) ----------

create table registros_produccion (
  id                      uuid primary key default gen_random_uuid(),
  fecha                   date not null default current_date,
  operario_id             uuid not null references operarios(id),
  suborden_id             uuid references subordenes(id),   -- nullable: labores indirectas (aseo, espera, etc.) no tienen OPP
  actividad_id            uuid not null references actividades(id),
  maquina_id              uuid references maquinas(id),
  hora_inicio             timestamptz not null,
  hora_fin                timestamptz,
  tiempo_labor_horas      numeric(10,4) generated always as (
                            case when hora_fin is null then null
                            else round((extract(epoch from (hora_fin - hora_inicio)) / 3600.0)::numeric, 4)
                            end
                          ) stored,
  cantidad_producida_texto text,        -- se deja como texto porque en planta se registra mixto ("9 Millares", "265 tiro/retiro", etc.)
  cantidad_producida_num   numeric(14,2), -- valor numérico cuando aplica, para sumar en reportes
  reproceso               boolean not null default false,
  comentario              text,
  materia_prima           text,
  consumo_materia_prima   text,
  remision                text,
  cantidad_despachada     numeric(14,2),
  cantidad_inventario     numeric(14,2),
  documento_url           text,
  valor_actividad         numeric(14,2) generated always as (null) stored, -- se reemplaza por trigger (ver abajo)
  created_at              timestamptz not null default now()
);

-- valor_actividad no puede ir en "generated always" porque depende de otra tabla (operarios.valor_hora).
-- Se recalcula con un trigger en vez de columna generada:
alter table registros_produccion drop column valor_actividad;
alter table registros_produccion add column valor_actividad numeric(14,2);

create or replace function fn_calcular_valor_actividad()
returns trigger language plpgsql as $$
declare
  v_valor_hora numeric(12,2);
begin
  if new.hora_fin is not null then
    select valor_hora into v_valor_hora from operarios where id = new.operario_id;
    new.valor_actividad := round(
      (extract(epoch from (new.hora_fin - new.hora_inicio)) / 3600.0)::numeric * coalesce(v_valor_hora,0)
    , 2);
  else
    new.valor_actividad := null;
  end if;
  return new;
end;
$$;

create trigger trg_calcular_valor_actividad
before insert or update on registros_produccion
for each row execute function fn_calcular_valor_actividad();

create index idx_registros_suborden on registros_produccion(suborden_id);
create index idx_registros_operario on registros_produccion(operario_id);
create index idx_registros_fecha on registros_produccion(fecha);

-- ---------- VISTA: OPP "buscable" con datos de cliente/orden para el formulario ----------

create or replace view v_subordenes_buscador as
select
  s.id,
  s.opp,
  s.producto,
  s.pieza,
  o.numero_orden,
  c.nombre as cliente,
  s.estado
from subordenes s
join ordenes o on o.id = s.orden_id
left join clientes c on c.id = o.cliente_id;

-- ---------- VISTA: equivalente a la hoja "Resumen" (costo y horas por área) ----------

create or replace view v_resumen_por_orden_area as
select
  o.numero_orden,
  a.nombre as area,
  sum(r.tiempo_labor_horas) as horas,
  sum(r.valor_actividad) as costo
from registros_produccion r
join actividades act on act.id = r.actividad_id
join areas a on a.id = act.area_id
left join subordenes s on s.id = r.suborden_id
left join ordenes o on o.id = s.orden_id
group by o.numero_orden, a.nombre;

-- ---------- VISTA: horas por operario y semana ----------

create or replace view v_horas_por_operario_semana as
select
  op.nombre as operario,
  date_trunc('week', r.fecha)::date as semana,
  sum(r.tiempo_labor_horas) as horas,
  sum(r.valor_actividad) as costo
from registros_produccion r
join operarios op on op.id = r.operario_id
group by op.nombre, date_trunc('week', r.fecha);
