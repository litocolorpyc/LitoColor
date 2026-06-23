import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function OrdenesPage() {
  const supabase = supabaseAdmin();
  const { data: ordenes } = await supabase
    .from("ordenes")
    .select("id, numero_orden, fecha, estado, clientes(nombre), subordenes(id)")
    .order("numero_orden", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Órdenes de producción</h1>
        <Link href="/ordenes/nueva" className="btn-accent px-4 py-2">
          + Nueva orden
        </Link>
      </div>
      <p className="text-text-muted mb-6 text-sm">
        Click en el número de una orden para ver su ficha técnica, el avance (horas y costo
        acumulado por área) y para cerrarla cuando termine.
      </p>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper border-b border-line text-left">
            <tr>
              <th className="px-4 py-2 codigo">Orden</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Subórdenes</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {ordenes?.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 hover:bg-accent-soft">
                <td className="px-4 py-2">
                  <Link href={`/ordenes/${o.id}`} className="codigo font-semibold text-accent">
                    {o.numero_orden}
                  </Link>
                </td>
                <td className="px-4 py-2">{(o.clientes as unknown as { nombre: string } | null)?.nombre}</td>
                <td className="px-4 py-2">{o.fecha}</td>
                <td className="px-4 py-2">{o.subordenes?.length ?? 0}</td>
                <td className="px-4 py-2">{o.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
