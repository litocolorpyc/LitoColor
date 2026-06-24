-- El buscador de OPP del formulario de registro de tiempo debe mostrar
-- solo subórdenes de órdenes "vivas" (no Terminadas/Anuladas), para que
-- nadie registre tiempo por error contra una orden ya cerrada y costeada.

create or replace view v_subordenes_buscador as
select
  s.id,
  s.opp,
  s.producto,
  s.pieza,
  o.numero_orden,
  c.nombre as cliente,
  s.estado,
  o.estado as estado_orden
from subordenes s
join ordenes o on o.id = s.orden_id
left join clientes c on c.id = o.cliente_id
where o.estado not in ('Terminada', 'Anulada');
