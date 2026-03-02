import React from "react";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

export default function AdminSlotCard({
  slot,
  locked,
  capacity,
  confirmedBookings,
  onToggleLock,
  onAdd,
  onRemove,
}) {
  const count = confirmedBookings.length;
  const remaining = Math.max(0, capacity - count);
  const isFull = remaining === 0;

  return (
    <section className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-slate-900">
            {slot.time} <span className="text-slate-400">•</span>{" "}
            <span className="text-slate-700">{count}/{capacity}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {locked ? <Badge>🔒 Travado</Badge> : null}
            {!locked && isFull ? <Badge>🔒 Lotado</Badge> : null}
            {!locked && !isFull ? (
              <span className="inline-flex rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">
                {remaining} vaga{remaining === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onToggleLock}
            className="rounded-xl border border-sky-100 px-3 py-2 text-sm font-semibold hover:bg-sky-50"
          >
            {locked ? "Destravar" : "Travar"}
          </button>

          <button
            onClick={onAdd}
            disabled={locked || isFull}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Aluno
          </button>
        </div>
      </header>

      <div className="mt-4 space-y-2">
        {confirmedBookings.length === 0 ? (
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3 text-sm text-slate-700">
            Nenhum aluno neste horário.
          </div>
        ) : (
          confirmedBookings.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-xl bg-sky-50/60 px-3 py-2"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">{b.studentName}</div>
                <div className="text-xs font-mono text-slate-600">{b.studentPhone}</div>
              </div>

              <button
                onClick={() => onRemove(b)}
                className="text-xs font-extrabold text-red-600 hover:underline"
              >
                Remover
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}