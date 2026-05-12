import React, { useMemo, useState } from "react";

export default function BookingSheet({ open, slot, onClose, onConfirm }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tipoReserva, setTipoReserva] = useState("");

  const canSubmit = useMemo(() => {
    return name.trim().length >= 2 && digitsOnly(phone).length >= 10 && tipoReserva.length >= 6;
  }, [name, phone, tipoReserva]);

  if (!open || !slot) return null;

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
              Confirmar agendamento
            </div>
            <div className="mt-1 text-sm text-slate-600">
              {slot.date} • {slot.time}
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
            <label className="text-xs font-semibold text-slate-700"><strong>Nome</strong></label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700"><strong>Telefone</strong></label>
            {/* <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="DDD + número"
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            /> */}
            {/* para aceitar apenas numeros */}
            <input
                value={phone}
                onChange={(e) => {
                  const apenasNumeros = e.target.value.replace(/\D/g, '');
                  setPhone(apenasNumeros);
                }}
                placeholder="DDD + número"
                type="tel"
                inputMode="numeric"
                className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-sky-200"
            />
            <div className="mt-2 text-xs text-slate-500">
              Usaremos seu telefone para você consultar e cancelar dentro do prazo.
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              <strong>Modelo de agendamento</strong>
            </label>            

            {/* <div className="mt-2 text-xs text-slate-500">
              Em pacote, o sistema valida se o aluno existe e se há saldo disponível.
            </div> */}
          </div>

          <div >
                  {/* className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-lg font-semibold text-gray-800 outline-none transition-all duration-200 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-200" */}
                <select className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                  value={tipoReserva} onChange={(e) => setTipoReserva(e.target.value)}>
                  <option value=""  className="text-base font-normal text-gray-400">Selecione uma opção</option>
                  <option value="PACOTE" className="text-sm font-bold text-gray-500">PACOTE</option>
                  <option value="AVULSA" className="text-sm font-bold text-gray-500">AVULSA</option>
              </select>
              
            </div>

          <button
            disabled={!canSubmit}
            onClick={() =>
              onConfirm({
                studentName: name.trim(),
                studentPhone: digitsOnly(phone),
                tipoReserva,
              })
            }
            className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirmar 🌊
          </button>

          {/* <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-slate-700">
            <div className="font-semibold">Regras de cancelamento</div>
            <div className="mt-1">
              6h e 8h: até 20h do dia anterior • Outros: até 2h antes.
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}