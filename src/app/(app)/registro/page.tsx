import { supabaseAdmin } from "@/lib/supabase/admin";
import { crearRegistro } from "./actions";
import { BuscadorOPP } from "@/components/BuscadorOPP";

function horaActual(offsetMin = 0) {
  const d = new Date(Date.now() + offsetMin * 60000);
  return d.toTimeString().slice(0, 5);
}

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const supabase = supabaseAdmin();

  const { data: actividades } = await supabase
    .from("actividades")
    .select("id, codigo_actividad, areas(nombre)")
    .eq("activo", true)
    .order("codigo_actividad");

  const { data: maquinas } = await supabase
    .from("maquinas")
    .select("id, codigo, nombre")
    .eq("activo", true)
    .order("codigo");

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-1">Registrar tiempo</h1>
      <p className="text-text-muted mb-6">
        Llena este formulario al terminar cada labor.
      </p>

      {ok && (
        <div className="card p-3 mb-4 border-ok text-ok bg-green-50">
          Registro guardado correctamente.
        </div>
      )}
      {error && (
        <div className="card p-3 mb-4 border-danger text-danger bg-red-50">
          {error}
        </div>
      )}

      <form action={crearRegistro} className="card p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              name="fecha"
              defaultValue={hoy}
              required
              className="input-field w-full"
            />
          </div>
          <div />
          <div>
            <label className="block text-sm font-medium mb-1">Hora inicio</label>
            <input
              type="time"
              name="hora_inicio"
              defaultValue={horaActual(-30)}
              required
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hora fin</label>
            <input
              type="time"
              name="hora_fin"
              defaultValue={horaActual()}
              required
              className="input-field w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Código y Actividad</label>
          <select name="actividad_id" required className="input-field w-full">
            <option value="" disabled>
              Selecciona la actividad
            </option>
            {actividades?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.codigo_actividad}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Máquina (opcional)</label>
          <select name="maquina_id" className="input-field w-full" defaultValue="">
            <option value="">— Sin máquina (labor manual) —</option>
            {maquinas?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.codigo} · {m.nombre}
              </option>
            ))}
          </select>
          <p className="text-xs text-text-muted mt-1">
            Se usa para calcular el costo de máquina cuando se cierre la orden.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">OPP (orden/suborden)</label>
          <BuscadorOPP name="suborden_id" />
          <p className="text-xs text-text-muted mt-1">
            Si la labor no corresponde a un trabajo (aseo, espera, capacitación), déjalo vacío.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cantidad producida</label>
          <input
            type="text"
            name="cantidad_producida_texto"
            placeholder="ej. 9 Millares, 265 tiro/retiro, 130 tacos x 50"
            className="input-field w-full"
          />
          <input
            type="number"
            step="0.01"
            name="cantidad_producida_num"
            placeholder="Valor numérico (opcional, para reportes)"
            className="input-field w-full mt-2"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium mb-1">¿Hubo reproceso?</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="reproceso" value="si" /> Sí
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="reproceso" value="no" defaultChecked /> No
            </label>
          </div>
        </fieldset>

        <div>
          <label className="block text-sm font-medium mb-1">Comentario</label>
          <textarea name="comentario" rows={2} className="input-field w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Materia prima</label>
            <input type="text" name="materia_prima" className="input-field w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Consumo materia prima (kg, hojas, etc.)
            </label>
            <input type="text" name="consumo_materia_prima" className="input-field w-full" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Remisión #</label>
            <input type="text" name="remision" className="input-field w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cant. despachada</label>
            <input type="number" step="0.01" name="cantidad_despachada" className="input-field w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cant. inventario</label>
            <input type="number" step="0.01" name="cantidad_inventario" className="input-field w-full" />
          </div>
        </div>

        <button type="submit" className="btn-accent w-full py-3 text-lg">
          Guardar registro
        </button>
      </form>
    </div>
  );
}
