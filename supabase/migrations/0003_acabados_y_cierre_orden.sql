-- =========================================================
-- Ajustes: catálogo editable de Tipos de Acabado, costeo de
-- máquina al CERRAR la orden, y eliminación del PIN de acceso.
-- =========================================================

-- ---------- Catálogo editable: Tipos de Acabado ----------
create table tipos_acabado (
  id          uuid primary key default gen_random_uuid(),
  codigo      text unique,
  nombre      text not null unique,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Relación muchos-a-muchos: una suborden puede tener varios acabados
create table subordenes_acabados (
  suborden_id     uuid not null references subordenes(id) on delete cascade,
  tipo_acabado_id uuid not null references tipos_acabado(id),
  primary key (suborden_id, tipo_acabado_id)
);

-- El campo `acabados` (jsonb) de subordenes deja de usarse para
-- checkboxes fijos; se conserva únicamente para notas libres, ej:
-- {"notas": "Laminado solo en carátula, no en contras"}
comment on column subordenes.acabados is
  'Notas libres sobre acabados. La lista de acabados seleccionados vive en subordenes_acabados.';

-- ---------- Costeo de máquina al cierre de la orden ----------
-- Por decisión del cliente: el valor/hora de máquina NO se suma en cada
-- registro de tiempo, sino que se calcula una sola vez, al cerrar la
-- orden (estado -> 'Terminada'), sumando sobre todo el histórico de
-- registros de esa orden el tiempo_labor_horas * maquinas.valor_hora
-- (solo para los registros que tienen máquina asociada).

alter table ordenes add column costo_mano_obra numeric(14,2);
alter table ordenes add column costo_maquina   numeric(14,2);
alter table ordenes add column costo_total      numeric(14,2);
alter table ordenes add column fecha_cierre     timestamptz;

create or replace function fn_cerrar_orden(p_orden_id uuid)
returns void language plpgsql as $$
declare
  v_mano_obra numeric(14,2);
  v_maquina   numeric(14,2);
begin
  select coalesce(sum(r.valor_actividad), 0)
    into v_mano_obra
  from registros_produccion r
  join subordenes s on s.id = r.suborden_id
  where s.orden_id = p_orden_id;

  select coalesce(sum(r.tiempo_labor_horas * m.valor_hora), 0)
    into v_maquina
  from registros_produccion r
  join subordenes s on s.id = r.suborden_id
  join maquinas m on m.id = r.maquina_id
  where s.orden_id = p_orden_id;

  update ordenes
  set estado = 'Terminada',
      costo_mano_obra = v_mano_obra,
      costo_maquina = v_maquina,
      costo_total = v_mano_obra + v_maquina,
      fecha_cierre = now()
  where id = p_orden_id;
end;
$$;

-- ---------- Acceso sin autenticación fuerte ----------
-- Ya no se usa codigo_seguridad como PIN de acceso: el operario solo
-- selecciona su nombre. Se deja la columna por si se reutiliza para
-- otro propósito (p. ej. control de horario en máquina externa), pero
-- deja de tener uso/validación en la app.
comment on column operarios.codigo_seguridad is
  'Histórico (Excel). Ya NO se usa para iniciar sesión: el acceso es solo por nombre.';
