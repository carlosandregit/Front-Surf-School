// src/mocks/scheduleMock.js

// Horários padrão (você pode ajustar depois)
export const DEFAULT_TIMES = ["06:00", "08:00", "09:00", "10:00", "14:00", "15:00", "16:00"];

export const CAPACITY = 6;

// Gera semana mock a partir de uma data de início (segunda)
export function buildMockWeek(weekStartISO) {
  // weekStartISO: "2026-03-02"
  const start = new Date(weekStartISO + "T00:00:00");

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const dateISO = toISODate(d);
    const dayLabel = formatDayLabel(d);

    const slots = DEFAULT_TIMES.map((time) => {
      const id = `${dateISO}-${time}`;

      // aleatoriedade leve só pra você ver estados diferentes
      const booked = pseudoBookedCount(id);
      const isLocked = pseudoLocked(id);

      return {
        id,
        date: dateISO,
        time,
        capacity: CAPACITY,
        bookedCount: isLocked ? booked : booked, // mantém
        isLocked,
      };
    });

    return { dateISO, dayLabel, slots };
  });

  // Força alguns estados para você ver exatamente:
  forceStates(days);

  return { weekStartISO, days };
}

function forceStates(days) {
  // Exemplo: domingo 8h lotado
  const sunday = days[6];
  setSlotState(sunday, "08:00", { bookedCount: 6, isLocked: false });
  setSlotState(sunday, "09:00", { bookedCount: 6, isLocked: false });

  // Exemplo: terça 6h travado
  const tuesday = days[1];
  setSlotState(tuesday, "06:00", { bookedCount: 0, isLocked: true });
}

function setSlotState(day, time, state) {
  const s = day.slots.find((x) => x.time === time);
  if (!s) return;
  if (typeof state.bookedCount === "number") s.bookedCount = state.bookedCount;
  if (typeof state.isLocked === "boolean") s.isLocked = state.isLocked;
}

// Helpers
function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDayLabel(d) {
  // pt-BR abreviado
  const weekday = d.toLocaleDateString("pt-BR", { weekday: "long" }).toUpperCase();
  const date = d.toLocaleDateString("pt-BR");
  return `${weekday} • ${date}`;
}

// determinístico pra não ficar mudando toda hora
function pseudoBookedCount(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 1000;
  const n = hash % 7; // 0..6
  return Math.min(n, CAPACITY);
}

function pseudoLocked(seed) {
  // trava 1 a cada ~9 slots só pra visualizar
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 17 + seed.charCodeAt(i)) % 1000;
  return hash % 9 === 0;
}