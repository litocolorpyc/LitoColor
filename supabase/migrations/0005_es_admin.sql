-- =========================================================
-- Antes, "¿quién ve el panel de administración?" se adivinaba
-- comparando el texto del campo `cargo` contra una lista fija en el
-- código ("Administrador", "Jefe de Producción", "Producción"). Como
-- ningún operario real tiene ese texto exacto en `cargo`, NADIE veía
-- el menú de Órdenes/Tableros/Catálogos. Se reemplaza por una bandera
-- explícita y editable desde el catálogo de Operarios.
-- =========================================================

alter table operarios add column es_admin boolean not null default false;

-- A todos los operarios ya cargados se les activa por ahora, para que
-- quien configuró el sistema pueda entrar y administrar todo. Luego,
-- desde Catálogos → Operarios, se puede desmarcar a quienes solo deban
-- ver "Registrar tiempo" (el personal de planta).
update operarios set es_admin = true;
