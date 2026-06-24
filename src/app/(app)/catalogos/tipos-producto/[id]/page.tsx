import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { agregarPieza, quitarPieza, agregarCampo, quitarCampo } from "../actions";

export default async function ConfigurarTipoProductoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = supabaseAdmin();

  const { data: tipo } = await supabase.from("tipos_producto").select("*").eq("id", id).single();
  const { data: piezas } = await supabase
    .from("tipos_producto_piezas")
    .select("*")
    .eq("tipo_producto_id", id)
    .order("orden_sugerido");
  const { data: campos } = await supabase
    .from("tipos_producto_campos")
    .select("*")
    .eq("tipo_producto_id", id)
    .order("orden_sugerido");

  if (!tipo) return <p>Tipo de producto no encontrado.</p>;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/catalogos/tipos-producto" className="text-sm text-text-muted hover:underline">
          ← Tipos de producto
        </Link>
        <h1 className="text-2xl font-bold mt-1">{tipo.nombre}</h1>
        <p className="text-text-muted">{tipo.descripcion}</p>
      </div>

      {error && <div className="card p-3 border-danger text-danger bg-red-50">{error}</div>}

      <section>
        <h2 className="font-semibold mb-2">Piezas esperadas</h2>
        <p className="text-sm text-text-muted mb-3">
          Al crear una orden de este tipo, podrás generar estas piezas de un clic en vez de
          escribirlas una por una (ej. Carátula, Guarda, Interiores…).
        </p>
        <div className="card overflow-hidden mb-3">
          <table className="w-full text-sm">
            <tbody>
              {piezas?.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{p.orden_sugerido}</td>
                  <td className="px-3 py-2 font-medium">{p.nombre_pieza}</td>
                  <td className="px-3 py-2 text-right">
                    <form action={quitarPieza}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="tipo_producto_id" value={id} />
                      <button type="submit" className="text-sm underline text-text-muted">
                        Quitar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {!piezas?.length && (
                <tr>
                  <td className="px-3 py-4 text-text-muted text-center">
                    Sin piezas definidas — la orden se hace con una sola pieza.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <form action={agregarPieza} className="flex gap-3 items-end">
          <input type="hidden" name="tipo_producto_id" value={id} />
          <div className="flex-1">
            <label className="block text-xs text-text-muted mb-1">Nombre de la pieza</label>
            <input type="text" name="nombre_pieza" placeholder="ej. Carátula" className="input-field w-full" />
          </div>
          <div className="w-24">
            <label className="block text-xs text-text-muted mb-1">Orden</label>
            <input type="number" name="orden_sugerido" defaultValue={(piezas?.length ?? 0) + 1} className="input-field w-full" />
          </div>
          <button type="submit" className="btn-accent px-4 py-2">
            + Agregar
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Campos personalizados</h2>
        <p className="text-sm text-text-muted mb-3">
          Datos extra que solo aplican a este tipo de producto (ej. &quot;Cartas por mazo&quot;,
          &quot;Meses por calendario&quot;). Se piden al agregar una pieza de una orden de este tipo.
        </p>
        <div className="card overflow-hidden mb-3">
          <table className="w-full text-sm">
            <thead className="bg-paper border-b border-line text-left">
              <tr>
                <th className="px-3 py-2">Etiqueta</th>
                <th className="px-3 py-2">Clave</th>
                <th className="px-3 py-2">Tipo de dato</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {campos?.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 font-medium">{c.etiqueta}</td>
                  <td className="px-3 py-2 codigo text-xs">{c.clave}</td>
                  <td className="px-3 py-2">{c.tipo_dato}</td>
                  <td className="px-3 py-2 text-right">
                    <form action={quitarCampo}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="tipo_producto_id" value={id} />
                      <button type="submit" className="text-sm underline text-text-muted">
                        Quitar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {!campos?.length && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-text-muted text-center">
                    Sin campos adicionales — se usan solo los campos estándar (papel, tintas, tamaño…).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <form action={agregarCampo} className="flex gap-3 items-end">
          <input type="hidden" name="tipo_producto_id" value={id} />
          <div className="flex-1">
            <label className="block text-xs text-text-muted mb-1">Etiqueta</label>
            <input type="text" name="etiqueta" placeholder="ej. Cartas por mazo" className="input-field w-full" />
          </div>
          <div className="w-40">
            <label className="block text-xs text-text-muted mb-1">Tipo de dato</label>
            <select name="tipo_dato" className="input-field w-full" defaultValue="texto">
              <option value="texto">Texto</option>
              <option value="numero">Número</option>
              <option value="booleano">Sí / No</option>
            </select>
          </div>
          <div className="w-24">
            <label className="block text-xs text-text-muted mb-1">Orden</label>
            <input type="number" name="orden_sugerido" defaultValue={(campos?.length ?? 0) + 1} className="input-field w-full" />
          </div>
          <button type="submit" className="btn-accent px-4 py-2">
            + Agregar
          </button>
        </form>
      </section>
    </div>
  );
}
