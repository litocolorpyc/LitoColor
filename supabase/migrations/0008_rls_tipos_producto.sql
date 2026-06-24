alter table tipos_producto enable row level security;
alter table tipos_producto_piezas enable row level security;
alter table tipos_producto_campos enable row level security;

create policy cat_tipos_producto_select on tipos_producto for select using (true);
create policy cat_tipos_producto_piezas_select on tipos_producto_piezas for select using (true);
create policy cat_tipos_producto_campos_select on tipos_producto_campos for select using (true);
-- Escritura: igual que el resto del esquema, solo vía servidor con la
-- Service Role Key (ver 0002_rls.sql).
