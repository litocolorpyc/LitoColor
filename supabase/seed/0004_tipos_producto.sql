-- Tipos de producto de ejemplo, a partir de las 3 órdenes que Diana
-- compartió. Son solo el punto de partida — se administran después
-- desde Catálogos → Tipos de producto.

insert into tipos_producto (nombre, descripcion) values
  ('Cuaderno argollado', 'Cuaderno con carátula, guarda, interiores, cartón e insertos'),
  ('Caja plegadiza', 'Caja troquelada de una sola pieza'),
  ('Afiche', 'Pieza impresa simple, sin acabados complejos')
on conflict (nombre) do nothing;

insert into tipos_producto_piezas (tipo_producto_id, nombre_pieza, orden_sugerido)
select id, pieza, orden from tipos_producto, (values
  ('Carátula', 1), ('Guarda', 2), ('Interiores', 3), ('Cartón', 4), ('Insertos', 5)
) as p(pieza, orden)
where tipos_producto.nombre = 'Cuaderno argollado';

insert into tipos_producto_piezas (tipo_producto_id, nombre_pieza, orden_sugerido)
select id, 'Caja', 1 from tipos_producto where nombre = 'Caja plegadiza';

insert into tipos_producto_piezas (tipo_producto_id, nombre_pieza, orden_sugerido)
select id, 'Afiche', 1 from tipos_producto where nombre = 'Afiche';
