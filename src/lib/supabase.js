import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

/*
==========================================
  ESQUEMA SQL — ejecutar en Supabase SQL Editor
==========================================

-- Operarios
create table operarios (
  id serial primary key,
  nombre text not null,
  cargo text,
  pin text not null unique,
  iniciales text,
  activo boolean default true
);

-- Actividades (catálogo)
create table actividades (
  cod text primary key,
  label text not null,
  area text,
  tipo text check (tipo in ('directa','indirecta','paro','legales'))
);

-- Máquinas
create table maquinas (
  cod text primary key,
  nombre text not null,
  area text
);

-- Papeles / insumos
create table papeles (
  cod text primary key,
  nombre text not null
);

-- Registros de tiempo (corazón del sistema)
create table registros (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  operario_id int references operarios(id),
  actividad_cod text references actividades(cod),
  maquina_cod text references maquinas(cod),
  opp text,
  cantidad int,
  hora_inicio time,
  hora_fin time,
  dur_min numeric generated always as (
    extract(epoch from (hora_fin - hora_inicio))/60
  ) stored,
  reproceso boolean default false,
  paro boolean default false,
  comentario text,
  created_at timestamptz default now()
);

-- Consumo de papel
create table consumo_papel (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  operario_id int references operarios(id),
  opp text,
  papel_cod text references papeles(cod),
  hojas_entrada int,
  hojas_salida int,
  maculatura int,
  comentario text,
  created_at timestamptz default now()
);

-- Despachos
create table despachos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  opp text,
  referencia text,
  cantidad_despachada int,
  cantidad_inventario int,
  remision text,
  created_at timestamptz default now()
);

-- Datos iniciales: operarios
insert into operarios (nombre,cargo,pin,iniciales,activo) values
  ('James Rodriguez','Prensista','2501','JR',true),
  ('Andres Moreno','Troquelador','2502','AM',true),
  ('Juliana Cortes','Papeleras','2503','JC',true),
  ('Teresa Sierra','Papeleras','2504','TS',true),
  ('Alejandro Rodriguez','Mensajero','2505','AL',true),
  ('Maria Montoya','Papeleras','2506','MM',false),
  ('Luz Elena Carvajal','Papeleras','2507','LE',false),
  ('Paola Salazar','Papeleras','2508','PS',false),
  ('Juan Carlos Quintero','Operario','2509','JQ',true),
  ('Juan Manuel Quintero','Operario','2510','JM',true),
  ('Liliana Giraldo','Operario','2511','LG',true),
  ('Julian Quintero','Operario','2512','JQ',true);

-- Datos iniciales: máquinas
insert into maquinas (cod,nombre,area) values
  ('P1','GTO 525','Litografía'),
  ('P2','Adast Dominant 2','Litografía'),
  ('G1','Guillotina','Guillotina'),
  ('Tr','Troqueladora','Troquelado'),
  ('L1','Laminadora','Plastificado'),
  ('L2','Laminadora Manual','Plastificado'),
  ('D1','Xerox 700','Impresión Digital'),
  ('Ar','Argolladora','Terminado'),
  ('C1','Cosedora Manual 1','Terminado'),
  ('C2','Cosedora Manual 2','Terminado'),
  ('C3','Cosedora Manual 3','Terminado'),
  ('En','Engomadora','Terminado'),
  ('Pe','Perforadora','Terminado'),
  ('T','Taladro','Terminado');

-- Datos iniciales: actividades (muestra representativa)
insert into actividades (cod,label,area,tipo) values
  ('1203','Impresión','Litografía','directa'),
  ('1302','Cortar Papel Inicial','Guillotina','directa'),
  ('1303','Corte Final','Guillotina','directa'),
  ('1403','Troquelar','Troquelado','directa'),
  ('1404','Estriar','Troquelado','directa'),
  ('1503','Plastificar','Plastificado','directa'),
  ('1602','Engomar','Engomadora','directa'),
  ('1603','Engomar y poner Caratula','Engomadora','directa'),
  ('1704','Plegar','Terminado','directa'),
  ('1707','Enganchar','Terminado','directa'),
  ('1714','Argollar','Terminado','directa'),
  ('1722','Empacar y Rotular','Terminado','directa'),
  ('2105','Hacer Aseo','General','indirecta'),
  ('2108','Lubricación y Limpieza','General','indirecta'),
  ('2107','Hacer Mantenimiento Preventivo','General','indirecta'),
  ('3101','Esperando Aprobación','General','paro'),
  ('3102','Esperando Asignación','General','paro'),
  ('3103','Esperando Papel','General','paro'),
  ('3104','Esperando Producción','General','paro'),
  ('3105','Esperando Suministros','General','paro'),
  ('4101','Descanso Desayuno','General','legales'),
  ('4102','Descanso Almuerzo','General','legales'),
  ('4104','Incapacidad','General','legales'),
  ('4105','Permiso Remunerado','General','legales');
*/
