import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function DashboardPage() {
  const supabase = supabaseAdmin();

  const { data: porOperario } = await supabase
    .from("v_horas_por_operario_semana")
    .select("*")
    .order("semana", { ascending: false })
    .limit(50);

  const { data: porArea } = await supabase
    .from("v_resumen_por_orden_area")
    .select("*")
    .order("numero_orden", { ascending: false })
    .limit(50);

  const totalHorasOperario = new Map<string, number>();
  const totalCostoOperario = new Map<string, number>();
  for (const r of porOperario ?? []) {
    totalHorasOperario.set(r.operario, (totalHorasOperario.get(r.operario) ?? 0) + Number(r.horas));
    totalCostoOperario.set(r.operario, (totalCostoOperario.get(r.operario) ?? 0) + Number(r.costo));
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-1">Tableros</h1>
        <p className="text-text-muted">
          Equivalente en vivo a las tablas dinámicas &quot;Resumen&quot;, &quot;Horas por semana&quot; y &quot;Actividad Hs&quot;.
        </p>
      </div>

      <section>
        <h2 className="font-semibold mb-3">Horas y costo por operario (últimas semanas)</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper border-b border-line text-left">
              <tr>
                <th className="px-3 py-2">Operario</th>
                <th className="px-3 py-2">Horas acumuladas</th>
                <th className="px-3 py-2">Costo acumulado</th>
              </tr>
            </thead>
            <tbody>
              {[...totalHorasOperario.entries()].map(([nombre, horas]) => (
                <tr key={nombre} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{nombre}</td>
                  <td className="px-3 py-2">{horas.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    $
                    {(totalCostoOperario.get(nombre) ?? 0).toLocaleString("es-CO", {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                </tr>
              ))}
              {!totalHorasOperario.size && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-text-muted text-center">
                    Sin registros aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Costo y horas por orden / área</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper border-b border-line text-left">
              <tr>
                <th className="px-3 py-2 codigo">Orden</th>
                <th className="px-3 py-2">Área</th>
                <th className="px-3 py-2">Horas</th>
                <th className="px-3 py-2">Costo</th>
              </tr>
            </thead>
            <tbody>
              {porArea?.map((r, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 codigo">{r.numero_orden}</td>
                  <td className="px-3 py-2">{r.area}</td>
                  <td className="px-3 py-2">{Number(r.horas).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    ${Number(r.costo).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
              {!porArea?.length && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-text-muted text-center">
                    Sin registros aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
