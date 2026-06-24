import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  crearSuborden,
  actualizarSuborden,
  actualizarOrden,
  cerrarOrden,
  generarPiezasDesdeTemplate,
} from "../actions";

function money(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  return `$${Number(v).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
}

export default async function DetalleOrdenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; editar?: string }>;
}) {
  const { id } = await params;
  const { error, editar } = await searchParams;
  const supabase = supabaseAdmin();

  const { data: orden } = await supabase
    .from("ordenes")
    .select(
      "id, numero_orden, fecha, estado, descripcion_general, costo_mano_obra, costo_maquina, costo_total, fecha_cierre, tipo_producto_id, clientes(nombre), tipos_producto(nombre)"
    )
    .eq("id", id)
    .single();

  const { data: subordenes } = await supabase
    .from("subordenes")
    .select("*, papeles(nombre), subordenes_acabados(tipo_acabado_id, tipos_acabado(nombre))")
    .eq("orden_id", id)
    .order("numero_suborden");

  const { data: tiposAcabado } = await supabase
    .from("tipos_acabado")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  const { data: papeles } = await supabase
    .from("papeles")
    .select("id, codigo, nombre")
    .eq("activo", true)
    .order("codigo");

  const { data: tiposProducto } = await supabase
    .from("tipos_producto")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  const { data: resumen } = await supabase
    .from("v_resumen_por_orden_area")
    .select("*")
    .eq("numero_orden", orden?.numero_orden ?? -1);

  if (!orden) {
    return <p>Orden no encontrada.</p>;
  }

  const cliente = (orden.clientes as unknown as { nombre: string } | null)?.nombre;
  const tipoProducto = (orden.tipos_producto as unknown as { nombre: string } | null)?.nombre;
  const siguienteNumero = (subordenes?.at(-1)?.numero_suborden ?? -1) + 1;
  const cerrada = orden.estado === "Terminada";

  const { data: piezasTemplate } = orden.tipo_producto_id
    ? await supabase
        .from("tipos_producto_piezas")
        .select("id")
        .eq("tipo_producto_id", orden.tipo_producto_id)
        .eq("activo", true)
    : { data: [] };

  const { data: camposTemplate } = orden.tipo_producto_id
    ? await supabase
        .from("tipos_producto_campos")
        .select("*")
        .eq("tipo_producto_id", orden.tipo_producto_id)
        .eq("activo", true)
        .order("orden_sugerido")
    : { data: [] };

  const subordenEnEdicion = editar ? subordenes?.find((s) => s.id === editar) : null;
  const acabadosSeleccionados = new Set(
    (
      (subordenEnEdicion?.subordenes_acabados as { tipo_acabado_id: string }[] | undefined) ?? []
    ).map((sa) => sa.tipo_acabado_id)
  );
  const camposActuales = (subordenEnEdicion?.campos_personalizados ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-8">
      <Link href="/ordenes" className="text-sm text-text-muted hover:underline">
        ← Volver a Órdenes
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="codigo text-text-muted text-sm">ORDEN</p>
          <h1 className="text-2xl font-bold codigo">{orden.numero_orden}</h1>
          <p className="text-text-muted">
            {cliente} · {orden.fecha} · {orden.estado}
            {tipoProducto && <> · <span className="text-accent">{tipoProducto}</span></>}
          </p>
        </div>
        {!cerrada && (
          <form action={cerrarOrden}>
            <input type="hidden" name="orden_id" value={orden.id} />
            <button type="submit" className="btn-primary px-4 py-2">
              Cerrar orden
            </button>
          </form>
        )}
      </div>

      {error && <div className="card p-3 border-danger text-danger bg-red-50">{error}</div>}

      {!cerrada && (
        <details className="card p-4">
          <summary className="cursor-pointer font-medium">✎ Editar datos de la orden</summary>
          <form action={actualizarOrden} className="mt-4 space-y-4 max-w-md">
            <input type="hidden" name="orden_id" value={orden.id} />
            <div>
              <label className="block text-sm font-medium mb-1">Número de orden</label>
              <input
                type="number"
                name="numero_orden"
                defaultValue={orden.numero_orden}
                required
                className="input-field w-full codigo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <input type="text" name="cliente" defaultValue={cliente ?? ""} required className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de producto</label>
              <select name="tipo_producto_id" className="input-field w-full" defaultValue={orden.tipo_producto_id ?? ""}>
                <option value="">— Sin clasificar —</option>
                {tiposProducto?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <input type="date" name="fecha" defaultValue={orden.fecha} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción general</label>
              <textarea
                name="descripcion_general"
                rows={3}
                defaultValue={orden.descripcion_general ?? ""}
                className="input-field w-full"
              />
            </div>
            <button type="submit" className="btn-accent px-5 py-2">
              Guardar cambios
            </button>
          </form>
        </details>
      )}

      {cerrada && (
        <section className="card p-5">
          <h2 className="font-semibold mb-3">Costo final (calculado al cierre)</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-text-muted">Mano de obra</p>
              <p className="text-lg font-semibold">{money(orden.costo_mano_obra)}</p>
            </div>
            <div>
              <p className="text-text-muted">Máquina</p>
              <p className="text-lg font-semibold">{money(orden.costo_maquina)}</p>
            </div>
            <div>
              <p className="text-text-muted">Total</p>
              <p className="text-lg font-semibold text-accent">{money(orden.costo_total)}</p>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-3">
            Cerrada el {orden.fecha_cierre ? new Date(orden.fecha_cierre).toLocaleString("es-CO") : "—"}
          </p>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Subórdenes (OPP)</h2>
          {!cerrada && orden.tipo_producto_id && !!piezasTemplate?.length && (
            <form action={generarPiezasDesdeTemplate}>
              <input type="hidden" name="orden_id" value={orden.id} />
              <input type="hidden" name="numero_orden" value={orden.numero_orden} />
              <input type="hidden" name="tipo_producto_id" value={orden.tipo_producto_id} />
              <input type="hidden" name="siguiente_numero" value={siguienteNumero} />
              <button type="submit" className="btn-accent px-4 py-2 text-sm">
                Generar piezas de &quot;{tipoProducto}&quot; ({piezasTemplate.length})
              </button>
            </form>
          )}
        </div>

        <div className="card overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-paper border-b border-line text-left">
              <tr>
                <th className="px-3 py-2 codigo">OPP</th>
                <th className="px-3 py-2">Trabajo / Pieza</th>
                <th className="px-3 py-2">Cant. solicitada</th>
                <th className="px-3 py-2">Papel</th>
                <th className="px-3 py-2">Acabados</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {subordenes?.map((s) => {
                const nombresAcabado = (
                  s.subordenes_acabados as { tipos_acabado: { nombre: string } | null }[]
                )
                  ?.map((sa) => sa.tipos_acabado?.nombre)
                  .filter(Boolean);
                const notas = (s.acabados as { notas?: string } | null)?.notas;
                const campos = (s.campos_personalizados ?? {}) as Record<string, unknown>;
                const camposTexto = Object.entries(campos)
                  .map(([k, v]) => `${k.replaceAll("_", " ")}: ${v}`)
                  .join(", ");
                return (
                  <tr key={s.id} className={`border-b border-line last:border-0 ${editar === s.id ? "bg-accent-soft" : ""}`}>
                    <td className="px-3 py-2 codigo">{s.opp}</td>
                    <td className="px-3 py-2">
                      {s.producto || s.pieza}
                      {camposTexto && <p className="text-xs text-text-muted">{camposTexto}</p>}
                    </td>
                    <td className="px-3 py-2">{s.cantidad_solicitada ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">
                      {(s.papeles as unknown as { nombre: string } | null)?.nombre ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {nombresAcabado?.join(", ") || "—"}
                      {notas ? ` · ${notas}` : ""}
                    </td>
                    <td className="px-3 py-2">{s.estado}</td>
                    <td className="px-3 py-2 text-right">
                      {!cerrada && (
                        <Link href={`/ordenes/${orden.id}?editar=${s.id}`} className="text-accent text-sm underline">
                          Editar
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!subordenes?.length && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-text-muted text-center">
                    Aún no hay subórdenes. Agrega la primera abajo
                    {orden.tipo_producto_id && !!piezasTemplate?.length
                      ? ", o genera todas las de la plantilla con el botón de arriba."
                      : "."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!cerrada && (
          <details className="card p-4" open={!!subordenEnEdicion}>
            <summary className="cursor-pointer font-medium">
              {subordenEnEdicion ? `✎ Editando ${subordenEnEdicion.opp}` : "+ Agregar suborden (OPP)"}
            </summary>
            <form
              action={subordenEnEdicion ? actualizarSuborden : crearSuborden}
              className="mt-4 space-y-5"
            >
              <input type="hidden" name="orden_id" value={orden.id} />
              <input type="hidden" name="numero_orden" value={orden.numero_orden} />
              {subordenEnEdicion && <input type="hidden" name="suborden_id" value={subordenEnEdicion.id} />}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">N° suborden</label>
                  <input
                    type="number"
                    name="numero_suborden"
                    defaultValue={subordenEnEdicion?.numero_suborden ?? siguienteNumero}
                    required
                    className="input-field w-full codigo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Producto / Trabajo</label>
                  <input
                    type="text"
                    name="producto"
                    defaultValue={subordenEnEdicion?.producto ?? ""}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pieza</label>
                  <input
                    type="text"
                    name="pieza"
                    defaultValue={subordenEnEdicion?.pieza ?? ""}
                    placeholder="Carátula, Guarda, Interiores…"
                    className="input-field w-full"
                  />
                </div>
                <div />
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad solicitada</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cantidad_solicitada"
                    defaultValue={subordenEnEdicion?.cantidad_solicitada ?? ""}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad programada</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cantidad_programada"
                    defaultValue={subordenEnEdicion?.cantidad_programada ?? ""}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Papel</label>
                  <select name="papel_id" className="input-field w-full" defaultValue={subordenEnEdicion?.papel_id ?? ""}>
                    <option value="">— Sin definir —</option>
                    {papeles?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} · {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tintas tiro</label>
                    <input
                      type="number"
                      name="tintas_tiro"
                      defaultValue={subordenEnEdicion?.tintas_tiro ?? ""}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tintas retiro</label>
                    <input
                      type="number"
                      name="tintas_retiro"
                      defaultValue={subordenEnEdicion?.tintas_retiro ?? ""}
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </div>

              <details open={!!subordenEnEdicion}>
                <summary className="cursor-pointer text-sm font-medium text-accent">
                  + Imposición y corte (solo si aplica: tamaño de pliego, montajes…)
                </summary>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ancho (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="ancho_cm"
                      defaultValue={subordenEnEdicion?.ancho_cm ?? ""}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Alto (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="alto_cm"
                      defaultValue={subordenEnEdicion?.alto_cm ?? ""}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CTP</label>
                    <input
                      type="text"
                      name="ctp"
                      defaultValue={subordenEnEdicion?.ctp ?? ""}
                      placeholder="Convencional…"
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unidades por montaje</label>
                    <input
                      type="number"
                      step="0.01"
                      name="unidades_por_montaje"
                      defaultValue={subordenEnEdicion?.unidades_por_montaje ?? ""}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tamaños por pliego</label>
                    <input
                      type="number"
                      step="0.01"
                      name="tamanos_por_pliego"
                      defaultValue={subordenEnEdicion?.tamanos_por_pliego ?? ""}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pliegos</label>
                    <input
                      type="number"
                      step="0.01"
                      name="pliegos"
                      defaultValue={subordenEnEdicion?.pliegos ?? ""}
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </details>

              {!!camposTemplate?.length && (
                <div className="border-t border-line pt-4">
                  <p className="text-sm font-medium mb-2">
                    Campos de &quot;{tipoProducto}&quot;
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {camposTemplate.map((c) => (
                      <div key={c.id}>
                        <label className="block text-sm font-medium mb-1">{c.etiqueta}</label>
                        {c.tipo_dato === "booleano" ? (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name={`campo__${c.clave}`}
                              value="true"
                              defaultChecked={Boolean(camposActuales[c.clave])}
                            />
                            <span className="text-sm text-text-muted">Sí</span>
                          </label>
                        ) : (
                          <input
                            type={c.tipo_dato === "numero" ? "number" : "text"}
                            step={c.tipo_dato === "numero" ? "0.01" : undefined}
                            name={`campo__${c.clave}`}
                            defaultValue={(camposActuales[c.clave] as string) ?? ""}
                            className="input-field w-full"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-line pt-4">
                <p className="text-sm font-medium mb-2">
                  Acabados{" "}
                  <Link href="/catalogos/tipos-acabado" className="text-xs text-accent underline">
                    (editar lista)
                  </Link>
                </p>
                <div className="flex flex-wrap gap-4">
                  {tiposAcabado?.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="tipos_acabado_id"
                        value={t.id}
                        defaultChecked={acabadosSeleccionados.has(t.id)}
                      />{" "}
                      {t.nombre}
                    </label>
                  ))}
                  {!tiposAcabado?.length && (
                    <p className="text-sm text-text-muted">
                      No hay tipos de acabado activos todavía.
                    </p>
                  )}
                </div>
                <input
                  type="text"
                  name="notas_acabados"
                  placeholder="Notas adicionales sobre acabados (texto libre)"
                  defaultValue={(subordenEnEdicion?.acabados as { notas?: string } | null)?.notas ?? ""}
                  className="input-field w-full mt-2"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-accent px-5 py-2">
                  {subordenEnEdicion ? "Guardar cambios" : "Guardar suborden"}
                </button>
                {subordenEnEdicion && (
                  <Link href={`/ordenes/${orden.id}`} className="px-5 py-2 text-text-muted">
                    Cancelar
                  </Link>
                )}
              </div>
            </form>
          </details>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-3">Horas y costo de mano de obra por área (en vivo)</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper border-b border-line text-left">
              <tr>
                <th className="px-3 py-2">Área</th>
                <th className="px-3 py-2">Horas</th>
                <th className="px-3 py-2">Costo</th>
              </tr>
            </thead>
            <tbody>
              {resumen?.map((r) => (
                <tr key={r.area} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{r.area}</td>
                  <td className="px-3 py-2">{Number(r.horas).toFixed(2)}</td>
                  <td className="px-3 py-2">{money(r.costo)}</td>
                </tr>
              ))}
              {!resumen?.length && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-text-muted text-center">
                    Todavía no hay tiempos registrados contra esta orden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Este costo es solo de mano de obra. El costo de máquina se calcula al cerrar la orden.
        </p>
      </section>
    </div>
  );
}
