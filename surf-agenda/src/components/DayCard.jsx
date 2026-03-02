import React from "react";
import SlotRow from "./SlotRow";

export default function DayCard({ day, onBook }) {
  return (
    <section className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <div className="text-sm font-extrabold tracking-wide text-slate-900">{day.dayLabel}</div>
        <div className="text-sky-700">🌊</div>
      </header>

      <div className="mt-3 divide-y divide-sky-50">
        {day.slots.map((slot) => (
          <SlotRow key={slot.id} slot={slot} onBook={onBook} />
        ))}
      </div>
    </section>
  );
}