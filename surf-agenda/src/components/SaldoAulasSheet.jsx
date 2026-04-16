import React, { useEffect, useState } from "react";

export default function SaldoAulasSheet({
  open,
  onClose,
  onBuscar,
  carregando = false,
  resultado = null,
}) {
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    if (open) {
      setTelefone("");
    }
  }, [open]);

  if (!open) return null;

  const telefoneLimpo = digitsOnly(telefone);
  const podeBuscar = telefoneLimpo.length >= 10;

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
              Saldo de aulas
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Consulte quantas aulas restam no pacote.
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
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Telefone
            </label>
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="DDD + número"
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <button
            disabled={!podeBuscar || carregando}
            onClick={() =>
              onBuscar({
                telefoneAluno: telefoneLimpo,
              })
            }
            className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {carregando ? "Buscando..." : "Buscar saldo"}
          </button>

          {resultado ? (
            <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4 text-sm text-slate-700">
              <div>
                <span className="font-semibold">Nome:</span> {resultado.nomeAluno}
              </div>
              <div className="mt-1">
                <span className="font-semibold">Telefone:</span> {resultado.telefoneAluno}
              </div>
              <div className="mt-2 text-base font-extrabold text-slate-900">
                Saldo disponível: {resultado.quantidadeAulasDisponiveis}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}