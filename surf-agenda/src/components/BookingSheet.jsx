import React, { useEffect, useMemo, useState } from "react";

export default function BookingSheet({ open, slot, onClose, onConfirm }) {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");


//   useEffect(() => {
//   if (open) {
//     setStudentName("");
//     setStudentPhone("");
//   }
// }, [open, slot?.id]);

  const canSubmit = useMemo(() => {
    return name.trim().length >= 2 && digitsOnly(phone).length >= 10;
  }, [name, phone]);

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
            <div className="text-base font-extrabold text-slate-900">Confirmar agendamento</div>
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
            <label className="text-xs font-semibold text-slate-700">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Telefone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="DDD + número"
              className="mt-2 w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            />
            <div className="mt-2 text-xs text-slate-500">
              Usaremos seu telefone para você consultar e cancelar dentro do prazo.
            </div>
          </div>

          <button
            disabled={!canSubmit}
            onClick={() =>
              onConfirm({
                classSlotId: slot.id,
                studentName: name.trim(),
                studentPhone: digitsOnly(phone),
              })
            }
            className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirmar 🌊
          </button>

          <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-slate-700">
            <div className="font-semibold">Regras de cancelamento</div>
            <div className="mt-1">
              6h e 8h: até 20h do dia anterior • Outros: até 2h antes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}