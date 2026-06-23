"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { buscarSubordenes } from "@/app/(app)/registro/actions";

type Resultado = {
  id: string;
  opp: string;
  cliente: string | null;
  pieza: string | null;
  producto: string | null;
  numero_orden: number;
};

const SIN_OPP: Resultado = {
  id: "",
  opp: "Sin OPP",
  cliente: "Labor sin orden asociada (aseo, espera, capacitación...)",
  pieza: null,
  producto: null,
  numero_orden: 0,
};

export function BuscadorOPP({ name }: { name: string }) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [seleccionado, setSeleccionado] = useState<Resultado | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [pending, startTransition] = useTransition();

  const queryLimpia = useMemo(() => query.trim(), [query]);

  // Carga inicial (lista completa de órdenes vivas) y cada vez que cambia
  // el texto. No exige escribir nada: al abrir el combo ya hay opciones.
  useEffect(() => {
    if (seleccionado) return;
    const t = setTimeout(() => {
      startTransition(async () => {
        const r = await buscarSubordenes(queryLimpia);
        setResultados(r);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [queryLimpia, seleccionado]);

  function elegir(r: Resultado) {
    setSeleccionado(r);
    setAbierto(false);
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={seleccionado?.id ?? ""} />
      <button
        type="button"
        className="input-field w-full text-left flex items-center justify-between"
        onClick={() => setAbierto((v) => !v)}
      >
        <span className={seleccionado ? "" : "text-text-muted"}>
          {seleccionado
            ? seleccionado.id
              ? `${seleccionado.opp} — ${seleccionado.cliente ?? ""}`
              : "Sin OPP"
            : "Selecciona la orden (OPP)…"}
        </span>
        <span className="text-text-muted">▾</span>
      </button>

      {abierto && (
        <div className="absolute z-10 mt-1 w-full card shadow-lg overflow-hidden">
          <input
            autoFocus
            className="input-field w-full rounded-none border-0 border-b border-line"
            placeholder="Buscar por cliente, OPP o producto…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="max-h-72 overflow-auto">
            <li>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent-soft border-b border-line font-medium"
                onClick={() => elegir(SIN_OPP)}
              >
                — Sin OPP —
                <span className="block text-xs text-text-muted font-normal">
                  Labor sin orden asociada (aseo, espera, capacitación…)
                </span>
              </button>
            </li>
            {pending && <li className="px-3 py-2 text-sm text-text-muted">Buscando…</li>}
            {!pending && resultados.length === 0 && (
              <li className="px-3 py-2 text-sm text-text-muted">
                No hay órdenes vivas que coincidan.
              </li>
            )}
            {resultados.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-accent-soft border-b border-line last:border-0"
                  onClick={() => elegir(r)}
                >
                  <span className="codigo font-semibold">{r.opp}</span>{" "}
                  <span className="text-sm text-text-muted">
                    {r.cliente} · {r.producto || r.pieza}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
