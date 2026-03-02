// src/services/bookingsStore.js

const KEY = "surf_bookings_v1";

export function listBookings() {
  return read();
}

export function addBooking(booking) {
  const all = read();
  all.push(booking);
  write(all);
  return booking;
}

export function findBookingsByPhone(phoneDigits) {
  const all = read();
  return all.filter((b) => b.studentPhone === phoneDigits);
}

export function cancelBookingLocal({ bookingId, phoneDigits, cancelCode }) {
  const all = read();
  const idx = all.findIndex((b) => b.id === bookingId);

  if (idx === -1) {
    return { ok: false, error: "Agendamento não encontrado." };
  }

  const b = all[idx];

  if (b.studentPhone !== phoneDigits) {
    return { ok: false, error: "Telefone não confere com o agendamento." };
  }

  if (String(b.cancelCode).toUpperCase() !== String(cancelCode).toUpperCase()) {
    return { ok: false, error: "Código de cancelamento inválido." };
  }

  if (b.status !== "CONFIRMED") {
    return { ok: false, error: "Este agendamento já foi cancelado." };
  }

  const can = canCancelNow({ dateISO: b.dateISO, time: b.time });
  if (!can.ok) {
    return { ok: false, error: can.message, code: "CANCEL_BLOCKED" };
  }

  all[idx] = {
    ...b,
    status: "CANCELLED",
    cancelledAt: new Date().toISOString(),
  };

  write(all);
  return { ok: true };
}

/**
 * Política:
 * - 06:00 e 08:00: até 20:00 do dia anterior
 * - demais: até 2h antes
 */
export function canCancelNow({ dateISO, time }) {
  const slotStart = new Date(`${dateISO}T${time}:00`);
  const now = new Date();

  // já passou do horário
  if (now >= slotStart) {
    return { ok: false, message: "A aula já iniciou ou já passou. Só o admin pode cancelar." };
  }

  if (time === "06:00" || time === "08:00") {
    const deadline = new Date(`${dateISO}T20:00:00`);
    deadline.setDate(deadline.getDate() - 1); // dia anterior às 20h
    if (now <= deadline) return { ok: true };
    return {
      ok: false,
      message: "Prazo expirado: para 6h e 8h, o cancelamento é até 20h do dia anterior. Só o admin pode cancelar.",
    };
  }

  const deadline = new Date(slotStart);
  deadline.setHours(deadline.getHours() - 2);

  if (now <= deadline) return { ok: true };
  return {
    ok: false,
    message: "Prazo expirado: para este horário, o cancelamento é até 2h antes. Só o admin pode cancelar.",
  };
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr));
}

export function adminRemoveBooking({ bookingId, reason = "" }) {
  const all = read();
  const idx = all.findIndex((b) => b.id === bookingId);

  if (idx === -1) return { ok: false, error: "Agendamento não encontrado." };

  const b = all[idx];

  if (b.status !== "CONFIRMED") {
    return { ok: false, error: "Este agendamento já está cancelado." };
  }

  all[idx] = {
    ...b,
    status: "CANCELLED",
    cancelledAt: new Date().toISOString(),
    adminReason: reason,
    cancelledBy: "ADMIN",
  };

  write(all);
  return { ok: true };
}