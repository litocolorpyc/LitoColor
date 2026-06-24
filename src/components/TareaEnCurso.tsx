"use client";

import { useEffect, useState } from "react";
import { finalizarTarea, cancelarTarea } from "@/app/(app)/registro/actions";

function formatoHMS(ms: number) {
  const totalSeg = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeg / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeg % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeg % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function TareaEnCurso({
  registroId,
  horaInicioIso,
  actividad,
  opp,
}: {
  registroId: string;
  horaInicioIso: string;
  actividad: string;
  opp: string | null;
}) {
  const [ahora, setAhora] = useState(() => Date.now());
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const transcurrido = formatoHMS(ahora - new Date(horaInicioIso).getTime());

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{actividad}</p>
          <p className="text-sm text-text-muted codigo">{opp || "Sin OPP"}</p>
        </div>
        <p className="codigo text-2xl font-bold text-accent">{transcurrido}</p>
      </div>

      {!expandido && (
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={() => setExpandido(true)}
            className="btn-primary px-5 py-2"
          >
            ■ Finalizar
          </button>
          <form action={cancelarTarea}>
            <input type="hidden" name="registro_id" value={registroId} />
            <button type="submit" className="text-sm text-text-muted underline">
              Cancelar (lo inicié por error)
            </button>
          </form>
        </div>
      )}

      {expandido && (
        <form action={finalizarTarea} className="mt-4 space-y-4 border-t border-line pt-4">
          <input type="hidden" name="registro_id" value={registroId} />

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

          <div className="flex gap-3">
            <button type="submit" className="btn-accent px-6 py-3">
              Guardar y finalizar
            </button>
            <button
              type="button"
              onClick={() => setExpandido(false)}
              className="px-6 py-3 text-text-muted"
            >
              Volver
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
