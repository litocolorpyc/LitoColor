alter table tipos_acabado enable row level security;
alter table subordenes_acabados enable row level security;

create policy cat_tipos_acabado_select on tipos_acabado for select using (true);
create policy cat_subordenes_acabados_select on subordenes_acabados for select using (true);
-- Escritura: igual que el resto del esquema, solo vía servidor con
-- la Service Role Key (ver 0002_rls.sql).
