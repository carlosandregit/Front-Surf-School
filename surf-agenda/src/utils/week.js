// src/utils/week.js

export function getWeekStartISO(date = new Date()) {
  // segunda-feira como início da semana
  const d = new Date(date);
  const day = d.getDay(); // 0 domingo ... 6 sábado
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diffToMonday);

  return toISODate(d);
}

export function addDaysISO(isoDate, days) {
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatWeekRange(weekStartISO) {
  const start = new Date(weekStartISO + "T00:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startBR = start.toLocaleDateString("pt-BR");
  const endBR = end.toLocaleDateString("pt-BR");
  return `${startBR} – ${endBR}`;
}