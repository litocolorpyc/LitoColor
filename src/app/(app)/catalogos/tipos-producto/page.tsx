import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { crearTipoProducto, cambiarActivoTipoProducto } from "./actions";

export default async function TiposProductoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const supabase = supabaseAdmin();

  const { data: tipos } = await supabase
    .from("tipos_producto")
    .select("id, nombre, descripcion, activo, tipos_producto_piezas(id), tipos_producto_campos(id)")
    .order("nombre");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/catalogos" className="text-sm text-text-muted hover:underline">
          ← Todos los catálogos
        </Link>
        <h1 className="text-2xl font-bold mt-1">Tipos de producto</h1>
        <p className="text-text-muted">
          Define qué piezas suele tener cada producto (para generarlas de un clic al crear una
          orden) y qué campos adicionales necesita (más allá de papel, tintas, tamaño…).
        </p>
      </div>

      {error && <div className="card p-3 border-danger text-danger bg-red-50">{error}</div>}
      {ok && <div className="card p-3 border-ok text-ok bg-green-50">Guardado correctamente.</div>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper border-b border-line text-left">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Piezas definidas</th>
              <th className="px-3 py-2">Campos personalizados</th>
              <th className="px-3 py-2">Activo</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {tipos?.map((t) => (
              <tr key={t.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2 font-medium">{t.nombre}</td>
                <td className="px-3 py-2">{t.tipos_producto_piezas?.length ?? 0}</td>
                <td className="px-3 py-2">{t.tipos_producto_campos?.length ?? 0}</td>
                <td className="px-3 py-2">{t.activo ? "Sí" : "No"}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link href={`/catalogos/tipos-producto/${t.id}`} className="text-accent text-sm underline mr-3">
                    Configurar
                  </Link>
                  <form action={cambiarActivoTipoProducto} className="inline">
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="activo" value={String(t.activo)} />
                    <button type="submit" className="text-sm underline text-text-muted">
                      {t.activo ? "Retirar" : "Reactivar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!tipos?.length && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-text-muted text-center">
                  Aún no hay tipos de producto.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card p-5 max-w-lg">
        <h2 className="font-semibold mb-4">Agregar tipo de producto</h2>
        <form action={crearTipoProducto} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input type="text" name="nombre" required placeholder="ej. Mazo de cartas" className="input-field w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <input type="text" name="descripcion" className="input-field w-full" />
          </div>
          <button type="submit" className="btn-accent px-5 py-2">
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
}
