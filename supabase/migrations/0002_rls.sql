-- =========================================================
-- Seguridad (RLS) — Operario vs Administrador
-- =========================================================
-- Modelo de acceso elegido (ver supuestos en README):
-- No usamos Supabase Auth completo todavía. El "login" es liviano:
-- el operario selecciona su nombre + su Código de Seguridad (PIN, ya
-- existe en su Excel "Desplegables"). La sesión se valida en el
-- servidor (Next.js) con una Server Action que confirma el PIN contra
-- la tabla `operarios` y emite una cookie de sesión propia firmada.
--
-- Por eso, en esta primera fase, todas las consultas a Supabase desde
-- el navegador NO usan la anon key directamente para escritura: se
-- hacen vía Server Actions/Route Handlers con la Service Role key en
-- el servidor, y RLS queda como segunda capa de protección.
--
-- Dejamos RLS activado con políticas permisivas controladas por una
-- claim simple (app_role) que el backend puede setear via
-- `set_config` en cada conexión si en el futuro se decide usar
-- Supabase Auth nativo con JWT de roles.

alter table areas enable row level security;
alter table actividades enable row level security;
alter table maquinas enable row level security;
alter table operarios enable row level security;
alter table papeles enable row level security;
alter table clientes enable row level security;
alter table ordenes enable row level security;
alter table subordenes enable row level security;
alter table registros_produccion enable row level security;

-- Lectura de catálogos: abierta (la app interna los necesita para llenar selects)
create policy cat_areas_select on areas for select using (true);
create policy cat_actividades_select on actividades for select using (true);
create policy cat_maquinas_select on maquinas for select using (true);
create policy cat_operarios_select on operarios for select using (true);
create policy cat_papeles_select on papeles for select using (true);
create policy cat_clientes_select on clientes for select using (true);
create policy cat_ordenes_select on ordenes for select using (true);
create policy cat_subordenes_select on subordenes for select using (true);
create policy cat_registros_select on registros_produccion for select using (true);

-- Escritura: bloqueada para el cliente anon. Todas las escrituras pasan
-- por el servidor con la Service Role Key (que ignora RLS por diseño).
-- No se crean policies de insert/update/delete para el rol anon/authenticated;
-- esto las deja denegadas por defecto.
