import React from "react";
import { formatWeekRange } from "../utils/week";

export default function WeekSwitcher({ weekStartISO, onPrev, onNext }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onPrev}
          className="rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-sky-50"
          aria-label="Semana anterior"
        >
          ‹
        </button>

        <div className="text-center">
          <div className="text-xs font-semibold text-slate-500">Semana</div>
          <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-slate-900">
            <span>🌊</span>
            <span>{formatWeekRange(weekStartISO)}</span>
          </div>
        </div>

        <button
          onClick={onNext}
          className="rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-sky-50"
          aria-label="Próxima semana"
        >
          ›
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-slate-700">
        <div className="font-semibold">⚠ Política de cancelamento</div>
        <div className="mt-1">
          • 6h e 8h: até <span className="font-semibold">20h do dia anterior</span>
          <br />• Demais horários: até <span className="font-semibold">2h antes</span>
        </div>
      </div>
    </div>
  );
}