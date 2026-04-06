import React, { useMemo, useState } from "react";
import AdminSlotCard from "../components/AdminSlotCard";
import AdminAddBookingSheet from "../components/AdminAddBookingSheet";

import { buildMockWeek, CAPACITY } from "../mocks/scheduleMock";
// import { getWeekStartISO } from "../utils/week";

import { addBooking, adminRemoveBooking, listBookings } from "../services/bookingsStore";
import { isSlotLocked, toggleSlotLocked } from "../services/slotLocksStore";

export default function Admin() {
  const todayISO = useMemo(() => toISODate(new Date()), []);
  const [selectedDateISO, setSelectedDateISO] = useState(todayISO);

  // const weekStartISO = useMemo(() => getWeekStartISO(new Date(selectedDateISO + "T00:00:00")), [
  //   selectedDateISO,
  // ]);

  const week = useMemo(() => buildMockWeek(weekStartISO), [weekStartISO]);

  const day = useMemo(() => {
    return week.days.find((d) => d.dateISO === selectedDateISO) || week.days[0];
  }, [week, selectedDateISO]);

  // Sheet adicionar aluno
  const [addOpen, setAddOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Gera mapa booking por slot
  const bookingsBySlot = useMemo(() => {
    const all = listBookings();
    const confirmed = all.filter((b) => b.status === "CONFIRMED");
    const map = new Map();

    for (const b of confirmed) {
      // classSlotId no mock é `${dateISO}-${time}`
      const key = b.classSlotId;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(b);
    }

    // ordena por nome
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.studentName.localeCompare(b.studentName));
      map.set(k, arr);
    }

    return map;
  }, [selectedDateISO]); // recarrega ao trocar dia

  function openAdd(slot) {
    setSelectedSlot(slot);
    setAddOpen(true);
  }

  function closeAdd() {
    setAddOpen(false);
    setSelectedSlot(null);
  }

  function handleAddConfirm({ studentName, studentPhone }) {
    if (!selectedSlot) return;

    const slotId = selectedSlot.id;
    const locked = isSlotLocked(slotId);
    const current = bookingsBySlot.get(slotId) || [];

    if (locked) {
      alert("Este horário está travado.");
      return;
    }
    if (current.length >= CAPACITY) {
      alert("Horário lotado.");
      return;
    }

    const cancelCode = makeCancelCode();
    const bookingId = cryptoId();

    addBooking({
      id: bookingId,
      classSlotId: slotId,
      dateISO: selectedSlot.date,
      time: selectedSlot.time,
      studentName,
      studentPhone,
      cancelCode,
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
      createdBy: "ADMIN",
    });

    alert(`✔ Aluno adicionado.\nCódigo de cancelamento do aluno: ${cancelCode}`);

    closeAdd();
    // força refresh simples
    window.location.reload();
  }

  function handleToggleLock(slotId) {
    const next = toggleSlotLocked(slotId);
    alert(next ? "Horário travado." : "Horário destravado.");
    window.location.reload();
  }

  function handleRemoveBooking(b) {
    const reason = prompt("Motivo (opcional):") || "";
    const res = adminRemoveBooking({ bookingId: b.id, reason });

    if (!res.ok) {
      alert(res.error);
      return;
    }

    alert("✔ Agendamento removido (admin).");
    window.location.reload();
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Admin</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gerencie o dia: travar horários, adicionar alunos e remover agendamentos.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <label className="text-xs font-semibold text-slate-700">Data</label>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="date"
            value={selectedDateISO}
            onChange={(e) => setSelectedDateISO(e.target.value)}
            className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
          />

          <div className="text-xs text-slate-500">
            {day?.dayLabel ? (
              <>
                <span className="font-semibold text-slate-700">Dia selecionado:</span> {day.dayLabel}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {day.slots.map((slot) => {
          const slotId = slot.id;
          const locked = isSlotLocked(slotId);
          const confirmed = bookingsBySlot.get(slotId) || [];

          return (
            <AdminSlotCard
              key={slotId}
              slot={slot}
              locked={locked}
              capacity={CAPACITY}
              confirmedBookings={confirmed}
              onToggleLock={() => handleToggleLock(slotId)}
              onAdd={() => openAdd(slot)}
              onRemove={handleRemoveBooking}
            />
          );
        })}
      </div>

      <AdminAddBookingSheet
        open={addOpen}
        slot={selectedSlot}
        onClose={closeAdd}
        onConfirm={handleAddConfirm}
      />
    </section>
  );
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function makeCancelCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function cryptoId() {
  return crypto?.randomUUID?.() || `b_${Math.random().toString(16).slice(2)}`;
}