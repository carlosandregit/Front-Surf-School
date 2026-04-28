import React from "react";

export default function ConfirmacaoSheet({
  open,
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  carregando = false,
  tipo = "padrao",
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  const estiloConfirmar =
    tipo === "perigo"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-slate-900 hover:bg-slate-800";

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Fechar"
      />

      <div className="fixed inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 shadow-2xl max-h-[75vh] sm:inset-0 sm:m-auto sm:max-w-sm sm:max-h-[60vh] sm:rounded-2xl">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            {titulo}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{mensagem}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={carregando}
            className="rounded-xl border border-sky-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-sky-50 disabled:opacity-40"
          >
            {textoCancelar}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={carregando}
            className={`rounded-xl px-4 py-3 text-sm font-extrabold text-white disabled:opacity-40 ${estiloConfirmar}`}
          >
            {carregando ? "Aguarde..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}