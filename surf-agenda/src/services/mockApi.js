
import {  listBookings,  findBookingsByPhone,  cancelBookingLocal,} from "./bookingsStore";
import { buildMockWeek, CAPACITY } from "../mocks/scheduleMock";



export async function getBookingsByPhone(phoneDigits) {
  const found = findBookingsByPhone(phoneDigits).slice().sort(sortByDateTime);
  return found;
}

  const KEY = "surf_bookings_v1";
   const CAPACITY_PER_SLOT = 6;

export async function getBookingsAdmin({ fromISO, toISO, phoneDigits }) {
  const all = listBookings().slice();

  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T23:59:59");



  const filtered = all.filter((b) => {
    const d = new Date(b.dateISO + "T00:00:00");
    const inRange = d >= from && d <= to;

    const phoneOk = phoneDigits
      ? String(b.studentPhone || "") === String(phoneDigits)
      : true;

    return inRange && phoneOk;
  });

  filtered.sort(sortByDateTime);
  return filtered;
}


export async function cancelBookingMock({ bookingId, phoneDigits, cancelCode }) {
  const res = cancelBookingLocal({ bookingId, phoneDigits, cancelCode });
  if (!res.ok) throw new Error(res.error);
  return { ok: true };
}


function sortByDateTime(a, b) {
  const da = new Date(`${a.dateISO}T${a.time}:00`).getTime();
  const db = new Date(`${b.dateISO}T${b.time}:00`).getTime();
  return da - db;
}

export async function createBookingMock({
  dateISO,
  time,
  studentName,
  studentPhone,
}) {
  const all = listBookings().slice();

  const confirmedCount = all.filter(
    (b) => b.dateISO === dateISO && b.time === time && b.status === "CONFIRMED"
  ).length;

  if (confirmedCount >= CAPACITY_PER_SLOT) {
    throw new Error("Horário lotado.");
  }

  const cancelCode = Math.random().toString(36).slice(2, 8).toUpperCase();

  const newBooking = {
    id: crypto.randomUUID(),
    dateISO,
    time,
    studentName,
    studentPhone,
    status: "CONFIRMED",
    cancelCode,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(KEY, JSON.stringify([...all, newBooking]));

  return { ok: true, cancelCode };
}

export async function getScheduleWeekMocked({ weekStartISO }) {
  const base = buildMockWeek(weekStartISO); // ✅ aqui é o ponto principal

  const all = listBookings();

  const confirmedMap = new Map();
  for (const b of all) {
    if (b.status !== "CONFIRMED") continue;
    const k = `${b.dateISO}|${b.time}`;
    confirmedMap.set(k, (confirmedMap.get(k) || 0) + 1);
  }

  const days = base.days.map((day) => {
    const slots = day.slots.map((slot) => {
      const k = `${day.dateISO}|${slot.time}`;
      const used = confirmedMap.get(k) || 0;

      const capacity = slot.capacity ?? CAPACITY; // ✅ usa a mesma capacidade do seu mock
      const remaining = Math.max(0, capacity - used);

      return {
        ...slot,
        capacity,
        remaining,
        isFull: remaining === 0,
      };
    });

    return { ...day, slots };
  });

  return { ...base, days };
}