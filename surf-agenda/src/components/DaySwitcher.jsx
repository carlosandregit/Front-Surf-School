import React from "react";
import { formatarFaixaData } from "../utils/data";

export default function DaySwitcher({ dataSelecionada, onPrev, onNext }) {
  return (
    <section className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="rounded-xl border border-sky-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50"
        >
          ‹
        </button>

        <div className="text-center">
          <div className="text-sm text-slate-500">Data</div>
          <div className="text-lg font-extrabold text-slate-900">
            🌊 {formatarFaixaData(dataSelecionada)}
          </div>
        </div>

        <button
          onClick={onNext}
          className="rounded-xl border border-sky-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50"
        >
          ›
        </button>
      </div>
    </section>
  );
}