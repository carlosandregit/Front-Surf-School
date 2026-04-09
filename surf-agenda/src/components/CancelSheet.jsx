import React, { useEffect, useMemo, useState } from "react";

export default function CancelSheet({
  open,
  booking,
  onClose,
  onConfirm,
  carregando = false,
}) {
  const [code, setCode] = useState("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (open) {
      setCode("");
      setMotivo("");
    }
  }, [open, booking?.idAgendamento]);

  const canSubmit = useMemo(() => {
    return String(code).trim().length >= 4;
  }, [code]);

  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Fechar"
      />

      <div className="fixed inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold text-slate-900">
              Cancelar aula
            </div>
            <div className="mt-1 text-sm text-slate-600">
              {booking.dataDoAgendamento} • {booking.hora}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-sky-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50"
          >
            Fechar
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-slate-700">
            Você está cancelando a aula de{" "}
            <span className="font-semibold">{booking.nomeAluno}</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Código de cancelamento
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex.: 37A78DC753"
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Motivo (opcional)
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Não poderei comparecer"
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <button
            disabled={!canSubmit || carregando}
            onClick={() =>
              onConfirm({
                codigoCancelamento: code.trim(),
                motivoCancelamento: motivo.trim() || null,
              })
            }
            className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {carregando ? "Cancelando..." : "Confirmar cancelamento"}
          </button>

          <div className="text-xs text-slate-500">
            Se o prazo estiver expirado, apenas o admin poderá cancelar.
          </div>
        </div>
      </div>
    </div>
  );
}