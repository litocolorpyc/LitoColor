"use client";

import { iniciarTarea } from "@/app/(app)/registro/actions";
import { BuscadorOPP } from "@/components/BuscadorOPP";

type Actividad = { id: string; codigo_actividad: string };
type Maquina = { id: string; codigo: string; nombre: string };

export function FormularioIniciarTarea({
  actividades,
  maquinas,
}: {
  actividades: Actividad[];
  maquinas: Maquina[];
}) {
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <form action={iniciarTarea} className="card p-5 space-y-4">
      <h2 className="font-semibold">Iniciar nueva actividad</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha</label>
        <input type="date" name="fecha" defaultValue={hoy} required className="input-field w-full" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Código y Actividad</label>
        <select name="actividad_id" required className="input-field w-full" defaultValue="">
          <option value="" disabled>
            Selecciona la actividad
          </option>
          {actividades.map((a) => (
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
          {maquinas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.codigo} · {m.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">OPP (orden/suborden)</label>
        <BuscadorOPP name="suborden_id" />
      </div>

      <button type="submit" className="btn-accent w-full py-3 text-lg">
        ▶ Iniciar
      </button>
    </form>
  );
}
