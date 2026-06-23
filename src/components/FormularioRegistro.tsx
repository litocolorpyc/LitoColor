"use client";

import { useEffect, useRef, useState } from "react";
import { crearRegistro } from "@/app/(app)/registro/actions";
import { BuscadorOPP } from "@/components/BuscadorOPP";

type Actividad = { id: string; codigo_actividad: string };
type Maquina = { id: string; codigo: string; nombre: string };

function formatoHMS(ms: number) {
  const totalSeg = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeg / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeg % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeg % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function FormularioRegistro({
  actividades,
  maquinas,
}: {
  actividades: Actividad[];
  maquinas: Maquina[];
}) {
  const [horaInicio, setHoraInicio] = useState<Date | null>(null);
  const [horaFin, setHoraFin] = useState<Date | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!horaInicio || horaFin) return;
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [horaInicio, horaFin]);

  function iniciar() {
    setHoraInicio(new Date());
    setHoraFin(null);
  }

  function finalizarYGuardar() {
    const fin = new Date();
    setHoraFin(fin);
    // Esperamos al próximo render (para que el input oculto tenga el
    // valor) antes de enviar el formulario.
    setTimeout(() => formRef.current?.requestSubmit(), 0);
  }

  function reiniciar() {
    setHoraInicio(null);
    setHoraFin(null);
  }

  const transcurrido = horaInicio ? formatoHMS((horaFin ?? new Date(ahora)).getTime() - horaInicio.getTime()) : null;

  return (
    <form ref={formRef} action={crearRegistro} className="card p-5 space-y-5">
      <input type="hidden" name="hora_inicio_iso" value={horaInicio ? horaInicio.toISOString() : ""} />
      <input type="hidden" name="hora_fin_iso" value={horaFin ? horaFin.toISOString() : ""} />

      {/* Cronómetro: la forma precisa y sin esfuerzo de marcar inicio/fin */}
      <div className="rounded-lg border border-line bg-paper p-5 text-center">
        {!horaInicio && (
          <>
            <p className="text-text-muted mb-3">Cuando empieces la labor, marca:</p>
            <button type="button" onClick={iniciar} className="btn-accent px-8 py-4 text-lg">
              ▶ Iniciar actividad
            </button>
          </>
        )}

        {horaInicio && !horaFin && (
          <>
            <p className="text-text-muted mb-1">
              Iniciado a las {horaInicio.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="codigo text-3xl font-bold mb-4">{transcurrido}</p>
            <p className="text-sm text-text-muted mb-3">
              Completa los datos de abajo y, al terminar la labor, marca:
            </p>
            <button type="button" onClick={finalizarYGuardar} className="btn-primary px-8 py-4 text-lg">
              ■ Finalizar y guardar
            </button>
          </>
        )}

        {horaInicio && horaFin && (
          <>
            <p className="text-text-muted">Tiempo registrado: <span className="codigo font-semibold">{transcurrido}</span></p>
            <button type="button" onClick={reiniciar} className="text-sm underline text-text-muted mt-2">
              Deshacer y volver a marcar
            </button>
          </>
        )}
      </div>

      <fieldset disabled={!horaInicio} className="space-y-5 disabled:opacity-40">
        <div>
          <label className="block text-sm font-medium mb-1">Código y Actividad</label>
          <select name="actividad_id" required className="input-field w-full">
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
          <p className="text-xs text-text-muted mt-1">
            Se usa para calcular el costo de máquina cuando se cierre la orden.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">OPP (orden/suborden)</label>
          <BuscadorOPP name="suborden_id" />
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
      </fieldset>
    </form>
  );
}
