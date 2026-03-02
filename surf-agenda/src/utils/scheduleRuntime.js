// src/utils/scheduleRuntime.js
import { listBookings } from "../services/bookingsStore";
import { isSlotLocked } from "../services/slotLocksStore";
import { CAPACITY } from "../mocks/scheduleMock";

export function hydrateWeekWithRuntime(week) {
  // Conta confirmados por slotId
  const all = listBookings().filter((b) => b.status === "CONFIRMED");
  const counts = new Map();

  for (const b of all) {
    const key = b.classSlotId; // no mock: `${dateISO}-${time}`
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  // Aplica em cada slot da semana
  const days = week.days.map((day) => {
    const slots = day.slots.map((slot) => {
      const slotId = slot.id;
      const bookedCount = counts.get(slotId) || 0;
      const locked = isSlotLocked(slotId);

      return {
        ...slot,
        capacity: CAPACITY,
        bookedCount,
        isLocked: locked,
      };
    });

    return { ...day, slots };
  });

  return { ...week, days };
}