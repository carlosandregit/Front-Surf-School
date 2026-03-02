import React from "react";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

export default function SlotRow({ slot, onBook }) {
 const remaining = slot.remaining ?? Math.max(0, (slot.capacity ?? 6) - (slot.bookedCount ?? 0));
  const isFull = slot.isFull ?? remaining === 0;

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-baseline gap-3">
        <div className="text-base font-semibold tabular-nums text-slate-900">{slot.time}</div>
        <div className="text-xs text-slate-500">
          {remaining} vaga{remaining === 1 ? "" : "s"}
        </div>
      </div>

      <div>
        {slot.isLocked ? (
          <Badge>🔒 Travado</Badge>
        ) : isFull ? (
          <Badge>🔒 Lotado</Badge>
        ) : (
          <button
            onClick={() => onBook(slot)}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            🌊 Agendar
          </button>
        )}
      </div>
    </div>
  );
}